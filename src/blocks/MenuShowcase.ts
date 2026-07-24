import type { Block } from 'payload'

export const MenuShowcaseBlock: Block = {
  slug: 'menushowcaseBlock',
  interfaceName: 'MenuShowcaseBlock',
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
