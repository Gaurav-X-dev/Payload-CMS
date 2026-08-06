import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const BrandsShowcaseBlock: Block = {
  slug: 'brandsshowcaseBlock',
  interfaceName: 'BrandsShowcaseBlock',
  labels: { singular: 'Brands Showcase', plural: 'Brands Showcase Sections' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader({ admin: { description: 'Optional heading displayed above the brand grid. Not rendered by the Spotlight presentation.' } }),
    {
      name: 'presentation',
      type: 'select',
      defaultValue: 'grid',
      options: [
        { label: 'Compact Grid (default)', value: 'grid' },
        { label: 'Editorial Spotlight', value: 'spotlight' },
      ],
      admin: {
        description: 'Grid: compact cards (Home). Spotlight: full editorial write-up per brand, alternating image side (Brands page).',
      },
    },
    {
      name: 'brands',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('brands'),
      hooks: { beforeValidate: [sameTenantRelationship('brands')] },
      admin: { description: 'Leave empty to show every enabled brand, sorted by Sort Order.' },
    },
    { name: 'limit', type: 'number', min: 1, max: 12, defaultValue: 4 },
    blockSettings(),
  ],
}
