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
  resolvePublicTenantID,
  USER_ROLES,
  USER_ROLE_OPTIONS,
} from '../access/tenantContext'
import {
  normalizeEmail,
  normalizeName,
  validateEmail,
  validateName,
} from '../validation/shared'
import {
  generateForgotPasswordEmailHTML,
  generateForgotPasswordEmailSubject,
} from '../lib/mail/forgotPasswordEmailContent'
import {
  captureWelcomeEmailPassword,
  sendWelcomeEmailAfterCreate,
} from '../lib/mail/sendWelcomeEmail'

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

/**
 * EXPLICIT BUSINESS REQUIREMENT (documented security tradeoff): unlike Payload's default
 * silent-null behavior, an unknown email must produce a distinguishable "Email not found"
 * response, and a known email that doesn't belong to the resolved tenant must be treated
 * identically to unknown. This deliberately allows a caller to learn whether an email is
 * registered — see the M2.9 checkpoint report for the accepted tradeoff.
 *
 * Runs as a beforeOperation hook (the same official extension point captureProtectedUserInput
 * already uses), which Payload's own forgotPasswordOperation calls before any token is
 * generated (payload/dist/auth/operations/forgotPassword.js, via buildBeforeOperation). Throwing
 * here aborts the operation entirely — no token write, no email send, no SMTP call — using
 * Payload's own error-to-HTTP-response handling, not a custom endpoint or a reimplementation of
 * any part of the official reset-token mechanism.
 *
 * Tenant resolution reuses resolvePublicTenantID — the same trusted, hostname-derived resolver
 * already used for Forgot Password's tenant-branded content (never a client-submitted value).
 * A Super Admin (who by design belongs to no tenant) is always eligible, matching how tenant
 * membership already works everywhere else in this codebase.
 */
export const validateForgotPasswordEligibility: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  if (operation !== 'forgotPassword' || !('data' in args) || !args.data) {
    return args
  }

  const rawEmail = (args.data as { email?: unknown }).email
  const email = typeof rawEmail === 'string' ? normalizeEmail(rawEmail) : ''
  if (!email) return args // malformed/missing email — Payload's own operation rejects this normally

  const tenantID = await resolvePublicTenantID(req)

  const eligibility: Where[] = [{ roles: { contains: USER_ROLES.superAdmin } }]
  if (tenantID) {
    eligibility.push({ tenants: { in: [tenantID] } })
  }

  const match = await req.payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { email: { equals: email } },
        { or: eligibility },
      ],
    },
  })

  if (!match.docs.length) {
    req.payload.logger.info(
      `Forgot Password rejected: no eligible user for the resolved tenant (tenant ${tenantID ?? 'unresolved'}).`,
    )
    userSecurityError('Email not found.', 'email')
  }

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

// crypto.randomBytes(20).toString('hex') — the exact, only way Payload's forgotPassword
// operation ever produces this value (payload/dist/auth/operations/forgotPassword.js).
const RESET_TOKEN_PATTERN = /^[0-9a-f]{40}$/

/**
 * Payload's own official forgotPassword operation writes the reset token via the normal Local
 * API `update()` (payload/dist/auth/operations/forgotPassword.js), which defaults
 * `overrideAccess` to `true` and is never explicitly overridden there — so this collection's
 * `access.update` is bypassed for that internal call the same way it is for any other Local API
 * write, and this beforeValidate hook (never bypassed by overrideAccess) is the only thing that
 * still runs. Without this allowance every forgot-password request fails with "User management
 * is not permitted" before a token can ever be stored, because req.user is legitimately absent
 * (the whole point of forgot-password) and none of the existing branches below account for it.
 *
 * Verified empirically (not assumed) that `data` here is the FULL current document — field-level
 * beforeValidate, which runs before this collection-level hook, merges in every existing field
 * (name, roles, tenants, ...), not just the two patched ones — so this can't be detected by an
 * exact or narrow key set. Instead it's detected by the one thing that's genuinely unique to this
 * exact call: a `resetPasswordToken` matching the precise 40-hex-character shape Payload's own
 * `crypto.randomBytes(20).toString('hex')` always produces, paired with a fresh expiration.
 *
 * This is safe to allow through unchanged: the token itself is generated server-side inside
 * Payload's own operation and never taken from request data, so a caller cannot forge a value
 * that matches this pattern; `data.roles`/`data.tenants`/etc. are present but are the user's own
 * existing, unmodified values (this update never changes them, whether this check allows it
 * through or not); and no external HTTP request can reach this exact code path — a
 * directly-submitted PATCH to /api/users/:id is already rejected by access.update before any
 * hook runs, since that path does not default to overrideAccess the way this internal Local API
 * call does.
 */
const isForgotPasswordTokenWrite = (
  data: Record<string, unknown>,
  operation: string,
  req: PayloadRequest,
): boolean => {
  if (req.user || operation !== 'update') return false
  return (
    typeof data.resetPasswordToken === 'string' &&
    RESET_TOKEN_PATTERN.test(data.resetPasswordToken) &&
    typeof data.resetPasswordExpiration === 'string' &&
    !Number.isNaN(Date.parse(data.resetPasswordExpiration))
  )
}

/**
 * Payload's official resetPassword operation (payload/dist/auth/operations/resetPassword.js)
 * invokes this collection's beforeValidate hooks directly — bypassing beforeOperation entirely
 * and, notably, never passing `originalDoc` — then writes the new hash/salt with a direct
 * `payload.db.updateOne()` call that never goes through access control at all. req.user is not
 * yet set at this point (login happens after). Recognized narrowly by the presence of `hash`
 * and `salt` (fields no external request can ever set directly — they exist only via Payload's
 * own password-hashing strategy) combined with a missing `originalDoc`, which only happens on
 * this exact internal path. Reachable only after Payload has already validated a non-expired,
 * matching reset token — this hook does not weaken that check, it only stops it from crashing.
 */
const isResetPasswordHashWrite = (
  data: Record<string, unknown>,
  operation: string,
  originalDoc: unknown,
  req: PayloadRequest,
): boolean =>
  !req.user &&
  operation === 'update' &&
  !originalDoc &&
  typeof data.hash === 'string' &&
  typeof data.salt === 'string'

export const enforceUserRBAC: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data
  if (req.context?.developmentReset === true) return data
  if (
    isForgotPasswordTokenWrite(data, operation, req) ||
    isResetPasswordHashWrite(data, operation, originalDoc, req)
  ) {
    return data
  }

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
    forgotPassword: {
      generateEmailHTML: generateForgotPasswordEmailHTML,
      generateEmailSubject: generateForgotPasswordEmailSubject,
    },
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
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      hooks: {
        beforeChange: [
          ({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value),
        ],
      },
      validate: async (value, { operation, id, req }) => {
        if (!value || typeof value !== 'string') return true

        const existing = await req.payload.find({
          collection: 'users',
          where: {
            and: [
              { email: { equals: value } },
              ...(operation === 'update' && id ? [{ id: { not_equals: id } }] : []),
            ],
          },
          limit: 1,
          overrideAccess: true,
        })

        if (existing.docs.length) {
          return 'A user with this email is already registered.'
        }

        return true
      },
    },
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
    beforeOperation: [captureProtectedUserInput, validateForgotPasswordEligibility],
    beforeValidate: [enforceUserRBAC],
    beforeChange: [captureWelcomeEmailPassword, stampUserAuditFields],
    afterChange: [sendWelcomeEmailAfterCreate],
  }
}
