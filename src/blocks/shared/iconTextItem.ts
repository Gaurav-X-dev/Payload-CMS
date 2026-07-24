import type { Field } from 'payload'
import { sameTenantRelationship } from '../../hooks/sameTenantRelationship'

export const iconTextItemFields: Field[] = [
  {
    name: 'icon',
    type: 'relationship',
    relationTo: 'media',
    required: true,
    hooks: { beforeValidate: [sameTenantRelationship('media')] },
  },
  {
    name: 'text',
    type: 'text',
    required: true,
  },
]
