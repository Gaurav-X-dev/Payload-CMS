import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { canCreateTenantContent, canDeleteTenantContent, canManageUserWithinActiveTenant, canUpdateTenantContent, getTenantReadScope, preserveTenantAdminManagedUserState, resolveActiveTenantContext } from '../src/access/tenantContext.ts'

type TestRole = 'super_admin' | 'tenant_admin' | 'tenant_member'

const request = ({
  activeTenantID,
  roles,
  tenantIDs,
}: {
  activeTenantID?: number
  roles?: TestRole[]
  tenantIDs?: number[]
}) => ({
  headers: new Headers(
    activeTenantID ? { 'x-tenant-id': String(activeTenantID) } : undefined,
  ),
  user: roles
    ? {
        id: 100,
        roles,
        tenants: tenantIDs ?? [],
      }
    : null,
})

const accessArgs = (req: ReturnType<typeof request>) => ({ req } as never)

test('Tenant A Admin creates content only in trusted Tenant A context', () => {
  const req = request({ roles: ['tenant_admin'], tenantIDs: [1] })

  assert.equal(canCreateTenantContent(accessArgs(req)), true)
  assert.equal(resolveActiveTenantContext(req as never)?.tenantID, 1)

  const spoofed = request({
    activeTenantID: 2,
    roles: ['tenant_admin'],
    tenantIDs: [1],
  })
  assert.equal(resolveActiveTenantContext(spoofed as never)?.tenantID, 1)
})

test('multi-tenant admin mutation requires a validated active tenant', () => {
  const ambiguous = request({
    roles: ['tenant_admin'],
    tenantIDs: [1, 2],
  })
  assert.equal(canCreateTenantContent(accessArgs(ambiguous)), false)
  assert.equal(canUpdateTenantContent(accessArgs(ambiguous)), false)
  assert.equal(canDeleteTenantContent(accessArgs(ambiguous)), false)

  const tenantB = request({
    activeTenantID: 2,
    roles: ['tenant_admin'],
    tenantIDs: [1, 2],
  })
  assert.equal(canCreateTenantContent(accessArgs(tenantB)), true)
  assert.deepEqual(canUpdateTenantContent(accessArgs(tenantB)), {
    tenantId: { equals: 2 },
  })
})

test('unassigned active tenant is rejected for a multi-tenant admin', () => {
  const req = request({
    activeTenantID: 3,
    roles: ['tenant_admin'],
    tenantIDs: [1, 2],
  })

  assert.equal(resolveActiveTenantContext(req as never), null)
  assert.equal(canCreateTenantContent(accessArgs(req)), false)
})

test('Tenant Members are read-only for business content', () => {
  const req = request({ roles: ['tenant_member'], tenantIDs: [1] })

  assert.deepEqual(getTenantReadScope(req as never), {
    tenantId: { in: [1] },
  })
  assert.equal(canCreateTenantContent(accessArgs(req)), false)
  assert.equal(canUpdateTenantContent(accessArgs(req)), false)
  assert.equal(canDeleteTenantContent(accessArgs(req)), false)
})

test('Tenant Admin update and delete constraints use only active tenant', () => {
  const req = request({ roles: ['tenant_admin'], tenantIDs: [1] })

  const updateScope = canUpdateTenantContent(accessArgs(req))
  const deleteScope = canDeleteTenantContent(accessArgs(req))

  assert.deepEqual(updateScope, {
    tenantId: { equals: 1 },
  })
  assert.deepEqual(deleteScope, {
    tenantId: { equals: 1 },
  })

  const canTarget = (scope: unknown, tenantID: number) =>
    scope === true ||
    (typeof scope === 'object' &&
      scope !== null &&
      (scope as { tenantId?: { equals?: number } }).tenantId?.equals === tenantID)

  assert.equal(canTarget(updateScope, 1), true)
  assert.equal(canTarget(updateScope, 2), false)
  assert.equal(canTarget(deleteScope, 1), true)
  assert.equal(canTarget(deleteScope, 2), false)
})

test('Tenant Admin user management requires target membership in active tenant', () => {
  const req = request({
    activeTenantID: 1,
    roles: ['tenant_admin'],
    tenantIDs: [1, 2],
  })

  assert.deepEqual(canManageUserWithinActiveTenant(accessArgs(req)), {
    tenants: { in: [1] },
  })
})

test('Tenant Admin edits preserve all existing memberships and roles', () => {
  const protectedState = preserveTenantAdminManagedUserState({
    roles: ['tenant_member'],
    tenants: [1, 2],
  } as never)

  assert.deepEqual(protectedState.tenants, [1, 2])
  assert.deepEqual(protectedState.roles, ['tenant_member'])
})

test('Tenant Admin cannot promote a managed user to Super Admin', () => {
  const original = preserveTenantAdminManagedUserState({
    roles: ['tenant_member'],
    tenants: [1, 2],
  } as never)

  assert.notDeepEqual(original.roles, ['super_admin'])
  assert.deepEqual(original.roles, ['tenant_member'])
})

test('Super Admin operations remain allowed', () => {
  const req = request({ roles: ['super_admin'], tenantIDs: [] })

  assert.equal(canCreateTenantContent(accessArgs(req)), true)
  assert.equal(canUpdateTenantContent(accessArgs(req)), true)
  assert.equal(canDeleteTenantContent(accessArgs(req)), true)
})

test('public reservation and contact creation remain enabled', () => {
  const reservations = readFileSync(
    new URL('../src/collections/Reservations.ts', import.meta.url),
    'utf8',
  )
  const contacts = readFileSync(
    new URL('../src/collections/ContactSubmissions.ts', import.meta.url),
    'utf8',
  )

  assert.match(reservations, /create:\s*\(\)\s*=>\s*true/)
  assert.match(contacts, /create:\s*\(\)\s*=>\s*true/)
})

test('all tenant-scoped collections no longer use membership-only mutations', () => {
  const tenantCollections = [
    'Amenities',
    'BlogPosts',
    'ContactSubmissions',
    'Events',
    'FAQs',
    'Footer',
    'Gallery',
    'Locations',
    'Media',
    'MenuCategories',
    'MenuItems',
    'Nav',
    'Packages',
    'Pages',
    'Redirects',
    'Reservations',
    'Rooms',
    'SEO',
    'SiteSettings',
    'TeamMembers',
    'Testimonials',
  ]

  for (const collection of tenantCollections) {
    const source = readFileSync(
      new URL(`../src/collections/${collection}.ts`, import.meta.url),
      'utf8',
    )
    assert.doesNotMatch(source, /(create|update|delete):\s*tenantIsolation/)
  }
})
