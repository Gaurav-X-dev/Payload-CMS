import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'heroBlock',
  interfaceName: 'HeroBlock',
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
