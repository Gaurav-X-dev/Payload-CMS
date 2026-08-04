import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 20 - Local API Security Audit', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  describe('1. Default Local API behavior', () => {
    test('omitted overrideAccess defaults to true (bypasses access)', async () => {
      // Create a dummy request without user
      const result = await payload.find({
        collection: 'pages',
        where: { id: { equals: fixtures.documents.tenantBPage.id } }
      })
      assert.strictEqual(result.docs.length, 1)
    })

    test('overrideAccess: true explicitly bypasses access', async () => {
      const result = await payload.find({
        collection: 'pages',
        overrideAccess: true,
        where: { id: { equals: fixtures.documents.tenantBPage.id } }
      })
      assert.strictEqual(result.docs.length, 1)
    })

    test('overrideAccess: false explicitly enforces access (blocks unauthenticated)', async () => {
      await assert.rejects(async () => {
        await payload.find({
          collection: 'pages',
          overrideAccess: false,
          where: { id: { equals: fixtures.documents.tenantBPage.id } }
        })
      })
    })

    test('passing req without user blocks access if overrideAccess: false', async () => {
      await assert.rejects(async () => {
        await payload.find({
          collection: 'pages',
          req: { headers: new Headers() },
          overrideAccess: false,
          where: { id: { equals: fixtures.documents.tenantBPage.id } }
        })
      })
    })
  })

  describe('2. Read isolation', () => {
    const getTenantAReq = () => ({
      user: fixtures.users.tenantAMember,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
    })

    test('Tenant A can read own records', async () => {
      const result = await payload.find({
        collection: 'pages',
        req: getTenantAReq(),
        overrideAccess: false,
        where: { id: { equals: fixtures.documents.tenantAPage.id } }
      })
      assert.strictEqual(result.docs.length, 1)
    })

    test('Tenant A cannot read Tenant B records', async () => {
      const result = await payload.find({
        collection: 'pages',
        req: getTenantAReq(),
        overrideAccess: false,
        where: { id: { equals: fixtures.documents.tenantBPage.id } }
      })
      assert.strictEqual(result.docs.length, 0)
    })

    test('direct ID lookups cannot bypass tenant isolation', async () => {
      await assert.rejects(async () => {
        await payload.findByID({
          collection: 'pages',
          id: fixtures.documents.tenantBPage.id,
          req: getTenantAReq(),
          overrideAccess: false
        })
      })
    })

    test('inactive tenant users cannot read protected records', async () => {
      await assert.rejects(async () => {
        await payload.find({
          collection: 'pages',
          req: {
            user: fixtures.users.inactiveTenantAdmin,
            headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantC.id) })
          },
          overrideAccess: false
        })
      })
    })
  })

  describe('3. Create security', () => {
    const getTenantAReq = () => ({
      user: fixtures.users.tenantAAdmin,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
    })

    const getTenantAMemberReq = () => ({
      user: fixtures.users.tenantAMember,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
    })

    test('Tenant A cannot create records for Tenant B', async () => {
      await assert.rejects(async () => {
        await payload.create({
          collection: 'pages',
          data: { _status: 'published', title: 'Hacked', slug: 'hacked', tenantId: fixtures.tenants.tenantB.id },
          req: getTenantAReq(),
          overrideAccess: false
        })
      })
    })

    test('tenant assignment spoofing is blocked by active tenant hook', async () => {
      await assert.rejects(async () => {
        await payload.create({
          collection: 'pages',
          data: { _status: 'published', title: 'Spoofed', slug: 'spoofed', tenantId: fixtures.tenants.tenantB.id },
          req: getTenantAReq(),
          overrideAccess: false
        })
      })
    })
  })

  describe('4. Update security', () => {
    const getTenantAReq = () => ({
      user: fixtures.users.tenantAAdmin,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
    })

    test('Tenant A cannot update Tenant B records', async () => {
      await assert.rejects(async () => {
        await payload.update({
          collection: 'pages',
          id: fixtures.documents.tenantBPage.id,
          data: { title: 'Hacked' },
          req: getTenantAReq(),
          overrideAccess: false
        })
      })
    })

    test('role-restricted fields cannot be changed via Local API if overrideAccess: false', async () => {
      const updatedUser = await payload.update({
        collection: 'users',
        id: fixtures.users.tenantAMember.id,
        data: { roles: ['super_admin'] },
        req: getTenantAReq(),
        overrideAccess: false
      })
      assert.ok(!updatedUser.roles.includes('super_admin'))
      assert.ok(updatedUser.roles.includes('tenant_member'))
    })
  })

  describe('5. Delete security', () => {
    const getTenantAReq = () => ({
      user: fixtures.users.tenantAAdmin,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
    })

    test('Tenant A cannot delete Tenant B records', async () => {
      await assert.rejects(async () => {
        await payload.delete({
          collection: 'pages',
          id: fixtures.documents.tenantBPage.id,
          req: getTenantAReq(),
          overrideAccess: false
        })
      })
    })
  })

  describe('6. Drafts and versions', () => {
    const getTenantAReq = () => ({
      user: fixtures.users.tenantAAdmin,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
    })

    test('foreign drafts cannot be read via Local API', async () => {
      const result = await payload.find({
        collection: 'pages',
        draft: true,
        req: getTenantAReq(),
        overrideAccess: false,
        where: { id: { equals: fixtures.documents.tenantBPage.id } }
      })
      assert.strictEqual(result.docs.length, 0)
    })
  })

  describe('7. Sensitive fields', () => {
    const getTenantAReq = () => ({
      user: fixtures.users.tenantAAdmin,
      headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
    })

    test('Local API responses do not expose restricted fields (hash, salt)', async () => {
      const result = await payload.find({
        collection: 'users',
        req: getTenantAReq(),
        overrideAccess: false,
        where: { id: { equals: fixtures.users.tenantAMember.id } }
      })
      const user = result.docs[0]
      assert.ok(user)
      assert.strictEqual(user.hash, undefined)
      assert.strictEqual(user.salt, undefined)
    })
  })
})
