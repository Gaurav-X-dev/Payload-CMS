import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import {
  normalizeIndianMobile,
  validateIndianMobile,
  validateSafeURL,
} from '../validation/shared'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'isActive', 'sortOrder'],
    description: 'Manage public kitchens, service areas, addresses, contacts, maps, and ordering links.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField(),
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 120,
      admin: { placeholder: 'Delhi Delivery Kitchen' },
    },
    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', required: true, maxLength: 100 },
        { name: 'address', type: 'textarea', required: true, maxLength: 500 },
      ],
    },
    { name: 'description', type: 'textarea', maxLength: 1_000 },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          maxLength: 10,
          validate: (value: unknown) => validateIndianMobile(value, { required: false }),
          hooks: { beforeValidate: [({ value }) => normalizeIndianMobile(value)] },
        },
        { name: 'email', type: 'email' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'mapsUrl', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value) },
        { name: 'mapsEmbedUrl', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value) },
      ],
    },
    {
      name: 'orderLinks',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text', required: true, maxLength: 80 },
        { name: 'url', type: 'text', required: true, maxLength: 2048, validate: (value: unknown) => validateSafeURL(value, { required: true }) },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
        { name: 'sortOrder', type: 'number', defaultValue: 0, min: 0 },
      ],
    },
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
