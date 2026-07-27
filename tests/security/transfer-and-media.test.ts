import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 14 & 15 - Tenant Transfer & Media Validation', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Tenant Transfer Integrity: Users cannot transfer a document to another tenant by updating tenantId', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAAdmin.email,
        password: 'password123',
      },
    })

    const updated = await payload.update({
      collection: 'pages',
      id: fixtures.documents.tenantAPage.id,
      data: {
        tenantId: fixtures.tenants.tenantB.id // Attempting transfer
      },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })
    
    // The assignTenant hook should overwrite the requested tenantId with the original one
    assert.strictEqual(
      typeof updated.tenantId === 'object' ? updated.tenantId.id : updated.tenantId, 
      fixtures.tenants.tenantA.id, 
      'Should ignore tenant change attempts and preserve original tenant'
    )
  })

  test('Branding and Media Validation: Cannot assign media from Tenant B to Tenant A branding', async () => {
    // Media validation is currently only for super admins since only they can edit tenants, 
    // but the hook ensures data integrity regardless.
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.superAdmin.email,
        password: 'password123',
      },
    })

    const filename = 'stage14-tenant-b-logo.png'
    const staleMedia = await payload.find({
      collection: 'media',
      depth: 0,
      overrideAccess: true,
      where: { filename: { equals: filename } },
    })
    for (const media of staleMedia.docs) {
      await payload.db.deleteOne({
        collection: 'media',
        req: { payload },
        where: { id: { equals: media.id } },
      })
    }

    const tenantBMedia = await payload.db.create({
      collection: 'media',
      data: {
        alt: 'Tenant B Logo',
        tenantId: fixtures.tenants.tenantB.id,
        filename,
        mimeType: 'image/png',
        filesize: 68,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      req: { payload },
    })

    try {
      await assert.rejects(
        payload.update({
          collection: 'tenants',
          id: fixtures.tenants.tenantA.id,
          data: {
            branding: {
              logo: tenantBMedia.id // Assigning Tenant B media to Tenant A
            }
          },
          req: { user },
          overrideAccess: false, // The hook should reject this
        })
      )
    } finally {
      await payload.db.deleteOne({
        collection: 'media',
        req: { payload },
        where: { id: { equals: tenantBMedia.id } },
      })
    }
  })
})
