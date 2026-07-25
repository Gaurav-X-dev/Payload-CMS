import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import { tenantScopedUnique } from '../hooks/tenantScopedUnique'
import { tenantVersionRead } from '../access/tenantVersionRead'
import { sameTenantRelationship } from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isHomePage', 'status', 'updatedAt'],
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
                { name: 'title', type: 'text', required: true },
                { 
                  name: 'slug', 
                  type: 'text',
                  index: true,
                  hooks: {
                    beforeValidate: [tenantScopedUnique('title')]
                  },
                  admin: { description: 'Auto-generated if left blank. (e.g., "about-us")' }
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
                  filterOptions: ({ id }) => ({ id: { not_equals: id } }),
                  hooks: { beforeValidate: [sameTenantRelationship('pages')] },
                },
                { name: 'isHomePage', type: 'checkbox', defaultValue: false, admin: { description: 'If checked, this page loads at the root URL (/).' } },
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'template', type: 'select', defaultValue: 'default', options: ['default', 'blank', 'landing'] },
                { name: 'status', type: 'select', defaultValue: 'draft', options: ['draft', 'published', 'archived'] },
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
              admin: { description: 'Construct the page visually using dynamic blocks.' },
              blocks: [
                // Phase 3B Blocks will be injected here
                // For now, we mock a simple rich text block to allow the schema to compile
                {
                  slug: 'mockBlock',
                  fields: [{ name: 'content', type: 'text' }]
                }
              ]
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
                { name: 'navigationLabel', type: 'text' },
                { name: 'sortOrder', type: 'number', defaultValue: 0 },
              ]
            },
            {
              name: 'redirect',
              type: 'group',
              fields: [
                { name: 'enableRedirect', type: 'checkbox', defaultValue: false },
                { name: 'redirectUrl', type: 'text', admin: { condition: (_, siblingData) => siblingData.enableRedirect } },
                { name: 'permanent', type: 'checkbox', defaultValue: true, admin: { condition: (_, siblingData) => siblingData.enableRedirect } },
              ]
            }
          ]
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
            {
              name: 'metaImage',
              type: 'relationship',
              relationTo: 'media',
              hooks: { beforeValidate: [sameTenantRelationship('media')] },
            },
            { name: 'canonicalUrl', type: 'text' },
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
