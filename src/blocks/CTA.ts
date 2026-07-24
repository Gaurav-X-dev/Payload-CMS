import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'ctaBlock',
  interfaceName: 'CTABlock',
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
