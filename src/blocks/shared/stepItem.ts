import type { Field } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../../hooks/sameTenantRelationship'

export const stepItemFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'icon',
        type: 'relationship',
        relationTo: 'media',
        filterOptions: tenantRelationshipFilter('media'),
        hooks: { beforeValidate: [sameTenantRelationship('media')] },
        admin: { description: 'Optional step icon.' },
      },
      {
        name: 'numberOverride',
        type: 'text',
        admin: { description: 'Overrides auto-incrementing step numbers.' },
      },
    ],
  },
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
]
