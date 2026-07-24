import assert from 'node:assert/strict'
import test from 'node:test'

// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { normalizeRelationshipIDs, sameTenantRelationship, validateRelationshipForTenant } from '../src/hooks/sameTenantRelationship.ts'
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { validateTenantParent } from '../src/hooks/tenantHierarchy.ts'
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { validateTenantTransfer } from '../src/hooks/tenantTransferIntegrity.ts'

type Fixture = {
  id: number
  parentTenant?: number | null
  tenantId?: number
  tenants?: number[]
}

const fixtures: Record<string, Fixture[]> = {
  media: [
    { id: 101, tenantId: 1 },
    { id: 201, tenantId: 2 },
  ],
  pages: [
    { id: 102, tenantId: 1 },
    { id: 202, tenantId: 2 },
  ],
  'menu-categories': [
    { id: 103, tenantId: 1 },
    { id: 203, tenantId: 2 },
  ],
  'menu-items': [
    { id: 104, tenantId: 1 },
    { id: 204, tenantId: 2 },
  ],
  'blog-posts': [
    { id: 105, tenantId: 1 },
    { id: 205, tenantId: 2 },
  ],
  users: [
    { id: 301, tenants: [1] },
    { id: 302, tenants: [2] },
  ],
  tenants: [
    { id: 1, parentTenant: null },
    { id: 2, parentTenant: null },
    { id: 3, parentTenant: null },
  ],
}

const valuesFromCondition = (condition: unknown): number[] => {
  if (!condition || typeof condition !== 'object') return []
  const operator = condition as {
    equals?: number
    in?: number[]
  }
  if (Array.isArray(operator.in)) return operator.in
  return typeof operator.equals === 'number' ? [operator.equals] : []
}

const fixtureRequest = (
  overrides: Partial<Record<string, Fixture[]>> = {},
) => {
  const data = { ...fixtures, ...overrides }

  return {
    payload: {
      find: async (args: {
        collection: string
        where?: {
          and?: Array<Record<string, unknown>>
          id?: unknown
        }
      }) => {
        const docs = data[args.collection] ?? []
        const conditions = args.where?.and ?? []
        const hasInboundRelationshipCondition = conditions.some((condition) =>
          Object.keys(condition).some((key) => key !== 'id' && key !== 'tenantId'))
        if (hasInboundRelationshipCondition) return { docs: [] }

        const idCondition =
          args.where?.id ??
          conditions.find((condition) => 'id' in condition)?.id
        const tenantCondition =
          conditions.find((condition) => 'tenantId' in condition)?.tenantId

        const ids = valuesFromCondition(idCondition)
        const tenantIDs = valuesFromCondition(tenantCondition)

        return {
          docs: docs.filter((doc) =>
            (!ids.length || ids.includes(doc.id)) &&
            (!tenantIDs.length || tenantIDs.includes(doc.tenantId ?? -1))),
        }
      },
    },
    user: {
      id: 999,
      roles: ['super_admin'],
      tenants: [],
    },
  }
}

const validate = (
  relationTo: string,
  tenantID: number,
  value: unknown,
  req = fixtureRequest(),
) => validateRelationshipForTenant({
  path: relationTo,
  relationTo: relationTo as never,
  req: req as never,
  tenantID,
  value,
})

test('Tenant A Page accepts Tenant A Media and rejects Tenant B Media', async () => {
  await assert.doesNotReject(validate('media', 1, 101))
  await assert.rejects(validate('media', 1, 201))
})

test('Tenant A Menu Item accepts Tenant A Category and rejects Tenant B Category', async () => {
  await assert.doesNotReject(validate('menu-categories', 1, 103))
  await assert.rejects(validate('menu-categories', 1, 203))
})

test('Blog, Gallery, Testimonial, Navigation, and SEO reject Tenant B relationships', async () => {
  await assert.rejects(validate('blog-posts', 1, 205))
  await assert.rejects(validate('media', 1, 201))
  await assert.rejects(validate('media', 1, 201))
  await assert.rejects(validate('pages', 1, 202))
  await assert.rejects(validate('media', 1, 201))
})

test('Blog author must have membership in the parent tenant', async () => {
  await assert.doesNotReject(validate('users', 1, 301))
  await assert.rejects(validate('users', 1, 302))
})

test('Tenant branding accepts same-tenant Media and rejects foreign Media', async () => {
  const hook = sameTenantRelationship('media', {
    parentTenantIdentity: 'documentID',
    path: 'branding.logo',
  })
  const req = fixtureRequest()

  await assert.doesNotReject(hook({
    data: { id: 1 },
    operation: 'create',
    originalDoc: undefined,
    req,
    value: 101,
  } as never))

  await assert.rejects(hook({
    data: {},
    operation: 'update',
    originalDoc: { id: 1 },
    req,
    value: 201,
  } as never))
})

test('relationship normalizer supports raw, populated, hasMany, localized, and empty values', () => {
  assert.deepEqual(normalizeRelationshipIDs('101'), [101])
  assert.deepEqual(normalizeRelationshipIDs({ id: 101 }), [101])
  assert.deepEqual(
    normalizeRelationshipIDs([101, { id: 102 }, { value: '103' }]),
    [101, 102, 103],
  )
  assert.deepEqual(
    normalizeRelationshipIDs({ en: { id: 101 }, fr: '102' }),
    [101, 102],
  )
  assert.deepEqual(normalizeRelationshipIDs(null), [])
  assert.deepEqual(normalizeRelationshipIDs([]), [])
})

test('Tenant parent self-reference is rejected', async () => {
  await assert.rejects(validateTenantParent({
    data: {},
    operation: 'update',
    originalDoc: { id: 1 },
    req: fixtureRequest(),
    value: 1,
  } as never))
})

test('direct Tenant parent cycle is rejected', async () => {
  const req = fixtureRequest({
    tenants: [
      { id: 1, parentTenant: null },
      { id: 2, parentTenant: 1 },
    ],
  })

  await assert.rejects(validateTenantParent({
    data: {},
    operation: 'update',
    originalDoc: { id: 1 },
    req,
    value: 2,
  } as never))
})

test('indirect Tenant parent cycle is rejected', async () => {
  const req = fixtureRequest({
    tenants: [
      { id: 1, parentTenant: null },
      { id: 2, parentTenant: 3 },
      { id: 3, parentTenant: 1 },
    ],
  })

  await assert.rejects(validateTenantParent({
    data: {},
    operation: 'update',
    originalDoc: { id: 1 },
    req,
    value: 2,
  } as never))
})

test('Super Admin tenant transfer without relationships passes', async () => {
  await assert.doesNotReject(validateTenantTransfer({
    collection: { slug: 'gallery' },
    data: { tenantId: 2, media: null },
    operation: 'update',
    originalDoc: { id: 401, tenantId: 1, media: null },
    req: fixtureRequest(),
  } as never))
})

test('Super Admin tenant transfer causing an outbound mismatch fails', async () => {
  await assert.rejects(validateTenantTransfer({
    collection: { slug: 'gallery' },
    data: { tenantId: 2 },
    operation: 'update',
    originalDoc: { id: 401, tenantId: 1, media: 101 },
    req: fixtureRequest(),
  } as never))
})
