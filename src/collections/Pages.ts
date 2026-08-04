import { ValidationError } from 'payload'
import type { CollectionBeforeValidateHook, CollectionConfig, Where } from 'payload'
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
import {
  CMS_PAGE_TYPES,
  normalizeCMSPageType,
  validatePageLayout,
} from '../validation/pageLayout'
import { normalizeTenantID, resolveTrustedTenantID } from '../access/tenantContext'

const validatePageModel: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const isHomePage = (data.isHomePage ?? originalDoc?.isHomePage) === true
  data.pageType = normalizeCMSPageType(data.pageType ?? originalDoc?.pageType, isHomePage)
  if (isHomePage) data.slug = ''

  if (data.pageType === 'home' && !isHomePage) {
    throw new ValidationError({
      errors: [{
        message: 'Page Type "Home" requires Is Home Page to be enabled.',
        path: 'pageType',
      }],
    })
  }
  if (!isHomePage) return data

  const tenantID = normalizeTenantID(data.tenantId)
    ?? normalizeTenantID(originalDoc?.tenantId)
    ?? await resolveTrustedTenantID(req)
  if (!tenantID) return data

  const conditions: Where[] = [
    { tenantId: { equals: tenantID } },
    { isHomePage: { equals: true } },
  ]
  if (operation === 'update' && originalDoc?.id) {
    conditions.push({ id: { not_equals: originalDoc.id } })
  }
  const existing = await req.payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { and: conditions },
  })
  if (existing.docs.length > 0) {
    throw new ValidationError({
      errors: [{
        message: 'This tenant already has a Home Page. Edit the existing page instead.',
        path: 'isHomePage',
      }],
    })
  }

  return data
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'pageType', 'isHomePage', '_status', 'updatedAt'],
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
                {
                  name: 'pageType',
                  type: 'select',
                  defaultValue: 'generic',
                  enumName: 'cms_page_type',
                  options: CMS_PAGE_TYPES.map((value) => ({
                    label: value.split('-').map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(' '),
                    value,
                  })),
                  admin: {
                    description: 'Controls optional page behavior. The Slug alone never determines the page type.',
                  },
                },
                { name: 'template', type: 'select', defaultValue: 'default', options: ['default', 'blank', 'landing'] },
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
              validate: (value: unknown) => validatePageLayout(value),
              admin: {
                description: 'Construct the page visually. Block order here is the public frontend order. Empty layout means no page sections.',
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
    beforeValidate: [validatePageModel],
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  }
}
