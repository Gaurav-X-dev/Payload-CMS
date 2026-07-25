import { BasePayload } from 'payload'
import { randomBytes } from 'node:crypto'

const randomId = () => randomBytes(4).toString('hex')

export async function setupSecurityFixtures(payload: BasePayload) {
  const tenantA = await payload.create({
    collection: 'tenants',
    data: { name: `Tenant A Active ${randomId()}`, type: 'restaurant', domains: [{ domain: `a-${randomId()}.example.com` }], isActive: true },
    overrideAccess: true,
  })

  const tenantB = await payload.create({
    collection: 'tenants',
    data: { name: `Tenant B Active ${randomId()}`, type: 'restaurant', domains: [{ domain: `b-${randomId()}.example.com` }], isActive: true },
    overrideAccess: true,
  })

  const tenantC = await payload.create({
    collection: 'tenants',
    data: { name: `Tenant C Inactive ${randomId()}`, type: 'restaurant', domains: [{ domain: `c-${randomId()}.example.com` }], isActive: false },
    overrideAccess: true,
  })

  const superAdmin = await payload.create({
    collection: 'users',
    data: { name: 'Super Admin', email: `superadmin-${randomId()}@example.com`, password: 'password123', roles: ['super_admin'], tenants: [] },
    overrideAccess: true,
  })

  const req = { user: superAdmin } as any

  const tenantAAdmin = await payload.create({
    collection: 'users',
    data: { name: 'Tenant A Admin', email: `tenantA-admin-${randomId()}@example.com`, password: 'password123', roles: ['tenant_admin'], tenants: [tenantA.id] },
    overrideAccess: true,
    req
  })

  const tenantAMember = await payload.create({
    collection: 'users',
    data: { name: 'Tenant A Member', email: `tenantA-member-${randomId()}@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [tenantA.id] },
    overrideAccess: true,
    req
  })

  const tenantBAdmin = await payload.create({
    collection: 'users',
    data: { name: 'Tenant B Admin', email: `tenantB-admin-${randomId()}@example.com`, password: 'password123', roles: ['tenant_admin'], tenants: [tenantB.id] },
    overrideAccess: true,
    req
  })

  const tenantBMember = await payload.create({
    collection: 'users',
    data: { name: 'Tenant B Member', email: `tenantB-member-${randomId()}@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [tenantB.id] },
    overrideAccess: true,
    req
  })

  const inactiveTenantAdmin = await payload.create({
    collection: 'users',
    data: { name: 'Inactive Admin', email: `tenantC-inactive-admin-${randomId()}@example.com`, password: 'password123', roles: ['tenant_admin'], tenants: [tenantC.id] },
    overrideAccess: true,
    req
  })

  const noTenantUser = await payload.create({
    collection: 'users',
    data: { name: 'No Tenant User', email: `no-tenant-${randomId()}@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [] },
    overrideAccess: true,
    req
  })
  
  const tempTenant = await payload.create({
    collection: 'tenants',
    data: { name: `Temp ${randomId()}`, type: 'restaurant', domains: [{ domain: `temp-${randomId()}.example.com` }] },
    overrideAccess: true,
    req
  })
  const malformedUser = await payload.create({
    collection: 'users',
    data: { name: 'Malformed User', email: `malformed-${randomId()}@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [tempTenant.id] },
    overrideAccess: true,
    req
  })
  await payload.delete({ collection: 'tenants', id: tempTenant.id, overrideAccess: true })

  const tenantAPage = await payload.create({
    collection: 'pages',
    data: { title: `Tenant A Page ${randomId()}`, slug: `tenant-a-page-${randomId()}`, tenantId: tenantA.id, status: 'published' },
    overrideAccess: true,
    req
  })

  const tenantBPage = await payload.create({
    collection: 'pages',
    data: { title: `Tenant B Page ${randomId()}`, slug: `tenant-b-page-${randomId()}`, tenantId: tenantB.id, status: 'draft' },
    overrideAccess: true,
    req
  })

  const tenantABlogPost = await payload.create({
    collection: 'blog-posts',
    data: {
      title: `Tenant A Blog ${randomId()}`,
      slug: `tenant-a-blog-${randomId()}`,
      tenantId: tenantA.id,
      status: 'published',
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
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
  })

  const tenantBBlogPost = await payload.create({
    collection: 'blog-posts',
    data: {
      title: `Tenant B Blog ${randomId()}`,
      slug: `tenant-b-blog-${randomId()}`,
      tenantId: tenantB.id,
      status: 'published',
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
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
  })

  const inactiveTenantCPage = await payload.create({
    collection: 'pages',
    data: { title: `Tenant C Page ${randomId()}`, slug: `tenant-c-page-${randomId()}`, tenantId: tenantC.id, status: 'published' },
    overrideAccess: true,
    req
  })

  const tenantAParent = await payload.create({
    collection: 'tenants',
    data: { name: `Tenant A Parent ${randomId()}`, type: 'hospitality', domains: [{ domain: `parent-a-${randomId()}.example.com` }] },
    overrideAccess: true,
    req
  })

  const tenantAChild = await payload.create({
    collection: 'tenants',
    data: { name: `Tenant A Child ${randomId()}`, type: 'restaurant', domains: [{ domain: `child-a-${randomId()}.example.com` }], parentTenant: tenantAParent.id },
    overrideAccess: true,
    req
  })

  return {
    tenants: { tenantA, tenantB, tenantC },
    users: { superAdmin, tenantAAdmin, tenantAMember, tenantBAdmin, tenantBMember, inactiveTenantAdmin, noTenantUser, malformedUser },
    documents: { tenantAPage, tenantBPage, inactiveTenantCPage, tenantAParent, tenantAChild, tenantABlogPost, tenantBBlogPost }
  }
}

export async function cleanupSecurityFixtures(payload: BasePayload, fixtures: any) {
  for (const user of Object.values(fixtures.users) as any[]) {
    if (user?.id) await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
  }

  if (fixtures.documents.tenantABlogPost?.id) {
    await payload.delete({ collection: 'blog-posts', id: fixtures.documents.tenantABlogPost.id, overrideAccess: true })
  }
  if (fixtures.documents.tenantBBlogPost?.id) {
    await payload.delete({ collection: 'blog-posts', id: fixtures.documents.tenantBBlogPost.id, overrideAccess: true })
  }

  for (const [key, doc] of Object.entries(fixtures.documents) as [string, any][]) {
    if (doc?.id && key !== 'tenantABlogPost' && key !== 'tenantBBlogPost') {
      if (doc.title) await payload.delete({ collection: 'pages', id: doc.id, overrideAccess: true })
      else if (doc.name) await payload.delete({ collection: 'tenants', id: doc.id, overrideAccess: true })
    }
  }

  for (const tenant of Object.values(fixtures.tenants) as any[]) {
    if (tenant?.id) await payload.delete({ collection: 'tenants', id: tenant.id, overrideAccess: true })
  }
}
