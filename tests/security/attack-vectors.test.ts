import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 9 - Filter & Population Attack Vectors', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Tenant A Admin cannot bypass tenant boundaries using explicit WHERE filters', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAAdmin.email,
        password: 'password123',
      },
    })
    
    // Attempt to query pages with a filter explicitly requesting Tenant B
    const result = await payload.find({
      collection: 'pages',
      where: {
        tenantId: {
          equals: fixtures.tenants.tenantB.id
        }
      },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })
    
    assert.strictEqual(result.docs.length, 0, 'Should not return any documents from Tenant B')
  })

  test('Super Admin can query any tenant using explicit WHERE filters', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.superAdmin.email,
        password: 'password123',
      },
    })
    
    // Super Admin queries Tenant B
    const result = await payload.find({
      collection: 'pages',
      where: {
        tenantId: {
          equals: fixtures.tenants.tenantB.id
        }
      },
      req: { user },
      overrideAccess: false,
    })
    
    const foundB = result.docs.some((doc: any) => doc.id === fixtures.documents.tenantBPage.id)
    assert.strictEqual(foundB, true, 'Super Admin should be able to query Tenant B specifically')
  })
})
