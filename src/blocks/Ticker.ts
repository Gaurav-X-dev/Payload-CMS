import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'

export const TickerBlock: Block = {
  slug: 'tickerBlock',
  interfaceName: 'TickerBlock',
  labels: { singular: 'Ticker / Marquee', plural: 'Ticker / Marquee Sections' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 16,
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'icon', type: 'text', maxLength: 10, admin: { description: 'A short glyph or emoji, e.g. ✦' } },
            { name: 'iconStyle', type: 'text', maxLength: 20, admin: { description: 'Optional CSS font-size override for the glyph, e.g. 1.4rem.' } },
          ],
        },
        { name: 'name', type: 'text', required: true, maxLength: 80 },
        { name: 'description', type: 'text', required: true, maxLength: 160 },
      ],
    },
    blockSettings(),
  ],
}
