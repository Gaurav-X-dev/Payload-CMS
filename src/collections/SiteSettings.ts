import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { tenantContentMutations } from '../access/tenantContext'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import {
  normalizeIndianMobile,
  validateIndianMobile,
  validateSafeURL,
} from '../validation/shared'

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  admin: {
    useAsTitle: 'id',
    description: 'Manage core operational settings for this tenant. Limited to one document per tenant.',
    defaultColumns: ['businessName', 'updatedAt'],
  },
  access: {
    read: tenantIsolation,
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ unique: true }), // 1:1 Tenant-Scoped Global
    
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Business Info',
          fields: [
            {
              name: 'businessName',
              type: 'text',
              required: true,
              maxLength: 100,
              admin: { placeholder: 'Very Good Ghee Roast' },
            },
            { name: 'legalName', type: 'text', maxLength: 100 },
            { name: 'taxId', type: 'text', maxLength: 50 },
            { name: 'tagline', type: 'text', maxLength: 160, admin: { description: 'Short brand line used in the header and footer.', placeholder: 'Flavours that stay.' } },
            { name: 'siteDescription', type: 'textarea', maxLength: 1_000, admin: { description: 'Brand summary used in the footer and as a metadata fallback.' } },
            { name: 'contactAddress', type: 'textarea', maxLength: 500, admin: { description: 'Public address or service-area description.' } },
          ]
        },
        {
          label: 'Restaurant Info',
          fields: [
            { name: 'cuisineType', type: 'text', maxLength: 100 },
            { 
              name: 'priceRange', 
              type: 'select', 
              options: ['$', '$$', '$$$', '$$$$'] 
            },
          ]
        },
        {
          label: 'Google Maps',
          fields: [
            {
              name: 'mapsUrl',
              type: 'text',
              maxLength: 2048,
              validate: (value: unknown) => validateSafeURL(value),
            },
            { name: 'mapsEmbedCode', type: 'textarea', maxLength: 10_000 },
          ]
        },
        {
          label: 'Business Hours',
          fields: [
            {
              name: 'hours',
              type: 'array',
              fields: [
                { 
                  name: 'day', 
                  type: 'select', 
                  required: true,
                  options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                },
                { name: 'openTime', type: 'text', maxLength: 20, admin: { placeholder: '13:00' } },
                { name: 'closeTime', type: 'text', maxLength: 20, admin: { placeholder: '22:00' } },
                { name: 'isClosed', type: 'checkbox', defaultValue: false },
              ]
            }
          ]
        },
        {
          label: 'Integrations',
          fields: [
            {
              name: 'whatsappNumber',
              type: 'text',
              maxLength: 10,
              validate: (value: unknown) =>
                validateIndianMobile(value, { required: false }),
              hooks: {
                beforeValidate: [({ value }) => normalizeIndianMobile(value)],
              },
            },
            {
              name: 'deliverySettings',
              type: 'group',
              fields: [
                { name: 'enableDelivery', type: 'checkbox', defaultValue: false },
                {
                  name: 'deliveryUrls',
                  type: 'array',
                  admin: { description: 'Public ordering platforms shown across the site.' },
                  fields: [
                    { name: 'platform', type: 'text', required: true, maxLength: 80, admin: { placeholder: 'Swiggy' } },
                    { name: 'url', type: 'text', required: true, maxLength: 2048, validate: (value: unknown) => validateSafeURL(value, { required: true }) },
                  ],
                },
              ],
            },
            { name: 'reservationSettings', type: 'group', fields: [ { name: 'provider', type: 'select', options: ['internal', 'opentable', 'resy'] }, { name: 'providerUrl', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value) } ] }
          ]
        },
        {
          label: 'Social Links',
          fields: [
            {
              name: 'socials',
              type: 'array',
              fields: [
                { name: 'platform', type: 'select', options: ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube'] },
                {
                  name: 'url',
                  type: 'text',
                  maxLength: 2048,
                  validate: (value: unknown) => validateSafeURL(value),
                },
              ]
            }
          ]
        },
        {
          label: 'Analytics & Scripts',
          fields: [
            { name: 'googleAnalyticsId', type: 'text' },
            { name: 'facebookPixelId', type: 'text' },
            { name: 'customHeaderScripts', type: 'code', admin: { language: 'html' } },
            { name: 'customFooterScripts', type: 'code', admin: { language: 'html' } },
          ]
        },
        {
          label: 'Feature Flags',
          fields: [
            { name: 'maintenanceMode', type: 'checkbox', defaultValue: false },
            { name: 'showAnnouncementBar', type: 'checkbox', defaultValue: false },
            {
              name: 'announcementText',
              type: 'text',
              maxLength: 300,
              admin: {
                condition: (_, siblingData) => siblingData?.showAnnouncementBar,
                placeholder: 'Authentic coastal flavours · Slow-roasted in pure ghee',
              },
            },
            {
              name: 'newsletter',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                { name: 'title', type: 'text', defaultValue: 'Join The Flavour Club', maxLength: 120 },
                { name: 'highlightedWord', type: 'text', defaultValue: 'Flavour', maxLength: 40 },
                { name: 'description', type: 'textarea', maxLength: 500 },
                {
                  type: 'row',
                  fields: [
                    { name: 'placeholder', type: 'text', defaultValue: 'Enter your email address', maxLength: 120 },
                    { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe', maxLength: 80 },
                  ],
                },
                { name: 'privacyText', type: 'text', defaultValue: 'We respect your privacy. Unsubscribe anytime.', maxLength: 300 },
              ],
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
