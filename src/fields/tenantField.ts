import type { RelationshipField } from 'payload'
import {
  getUserTenantIDs,
  isSuperAdminUser,
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
    filterOptions: ({ user }) => {
      if (isSuperAdminUser(user)) return true
      const tenantIDs = getUserTenantIDs(user)
      return tenantIDs.length ? { id: { in: tenantIDs } } : false
    },
    ...overrides,
    admin: {
      description:
        'Super Admins may select a tenant. Other users are assigned from trusted tenant context.',
      position: 'sidebar',
    },
  }
}
