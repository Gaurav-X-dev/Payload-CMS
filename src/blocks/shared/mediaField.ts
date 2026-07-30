import type { GroupField } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../../hooks/sameTenantRelationship'

export const mediaField = (overrides?: Partial<GroupField>): GroupField => ({
  name: 'media',
  type: 'group',
  admin: {
    description: 'Standardized media handling with display overrides.',
  },
  ...overrides,
  fields: [
    {
      name: 'item',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    {
      type: 'row',
      fields: [
        { name: 'altOverride', type: 'text', admin: { description: 'Overrides the default Alt text.' } },
        { name: 'caption', type: 'text', admin: { description: 'Displays a visible figcaption.' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'aspectRatio',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: '16:9', value: '16:9' },
            { label: '4:3', value: '4:3' },
            { label: '1:1', value: '1:1' },
            { label: '9:16', value: '9:16' },
          ],
        },
        {
          name: 'objectFit',
          type: 'select',
          defaultValue: 'cover',
          options: [
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
          ],
        },
        {
          name: 'priority',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Load immediately (prevents lazy-loading). Use only for above-the-fold media.',
          },
        },
      ],
    },
    {
      name: 'focalPoint',
      type: 'group',
      admin: {
        description: 'Precise cropping point for mobile views.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'x', type: 'number', min: 0, max: 100, defaultValue: 50 },
            { name: 'y', type: 'number', min: 0, max: 100, defaultValue: 50 },
          ],
        },
      ],
    },
    ...(overrides?.fields || []),
  ],
})
