import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 12 & 13 - Data Integrity', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Cannot relate a document to a record in a different tenant', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAAdmin.email,
        password: 'password123',
      },
    })

    await assert.rejects(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Cross Tenant Relation Page',
          slug: 'cross-tenant-page',
          tenantId: fixtures.tenants.tenantA.id,
          parent: fixtures.documents.tenantBPage.id,
          _status: 'draft',
        },
        req: {
          user,
          headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
        },
        overrideAccess: false,
      })
    )
  })

  test('Tenant Hierarchy Validation prevents circular inheritance', async () => {
    await assert.rejects(
      payload.update({
        collection: 'tenants',
        id: fixtures.tenants.tenantA.id,
        data: {
          parentTenant: fixtures.tenants.tenantA.id
        },
        overrideAccess: true,
      })
    )
  })
})
