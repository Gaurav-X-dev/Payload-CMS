import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { ValidationError } from 'payload'
import { isSuperAdmin } from '../access/isSuperAdmin'
import {
  canCreateTenantUser,
  canManageUserWithinActiveTenant,
  getAuthenticatedTenantID,
  getUserTenantIDs,
  isSuperAdminUser,
  isTenantAdminUser,
  preserveTenantAdminManagedUserState,
} from '../access/tenantContext'

const readUsers: Access = ({ req }) => {
  if (isSuperAdminUser(req.user)) return true
  if (!req.user) return false
  if (!isTenantAdminUser(req.user)) {
    const ownUser: import('payload').Where = { id: { equals: req.user.id } }
    return ownUser
  }
  const tenantIDs = getUserTenantIDs(req.user)
  if (!tenantIDs.length) return false
  const tenantUsers: import('payload').Where = { tenants: { in: tenantIDs } }
  return tenantUsers
}

const updateUsers: Access = (args) => {
  const { req } = args
  if (isSuperAdminUser(req.user) || isTenantAdminUser(req.user)) {
    return canManageUserWithinActiveTenant(args)
  }
  if (!req.user) return false

  return {
    id: {
      equals: req.user.id,
    },
  }
}

const enforceUserRBAC: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data

  if (!req.user && operation === 'create') {
    const existingUsers = await req.payload.count({
      collection: 'users',
      overrideAccess: true,
    })
    if (existingUsers.totalDocs === 0) {
      data.roles = ['super_admin']
      data.tenants = []
      return data
    }
  }

  if (isSuperAdminUser(req.user)) return data

  if (isTenantAdminUser(req.user)) {
    const tenantID = getAuthenticatedTenantID(req)
    if (!tenantID) {
      throw new ValidationError({
        errors: [{ message: 'An assigned tenant context is required.', path: 'tenants' }],
      })
    }
    if (operation === 'create') {
      data.tenants = [tenantID]
      data.roles = ['tenant_member']
      return data
    }

    const originalTenantIDs = getUserTenantIDs(originalDoc)
    if (!originalTenantIDs.includes(tenantID)) {
      throw new ValidationError({
        errors: [{
          message: 'The target user is not a member of the active tenant.',
          path: 'tenants',
        }],
      })
    }

    const protectedState = preserveTenantAdminManagedUserState(originalDoc)
    data.tenants = protectedState.tenants
    data.roles = protectedState.roles
    return data
  }

  if (operation === 'update' && req.user?.id === originalDoc?.id) {
    data.roles = originalDoc.roles
    data.tenants = originalDoc.tenants
    return data
  }

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
  },
  access: {
    // Anyone can read if they are logged in and in the same tenant, or super admin
    read: readUsers,
    // Only super admins or tenant admins can create/update users
    create: canCreateTenantUser,
    update: updateUsers,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['tenant_member'],
      required: true,
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Tenant Admin', value: 'tenant_admin' },
        { label: 'Tenant Member', value: 'tenant_member' },
      ],
      access: {
        // Only super admins can grant the super_admin role
        update: ({ req: { user } }) => {
          if (!user) return false
          return user.roles?.includes('super_admin')
        }
      }
    },
    {
      name: 'tenants',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: true,
      admin: {
        condition: (data) => !data.roles?.includes('super_admin'),
      },
      access: {
        update: ({ req: { user } }) => isSuperAdminUser(user),
      },
    },
    {
      name: 'apiKey',
      type: 'text',
      access: {
        read: ({ req: { user } }) => isSuperAdminUser(user),
        update: ({ req: { user } }) => isSuperAdminUser(user),
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
      access: { update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      access: { update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    }
  ],
  hooks: {
    beforeValidate: [enforceUserRBAC],
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create') {
          data.createdBy = req.user?.id
        }
        data.updatedBy = req.user?.id
        return data
      }
    ]
  }
}
