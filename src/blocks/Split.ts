import type { Block } from 'payload'

export const SplitBlock: Block = {
  slug: 'splitBlock',
  interfaceName: 'SplitBlock',
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
