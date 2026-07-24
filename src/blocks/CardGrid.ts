import type { Block } from 'payload'

export const CardGridBlock: Block = {
  slug: 'cardgridBlock',
  interfaceName: 'CardGridBlock',
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
