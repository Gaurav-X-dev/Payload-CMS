import type { Access, PayloadRequest, User, Where } from 'payload'
import { resolveHostname } from '../lib/site/resolveHostname'
import { resolveLocalSite } from '../lib/site/resolveLocalSite'

export type TenantID = number
export type UserRole = NonNullable<User['roles']>[number]
export type AuthorizationUser = {
  id?: unknown
  roles?: unknown
  tenants?: unknown
}

export const USER_ROLES = {
  superAdmin: 'super_admin',
  tenantAdmin: 'tenant_admin',
  tenantMember: 'tenant_member',
} as const satisfies Record<string, UserRole>

export const USER_ROLE_OPTIONS = [
  { label: 'Super Admin', value: USER_ROLES.superAdmin },
  { label: 'Tenant Admin', value: USER_ROLES.tenantAdmin },
  { label: 'Tenant Member', value: USER_ROLES.tenantMember },
] as const

export const TENANT_ADMIN_ASSIGNABLE_ROLES: readonly UserRole[] = [
  USER_ROLES.tenantMember,
]

const toTenantID = (value: unknown): TenantID | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return toTenantID(value.id)
  }
  return null
}

export const getUserRoles = (user: AuthorizationUser | null | undefined): UserRole[] =>
  Array.isArray(user?.roles)
    ? user.roles.filter(
        (role): role is UserRole =>
          Object.values(USER_ROLES).includes(role),
      )
    : []

export const userHasRole = (
  user: AuthorizationUser | null | undefined,
  role: UserRole,
): boolean => getUserRoles(user).includes(role)

export const isSuperAdminUser = (user: AuthorizationUser | null | undefined): boolean =>
  userHasRole(user, USER_ROLES.superAdmin)

export const isTenantAdminUser = (user: AuthorizationUser | null | undefined): boolean =>
  userHasRole(user, USER_ROLES.tenantAdmin)

export const isTenantMemberUser = (user: AuthorizationUser | null | undefined): boolean =>
  userHasRole(user, USER_ROLES.tenantMember)

export const getUserTenantIDs = (
  user: { tenants?: unknown } | null | undefined,
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

export const getAllowedTenantIDs = getUserTenantIDs

export const hasTenantAccess = (
  user: Parameters<typeof getUserTenantIDs>[0],
  tenantID: unknown,
): boolean => {
  const normalized = toTenantID(tenantID)
  return Boolean(normalized && getUserTenantIDs(user).includes(normalized))
}

export const getAllowedAssignableRoles = (
  actor: AuthorizationUser | null | undefined,
): readonly UserRole[] => {
  if (isSuperAdminUser(actor)) return Object.values(USER_ROLES)
  if (isTenantAdminUser(actor)) return TENANT_ADMIN_ASSIGNABLE_ROLES
  return []
}

export const canAssignRoles = (
  actor: AuthorizationUser | null | undefined,
  requestedRoles: unknown,
): boolean => {
  if (!Array.isArray(requestedRoles) || requestedRoles.length === 0) return false
  const normalized = requestedRoles.filter(
    (role): role is UserRole =>
      typeof role === 'string' && Object.values(USER_ROLES).includes(role as UserRole),
  )
  if (
    normalized.length !== requestedRoles.length ||
    new Set(normalized).size !== normalized.length
  ) {
    return false
  }
  const allowed = getAllowedAssignableRoles(actor)
  return normalized.every((role) => allowed.includes(role))
}

export const canAssignTenants = (
  actor: AuthorizationUser | null | undefined,
  requestedTenantIDs: unknown,
): boolean => {
  if (!Array.isArray(requestedTenantIDs)) return false
  const normalized = requestedTenantIDs.map(toTenantID)
  if (
    normalized.some((tenantID) => tenantID === null) ||
    new Set(normalized).size !== normalized.length
  ) {
    return false
  }
  if (isSuperAdminUser(actor)) return true
  if (!isTenantAdminUser(actor) || normalized.length === 0) return false
  const allowed = getUserTenantIDs(actor)
  return normalized.every(
    (tenantID) => tenantID !== null && allowed.includes(tenantID),
  )
}

export const canManageUser = (
  actor: AuthorizationUser | null | undefined,
  target: AuthorizationUser | null | undefined,
): boolean => {
  if (isSuperAdminUser(actor)) return true
  if (!isTenantAdminUser(actor) || !target || isSuperAdminUser(target)) {
    return false
  }
  const actorTenantIDs = getUserTenantIDs(actor)
  const targetTenantIDs = getUserTenantIDs(target)
  return (
    targetTenantIDs.length > 0 &&
    targetTenantIDs.every((tenantID) => actorTenantIDs.includes(tenantID))
  )
}

export const getAuthenticatedTenantID = (req: PayloadRequest): TenantID | null => {
  const tenantIDs = getUserTenantIDs(req.user)

  let candidateTenantID: TenantID | null = null
  if (tenantIDs.length === 1) {
    candidateTenantID = tenantIDs[0]
  } else {
    const explicitTenantID = getExplicitTenantID(req)
    if (explicitTenantID && tenantIDs.includes(explicitTenantID)) {
      candidateTenantID = explicitTenantID
    } else {
      const host = req.headers?.get?.('host')
      if (host) {
        const localSite = resolveLocalSite(host)
        if (localSite && Array.isArray(req.user?.tenants)) {
          const matchedTenant = req.user.tenants.find((tenant) => {
            if (tenant && typeof tenant === 'object') {
              const id = toTenantID(tenant)
              const slug = 'slug' in tenant ? tenant.slug : null
              return slug === localSite.key && id !== null && tenantIDs.includes(id)
            }
            return false
          })
          if (matchedTenant && typeof matchedTenant === 'object') {
            candidateTenantID = toTenantID(matchedTenant)
          }
        }
      }
    }
  }

  if (candidateTenantID) {
    // If the tenant is populated in req.user.tenants, check isActive
    const selectedTenant = (req.user?.tenants || []).find((tenant) =>
      toTenantID(tenant) === candidateTenantID
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
  if (!req.user) return false
  if (isSuperAdminUser(req.user)) return true
  if (!isTenantAdminUser(req.user)) return false

  const context = resolveActiveTenantContext(req)
  if (context?.tenantID) {
    return {
      tenantId: {
        equals: context.tenantID,
      },
    }
  }

  const tenantIDs = getUserTenantIDs(req.user)
  if (tenantIDs.length > 0) {
    return {
      tenantId: {
        in: tenantIDs,
      },
    }
  }

  return false
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
  if (!req.user) return false
  if (isSuperAdminUser(req.user)) return true
  if (!isTenantAdminUser(req.user)) return false

  const context = resolveActiveTenantContext(req)
  if (context?.tenantID) {
    return {
      tenants: {
        in: [context.tenantID],
      },
    }
  }

  const tenantIDs = getUserTenantIDs(req.user)
  if (tenantIDs.length > 0) {
    return {
      tenants: {
        in: tenantIDs,
      },
    }
  }

  return false
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

export const tenantScopeWhere = (
  req: PayloadRequest,
  field = 'tenantId',
): true | Where | false => {
  if (!req.user) return false
  if (isSuperAdminUser(req.user)) return true
  const tenantIDs = getUserTenantIDs(req.user)
  if (!tenantIDs.length) return false
  return {
    [field]: {
      in: tenantIDs,
    },
  }
}

export const resolvePublicTenantID = async (
  req: PayloadRequest,
): Promise<TenantID | null> => {
  const host = req.headers.get('host')
  const hostname = resolveHostname(host)
  const isLocalDevelopment =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  const localSite = resolveLocalSite(host)

  let tenantWhere: import('payload').Where
  if (isLocalDevelopment) {
    tenantWhere = {
      slug: {
        equals: process.env.DEFAULT_TENANT_SLUG || '',
      },
    }
  } else if (localSite) {
    tenantWhere = {
      slug: {
        equals: localSite.key,
      },
    }
  } else {
    tenantWhere = {
      'domains.domain': {
        equals: hostname,
      },
    }
  }

  if (!hostname || (isLocalDevelopment && !process.env.DEFAULT_TENANT_SLUG)) {
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
export const normalizeRelationshipID = toTenantID
