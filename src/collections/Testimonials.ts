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
import {
  normalizeName,
  validateFiniteInteger,
  validateName,
} from '../validation/shared'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'rating', 'isFeatured', 'sortOrder'],
    description: 'Manage approved customer reviews. Featured reviews can be highlighted on the home page.',
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
        {
          name: 'customerName',
          type: 'text',
          required: true,
          maxLength: 100,
          validate: validateName,
          hooks: { beforeValidate: [({ value }) => normalizeName(value)] },
        },
        { name: 'customerRole', type: 'text', maxLength: 160, admin: { description: 'Attribution shown below the review.', placeholder: 'Delhi, via Swiggy' } },
      ]
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      index: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      validate: (value: unknown) =>
        validateFiniteInteger(value, { min: 1, max: 5 }),
    },
    { name: 'review', type: 'textarea', required: true, maxLength: 2_000, admin: { placeholder: 'Paste the approved customer review.' } },
    {
      name: 'photo',
      type: 'relationship',
      relationTo: 'media',
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
