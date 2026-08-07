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
      name: 'presentation',
      type: 'select',
      defaultValue: 'tabs',
      options: [
        { label: 'Tab Accordion', value: 'tabs' },
        { label: 'Plus/Minus Accordion', value: 'plusminus' },
      ],
      admin: {
        description: 'Controls the accordion\'s visual style. Themes that only use one style can leave this at Tab Accordion.',
      },
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'faqs',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('faqs'),
      hooks: { beforeValidate: [sameTenantRelationship('faqs')] },
      admin: { description: 'Leave empty to show all published FAQs.' },
    },
    {
      name: 'featuredOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Only applies to the auto-pulled pool (i.e. when Items above is left empty). An explicit Items selection always renders exactly what was chosen.',
      },
    },
    { name: 'limit', type: 'number', min: 1, max: 30, defaultValue: 10 },
    blockSettings(),
  ],
}
