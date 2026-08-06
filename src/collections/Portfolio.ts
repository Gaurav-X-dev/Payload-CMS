import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import { tenantScopedUnique } from '../hooks/tenantScopedUnique'
import { linkField } from '../blocks/shared/linkField'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import { validateFiniteInteger } from '../validation/shared'

export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'enabled', 'featured', 'sortOrder'],
    description: 'Manage case studies and past project write-ups shown on the Portfolio page.',
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
        { name: 'title', type: 'text', required: true, maxLength: 160 },
        {
          name: 'slug',
          type: 'text',
          index: true,
          hooks: { beforeValidate: [tenantScopedUnique('title')] },
          admin: { description: 'Auto-generated if left blank. Not currently used for routing — reserved for a future case-study detail page.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'text',
          maxLength: 120,
          admin: { description: 'Must match a Portfolio page filter label exactly (e.g. "Restaurant Design") for filtering to work.', placeholder: 'Restaurant Design' },
        },
        { name: 'year', type: 'text', maxLength: 20, admin: { placeholder: '2024' } },
      ],
    },
    { name: 'description', type: 'textarea', maxLength: 1_000 },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      filterOptions: tenantRelationshipFilter('brands'),
      hooks: { beforeValidate: [sameTenantRelationship('brands')] },
      admin: { description: 'Optional: link this case study to one of this tenant\'s Brands.' },
    },
    { name: 'enableCTA', type: 'checkbox', defaultValue: false, admin: { description: 'Leave off to use the default "Inquire on case" link to Contact.' } },
    linkField({
      name: 'cta',
      admin: { condition: (_, siblingData) => siblingData?.enableCTA },
    }),
    {
      type: 'row',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true, index: true },
        { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
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
