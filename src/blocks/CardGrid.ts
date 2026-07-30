import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { cardItemFields } from './shared/cardItem'
import { sectionHeader } from './shared/sectionHeader'

export const CardGridBlock: Block = {
  slug: 'cardgridBlock',
  interfaceName: 'CardGridBlock',
  fields: [
    sectionHeader(),
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      admin: { initCollapsed: true },
      fields: cardItemFields,
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: ['2', '3', '4'],
    },
    blockSettings(),
  ],
}
