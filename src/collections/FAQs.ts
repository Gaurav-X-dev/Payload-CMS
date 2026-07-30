import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import { validateFiniteInteger } from '../validation/shared'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'isActive', 'sortOrder'],
    description: 'Reusable questions and answers for delivery, reservations, catering, and general pages.',
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
      maxLength: 300,
    },
    { name: 'answer', type: 'textarea', required: true, maxLength: 5_000 },
    {
      type: 'row',
      fields: [
        { name: 'category', type: 'text', maxLength: 80, admin: { placeholder: 'Delivery' } },
        { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          min: 0,
          validate: (value: unknown) => validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
        },
      ],
    },
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
