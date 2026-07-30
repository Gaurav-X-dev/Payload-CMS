import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const FAQBlock: Block = {
  slug: 'faqBlock',
  interfaceName: 'FAQBlock',
  fields: [
    sectionHeader(),
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('faqs'),
      hooks: { beforeValidate: [sameTenantRelationship('faqs')] },
      admin: { description: 'Leave empty to show all published FAQs.' },
    },
    { name: 'limit', type: 'number', min: 1, max: 30, defaultValue: 10 },
    blockSettings(),
  ],
}
