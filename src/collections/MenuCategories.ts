import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import { tenantScopedUnique } from '../hooks/tenantScopedUnique'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import { validateFiniteInteger } from '../validation/shared'

export const MenuCategories: CollectionConfig = {
  slug: 'menu-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder', 'isActive'],
    description: 'Organize the public menu. Only active categories appear on the Ghee Roast site.',
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
        { name: 'title', type: 'text', required: true, maxLength: 100, admin: { placeholder: 'Coastal Seafood' } },
        { 
          name: 'slug', 
          type: 'text', 
          index: true,
          maxLength: 120,
          hooks: { beforeValidate: [tenantScopedUnique('title')] },
          admin: { description: 'Auto-generated if left blank. Used by menu filters and URLs.', placeholder: 'coastal-seafood' }
        },
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          min: 0,
          index: true,
          validate: (value: unknown) =>
            validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
        },
      ]
    },
    {
      type: 'row',
      fields: [
        {
          name: 'icon',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
      ]
    }
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
