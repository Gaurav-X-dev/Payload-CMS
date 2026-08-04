import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 4 - Authentication and Session Boundaries', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Unauthenticated API access properly denies protected routes', async () => {
    // Attempting to create a user without auth should fail
    await assert.rejects(
      payload.create({
        collection: 'users',
        data: {
          email: 'unauth-hacker@example.com',
          password: 'password123',
          roles: ['super_admin']
        },
        overrideAccess: false
      })
    )

    // Attempting to create a page without auth should fail
    await assert.rejects(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Hacked Page',
          slug: 'hacked-page',
          _status: 'published',
          tenantId: fixtures.tenants.tenantA.id
        },
        overrideAccess: false
      })
    )
  })

  test('Invalid credentials fail correctly', async () => {
    await assert.rejects(
      payload.login({
        collection: 'users',
        data: {
          email: fixtures.users.superAdmin.email,
          password: 'wrong_password_here',
        },
      })
    )
  })

  test('Tokens issued to inactive tenants are properly bounded or rejected', async () => {
    // Log in as inactive tenant admin
    const { token, user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.inactiveTenantAdmin.email,
        password: 'password123',
      },
    })
    assert.ok(token)
    assert.ok(user)

    const req = {
      user,
      headers: new Headers({
        'x-tenant-id': String(fixtures.tenants.tenantC.id) // Try to act on the inactive tenant
      })
    }

    await assert.rejects(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Inactive Tenant Page',
          slug: 'inactive-tenant-page',
          tenantId: fixtures.tenants.tenantC.id,
          _status: 'draft'
        },
        req,
        overrideAccess: false
      })
    )
  })

  test('Logging in as a user with malformed/missing tenant arrays behaves safely', async () => {
    // 1. Missing tenant user
    const noTenantLogin = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.noTenantUser.email,
        password: 'password123',
      },
    })
    assert.ok(noTenantLogin.token)
    
    // Should not be able to access Tenant A
    await assert.rejects(
      payload.find({
        collection: 'pages',
        req: {
          user: noTenantLogin.user,
          headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
        },
        overrideAccess: false
      })
    )

    // 2. Malformed tenant user (references a deleted tenant)
    const malformedLogin = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.malformedUser.email,
        password: 'password123',
      },
    })
    assert.ok(malformedLogin.token)

    // Using the stale tenant ID should result in denial
    await assert.rejects(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Malformed User Page',
          slug: 'malformed-page',
          tenantId: fixtures.users.malformedUser.tenants[0],
          _status: 'draft'
        },
        req: {
          user: malformedLogin.user,
          headers: new Headers({ 'x-tenant-id': String(fixtures.users.malformedUser.tenants[0]) })
        },
        overrideAccess: false
      })
    )
  })
})
