import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 5 - Active Tenant Enforcement', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Inactive tenant user cannot perform operations', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.inactiveTenantAdmin.email,
        password: 'password123',
      },
    })

    const req = {
      user,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantC.id) })
    }

    // 1. Cannot Read
    await assert.rejects(
      payload.find({
        collection: 'pages',
        req,
        overrideAccess: false,
      })
    )

    // 2. Cannot Create
    await assert.rejects(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Should fail',
          slug: 'should-fail',
          tenantId: fixtures.tenants.tenantC.id,
          status: 'draft',
        },
        req,
        overrideAccess: false,
      })
    )

    // 3. Cannot Update
    await assert.rejects(
      payload.update({
        collection: 'pages',
        id: fixtures.documents.inactiveTenantCPage.id,
        data: { title: 'Should fail' },
        req,
        overrideAccess: false,
      })
    )

    // 4. Cannot Delete
    await assert.rejects(
      payload.delete({
        collection: 'pages',
        id: fixtures.documents.inactiveTenantCPage.id,
        req,
        overrideAccess: false,
      })
    )
  })
})
