import { BasePayload } from 'payload'
import { basename } from 'node:path'

const fixtureNamespace = basename(process.argv[1] ?? 'security-test')
  .replace(/\.test\.ts$/, '')
  .replace(/[^a-z0-9-]/gi, '-')
let fixtureIndex = 0
const deterministicId = () => `${fixtureNamespace}-${++fixtureIndex}`

export async function setupSecurityFixtures(payload: BasePayload) {
  type FixtureCollection = 'blog-posts' | 'pages' | 'tenants' | 'users'
  const created: Array<{ collection: FixtureCollection; id: number }> = []
  const track = async <T extends { id: number }>(
    collection: FixtureCollection,
    operation: Promise<T>,
  ) => {
    const document = await operation
    created.push({ collection, id: document.id })
    return document
  }

  try {
  const tenantA = await track('tenants', payload.create({
    collection: 'tenants',
    data: { name: `Tenant A Active ${deterministicId()}`, type: 'restaurant', domains: [{ domain: `a-${deterministicId()}.example.com` }], isActive: true },
    overrideAccess: true,
  }))

  const tenantB = await track('tenants', payload.create({
    collection: 'tenants',
    data: { name: `Tenant B Active ${deterministicId()}`, type: 'restaurant', domains: [{ domain: `b-${deterministicId()}.example.com` }], isActive: true },
    overrideAccess: true,
  }))

  const tenantC = await track('tenants', payload.create({
    collection: 'tenants',
    data: { name: `Tenant C Inactive ${deterministicId()}`, type: 'restaurant', domains: [{ domain: `c-${deterministicId()}.example.com` }], isActive: false },
    overrideAccess: true,
  }))

  const superAdmin = await track('users', payload.create({
    collection: 'users',
    data: { name: 'Super Admin', email: `superadmin-${deterministicId()}@example.com`, password: 'password123', roles: ['super_admin'], tenants: [] },
    overrideAccess: true,
  }))

  const req = { user: superAdmin } as any

  const tenantAAdmin = await track('users', payload.create({
    collection: 'users',
    data: { name: 'Tenant A Admin', email: `tenantA-admin-${deterministicId()}@example.com`, password: 'password123', roles: ['tenant_admin'], tenants: [tenantA.id] },
    overrideAccess: true,
    req
  }))

  const tenantAMember = await track('users', payload.create({
    collection: 'users',
    data: { name: 'Tenant A Member', email: `tenantA-member-${deterministicId()}@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [tenantA.id] },
    overrideAccess: true,
    req
  }))

  const tenantBAdmin = await track('users', payload.create({
    collection: 'users',
    data: { name: 'Tenant B Admin', email: `tenantB-admin-${deterministicId()}@example.com`, password: 'password123', roles: ['tenant_admin'], tenants: [tenantB.id] },
    overrideAccess: true,
    req
  }))

  const tenantBMember = await track('users', payload.create({
    collection: 'users',
    data: { name: 'Tenant B Member', email: `tenantB-member-${deterministicId()}@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [tenantB.id] },
    overrideAccess: true,
    req
  }))

  const inactiveTenantAdmin = await track('users', payload.create({
    collection: 'users',
    data: { name: 'Inactive Admin', email: `tenantC-inactive-admin-${deterministicId()}@example.com`, password: 'password123', roles: ['tenant_admin'], tenants: [tenantC.id] },
    overrideAccess: true,
    req
  }))

  const noTenantUser = await track('users', payload.create({
    collection: 'users',
    data: { name: 'No Tenant User', email: `no-tenant-${deterministicId()}@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [] },
    overrideAccess: true,
    req
  }))
  
  const tempTenant = await track('tenants', payload.create({
    collection: 'tenants',
    data: { name: `Temp ${deterministicId()}`, type: 'restaurant', domains: [{ domain: `temp-${deterministicId()}.example.com` }] },
    overrideAccess: true,
    req
  }))
  const malformedUser = await track('users', payload.create({
    collection: 'users',
    data: { name: 'Malformed User', email: `malformed-${deterministicId()}@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [tempTenant.id] },
    overrideAccess: true,
    req
  }))
  await payload.delete({ collection: 'tenants', id: tempTenant.id, overrideAccess: true })
  created.splice(
    created.findIndex(({ collection, id }) => collection === 'tenants' && id === tempTenant.id),
    1,
  )

  const tenantAPage = await track('pages', payload.create({
    collection: 'pages',
    data: { title: `Tenant A Page ${deterministicId()}`, slug: `tenant-a-page-${deterministicId()}`, tenantId: tenantA.id, status: 'published' },
    overrideAccess: true,
    req
  }))

  const tenantBPage = await track('pages', payload.create({
    collection: 'pages',
    data: { title: `Tenant B Page ${deterministicId()}`, slug: `tenant-b-page-${deterministicId()}`, tenantId: tenantB.id, status: 'draft' },
    overrideAccess: true,
    req
  }))

  const tenantABlogPost = await track('blog-posts', payload.create({
    collection: 'blog-posts',
    data: {
      title: `Tenant A Blog ${deterministicId()}`,
      slug: `tenant-a-blog-${deterministicId()}`,
      tenantId: tenantA.id,
      status: 'published',
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          direction: null,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                { mode: 'normal', text: 'Mock', type: 'text', version: 1 }
              ]
            }
          ]
        }
      }
    },
    overrideAccess: true,
    req
  }))

  const tenantBBlogPost = await track('blog-posts', payload.create({
    collection: 'blog-posts',
    data: {
      title: `Tenant B Blog ${deterministicId()}`,
      slug: `tenant-b-blog-${deterministicId()}`,
      tenantId: tenantB.id,
      status: 'published',
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          direction: null,
          version: 1,
          children: [
            {
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [
                { mode: 'normal', text: 'Mock', type: 'text', version: 1 }
              ]
            }
          ]
        }
      }
    },
    overrideAccess: true,
    req
  }))

  const inactiveTenantCPage = await track('pages', payload.create({
    collection: 'pages',
    data: { title: `Tenant C Page ${deterministicId()}`, slug: `tenant-c-page-${deterministicId()}`, tenantId: tenantC.id, status: 'published' },
    overrideAccess: true,
    req
  }))

  const tenantAParent = await track('tenants', payload.create({
    collection: 'tenants',
    data: { name: `Tenant A Parent ${deterministicId()}`, type: 'hospitality', domains: [{ domain: `parent-a-${deterministicId()}.example.com` }] },
    overrideAccess: true,
    req
  }))

  const tenantAChild = await track('tenants', payload.create({
    collection: 'tenants',
    data: { name: `Tenant A Child ${deterministicId()}`, type: 'restaurant', domains: [{ domain: `child-a-${deterministicId()}.example.com` }], parentTenant: tenantAParent.id },
    overrideAccess: true,
    req
  }))

  return {
    tenants: { tenantA, tenantB, tenantC },
    users: { superAdmin, tenantAAdmin, tenantAMember, tenantBAdmin, tenantBMember, inactiveTenantAdmin, noTenantUser, malformedUser },
    documents: { tenantAPage, tenantBPage, inactiveTenantCPage, tenantAParent, tenantAChild, tenantABlogPost, tenantBBlogPost }
  }
  } catch (setupError) {
    const cleanupErrors: unknown[] = []

    for (const { collection, id } of created.reverse()) {
      try {
        await payload.delete({ collection, id, overrideAccess: true })
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError)
      }
    }

    try {
      await shutdownPayload(payload)
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError)
    }

    if (cleanupErrors.length) {
      throw new AggregateError(
        [setupError, ...cleanupErrors],
        'Security fixture setup and rollback failed',
      )
    }

    throw setupError
  }
}

export async function cleanupSecurityFixtures(payload: BasePayload, fixtures: any) {
  const cleanupErrors: unknown[] = []
  const attempt = async (operation: () => Promise<unknown>) => {
    try {
      await operation()
    } catch (error) {
      cleanupErrors.push(error)
    }
  }

  for (const doc of [
    fixtures.documents.tenantABlogPost,
    fixtures.documents.tenantBBlogPost,
  ]) {
    if (doc?.id) {
      await attempt(() => payload.delete({
        collection: 'blog-posts',
        id: doc.id,
        overrideAccess: true,
      }))
    }
  }

  for (const doc of [
    fixtures.documents.tenantAPage,
    fixtures.documents.tenantBPage,
    fixtures.documents.inactiveTenantCPage,
  ]) {
    if (doc?.id) {
      await attempt(() => payload.delete({
        collection: 'pages',
        id: doc.id,
        overrideAccess: true,
      }))
    }
  }

  for (const user of Object.values(fixtures.users) as any[]) {
    if (user?.id) {
      await attempt(() => payload.delete({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
      }))
    }
  }

  for (const tenant of [
    fixtures.documents.tenantAChild,
    fixtures.documents.tenantAParent,
    fixtures.tenants.tenantA,
    fixtures.tenants.tenantB,
    fixtures.tenants.tenantC,
  ]) {
    if (tenant?.id) {
      await attempt(() => payload.delete({
        collection: 'tenants',
        id: tenant.id,
        overrideAccess: true,
      }))
    }
  }

  await attempt(() => shutdownPayload(payload))

  if (cleanupErrors.length) {
    throw new AggregateError(cleanupErrors, 'Security fixture cleanup failed')
  }
}

export async function shutdownPayload(payload: BasePayload) {
  const shutdownErrors: unknown[] = []

  try {
    await payload.destroy()
  } catch (error) {
    shutdownErrors.push(error)
  }

  const pool = (payload.db as any)?.pool
  if (pool && typeof pool.end === 'function' && !pool.ended) {
    try {
      // @payloadcms/db-postgres 3.86 checks out a bootstrap client in
      // connectWithReconnect without releasing it. All test operations have
      // completed here, so release only clients that are still checked out
      // before asking pg to close the pool normally.
      const idleClients = new Set(
        (pool._idle ?? []).map((entry: any) => entry.client),
      )
      for (const client of pool._clients ?? []) {
        if (!idleClients.has(client) && typeof client.release === 'function') {
          client.release()
        }
      }
      await pool.end()
    } catch (error) {
      shutdownErrors.push(error)
    }
  }

  if (shutdownErrors.length) {
    throw new AggregateError(shutdownErrors, 'Payload shutdown failed')
  }
}
