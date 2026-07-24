import type { Block } from 'payload'

export const SpacerBlock: Block = {
  slug: 'spacerBlock',
  interfaceName: 'SpacerBlock',
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
