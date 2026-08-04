import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import { validateSafeURL } from '../validation/shared'

export const Footer: CollectionConfig = {
  slug: 'footer',
  admin: {
    useAsTitle: 'id',
    description: 'Manage the footer layout for this tenant. Limited to one document per tenant.',
    defaultColumns: ['copyright', '_status', 'updatedAt'],
  },
  versions: { drafts: true },
  access: {
    read: tenantPublicRead({ publishedOnly: true }),
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ unique: true }), // 1:1 Tenant-Scoped Global
    {
      name: 'contactHeading',
      type: 'text',
      defaultValue: 'Get In Touch',
      maxLength: 100,
      admin: { description: 'Heading above the business contact details column.' },
    },
    {
      name: 'columns',
      type: 'array',
      maxRows: 4,
      admin: {
        description: 'Organize footer navigation into up to four editor-managed columns.',
        initCollapsed: true,
      },
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 100 },
        {
          name: 'links',
          type: 'array',
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
          ]
        }
      ]
    },
    {
      name: 'bottomLinks',
      type: 'array',
      admin: { description: 'Legal and utility links below the main footer.' },
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
      ]
    },
    {
      name: 'copyright',
      type: 'text',
      defaultValue: '© {year} All rights reserved.',
      maxLength: 200,
      admin: { description: 'Use {year} to dynamically inject the current year.' }
    }
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
