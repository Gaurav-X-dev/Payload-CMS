import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const PortfolioShowcaseBlock: Block = {
  slug: 'portfolioshowcaseBlock',
  interfaceName: 'PortfolioShowcaseBlock',
  labels: { singular: 'Portfolio Showcase', plural: 'Portfolio Showcase Sections' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader({ admin: { description: 'Optional heading. The Portfolio page\'s filterable grid renders no heading above it by default.' } }),
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'portfolio',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('portfolio'),
      hooks: { beforeValidate: [sameTenantRelationship('portfolio')] },
      admin: { description: 'Leave empty to show every enabled case study, sorted by Sort Order.' },
    },
    { name: 'limit', type: 'number', min: 1, max: 24, defaultValue: 12 },
    blockSettings(),
  ],
}
