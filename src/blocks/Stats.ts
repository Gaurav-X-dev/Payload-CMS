import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'statsBlock',
  interfaceName: 'StatsBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'subtitle',
      type: 'text',
    },
  ],
}
