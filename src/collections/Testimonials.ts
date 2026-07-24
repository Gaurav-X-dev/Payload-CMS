import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import { sameTenantRelationship } from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'rating', 'isFeatured', 'sortOrder'],
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
        { name: 'customerName', type: 'text', required: true },
        { name: 'customerRole', type: 'text', admin: { description: 'e.g. Local Food Critic, Regular Guest' } },
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
    },
    { name: 'review', type: 'textarea', required: true },
    {
      name: 'photo',
      type: 'relationship',
      relationTo: 'media',
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    {
      type: 'row',
      fields: [
        { name: 'isFeatured', type: 'checkbox', defaultValue: false, index: true },
        { name: 'sortOrder', type: 'number', defaultValue: 0 },
      ]
    }
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
