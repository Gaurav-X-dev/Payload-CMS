import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import {
  normalizeName,
  validateFiniteInteger,
  validateName,
} from '../validation/shared'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'

export const TeamMembers: CollectionConfig = {
  slug: 'teammembers',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'role', 'isActive', 'sortOrder'],
    description: 'Manage chefs, founders, and team profiles shown on tenant pages.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField(),
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
      validate: validateName,
      hooks: { beforeValidate: [({ value }) => normalizeName(value)] },
    },
    {
      type: 'row',
      fields: [
        { name: 'role', type: 'text', required: true, maxLength: 120, admin: { placeholder: 'Founder & Head Chef' } },
        {
          name: 'photo',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
      ],
    },
    { name: 'bio', type: 'textarea', maxLength: 2_000 },
    { name: 'quote', type: 'textarea', maxLength: 500 },
    {
      type: 'row',
      fields: [
        { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          min: 0,
          validate: (value: unknown) => validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
        },
      ],
    },
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
