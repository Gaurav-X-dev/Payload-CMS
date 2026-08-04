import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 10 & 11 - Role-Based Access Control and Membership', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Tenant Member cannot create content', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAMember.email,
        password: 'password123',
      },
    })
    
    await assert.rejects(
      payload.create({
        collection: 'pages',
        data: {
          title: 'Member Page',
          slug: 'member-page',
          tenantId: fixtures.tenants.tenantA.id,
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

  test('Tenant Member cannot create other users', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAMember.email,
        password: 'password123',
      },
    })
    
    await assert.rejects(
      payload.create({
        collection: 'users',
        data: {
          name: 'Hacker',
          email: 'hacker@example.com',
          password: 'password123',
        },
        req: {
          user,
          headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
        },
        overrideAccess: false,
      })
    )
  })

  test('Tenant Admin cannot elevate roles to super_admin', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAAdmin.email,
        password: 'password123',
      },
    })
    
    const newUser = await payload.create({
      collection: 'users',
      data: {
        name: 'New Admin',
        email: 'new-admin@example.com',
        password: 'password123',
        roles: ['super_admin'] // Attempt elevation
      },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })
    
    assert.deepStrictEqual(newUser.roles, ['tenant_member'], 'Should automatically downgrade created user to tenant_member')
    await payload.delete({ collection: 'users', id: newUser.id, overrideAccess: true })
  })

  test('Tenant Member editing their own profile cannot elevate their roles or change tenants', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAMember.email,
        password: 'password123',
      },
    })
    
    const updated = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        name: 'Updated Name',
        roles: ['super_admin'],
        tenants: [fixtures.tenants.tenantB.id] // Attempt to switch tenants
      },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })
    
    assert.strictEqual(updated.name, 'Updated Name', 'Should allow updating basic fields')
    assert.deepStrictEqual(updated.roles, ['tenant_member'], 'Should ignore role elevation attempts')
    
    // In Payload, if the access hook prevents reading/writing the field, it won't even process it, 
    // or beforeValidate hook intercepts it. Either way, tenant shouldn't be B.
    const userHasTenantB = updated.tenants?.some((t: any) => 
      (typeof t === 'object' ? t.id : t) === fixtures.tenants.tenantB.id
    )
    assert.strictEqual(userHasTenantB, false, 'Should ignore tenant change attempts')
  })
})
