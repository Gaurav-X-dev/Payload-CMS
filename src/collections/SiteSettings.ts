import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { tenantContentMutations } from '../access/tenantContext'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  admin: {
    useAsTitle: 'id',
    description: 'Manage core operational settings for this tenant. Limited to one document per tenant.',
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
            { name: 'businessName', type: 'text', required: true },
            { name: 'legalName', type: 'text' },
            { name: 'taxId', type: 'text' },
          ]
        },
        {
          label: 'Restaurant Info',
          fields: [
            { name: 'cuisineType', type: 'text' },
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
            { name: 'mapsUrl', type: 'text' },
            { name: 'mapsEmbedCode', type: 'textarea' },
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
                  options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                },
                { name: 'openTime', type: 'text' },
                { name: 'closeTime', type: 'text' },
                { name: 'isClosed', type: 'checkbox', defaultValue: false },
              ]
            }
          ]
        },
        {
          label: 'Integrations',
          fields: [
            { name: 'whatsappNumber', type: 'text' },
            { name: 'deliverySettings', type: 'group', fields: [ { name: 'enableDelivery', type: 'checkbox', defaultValue: false }, { name: 'deliveryUrls', type: 'array', fields: [{ name: 'platform', type: 'text' }, { name: 'url', type: 'text' }] } ] },
            { name: 'reservationSettings', type: 'group', fields: [ { name: 'provider', type: 'select', options: ['internal', 'opentable', 'resy'] }, { name: 'providerUrl', type: 'text' } ] }
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
                { name: 'url', type: 'text' },
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
            { name: 'announcementText', type: 'text' },
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
