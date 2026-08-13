import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/isSuperAdmin'
import { assignedTenantRead } from '../access/tenantPublicRead'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import { validateTenantParent } from '../hooks/tenantHierarchy'
import { validateTenantIdentity } from '../hooks/validateTenantIdentity'
import {
  invalidateTenantCacheForTenantDocument,
  invalidateTenantCacheForTenantDocumentAfterDelete,
} from '../hooks/invalidateTenantCache'
import {
  isSuperAdminUser,
  isTenantAdminUser,
} from '../access/tenantContext'

/**
 * Tenants Collection
 * 
 * Purpose: Central configuration hub for the multi-tenant architecture. Stores global
 * branding, feature flags, localization, and contact settings for each restaurant/brand.
 * 
 * Design Decisions:
 * 1. Global Settings Replacement: Instead of traditional Payload "Globals" for settings, 
 *    everything is stored here so multiple sites can run from one DB.
 * 2. Hierarchical Tenants: 'parentTenant' allows structures like Hospitality Group -> Restaurant.
 * 3. Fallbacks & Localization: Added timezone, currency, and locale to support international scaling.
 * 4. Slug Generation: The beforeValidate hook handles slug auto-generation while allowing manual overrides.
 * 5. Auditing: Added createdBy and updatedBy for accountability.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'type', 'isActive', 'isPrimary'],
    hidden: ({ user }) => !isSuperAdminUser(user) && !isTenantAdminUser(user),
  },
  access: {
    read: assignedTenantRead,
    create: isSuperAdmin,
    update: isSuperAdmin, // In the future, tenant admins could update their own config
    delete: isSuperAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 100,
        },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          index: true,
          maxLength: 100,
          admin: {
            description: 'Auto-generated if left blank. Used for internal routing and data isolation.',
          }
        },
      ]
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Restaurant', value: 'restaurant' },
            { label: 'Hospitality Group', value: 'hospitality' },
            { label: 'Cloud Kitchen', value: 'cloud_kitchen' },
          ],
        },
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'ghee-roast',
          options: [
            { label: 'Ghee Roast', value: 'ghee-roast' },
            { label: 'Zuru Zuru', value: 'zuru-zuru' },
            // Public brand is "Curious Ladoo"; the value stays "curious-hub" because it is
            // already threaded through src/themes/curious-hub, LocalThemeKey, and the theme
            // registry — renaming it is cosmetic only and not worth the migration risk.
            { label: 'Curious Ladoo', value: 'curious-hub' },
          ],
        },
        {
          name: 'parentTenant',
          type: 'relationship',
          relationTo: 'tenants',
          hooks: { beforeValidate: [validateTenantParent] },
          admin: {
            description: 'Assign if this is a sub-brand of another tenant.',
          }
        },
      ]
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: { position: 'sidebar' }
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
          admin: { 
            position: 'sidebar',
            description: 'If true, this tenant acts as the fallback for unknown domains.'
          }
        },
      ]
    },
    {
      name: 'domains',
      type: 'array',
      admin: {
        description: 'Domains that should route to this tenant (e.g. ghee-roast.com)',
      },
      fields: [
        {
          name: 'domain',
          type: 'text',
          required: true,
          index: true,
          maxLength: 253,
        },
      ],
    },
    
    // --- Localization & Settings ---
    {
      name: 'settings',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'defaultLocale', type: 'text', defaultValue: 'en' },
        { name: 'timezone', type: 'text', defaultValue: 'Asia/Kolkata' },
        { name: 'currency', type: 'text', defaultValue: 'INR' },
      ]
    },

    // --- Contact Info ---
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'contactEmail', type: 'email' },
        { name: 'contactPhone', type: 'text' },
      ]
    },

    // --- Branding & Theming ---
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'primaryColor', type: 'text', defaultValue: '#000000', maxLength: 7 },
            { name: 'accentColor', type: 'text', defaultValue: '#d4af37', maxLength: 7 },
            { name: 'backgroundColor', type: 'text', defaultValue: '#ffffff', maxLength: 7 },
          ]
        },
        {
          type: 'row',
          fields: [
            {
              name: 'logo',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: tenantRelationshipFilter('media', {
                parentTenantIdentity: 'documentID',
              }),
              hooks: {
                beforeValidate: [
                  sameTenantRelationship('media', {
                    parentTenantIdentity: 'documentID',
                    path: 'branding.logo',
                  }),
                ],
              },
            },
            {
              name: 'favicon',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: tenantRelationshipFilter('media', {
                parentTenantIdentity: 'documentID',
              }),
              hooks: {
                beforeValidate: [
                  sameTenantRelationship('media', {
                    parentTenantIdentity: 'documentID',
                    path: 'branding.favicon',
                  }),
                ],
              },
            },
          ]
        }
      ]
    },

    // --- Typography ---
    {
      name: 'typography',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'headingFont', type: 'text', defaultValue: 'Inter' },
            { name: 'bodyFont', type: 'text', defaultValue: 'Inter' },
            { name: 'decorativeFont', type: 'text' },
          ]
        },
        {
          type: 'row',
          fields: [
            { 
              name: 'headingTransform', 
              type: 'select', 
              defaultValue: 'none',
              options: ['none', 'uppercase', 'capitalize', 'lowercase']
            },
            { name: 'cardRadius', type: 'text', defaultValue: '8px' },
          ]
        }
      ]
    },

    // --- Features (Toggles) ---
    {
      name: 'features',
      type: 'group',
      fields: [
        { name: 'enableMenu', type: 'checkbox', defaultValue: true },
        { name: 'enableBlog', type: 'checkbox', defaultValue: false },
        { name: 'enableReservations', type: 'checkbox', defaultValue: false },
        { name: 'enableCatering', type: 'checkbox', defaultValue: false },
        { name: 'enableGallery', type: 'checkbox', defaultValue: true },
      ]
    },

    // --- Layout Presets ---
    {
      name: 'layout',
      type: 'group',
      fields: [
        { 
          name: 'preset', 
          type: 'select', 
          defaultValue: 'classic',
          options: ['classic', 'elegant', 'grand']
        },
        { 
          name: 'headerStyle', 
          type: 'select', 
          defaultValue: 'transparent-scroll',
          options: ['transparent-scroll', 'fixed-dark', 'centered-logo']
        },
        { 
          name: 'footerStyle', 
          type: 'select', 
          defaultValue: 'light',
          options: ['light', 'dark']
        },
      ]
    },

    // --- Audit Fields ---
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    }
  ],
  hooks: {
    beforeValidate: [validateTenantIdentity],
    beforeChange: [
      ({ req, data, operation, originalDoc }) => {
        if (req.context?.developmentReset === true) return data
        data.createdBy = operation === 'create'
          ? req.user?.id
          : originalDoc?.createdBy
        data.updatedBy = req.user?.id ?? originalDoc?.updatedBy
        return data
      }
    ],
    afterChange: [invalidateTenantCacheForTenantDocument],
    afterDelete: [invalidateTenantCacheForTenantDocumentAfterDelete],
  }
}
