import type { Field } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../../hooks/sameTenantRelationship'

export const iconTextItemFields: Field[] = [
  {
    name: 'icon',
    type: 'relationship',
    relationTo: 'media',
    required: true,
    filterOptions: tenantRelationshipFilter('media'),
    hooks: { beforeValidate: [sameTenantRelationship('media')] },
  },
  {
    name: 'text',
    type: 'text',
    required: true,
  },
]
