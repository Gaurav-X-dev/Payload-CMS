import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import { tenantScopedUnique } from '../hooks/tenantScopedUnique'
import { sameTenantRelationship } from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'

export const MenuCategories: CollectionConfig = {
  slug: 'menu-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder', 'isActive'],
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
          name: 'slug', 
          type: 'text', 
          index: true,
          hooks: { beforeValidate: [tenantScopedUnique('title')] },
          admin: { description: 'Auto-generated if left blank.' } 
        },
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
        { name: 'sortOrder', type: 'number', defaultValue: 0, index: true },
      ]
    },
    {
      type: 'row',
      fields: [
        {
          name: 'icon',
          type: 'relationship',
          relationTo: 'media',
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
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
