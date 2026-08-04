import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const StatsBlock: Block = {
  slug: 'statsBlock',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Statistics', plural: 'Statistics Sections' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader({ admin: { description: 'Optional heading displayed above the statistics.' } }),
    {
      name: 'presentation',
      type: 'select',
      defaultValue: 'cards',
      options: [
        { label: 'Reusable Cards', value: 'cards' },
        { label: 'Ghee Roast Home Strip', value: 'ghee-home-strip' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 8,
      fields: [
        { name: 'value', type: 'text', required: true, maxLength: 30, admin: { placeholder: '25+' } },
        { name: 'label', type: 'text', required: true, maxLength: 100 },
      ],
    },
    blockSettings(),
  ],
}
