import assert from 'node:assert/strict'
import test from 'node:test'
import type { PayloadRequest } from 'payload'
import {
  canAssignRoles,
  canAssignTenants,
  canManageUser,
  getAllowedAssignableRoles,
  hasTenantAccess,
  isSuperAdminUser,
  isTenantAdminUser,
  isTenantMemberUser,
  USER_ROLES,
} from '../src/access/tenantContext.ts'
import {
  captureProtectedUserInput,
  enforceUserRBAC,
  stampUserAuditFields,
  Users,
} from '../src/collections/Users.ts'
import {
  MAX_MEDIA_FILE_SIZE,
  validateMediaUploadSize,
} from '../src/collections/Media.ts'
import { Tenants } from '../src/collections/Tenants.ts'
import { validateTenantIdentity } from '../src/hooks/validateTenantIdentity.ts'
import { assignTenant } from '../src/hooks/assignTenant.ts'
import {
  hasDuplicateRelationshipIDs,
  tenantRelationshipFilter,
} from '../src/hooks/sameTenantRelationship.ts'
import {
  normalizeDomain,
  normalizeContactPhone,
  normalizeEmail,
  normalizeHexColor,
  normalizeIndianMobile,
  normalizeSlug,
  validateDomain,
  validateContactPhone,
  validateConfiguredLink,
  validateDateOrder,
  validateEmail,
  validateFiniteInteger,
  validateFiniteNumber,
  validateHexColor,
  validateIndianMobile,
  validateName,
  validateSafeURL,
  validateSlug,
} from '../src/validation/shared.ts'

const superAdmin = {
  id: 1,
  roles: [USER_ROLES.superAdmin],
  tenants: [],
}
const tenantAdmin = {
  id: 2,
  roles: [USER_ROLES.tenantAdmin],
  tenants: [10],
}
const tenantMember = {
  id: 3,
  roles: [USER_ROLES.tenantMember],
  tenants: [10],
}

test('role helpers enforce the explicit hierarchy', () => {
  assert.equal(isSuperAdminUser(superAdmin), true)
  assert.equal(isTenantAdminUser(tenantAdmin), true)
  assert.equal(isTenantMemberUser(tenantMember), true)
  assert.deepEqual(getAllowedAssignableRoles(tenantAdmin), [USER_ROLES.tenantMember])
  assert.equal(canAssignRoles(superAdmin, [USER_ROLES.superAdmin]), true)
  assert.equal(canAssignRoles(tenantAdmin, [USER_ROLES.tenantMember]), true)
  assert.equal(canAssignRoles(tenantAdmin, [USER_ROLES.tenantAdmin]), false)
  assert.equal(canAssignRoles(tenantAdmin, [USER_ROLES.superAdmin]), false)
  assert.equal(canAssignRoles(tenantMember, [USER_ROLES.tenantMember]), false)
})

test('tenant assignment and target-management matrices reject cross-tenant access', () => {
  assert.equal(hasTenantAccess(tenantAdmin, 10), true)
  assert.equal(hasTenantAccess(tenantAdmin, 20), false)
  assert.equal(canAssignTenants(superAdmin, [10, 20]), true)
  assert.equal(canAssignTenants(tenantAdmin, [10]), true)
  assert.equal(canAssignTenants(tenantAdmin, [20]), false)
  assert.equal(canAssignTenants(tenantAdmin, [10, 10]), false)
  assert.equal(canManageUser(tenantAdmin, tenantMember), true)
  assert.equal(
    canManageUser(tenantAdmin, {
      roles: [USER_ROLES.tenantMember],
      tenants: [10, 20],
    }),
    false,
  )
  assert.equal(canManageUser(tenantAdmin, superAdmin), false)
  assert.equal(canManageUser(tenantMember, tenantMember), false)
})

test('Users Admin UI hides protected role and tenant controls from non-Super Admins', () => {
  const namedFields = Users.fields.filter(
    (field): field is Extract<typeof field, { name: string }> => 'name' in field,
  )
  const rolesField = namedFields.find((field) => field.name === 'roles')
  const tenantsField = namedFields.find((field) => field.name === 'tenants')
  assert.ok(rolesField && tenantsField)

  const roleCondition = rolesField.admin?.condition as unknown as (
    data: unknown,
    siblingData: unknown,
    context: { user: unknown },
  ) => boolean
  const tenantCondition = tenantsField.admin?.condition as unknown as typeof roleCondition
  assert.equal(roleCondition({}, {}, { user: superAdmin }), true)
  assert.equal(roleCondition({}, {}, { user: tenantAdmin }), false)
  assert.equal(tenantCondition({}, {}, { user: tenantAdmin }), false)

  const hidden = Users.admin?.hidden as unknown as (
    context: { user: unknown },
  ) => boolean
  assert.equal(hidden({ user: tenantAdmin }), false)
  assert.equal(hidden({ user: tenantMember }), true)
})

test('Tenants access is read-only and membership-scoped for non-Super Admins', async () => {
  const read = Tenants.access?.read
  const create = Tenants.access?.create
  const update = Tenants.access?.update
  const remove = Tenants.access?.delete
  if (
    typeof read !== 'function' ||
    typeof create !== 'function' ||
    typeof update !== 'function' ||
    typeof remove !== 'function'
  ) {
    assert.fail('Tenants collection access functions must all be configured.')
  }

  assert.deepEqual(
    await read({
      req: requestFor(tenantAdmin),
    } as never),
    { id: { in: [10] } },
  )
  assert.equal(
    await create({
      req: requestFor(tenantAdmin),
    } as never),
    false,
  )
  assert.equal(
    await update({
      req: requestFor(tenantMember),
    } as never),
    false,
  )
  assert.equal(
    await remove({
      req: requestFor(superAdmin),
    } as never),
    true,
  )
})

const requestFor = (
  user: typeof superAdmin | typeof tenantAdmin | typeof tenantMember,
): PayloadRequest => ({
  context: {},
  headers: new Headers({ 'x-tenant-id': '10' }),
  payload: {
    count: async () => ({ totalDocs: 1 }),
    find: async () => ({
      docs: [{ id: 10, isActive: true }],
      totalDocs: 1,
    }),
  },
  user,
} as unknown as PayloadRequest)

const runUserValidation = (
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown> | undefined,
  user: typeof superAdmin | typeof tenantAdmin | typeof tenantMember,
  operation: 'create' | 'update',
) => {
  const req = requestFor(user)
  captureProtectedUserInput({
    args: { data },
    operation,
    req,
  } as never)

  const fieldAccessibleData = { ...data }
  if (!isSuperAdminUser(user)) {
    delete fieldAccessibleData.apiKey
    delete fieldAccessibleData.roles
    delete fieldAccessibleData.tenants
  }

  return enforceUserRBAC({
    data: fieldAccessibleData,
    operation,
    originalDoc,
    req,
  } as never)
}

test('Tenant Admin crafted role and membership escalation is rejected server-side', async () => {
  await assert.rejects(
    () => runUserValidation({
      email: 'new@example.com',
      name: 'New User',
      roles: [USER_ROLES.superAdmin],
      tenants: [10],
    }, undefined, tenantAdmin, 'create'),
    /invalid: roles/i,
  )
  await assert.rejects(
    () => runUserValidation({
      roles: [USER_ROLES.superAdmin],
    }, tenantAdmin, tenantAdmin, 'update'),
    /invalid: roles/i,
  )
  await assert.rejects(
    () => runUserValidation({
      tenants: [20],
    }, tenantMember, tenantAdmin, 'update'),
    /invalid: tenants/i,
  )
  await assert.rejects(
    () => runUserValidation({
      apiKey: 'crafted-api-key',
      email: 'member@example.com',
      name: 'Tenant Member',
    }, undefined, tenantAdmin, 'create'),
    /invalid: apiKey/i,
  )
})

test('Users read scope excludes Super Admins and mixed unauthorized memberships', async () => {
  const read = Users.access?.read
  if (typeof read !== 'function') {
    assert.fail('Users read access must be configured.')
  }
  const req = requestFor(tenantAdmin)
  req.payload.find = async () => ({
    docs: [{ id: 10 }, { id: 20 }],
    totalDocs: 2,
  }) as never

  assert.deepEqual(await read({ req } as never), {
    and: [
      { roles: { not_in: [USER_ROLES.superAdmin] } },
      { tenants: { in: [10] } },
      { tenants: { not_in: [20] } },
    ],
  })
  assert.deepEqual(
    await read({ req: requestFor(tenantMember) } as never),
    { id: { equals: tenantMember.id } },
  )
})

test('Tenant Admin cannot modify a Super Admin through collection hooks', async () => {
  await assert.rejects(
    () => runUserValidation(
      { name: 'Changed Name' },
      superAdmin,
      tenantAdmin,
      'update',
    ),
    /invalid: id/i,
  )
})

test('allowed Tenant Admin creation is forced to the safe member role and active tenant', async () => {
  const data = {
    email: 'member@example.com',
    name: 'Tenant Member',
  }
  const result = await runUserValidation(data, undefined, tenantAdmin, 'create')
  assert.deepEqual(result?.roles, [USER_ROLES.tenantMember])
  assert.deepEqual(result?.tenants, [10])
})

test('audit fields ignore crafted values and preserve original creator', async () => {
  const result = await stampUserAuditFields({
    data: { createdBy: 999, updatedBy: 999 },
    operation: 'update',
    originalDoc: { createdBy: 7, updatedBy: 8 },
    req: requestFor(tenantAdmin),
  } as never)
  assert.equal(result.createdBy, 7)
  assert.equal(result.updatedBy, tenantAdmin.id)
})

test('tenant-scoped content cannot be moved with a crafted tenant field', async () => {
  await assert.rejects(
    () => assignTenant({
      data: { tenantId: 20 },
      operation: 'update',
      originalDoc: { id: 100, tenantId: 10 },
      req: requestFor(tenantAdmin),
    } as never),
    /invalid: tenantId/i,
  )
})

test('Indian mobile validation accepts normalized supported forms', () => {
  for (const value of ['9876543210', '+91 98765 43210', '91-9876543210']) {
    const normalized = normalizeIndianMobile(value)
    assert.equal(normalized, '9876543210')
    assert.equal(validateIndianMobile(normalized), true)
  }
})

test('Indian mobile validation rejects malformed values', () => {
  for (const value of [
    '987654321',
    '98765432100',
    '1234567890',
    'abc9876543',
    '98765abc10',
    '   ',
    null,
  ]) {
    assert.notEqual(validateIndianMobile(value), true)
  }
})

test('generic contact phone validation allows international syntax without forcing Indian rules', () => {
  for (const value of ['+1 (415) 555-2671', '+44 20 7946 0958', '080 1234 5678']) {
    assert.equal(validateContactPhone(normalizeContactPhone(value)), true)
  }
  for (const value of ['phone', '123', '<script>', '+12 34 ext 5']) {
    assert.notEqual(validateContactPhone(value), true)
  }
})

test('email validation normalizes valid addresses and rejects malformed input', () => {
  for (const value of ['admin@example.com', 'user.name+tag@example.co.in']) {
    assert.equal(validateEmail(normalizeEmail(value)), true)
  }
  for (const value of [
    'admin',
    'admin@',
    '@example.com',
    'admin example@example.com',
    '   ',
  ]) {
    assert.notEqual(validateEmail(value), true)
  }
})

test('slug and domain validation enforce normalized safe identifiers', () => {
  assert.equal(normalizeSlug('Ghee Roast'), 'ghee-roast')
  assert.equal(validateSlug(normalizeSlug('Ghee Roast')), true)
  assert.equal(validateSlug('zuru-zuru'), true)
  for (const value of ['/ghee-roast', 'ghee_roast', 'admin']) {
    assert.notEqual(validateSlug(value), true)
  }

  for (const value of ['ghee-roast.localhost', 'gheeroast.com', 'www.gheeroast.com']) {
    assert.equal(validateDomain(normalizeDomain(value)), true)
  }
  for (const value of [
    'https://gheeroast.com/path',
    'javascript:alert(1)',
    'invalid domain',
    '   ',
  ]) {
    assert.notEqual(validateDomain(normalizeDomain(value)), true)
  }
})

test('tenant validation rejects duplicate domains and duplicate primary tenants', async () => {
  const duplicateDomainRequest = {
    payload: {
      find: async ({ where }: { where: unknown }) => ({
        docs: JSON.stringify(where).includes('domains.domain') ? [{ id: 2 }] : [],
      }),
    },
  }
  await assert.rejects(
    () => validateTenantIdentity({
      data: {
        domains: [{ domain: 'gheeroast.com' }],
        isPrimary: false,
        name: 'Ghee Roast',
        slug: 'ghee-roast',
      },
      operation: 'create',
      req: duplicateDomainRequest,
    } as never),
    /invalid: domains/i,
  )

  const duplicatePrimaryRequest = {
    payload: {
      find: async ({ where }: { where: unknown }) => ({
        docs: JSON.stringify(where).includes('isPrimary') ? [{ id: 2 }] : [],
      }),
    },
  }
  await assert.rejects(
    () => validateTenantIdentity({
      data: {
        domains: [],
        isPrimary: true,
        name: 'Ghee Roast',
        slug: 'ghee-roast',
      },
      operation: 'create',
      req: duplicatePrimaryRequest,
    } as never),
    /invalid: isPrimary/i,
  )
})

test('URL, color, and name validation reject unsafe or malformed input', () => {
  assert.equal(validateSafeURL('/menu'), true)
  assert.equal(validateSafeURL('https://example.com/menu'), true)
  assert.notEqual(validateSafeURL('javascript:alert(1)'), true)

  for (const value of ['#000000', '#d4af37', '#fff']) {
    assert.equal(validateHexColor(normalizeHexColor(value)), true)
  }
  for (const value of ['black', '000000', '#12', '<script>']) {
    assert.notEqual(validateHexColor(value), true)
  }

  assert.equal(validateName('Gaurav Singh-Pal'), true)
  assert.notEqual(validateName(' '), true)
  assert.notEqual(validateName('A'), true)

  assert.equal(validateConfiguredLink('#menu', 'anchor'), true)
  assert.equal(validateConfiguredLink('mailto:admin@example.com', 'email'), true)
  assert.equal(validateConfiguredLink('tel:+91 98765 43210', 'phone'), true)
  assert.notEqual(validateConfiguredLink('javascript:alert(1)', 'custom'), true)
})

test('integer validation rejects fractional and non-finite values', () => {
  assert.equal(validateFiniteInteger(0, { min: 0, max: 100 }), true)
  assert.equal(validateFiniteInteger(100, { min: 0, max: 100 }), true)
  for (const value of [NaN, Infinity, -Infinity, 1.5, -1, 101, '10']) {
    assert.notEqual(validateFiniteInteger(value, { min: 0, max: 100 }), true)
  }
})

test('price validation allows finite two-decimal values only', () => {
  for (const value of [0, 99, 99.5, 99.99]) {
    assert.equal(
      validateFiniteNumber(value, { decimalPlaces: 2, min: 0, max: 1_000_000 }),
      true,
    )
  }
  for (const value of [NaN, Infinity, -1, 99.999, 1_000_001, '99.99']) {
    assert.notEqual(
      validateFiniteNumber(value, { decimalPlaces: 2, min: 0, max: 1_000_000 }),
      true,
    )
  }
})

test('date ordering rejects invalid and reversed publication windows', () => {
  assert.equal(validateDateOrder('2026-07-29', '2026-07-30'), true)
  assert.equal(validateDateOrder('2026-07-29', '2026-07-29'), true)
  assert.notEqual(validateDateOrder('2026-07-30', '2026-07-29'), true)
  assert.notEqual(validateDateOrder('not-a-date', '2026-07-29'), true)
})

test('hasMany relationship validation detects duplicate raw and populated IDs', () => {
  assert.equal(hasDuplicateRelationshipIDs([10, 11]), false)
  assert.equal(hasDuplicateRelationshipIDs([10, 10]), true)
  assert.equal(
    hasDuplicateRelationshipIDs([{ id: 10 }, { value: { id: 10 } }]),
    true,
  )
})

test('relationship dropdown filters stay inside the document tenant', () => {
  const mediaFilter = tenantRelationshipFilter('media')
  const userFilter = tenantRelationshipFilter('users')
  const context = {
    blockData: undefined,
    data: { tenantId: 10 },
    id: undefined,
    req: requestFor(tenantAdmin),
    siblingData: {},
    user: tenantAdmin,
  }
  assert.deepEqual(
    mediaFilter({ ...context, relationTo: 'media' } as never),
    { tenantId: { equals: 10 } },
  )
  assert.deepEqual(
    userFilter({ ...context, relationTo: 'users' } as never),
    { tenants: { in: [10] } },
  )
})

test('media upload validation deterministically rejects images over 10 MB', () => {
  const requestWithSize = (size: number) => ({
    file: {
      data: Buffer.alloc(0),
      mimetype: 'image/png',
      name: 'stage-security-check.png',
      size,
    },
  })

  assert.doesNotThrow(() => validateMediaUploadSize({
    args: { data: {} },
    operation: 'create',
    req: requestWithSize(MAX_MEDIA_FILE_SIZE),
  } as never))
  assert.throws(
    () => validateMediaUploadSize({
      args: { data: {} },
      operation: 'create',
      req: requestWithSize(MAX_MEDIA_FILE_SIZE + 1),
    } as never),
    (error: unknown) => {
      const cause = (error as {
        cause?: { errors?: Array<{ message?: string; path?: string }> }
      }).cause
      assert.equal(cause?.errors?.[0]?.path, 'file')
      assert.equal(cause?.errors?.[0]?.message, 'Images must be 10 MB or smaller.')
      return true
    },
  )
})
