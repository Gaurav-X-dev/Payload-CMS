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

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'isAvailable'],
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField(),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basic Info',
          fields: [
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
                { name: 'sku', type: 'text', admin: { description: 'Optional ID for POS integration.' } },
              ]
            },
            { name: 'description', type: 'textarea' },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'menu-categories',
                  required: true,
                  index: true,
                  hooks: {
                    beforeValidate: [sameTenantRelationship('menu-categories')],
                  },
                },
                { name: 'displayOrder', type: 'number', defaultValue: 0 },
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'price', type: 'number', min: 0, required: true },
                { name: 'taxCategory', type: 'text', defaultValue: 'standard' },
              ]
            },
            {
              name: 'pricingOptions',
              type: 'array',
              admin: { description: 'e.g. Regular vs Large, or add-ons.' },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'price', type: 'number', required: true },
              ]
            }
          ]
        },
        {
          label: 'Attributes & Dietary',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'dietary',
                  type: 'select',
                  hasMany: true,
                  index: true,
                  options: ['Veg', 'Non-Veg', 'Vegan', 'Gluten-Free', 'Keto', 'Halal']
                },
                {
                  name: 'spiceLevel',
                  type: 'select',
                  defaultValue: 'none',
                  options: ['none', 'mild', 'medium', 'hot', 'extra_hot']
                }
              ]
            },
            { name: 'allergens', type: 'select', hasMany: true, options: ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'] },
            {
              type: 'row',
              fields: [
                { name: 'calories', type: 'number' },
                { name: 'servingSize', type: 'text' },
                { name: 'prepTime', type: 'number', admin: { description: 'Preparation time in minutes.' } },
              ]
            }
          ]
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'image',
              type: 'relationship',
              relationTo: 'media',
              hooks: { beforeValidate: [sameTenantRelationship('media')] },
            },
            {
              name: 'gallery',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              hooks: { beforeValidate: [sameTenantRelationship('media')] },
            },
          ]
        },
        {
          label: 'Availability & Upsell',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'isAvailable', type: 'checkbox', defaultValue: true, index: true },
                { name: 'isFeatured', type: 'checkbox', defaultValue: false, index: true },
              ]
            },
            { name: 'stockStatus', type: 'select', defaultValue: 'in_stock', options: ['in_stock', 'low_stock', 'out_of_stock'] },
            { name: 'availabilityTime', type: 'text', admin: { description: 'e.g., "Lunch Only (11am - 3pm)"' } },
            {
              name: 'recommendedItems',
              type: 'relationship',
              relationTo: 'menu-items',
              hasMany: true,
              hooks: { beforeValidate: [sameTenantRelationship('menu-items')] },
            },
            {
              name: 'upsellItems',
              type: 'relationship',
              relationTo: 'menu-items',
              hasMany: true,
              hooks: { beforeValidate: [sameTenantRelationship('menu-items')] },
            },
          ]
        }
      ]
    }
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
