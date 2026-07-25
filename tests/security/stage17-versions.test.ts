import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'

process.env.PAYLOAD_SECRET = 'test-secret_key'

import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 17 - Drafts and Versions Security', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Unauthenticated users cannot read versions', async () => {
    const versions = await payload.findVersions({
      collection: 'pages',
      overrideAccess: false,
    })
    assert.strictEqual(versions.docs.length, 0, 'Unauthenticated users should see 0 versions')
  })

  test('Tenant user can read own-tenant Pages versions', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantAMember.email, password: 'password123' },
    })
    
    await payload.update({
      collection: 'pages',
      id: fixtures.documents.tenantAPage.id,
      data: { title: 'Updated Title for Version' },
      overrideAccess: true,
    })

    const versions = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: fixtures.documents.tenantAPage.id } },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })

    assert.strictEqual(versions.docs.length > 0, true, 'Should allow reading versions of own tenant')
  })

  test('Tenant user cannot read cross-tenant Pages versions', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantBMember.email, password: 'password123' },
    })
    
    const versions = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: fixtures.documents.tenantAPage.id } },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantB.id) })
      },
      overrideAccess: false,
    })

    assert.strictEqual(versions.docs.length, 0, 'Should not allow reading versions of another tenant')
  })

  test('Tenant user can read own-tenant BlogPosts versions', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantAMember.email, password: 'password123' },
    })
    
    await payload.update({
      collection: 'blog-posts',
      id: fixtures.documents.tenantABlogPost.id,
      data: { title: 'Updated Blog Title for Version' },
      overrideAccess: true,
    })

    const versions = await payload.findVersions({
      collection: 'blog-posts',
      where: { parent: { equals: fixtures.documents.tenantABlogPost.id } },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })

    assert.strictEqual(versions.docs.length > 0, true, 'Should allow reading own-tenant BlogPosts versions')
  })

  test('Tenant user cannot read cross-tenant BlogPosts versions', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantBMember.email, password: 'password123' },
    })
    
    await payload.update({
      collection: 'blog-posts',
      id: fixtures.documents.tenantABlogPost.id,
      data: { title: 'Another Blog Title for Version' },
      overrideAccess: true,
    })

    const versions = await payload.findVersions({
      collection: 'blog-posts',
      where: { parent: { equals: fixtures.documents.tenantABlogPost.id } },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantB.id) })
      },
      overrideAccess: false,
    })

    assert.strictEqual(versions.docs.length, 0, 'Should not allow reading cross-tenant BlogPosts versions')
  })

  test('Inactive tenant users cannot read versions', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.inactiveTenantAdmin.email, password: 'password123' },
    })
    
    await payload.update({
      collection: 'pages',
      id: fixtures.documents.inactiveTenantCPage.id,
      data: { title: 'Updated Inactive Page' },
      overrideAccess: true,
    })

    await assert.rejects(
      payload.findVersions({
        collection: 'pages',
        where: { parent: { equals: fixtures.documents.inactiveTenantCPage.id } },
        req: {
          user,
          headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantC.id) })
        },
        overrideAccess: false,
      })
    )
  })

  test('Super Admin can read all versions', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.superAdmin.email, password: 'password123' },
    })

    const versions = await payload.findVersions({
      collection: 'pages',
      req: { user },
      overrideAccess: false,
    })

    assert.strictEqual(versions.docs.length > 0, true, 'Super Admin should be able to read all versions')
  })

  test('Draft reads remain tenant isolated', async () => {
    const { user: userA } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantAMember.email, password: 'password123' },
    })

    const pages = await payload.find({
      collection: 'pages',
      where: { id: { equals: fixtures.documents.tenantBPage.id } },
      req: {
        user: userA,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
      draft: true,
    })

    assert.strictEqual(pages.docs.length, 0, 'Tenant A member cannot read Tenant B draft')
  })

  test('Unauthorized users cannot publish drafts', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantBMember.email, password: 'password123' },
    })

    await assert.rejects(
      payload.update({
        collection: 'pages',
        id: fixtures.documents.tenantBPage.id,
        data: { _status: 'published' },
        req: {
          user,
          headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantB.id) })
        },
        overrideAccess: false,
      }),
      (err: any) => err.status === 403,
      'Should reject due to access control (403)'
    )
  })

  test('Authorized users can publish drafts', async () => {
    // Tenant Admin should be able to publish within their tenant
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantBAdmin.email, password: 'password123' },
    })

    const updated = await payload.update({
      collection: 'pages',
      id: fixtures.documents.tenantBPage.id,
      data: { _status: 'published' },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantB.id) })
      },
      overrideAccess: false,
    })

    assert.strictEqual(updated._status, 'published', 'Authorized user should be able to publish draft')
  })

  test('Unauthorized users cannot restore previous versions', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantAMember.email, password: 'password123' },
    })

    const versions = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: fixtures.documents.tenantAPage.id } },
      overrideAccess: true,
    })
    
    assert.ok(versions.docs.length > 0, 'Expected at least one version before restore test')

    await assert.rejects(
      payload.restoreVersion({
        collection: 'pages',
        id: versions.docs[0].id,
        req: {
          user,
          headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
        },
        overrideAccess: false,
      }),
      (err: any) => err.status === 403,
      'Should reject due to access control (403)'
    )
  })

  test('Authorized users can restore previous versions', async () => {
    // Tenant Admin should be able to restore
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantAAdmin.email, password: 'password123' },
    })

    const versions = await payload.findVersions({
      collection: 'pages',
      where: { parent: { equals: fixtures.documents.tenantAPage.id } },
      overrideAccess: true,
    })
    
    assert.ok(versions.docs.length > 0, 'Expected at least one version before restore test')

    const restored = await payload.restoreVersion({
      collection: 'pages',
      id: versions.docs[0].id,
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })

    assert.ok(restored, 'Authorized user should be able to restore version')
  })

  test('Missing version.tenantId does not expose data', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: { email: fixtures.users.tenantBMember.email, password: 'password123' },
    })

    const versions = await payload.findVersions({
      collection: 'pages',
      where: { 'version.tenantId': { exists: false } },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantB.id) })
      },
      overrideAccess: false,
    })

    assert.strictEqual(versions.docs.length, 0, 'Should not expose missing tenant versions')
  })
})
