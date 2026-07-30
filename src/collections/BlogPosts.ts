import { ValidationError } from 'payload'
import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
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
import { validateDateOrder } from '../validation/shared'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedDate', 'isPinned'],
  },
  access: {
    read: tenantPublicRead({ publishedOnly: true }),
    readVersions: tenantVersionRead,
    ...tenantContentMutations,
  },
  versions: {
    drafts: true,
  },
  fields: [
    tenantField(),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true, maxLength: 200 },
            { 
              name: 'slug', 
              type: 'text', 
              index: true,
              hooks: { beforeValidate: [tenantScopedUnique('title')] },
              admin: { description: 'Auto-generated if left blank.' } 
            },
            { name: 'excerpt', type: 'textarea', maxLength: 500 },
            { name: 'content', type: 'richText', required: true },
            {
              name: 'heroImage',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: tenantRelationshipFilter('media'),
              hooks: { beforeValidate: [sameTenantRelationship('media')] },
            },
          ]
        },
        {
          label: 'Publishing & Meta',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'draft',
                  enumName: 'cms_blog_status',
                  options: ['draft', 'published', 'archived'],
                },
                {
                  name: 'author',
                  type: 'relationship',
                  relationTo: 'users',
                  index: true,
                  filterOptions: tenantRelationshipFilter('users'),
                  hooks: { beforeValidate: [sameTenantRelationship('users')] },
                },
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'publishedDate', type: 'date', index: true, admin: { description: 'Scheduled Publishing: Set a future date to automatically publish.' } },
                { name: 'unpublishDate', type: 'date', admin: { description: 'Scheduled Unpublish: Set a date to automatically archive.' } },
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'isFeatured', type: 'checkbox', defaultValue: false },
                { name: 'isPinned', type: 'checkbox', defaultValue: false, admin: { description: 'Keep at the top of the blog index.' } },
                { name: 'showTableOfContents', type: 'checkbox', defaultValue: false },
              ]
            }
          ]
        },
        {
          label: 'Categorization & SEO',
          fields: [
            { name: 'categories', type: 'text', hasMany: true },
            { name: 'tags', type: 'text', hasMany: true },
            { name: 'metaTitle', type: 'text', maxLength: 70 },
            { name: 'metaDescription', type: 'textarea', maxLength: 160 },
            {
              name: 'metaImage',
              type: 'relationship',
              relationTo: 'media',
              filterOptions: tenantRelationshipFilter('media'),
              hooks: { beforeValidate: [sameTenantRelationship('media')] },
            },
          ]
        },
        {
          label: 'Relationships',
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              relationTo: 'blog-posts',
              hasMany: true,
              filterOptions: tenantRelationshipFilter('blog-posts'),
              hooks: { beforeValidate: [sameTenantRelationship('blog-posts')] },
            },
            {
              name: 'relatedMenuItems',
              type: 'relationship',
              relationTo: 'menu-items',
              hasMany: true,
              filterOptions: tenantRelationshipFilter('menu-items'),
              hooks: { beforeValidate: [sameTenantRelationship('menu-items')] },
            },
          ]
        },
        {
          label: 'Auto-Calculated',
          fields: [
            { name: 'readingTimeMinutes', type: 'number', admin: { readOnly: true, position: 'sidebar' } }
          ]
        }
      ]
    }
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const result = validateDateOrder(data.publishedDate, data.unpublishDate)
        if (result !== true) {
          throw new ValidationError({
            errors: [{ message: result, path: 'unpublishDate' }],
          })
        }
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Calculate reading time (Rough estimate: 200 words per minute)
        // Note: In a real Lexical setup, we extract text nodes. 
        // For simple schema sake, we default to 2 if content exists.
        if (data.content) {
          data.readingTimeMinutes = 2 
        }
        return data
      }
    ],
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  }
}
