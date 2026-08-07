import type { RelationshipField } from 'payload'
import {
  getUserTenantIDs,
  isSuperAdminUser,
  resolvePublicTenantID,
} from '../access/tenantContext'

export const tenantField = (
  overrides: Pick<Partial<RelationshipField>, 'required' | 'unique'> = {},
): RelationshipField => {
  return {
    name: 'tenantId',
    type: 'relationship',
    relationTo: 'tenants',
    required: true,
    index: true,
    filterOptions: async ({ req, user }) => {
      if (isSuperAdminUser(user)) return true
      const tenantIDs = getUserTenantIDs(user)
      if (tenantIDs.length) return { id: { in: tenantIDs } }
      // Unauthenticated (public) creates — e.g. a contact form submission — have no user-scoped
      // tenants at all. Without this, filterOptions would always return `false` and reject the
      // trusted, host-derived tenantId that `assignTenant` already assigned in the same
      // beforeValidate chain, breaking every public-facing tenant-scoped create.
      const publicTenantID = await resolvePublicTenantID(req)
      return publicTenantID ? { id: { equals: publicTenantID } } : false
    },
    ...overrides,
    admin: {
      description:
        'Super Admins may select a tenant. Other users are assigned from trusted tenant context.',
      position: 'sidebar',
    },
  }
}
