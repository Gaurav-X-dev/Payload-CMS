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

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'isFeatured', 'sortOrder'],
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
        { name: 'title', type: 'text', required: true },
        { 
          name: 'category', 
          type: 'select', 
          defaultValue: 'food',
          index: true,
          options: ['food', 'ambiance', 'events', 'kitchen', 'exterior']
        },
      ]
    },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
      required: true,
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
