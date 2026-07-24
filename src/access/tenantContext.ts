import type { Access, PayloadRequest, User, Where } from 'payload'

export type TenantID = number
export type UserRole = NonNullable<User['roles']>[number]

const toTenantID = (value: unknown): TenantID | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return toTenantID(value.id)
  }
  return null
}

export const getUserRoles = (user: PayloadRequest['user']): UserRole[] =>
  Array.isArray(user?.roles)
    ? user.roles.filter(
        (role): role is UserRole =>
          role === 'super_admin' || role === 'tenant_admin' || role === 'tenant_member',
      )
    : []

export const userHasRole = (
  user: PayloadRequest['user'],
  role: UserRole,
): boolean => getUserRoles(user).includes(role)

export const isSuperAdminUser = (user: PayloadRequest['user']): boolean =>
  userHasRole(user, 'super_admin')

export const isTenantAdminUser = (user: PayloadRequest['user']): boolean =>
  userHasRole(user, 'tenant_admin')

export const getUserTenantIDs = (
  user: { tenants?: User['tenants'] } | null | undefined,
): TenantID[] => {
  if (!Array.isArray(user?.tenants)) return []

  return Array.from(
    new Set(
      user.tenants
        .map(toTenantID)
        .filter((tenantID): tenantID is TenantID => tenantID !== null),
    ),
  )
}

export const getExplicitTenantID = (req: PayloadRequest): TenantID | null =>
  toTenantID(req.headers.get('x-tenant-id'))

export const getAuthenticatedTenantID = (req: PayloadRequest): TenantID | null => {
  const tenantIDs = getUserTenantIDs(req.user)

  let candidateTenantID: TenantID | null = null
  if (tenantIDs.length === 1) {
    candidateTenantID = tenantIDs[0]
  } else {
    const explicitTenantID = getExplicitTenantID(req)
    if (explicitTenantID && tenantIDs.includes(explicitTenantID)) {
      candidateTenantID = explicitTenantID
    }
  }

  if (candidateTenantID) {
    // If the tenant is populated in req.user.tenants, check isActive
    const selectedTenant = (req.user?.tenants || []).find((t: any) =>
      toTenantID(typeof t === 'object' && t !== null ? t.id : t) === candidateTenantID
    )
    if (selectedTenant && typeof selectedTenant === 'object' && 'isActive' in selectedTenant) {
      if (selectedTenant.isActive === false) return null
    }
    return candidateTenantID
  }

  return null
}

export type ActiveTenantContext = {
  tenantID: TenantID | null
  isSuperAdmin: boolean
}

/**
 * Resolves mutation tenant context from authenticated membership plus the
 * validated x-tenant-id header. Multi-tenant non-super users are deliberately
 * ambiguous until they select one of their own tenants.
 */
export const resolveActiveTenantContext = (
  req: PayloadRequest,
): ActiveTenantContext | null => {
  if (!req.user) return null

  if (isSuperAdminUser(req.user)) {
    return {
      tenantID: getExplicitTenantID(req),
      isSuperAdmin: true,
    }
  }

  const tenantID = getAuthenticatedTenantID(req)
  if (!tenantID) return null

  return {
    tenantID,
    isSuperAdmin: false,
  }
}

const activeTenantMutationWhere = (req: PayloadRequest): true | Where | false => {
  const context = resolveActiveTenantContext(req)
  if (!context) return false
  if (context.isSuperAdmin) return true
  if (!isTenantAdminUser(req.user) || !context.tenantID) return false

  return {
    tenantId: {
      equals: context.tenantID,
    },
  }
}

export const canCreateTenantContent: Access = ({ req }) => {
  const context = resolveActiveTenantContext(req)
  if (!context) return false
  if (context.isSuperAdmin) return true
  return Boolean(context.tenantID && isTenantAdminUser(req.user))
}

export const canCreateTenantUser = canCreateTenantContent

export const canUpdateTenantContent: Access = ({ req }) =>
  activeTenantMutationWhere(req)

export const canDeleteTenantContent: Access = ({ req }) =>
  activeTenantMutationWhere(req)

export const tenantContentMutations = {
  create: canCreateTenantContent,
  update: canUpdateTenantContent,
  delete: canDeleteTenantContent,
}

export const canManageUserWithinActiveTenant: Access = ({ req }) => {
  const context = resolveActiveTenantContext(req)
  if (!context) return false
  if (context.isSuperAdmin) return true
  if (!context.tenantID || !isTenantAdminUser(req.user)) return false

  return {
    tenants: {
      in: [context.tenantID],
    },
  }
}

/**
 * Tenant Admins may edit a user through one active tenant, but they do not own
 * that user's memberships in any other tenant. Phase 1 therefore preserves the
 * complete existing membership set and ignores membership changes in request
 * data. Membership administration remains a Super Admin operation.
 */
export const preserveUnmanagedTenantMemberships = (
  originalTenants: User['tenants'] | null | undefined,
): TenantID[] => getUserTenantIDs({ tenants: originalTenants ?? [] })

export const preserveTenantAdminManagedUserState = (
  originalUser: Pick<User, 'roles' | 'tenants'>,
): Pick<User, 'roles' | 'tenants'> => ({
  roles: originalUser.roles,
  tenants: preserveUnmanagedTenantMemberships(originalUser.tenants),
})

export const getTenantReadScope = (
  req: PayloadRequest,
): true | Where | false => {
  if (!req.user) return false
  if (isSuperAdminUser(req.user)) return true

  const tenantIDs = getUserTenantIDs(req.user)
  if (!tenantIDs.length) return false

  return {
    tenantId: {
      in: tenantIDs,
    },
  }
}

const normalizeHostname = (host: string | null): string =>
  (host || '').trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '')

export const resolvePublicTenantID = async (
  req: PayloadRequest,
): Promise<TenantID | null> => {
  const hostname = normalizeHostname(req.headers.get('host'))
  const isLocalDevelopment =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'

  let tenantWhere: import('payload').Where
  if (isLocalDevelopment) {
    tenantWhere = {
      slug: {
        equals: process.env.DEFAULT_TENANT_SLUG || '',
      },
    }
  } else {
    tenantWhere = {
      'domains.domain': {
        equals: hostname,
      },
    }
  }

  if ((!isLocalDevelopment && !hostname) || (isLocalDevelopment && !process.env.DEFAULT_TENANT_SLUG)) {
    return null
  }

  const result = await req.payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        tenantWhere,
        {
          isActive: {
            equals: true,
          },
        },
      ],
    },
  })

  if (result.docs.length !== 1) return null
  return toTenantID(result.docs[0].id)
}

export const resolveTrustedTenantID = async (
  req: PayloadRequest,
): Promise<TenantID | null> => {
  if (req.user) return getAuthenticatedTenantID(req)
  return resolvePublicTenantID(req)
}

export const normalizeTenantID = toTenantID
