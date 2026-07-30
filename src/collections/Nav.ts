import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
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
  validateSafeURL,
} from '../validation/shared'

export const Nav: CollectionConfig = {
  slug: 'nav',
  admin: {
    useAsTitle: 'internalName',
    description: 'Manage the primary header navigation for this tenant. Limited to one document per tenant.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ unique: true }), // Unique constraint ensures 1:1 mapping (Tenant-Scoped Global)
    {
      type: 'row',
      fields: [
        { name: 'internalName', type: 'text', required: true, defaultValue: 'Primary Header', maxLength: 100 },
        {
          name: 'location',
          type: 'select',
          required: true,
          defaultValue: 'header',
          options: [{ label: 'Header', value: 'header' }],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'brandName', type: 'text', maxLength: 100 },
        {
          name: 'logo',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
      ],
    },
    {
      name: 'links',
      type: 'blocks',
      blocks: [
        {
          slug: 'link',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', required: true, maxLength: 80 },
                { 
                  name: 'type', 
                  type: 'select', 
                  defaultValue: 'internal',
                  options: [
                    { label: 'Page', value: 'page' },
                    { label: 'Internal URL', value: 'internal' },
                    { label: 'External URL', value: 'external' },
                    { label: 'Anchor Link', value: 'anchor' },
                  ]
                },
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                {
                  name: 'sortOrder',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  validate: (value: unknown) =>
                    validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
                },
              ],
            },
            {
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
              filterOptions: tenantRelationshipFilter('pages'),
              admin: { condition: (_, siblingData) => siblingData.type === 'page' },
              hooks: { beforeValidate: [sameTenantRelationship('pages')] },
            },
            {
              name: 'url',
              type: 'text',
              maxLength: 2048,
              validate: (value: unknown) => validateSafeURL(value),
              admin: { condition: (_, siblingData) => siblingData.type !== 'page' },
            },
            {
              name: 'children',
              type: 'array',
              maxRows: 12,
              admin: {
                description: 'Optional dropdown links. On mobile these follow the parent item.',
                initCollapsed: true,
              },
              fields: [
                { name: 'label', type: 'text', required: true, maxLength: 80 },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  maxLength: 2048,
                  validate: (value: unknown) => validateSafeURL(value, { required: true }),
                },
                { name: 'newTab', type: 'checkbox', defaultValue: false },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'icon', type: 'text', admin: { description: 'Icon class name (e.g., fas fa-home)' } },
                { name: 'badge', type: 'text' },
              ]
            },
            {
              type: 'row',
              fields: [
                { name: 'newTab', type: 'checkbox', defaultValue: false },
                { name: 'nofollow', type: 'checkbox', defaultValue: false },
                { 
                  name: 'visibility', 
                  type: 'select',
                  defaultValue: 'public',
                  options: ['public', 'logged_in', 'logged_out']
                }
              ]
            }
          ]
        },
        {
          slug: 'megaMenu',
          fields: [
            { name: 'label', type: 'text', required: true, maxLength: 80 },
            {
              name: 'columns',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', maxLength: 100 },
                {
                  name: 'links',
                  type: 'relationship',
                  relationTo: 'pages',
                  hasMany: true,
                  filterOptions: tenantRelationshipFilter('pages'),
                  hooks: { beforeValidate: [sameTenantRelationship('pages')] },
                },
              ],
            }
          ]
        }
      ]
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            { name: 'label', type: 'text', defaultValue: 'Order online', maxLength: 80 },
            {
              name: 'url',
              type: 'text',
              defaultValue: '/menu',
              maxLength: 2048,
              validate: (value: unknown) => validateSafeURL(value),
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
