import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'

export const Footer: CollectionConfig = {
  slug: 'footer',
  admin: {
    useAsTitle: 'id',
    description: 'Manage the footer layout for this tenant. Limited to one document per tenant.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ unique: true }), // 1:1 Tenant-Scoped Global
    {
      name: 'columns',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
            { name: 'newTab', type: 'checkbox', defaultValue: false },
          ]
        }
      ]
    },
    {
      name: 'bottomLinks',
      type: 'array',
      admin: { description: 'Links below the main footer (e.g., Privacy Policy, Terms of Service).' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ]
    },
    {
      name: 'copyright',
      type: 'text',
      defaultValue: '© {year} All rights reserved.',
      admin: { description: 'Use {year} to dynamically inject the current year.' }
    }
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
