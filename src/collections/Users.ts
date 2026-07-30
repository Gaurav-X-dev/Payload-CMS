import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  PayloadRequest,
  User,
  Where,
} from 'payload'
import { ValidationError } from 'payload'
import {
  canAssignRoles,
  canAssignTenants,
  canCreateTenantUser,
  canManageUser,
  getAuthenticatedTenantID,
  getUserTenantIDs,
  isSuperAdminUser,
  isTenantAdminUser,
  USER_ROLES,
  USER_ROLE_OPTIONS,
} from '../access/tenantContext'
import {
  normalizeEmail,
  normalizeName,
  validateEmail,
  validateName,
} from '../validation/shared'

const userSecurityError = (
  message: string,
  path: string,
): never => {
  throw new ValidationError({
    errors: [{ message, path }],
  })
}

const manageableUserWhere = async (
  req: PayloadRequest,
): Promise<true | Where | false> => {
  if (isSuperAdminUser(req.user)) return true
  if (!req.user || !isTenantAdminUser(req.user)) return false

  const tenantIDs = getUserTenantIDs(req.user)
  if (!tenantIDs.length) return false

  // Internal access is intentional: only tenant IDs are selected so the
  // access filter can exclude users with any unmanaged membership.
  const tenants = await req.payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 10_000,
    overrideAccess: true,
    pagination: false,
  })
  const unauthorizedTenantIDs = tenants.docs
    .map((tenant) => tenant.id)
    .filter((tenantID) => !tenantIDs.includes(Number(tenantID)))

  const conditions: Where[] = [
    { roles: { not_in: [USER_ROLES.superAdmin] } },
    { tenants: { in: tenantIDs } },
  ]
  if (unauthorizedTenantIDs.length) {
    conditions.push({ tenants: { not_in: unauthorizedTenantIDs } })
  }
  return { and: conditions }
}

const readUsers: Access = async ({ req }) => {
  if (isSuperAdminUser(req.user) || isTenantAdminUser(req.user)) {
    return manageableUserWhere(req)
  }
  if (!req.user) return false
  return {
    id: {
      equals: req.user.id,
    },
  }
}

const updateUsers: Access = async ({ req }) => {
  if (isSuperAdminUser(req.user) || isTenantAdminUser(req.user)) {
    return manageableUserWhere(req)
  }
  if (!req.user) return false
  return { id: { equals: req.user.id } }
}

const deleteUsers: Access = async ({ req }) => {
  if (isSuperAdminUser(req.user)) return true
  if (isTenantAdminUser(req.user) && req.user) {
    const scope = await manageableUserWhere(req)
    if (!scope || scope === true) return scope
    return {
      and: [
        scope,
        { id: { not_equals: req.user.id } },
      ],
    }
  }
  return false
}

const sameIDs = (left: unknown, right: unknown): boolean => {
  const leftIDs = getUserTenantIDs({ tenants: Array.isArray(left) ? left as User['tenants'] : [] })
  const rightIDs = getUserTenantIDs({ tenants: Array.isArray(right) ? right as User['tenants'] : [] })
  return leftIDs.length === rightIDs.length && leftIDs.every((id) => rightIDs.includes(id))
}

const sameRoles = (left: unknown, right: unknown): boolean => {
  if (!Array.isArray(left) || !Array.isArray(right)) return false
  return left.length === right.length && left.every((role) => right.includes(role))
}

type ProtectedUserInput = {
  apiKeyPresent: boolean
  roles?: unknown
  rolesPresent: boolean
  tenants?: unknown
  tenantsPresent: boolean
}

const PROTECTED_USER_INPUT_CONTEXT_KEY = 'protectedUserInput'

const getProtectedUserInput = (req: PayloadRequest): ProtectedUserInput => {
  const value = req.context?.[PROTECTED_USER_INPUT_CONTEXT_KEY]
  if (!value || typeof value !== 'object') {
    return {
      apiKeyPresent: false,
      rolesPresent: false,
      tenantsPresent: false,
    }
  }
  return value as ProtectedUserInput
}

/**
 * Payload applies field access before collection beforeValidate hooks. Capture
 * protected raw input here so a crafted API request is rejected explicitly
 * instead of having an unauthorized field silently removed.
 */
export const captureProtectedUserInput: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (
    (operation !== 'create' && operation !== 'update') ||
    req.context?.developmentReset === true ||
    req.context?.developmentSeed === true ||
    !('data' in args) ||
    !args.data ||
    typeof args.data !== 'object'
  ) {
    return args
  }

  const rawData = args.data as Record<string, unknown>
  req.context[PROTECTED_USER_INPUT_CONTEXT_KEY] = {
    apiKeyPresent: Object.hasOwn(rawData, 'apiKey'),
    roles: rawData.roles,
    rolesPresent: Object.hasOwn(rawData, 'roles'),
    tenants: rawData.tenants,
    tenantsPresent: Object.hasOwn(rawData, 'tenants'),
  } satisfies ProtectedUserInput

  return args
}

const ensureTenantReferences = async ({
  req,
  tenantIDs,
}: {
  req: PayloadRequest
  tenantIDs: number[]
}): Promise<void> => {
  if (!tenantIDs.length) return
  const tenants = await req.payload.find({
    collection: 'tenants',
    depth: 0,
    limit: tenantIDs.length,
    overrideAccess: true,
    pagination: false,
    select: { id: true, isActive: true },
    where: {
      and: [
        { id: { in: tenantIDs } },
        { isActive: { equals: true } },
      ],
    },
  })
  if (tenants.docs.length !== tenantIDs.length) {
    userSecurityError('Every assigned tenant must exist and be active.', 'tenants')
  }
}

export const enforceUserRBAC: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data
  if (req.context?.developmentReset === true) return data

  if (data.name !== undefined) {
    data.name = normalizeName(data.name)
    const nameResult = validateName(data.name)
    if (nameResult !== true) userSecurityError(nameResult, 'name')
  }
  if (data.email !== undefined) {
    data.email = normalizeEmail(data.email)
    const emailResult = validateEmail(data.email)
    if (emailResult !== true) userSecurityError(emailResult, 'email')
  }

  if (req.context?.developmentSeed === true) return data

  const protectedInput = getProtectedUserInput(req)

  if (!req.user && operation === 'create') {
    const existingUsers = await req.payload.count({
      collection: 'users',
      overrideAccess: true,
    })
    if (existingUsers.totalDocs === 0) {
      data.roles = [USER_ROLES.superAdmin]
      data.tenants = []
      return data
    }
  }

  if (isSuperAdminUser(req.user)) {
    const requestedRoles = data.roles ?? originalDoc?.roles
    const requestedTenants = data.tenants ?? originalDoc?.tenants ?? []
    if (!canAssignRoles(req.user, requestedRoles)) {
      return userSecurityError('One or more selected roles cannot be assigned.', 'roles')
    }
    if (!canAssignTenants(req.user, requestedTenants)) {
      return userSecurityError('One or more selected tenants cannot be assigned.', 'tenants')
    }
    const roles = requestedRoles as User['roles']
    const tenantIDs = getUserTenantIDs({
      tenants: requestedTenants as User['tenants'],
    })
    if (roles.includes(USER_ROLES.superAdmin)) {
      if (roles.length !== 1 || tenantIDs.length) {
        return userSecurityError(
          'Super Admin must be the only role and cannot have tenant memberships.',
          'roles',
        )
      }
    } else {
      if (!tenantIDs.length) {
        return userSecurityError('A tenant role requires at least one active tenant.', 'tenants')
      }
      await ensureTenantReferences({ req, tenantIDs })
    }
    data.roles = roles
    data.tenants = tenantIDs
    return data
  }

  if (isTenantAdminUser(req.user)) {
    if (protectedInput.apiKeyPresent) {
      return userSecurityError('Tenant Admins cannot set API keys.', 'apiKey')
    }
    const tenantID = getAuthenticatedTenantID(req)
    if (!tenantID) {
      throw new ValidationError({
        errors: [{ message: 'An assigned tenant context is required.', path: 'tenants' }],
      })
    }
    if (operation === 'create') {
      if (
        protectedInput.rolesPresent &&
        !canAssignRoles(req.user, protectedInput.roles)
      ) {
        return userSecurityError('Tenant Admins cannot assign the requested role.', 'roles')
      }
      if (
        protectedInput.tenantsPresent &&
        (
          !canAssignTenants(req.user, protectedInput.tenants) ||
          !sameIDs(protectedInput.tenants, [tenantID])
        )
      ) {
        return userSecurityError(
          'Tenant Admins may assign only the active tenant.',
          'tenants',
        )
      }
      await ensureTenantReferences({ req, tenantIDs: [tenantID] })
      data.tenants = [tenantID]
      data.roles = [USER_ROLES.tenantMember]
      return data
    }

    if (!canManageUser(req.user, originalDoc)) {
      return userSecurityError('This user is not available for tenant management.', 'id')
    }
    if (
      protectedInput.rolesPresent &&
      !sameRoles(protectedInput.roles, originalDoc.roles)
    ) {
      return userSecurityError('Tenant Admins cannot change user roles.', 'roles')
    }
    if (
      protectedInput.tenantsPresent &&
      !sameIDs(protectedInput.tenants, originalDoc.tenants)
    ) {
      return userSecurityError('Tenant Admins cannot change tenant memberships.', 'tenants')
    }
    data.tenants = getUserTenantIDs(originalDoc)
    data.roles = originalDoc.roles
    return data
  }

  if (operation === 'update' && req.user?.id === originalDoc?.id) {
    if (protectedInput.apiKeyPresent) {
      return userSecurityError('You cannot set your own API key.', 'apiKey')
    }
    if (
      protectedInput.rolesPresent &&
      !sameRoles(protectedInput.roles, originalDoc.roles)
    ) {
      return userSecurityError('You cannot change your own roles.', 'roles')
    }
    if (
      protectedInput.tenantsPresent &&
      !sameIDs(protectedInput.tenants, originalDoc.tenants)
    ) {
      return userSecurityError('You cannot change your own tenant memberships.', 'tenants')
    }
    data.roles = originalDoc.roles
    data.tenants = originalDoc.tenants
    return data
  }

  return userSecurityError('User management is not permitted.', 'id')
}

export const stampUserAuditFields: CollectionBeforeChangeHook = ({
  req,
  data,
  operation,
  originalDoc,
}) => {
  if (req.context?.developmentReset === true) return data
  data.createdBy = operation === 'create'
    ? req.user?.id
    : originalDoc?.createdBy
  data.updatedBy = req.user?.id ?? originalDoc?.updatedBy
  return data
}

/**
 * Users Collection
 * 
 * Purpose: Handles authentication, session management, and RBAC (Role Based Access Control).
 * 
 * Design Decisions:
 * 1. Role Extension: 'role' is implemented as a hasMany select. While we only use 3 roles currently,
 *    this array structure allows us to easily add granular roles (e.g. 'menu_editor', 'reservation_manager')
 *    in the future without migrating database schemas.
 * 2. Multi-Tenant Support: The 'tenants' field is an array of relationships, allowing one user 
 *    (like a regional manager) to administer multiple restaurant branches.
 * 3. Auditing: Added 'createdBy' and 'updatedBy' to track who created/modified user accounts.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles', 'tenants', 'updatedAt'],
    hidden: ({ user }) => !isSuperAdminUser(user) && !isTenantAdminUser(user),
  },
  access: {
    // Anyone can read if they are logged in and in the same tenant, or super admin
    read: readUsers,
    // Only super admins or tenant admins can create/update users
    create: canCreateTenantUser,
    update: updateUsers,
    delete: deleteUsers,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: [USER_ROLES.tenantMember],
      required: true,
      options: [...USER_ROLE_OPTIONS],
      admin: {
        condition: (_data, _siblingData, { user }) => isSuperAdminUser(user),
      },
      access: {
        create: ({ req: { user } }) => isSuperAdminUser(user),
        update: ({ req: { user } }) => isSuperAdminUser(user),
      }
    },
    {
      name: 'tenants',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: true,
      admin: {
        condition: (_data, _siblingData, { user }) => isSuperAdminUser(user),
      },
      access: {
        create: ({ req: { user } }) => isSuperAdminUser(user),
        update: ({ req: { user } }) => isSuperAdminUser(user),
      },
      filterOptions: ({ user }) => {
        if (isSuperAdminUser(user)) return true
        const tenantIDs = getUserTenantIDs(user)
        return tenantIDs.length ? { id: { in: tenantIDs } } : false
      },
    },
    {
      name: 'apiKey',
      type: 'text',
      access: {
        read: ({ req: { user } }) => isSuperAdminUser(user),
        create: ({ req: { user } }) => isSuperAdminUser(user),
        update: ({ req: { user } }) => isSuperAdminUser(user),
      },
      admin: {
        condition: (_data, _siblingData, { user }) => isSuperAdminUser(user),
      },
      hooks: {
        afterRead: [
          ({ req: { user }, value }) =>
            isSuperAdminUser(user) ? value : undefined,
        ],
      },
    },
    // Audit Fields
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    }
  ],
  hooks: {
    beforeOperation: [captureProtectedUserInput],
    beforeValidate: [enforceUserRBAC],
    beforeChange: [stampUserAuditFields],
  }
}
