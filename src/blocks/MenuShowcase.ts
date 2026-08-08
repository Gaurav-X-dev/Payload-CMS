import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { ctaGroup } from './shared/ctaGroup'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const MenuShowcaseBlock: Block = {
  slug: 'menushowcaseBlock',
  interfaceName: 'MenuShowcaseBlock',
  labels: { singular: 'Menu / Specials Showcase', plural: 'Menu / Specials Showcases' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader(),
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'menu-categories',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('menu-categories'),
      hooks: { beforeValidate: [sameTenantRelationship('menu-categories')] },
      admin: { description: 'Leave empty to show all active categories.' },
    },
    { name: 'featuredOnly', type: 'checkbox', defaultValue: true },
    {
      name: 'limit',
      type: 'number',
      min: 1,
      max: 60,
      defaultValue: 6,
      admin: { description: 'Curated previews (e.g. Home) typically use a low limit. A full browsable menu page can raise this up to 60.' },
    },
    ctaGroup(),
    blockSettings(),
  ],
}
