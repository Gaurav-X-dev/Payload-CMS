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
import {
  validateFiniteInteger,
  validateFiniteNumber,
} from '../validation/shared'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'price', 'isAvailable'],
    description: 'Manage dishes, pricing, dietary details, availability, imagery, and featured placement.',
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
                { name: 'title', type: 'text', required: true, maxLength: 160, admin: { placeholder: 'Signature Chicken Ghee Roast' } },
                { 
                  name: 'slug', 
                  type: 'text',
                  index: true,
                  hooks: { beforeValidate: [tenantScopedUnique('title')] },
                  admin: { description: 'Auto-generated if left blank.' }
                },
                { name: 'sku', type: 'text', maxLength: 100, admin: { description: 'Optional ID for POS integration.' } },
              ]
            },
            { name: 'description', type: 'textarea', required: true, maxLength: 1_000, admin: { description: 'Customer-facing menu description.' } },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'menu-categories',
                  required: true,
                  index: true,
                  filterOptions: tenantRelationshipFilter('menu-categories'),
                  hooks: {
                    beforeValidate: [sameTenantRelationship('menu-categories')],
                  },
                },
                {
                  name: 'displayOrder',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  validate: (value: unknown) =>
                    validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
                },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  required: true,
                  validate: (value: unknown) =>
                    validateFiniteNumber(value, {
                      decimalPlaces: 2,
                      min: 0,
                      max: 1_000_000,
                    }),
                },
                { name: 'taxCategory', type: 'text', defaultValue: 'standard', maxLength: 80 },
              ]
            },
            {
              name: 'pricingOptions',
              type: 'array',
              admin: { description: 'e.g. Regular vs Large, or add-ons.' },
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  required: true,
                  validate: (value: unknown) =>
                    validateFiniteNumber(value, {
                      decimalPlaces: 2,
                      min: 0,
                      max: 1_000_000,
                    }),
                },
              ]
            },
            {
              name: 'locations',
              type: 'relationship',
              relationTo: 'locations',
              hasMany: true,
              filterOptions: tenantRelationshipFilter('locations'),
              hooks: { beforeValidate: [sameTenantRelationship('locations')] },
              admin: { description: 'Which outlets serve this dish. Leave empty to show it at every location.' },
            },
            {
              name: 'locationPricing',
              type: 'array',
              admin: { description: "Override this dish's price at specific locations. Leave empty to use the price above everywhere." },
              fields: [
                {
                  name: 'location',
                  type: 'relationship',
                  relationTo: 'locations',
                  required: true,
                  filterOptions: tenantRelationshipFilter('locations'),
                  hooks: { beforeValidate: [sameTenantRelationship('locations')] },
                },
                {
                  name: 'price',
                  type: 'number',
                  min: 0,
                  required: true,
                  validate: (value: unknown) =>
                    validateFiniteNumber(value, {
                      decimalPlaces: 2,
                      min: 0,
                      max: 1_000_000,
                    }),
                },
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
                {
                  name: 'calories',
                  type: 'number',
                  min: 0,
                  validate: (value: unknown) =>
                    value == null
                      ? true
                      : validateFiniteInteger(value, { min: 0, max: 100_000 }),
                },
                { name: 'servingSize', type: 'text', maxLength: 100 },
                {
                  name: 'prepTime',
                  type: 'number',
                  min: 0,
                  max: 1440,
                  validate: (value: unknown) =>
                    value == null
                      ? true
                      : validateFiniteInteger(value, { min: 0, max: 1440 }),
                  admin: { description: 'Preparation time in minutes.' },
                },
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
              filterOptions: tenantRelationshipFilter('media'),
              hooks: { beforeValidate: [sameTenantRelationship('media')] },
            },
            {
              name: 'gallery',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              filterOptions: tenantRelationshipFilter('media'),
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
            { name: 'badge', type: 'select', defaultValue: 'none', options: ['none', 'chef', 'popular', 'new'], admin: { description: 'Optional promotional tag shown on the dish card (e.g. Menu Showcase). "None" shows no badge.' } },
            { name: 'stockStatus', type: 'select', defaultValue: 'in_stock', options: ['in_stock', 'low_stock', 'out_of_stock'] },
            { name: 'availabilityTime', type: 'text', admin: { description: 'e.g., "Lunch Only (11am - 3pm)"' } },
            {
              name: 'recommendedItems',
              type: 'relationship',
              relationTo: 'menu-items',
              hasMany: true,
              filterOptions: tenantRelationshipFilter('menu-items'),
              hooks: { beforeValidate: [sameTenantRelationship('menu-items')] },
            },
            {
              name: 'upsellItems',
              type: 'relationship',
              relationTo: 'menu-items',
              hasMany: true,
              filterOptions: tenantRelationshipFilter('menu-items'),
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
