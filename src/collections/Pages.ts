import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import { tenantScopedUnique } from '../hooks/tenantScopedUnique'
import { tenantVersionRead } from '../access/tenantVersionRead'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import { AllBlocks } from '../blocks'
import {
  validateFiniteInteger,
  validateSafeURL,
} from '../validation/shared'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isHomePage', 'status', 'updatedAt'],
    description: 'Build tenant pages with reusable, CMS-driven sections. Drafts remain private until published.',
    livePreview: {
      url: ({ data }) => data?.isHomePage ? '/' : `/${String(data?.slug || '').replace(/^\/+/, '')}`,
    },
    preview: (data) => data?.isHomePage ? '/' : `/${String(data?.slug || '').replace(/^\/+/, '')}`,
  },
  access: {
    read: tenantPublicRead({ publishedOnly: true }),
    readVersions: tenantVersionRead,
    ...tenantContentMutations,
  },
  versions: {
    drafts: true, // Enables drafts and publishing workflow
  },
  fields: [
    tenantField(),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  maxLength: 200,
                  admin: { placeholder: 'About Very Good Ghee Roast' },
                },
                { 
                  name: 'slug', 
                  type: 'text',
                  index: true,
                  hooks: {
                    beforeValidate: [tenantScopedUnique('title')]
                  },
                  admin: {
                    description: 'Auto-generated if left blank. Use a short URL-safe value, e.g. "about".',
                    placeholder: 'about',
                  }
                },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'parent',
                  type: 'relationship',
                  relationTo: 'pages',
                  index: true,
                  filterOptions: tenantRelationshipFilter('pages', {
                    excludeCurrentDocument: true,
                  }),
                  hooks: { beforeValidate: [sameTenantRelationship('pages')] },
                },
                { name: 'isHomePage', type: 'checkbox', defaultValue: false, admin: { description: 'If checked, this page loads at the root URL (/).' } },
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'template', type: 'select', defaultValue: 'default', options: ['default', 'blank', 'landing'] },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'draft',
                  enumName: 'cms_page_status',
                  options: ['draft', 'published', 'archived'],
                },
              ]
            },
            { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
          ]
        },
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              admin: {
                description: 'Construct the page visually. When empty, the Ghee Roast theme keeps its legacy design as a compatibility fallback.',
                initCollapsed: true,
              },
              blocks: AllBlocks,
            }
          ]
        },
        {
          label: 'Navigation & Routing',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'showInNavigation', type: 'checkbox', defaultValue: false },
                { name: 'navigationLabel', type: 'text', maxLength: 80 },
                {
                  name: 'sortOrder',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  validate: (value: unknown) =>
                    validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
                },
              ]
            },
            {
              name: 'redirect',
              type: 'group',
              fields: [
                { name: 'enableRedirect', type: 'checkbox', defaultValue: false },
                {
                  name: 'redirectUrl',
                  type: 'text',
                  maxLength: 2048,
                  validate: (value: unknown) => validateSafeURL(value),
                  admin: { condition: (_, siblingData) => siblingData.enableRedirect },
                },
                { name: 'permanent', type: 'checkbox', defaultValue: true, admin: { condition: (_, siblingData) => siblingData.enableRedirect } },
              ]
            }
          ]
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              maxLength: 70,
              admin: {
                description: 'Recommended: 50–60 characters. Falls back to the page title.',
                placeholder: 'Page title | Very Good Ghee Roast',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              maxLength: 160,
              admin: {
                description: 'Recommended: 120–160 characters.',
                placeholder: 'A concise search result description.',
              },
            },
            {
              name: 'metaImage',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: tenantRelationshipFilter('media'),
              hooks: { beforeValidate: [sameTenantRelationship('media')] },
            },
            {
              name: 'canonicalUrl',
              type: 'text',
              maxLength: 2048,
              validate: (value: unknown) => validateSafeURL(value),
            },
            { name: 'noIndex', type: 'checkbox', defaultValue: false },
          ]
        }
      ]
    }
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // If it's the home page, force the slug to be blank or 'home'
        if (data.isHomePage) {
          data.slug = ''
        }
        return data
      }
    ],
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  }
}
