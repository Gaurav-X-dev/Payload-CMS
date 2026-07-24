import type { RelationshipField } from 'payload'

export const tenantField = (
  overrides: Pick<Partial<RelationshipField>, 'unique'> = {},
): RelationshipField => {
  return {
    name: 'tenantId',
    type: 'relationship',
    relationTo: 'tenants',
    required: true,
    index: true,
    ...overrides,
    admin: {
      description:
        'Super Admins may select a tenant. Other users are assigned from trusted tenant context.',
      position: 'sidebar',
    },
  }
}
