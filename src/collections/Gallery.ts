import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import { validateFiniteInteger } from '../validation/shared'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'isFeatured', 'sortOrder'],
    description: 'Curate reusable imagery for galleries and collection-backed page blocks.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField(),
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 160, admin: { placeholder: 'Signature ghee roast' } },
        { 
          name: 'category',
          type: 'select',
          defaultValue: 'food',
          index: true,
          options: ['food', 'ambiance', 'events', 'kitchen', 'exterior', 'chefs']
        },
      ]
    },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    {
      type: 'row',
      fields: [
        { name: 'isFeatured', type: 'checkbox', defaultValue: false, index: true },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          min: 0,
          validate: (value: unknown) =>
            validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
        },
      ]
    }
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
