import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const GalleryBlock: Block = {
  slug: 'galleryBlock',
  interfaceName: 'GalleryBlock',
  fields: [
    sectionHeader(),
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'collection',
      options: [{ label: 'Gallery collection', value: 'collection' }, { label: 'Manual selection', value: 'manual' }],
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'gallery',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('gallery'),
      hooks: { beforeValidate: [sameTenantRelationship('gallery')] },
      admin: { condition: (_, siblingData) => siblingData?.source === 'manual' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          defaultValue: 'all',
          options: ['all', 'food', 'ambiance', 'events', 'kitchen', 'exterior'],
          admin: { condition: (_, siblingData) => siblingData?.source === 'collection' },
        },
        { name: 'featuredOnly', type: 'checkbox', defaultValue: false, admin: { condition: (_, siblingData) => siblingData?.source === 'collection' } },
        { name: 'limit', type: 'number', min: 1, max: 24, defaultValue: 8 },
      ],
    },
    blockSettings(),
  ],
}
