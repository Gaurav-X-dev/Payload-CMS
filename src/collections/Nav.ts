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

export const Nav: CollectionConfig = {
  slug: 'nav',
  admin: {
    useAsTitle: 'id', // Because there's only one per tenant, ID is fine
    description: 'Manage the primary header navigation for this tenant. Limited to one document per tenant.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ unique: true }), // Unique constraint ensures 1:1 mapping (Tenant-Scoped Global)
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
                { name: 'label', type: 'text', required: true },
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
              name: 'page',
              type: 'relationship',
              relationTo: 'pages',
              admin: { condition: (_, siblingData) => siblingData.type === 'page' },
              hooks: { beforeValidate: [sameTenantRelationship('pages')] },
            },
            { name: 'url', type: 'text', admin: { condition: (_, siblingData) => siblingData.type !== 'page' } },
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
            { name: 'label', type: 'text', required: true },
            {
              name: 'columns',
              type: 'array',
              fields: [
                { name: 'title', type: 'text' },
                {
                  name: 'links',
                  type: 'relationship',
                  relationTo: 'pages',
                  hasMany: true,
                  hooks: { beforeValidate: [sameTenantRelationship('pages')] },
                },
              ],
            }
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
