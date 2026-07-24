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

export const SEO: CollectionConfig = {
  slug: 'seo',
  admin: {
    useAsTitle: 'id',
    description: 'Manage global fallback SEO metadata for this tenant. Limited to one document per tenant.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ unique: true }), // 1:1 Tenant-Scoped Global

    {
      type: 'tabs',
      tabs: [
        {
          label: 'General Meta',
          fields: [
            { 
              name: 'metaTitlePattern', 
              type: 'text', 
              defaultValue: '%s | Brand Name',
              admin: { description: 'Use %s where the specific page title should be injected.' }
            },
            { name: 'metaDescription', type: 'textarea' },
            { name: 'keywords', type: 'text', admin: { description: 'Comma separated keywords.' } },
            { name: 'canonicalUrl', type: 'text' },
            { 
              name: 'robots', 
              type: 'select', 
              defaultValue: 'index, follow',
              options: ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow']
            }
          ]
        },
        {
          label: 'Open Graph (Social)',
          fields: [
            { name: 'ogTitle', type: 'text' },
            { name: 'ogDescription', type: 'textarea' },
            {
              name: 'defaultOGImage',
              type: 'relationship',
              relationTo: 'media',
              hooks: { beforeValidate: [sameTenantRelationship('media')] },
            },
            { name: 'ogSiteName', type: 'text' },
          ]
        },
        {
          label: 'Twitter Cards',
          fields: [
            { 
              name: 'twitterCard', 
              type: 'select', 
              defaultValue: 'summary_large_image',
              options: ['summary', 'summary_large_image', 'app', 'player']
            },
            { name: 'twitterSite', type: 'text', admin: { description: '@username for the website used in the card footer.' } },
            { name: 'twitterCreator', type: 'text', admin: { description: '@username for the content creator / author.' } },
          ]
        },
        {
          label: 'Advanced SEO',
          fields: [
            { name: 'jsonLd', type: 'code', admin: { language: 'json', description: 'Global JSON-LD schema (e.g., Organization or LocalBusiness).' } },
            { name: 'googleSiteVerification', type: 'text' },
            { name: 'bingSiteVerification', type: 'text' },
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
