import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 5 - Cross-Tenant Data Isolation', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Tenant A Admin cannot read Tenant B documents', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAAdmin.email,
        password: 'password123',
      },
    })
    
    // Attempt to read Tenant B's page
    const result = await payload.find({
      collection: 'pages',
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })
    
    // They should not see Tenant B's page
    const foundB = result.docs.some((doc: any) => doc.id === fixtures.documents.tenantBPage.id)
    assert.strictEqual(foundB, false, 'Tenant A Admin should not be able to read Tenant B documents')
  })

  test('Tenant A Admin cannot create documents assigned to Tenant B', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAAdmin.email,
        password: 'password123',
      },
    })

    // Attempt to create a page for Tenant B
    await assert.rejects(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Malicious Page in B',
          slug: 'malicious-page-b',
          tenantId: fixtures.tenants.tenantB.id,
          _status: 'draft',
        },
        req: {
          user,
          // They might try to spoof the x-tenant-id header, but our context resolves securely
          headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantB.id) })
        },
        overrideAccess: false,
      })
    )
  })

  test('Tenant A Admin cannot update or delete Tenant B documents', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAAdmin.email,
        password: 'password123',
      },
    })

    const req = {
      user,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
    }

    // Attempt to update Tenant B's page
    await assert.rejects(
      payload.update({
        collection: 'pages',
        id: fixtures.documents.tenantBPage.id,
        data: { title: 'Hacked by A' },
        req,
        overrideAccess: false,
      })
    )

    // Attempt to delete Tenant B's page
    await assert.rejects(
      payload.delete({
        collection: 'pages',
        id: fixtures.documents.tenantBPage.id,
        req,
        overrideAccess: false,
      })
    )
  })

  test('Super Admin can read and modify all documents across all tenants', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.superAdmin.email,
        password: 'password123',
      },
    })

    const req = { user }

    // Read all
    const result = await payload.find({
      collection: 'pages',
      req,
      overrideAccess: false,
      pagination: false,
      where: {
        id: {
          in: [
            fixtures.documents.tenantAPage.id,
            fixtures.documents.tenantBPage.id,
          ],
        },
      },
    })
    
    const foundA = result.docs.some((doc: any) => doc.id === fixtures.documents.tenantAPage.id)
    const foundB = result.docs.some((doc: any) => doc.id === fixtures.documents.tenantBPage.id)
    assert.strictEqual(foundA, true)
    assert.strictEqual(foundB, true)

    // Update B
    const updated = await payload.update({
      collection: 'pages',
      id: fixtures.documents.tenantBPage.id,
      data: { title: 'Updated by Super Admin' },
      req,
      overrideAccess: false,
    })
    assert.strictEqual(updated.title, 'Updated by Super Admin')
  })
})
