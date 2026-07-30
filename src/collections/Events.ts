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
import { validateSafeURL } from '../validation/shared'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'status', 'isFeatured'],
    description: 'Manage public events, pop-ups, catering showcases, and reservation links.',
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
      maxLength: 160,
    },
    { name: 'summary', type: 'textarea', required: true, maxLength: 500 },
    { name: 'description', type: 'textarea', maxLength: 5_000 },
    {
      type: 'row',
      fields: [
        { name: 'startsAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    { name: 'locationName', type: 'text', maxLength: 160 },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    { name: 'bookingUrl', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value) },
    {
      type: 'row',
      fields: [
        { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: ['draft', 'published', 'cancelled'] },
        { name: 'isFeatured', type: 'checkbox', defaultValue: false, index: true },
      ],
    },
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
