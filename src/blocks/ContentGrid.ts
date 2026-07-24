import type { Block } from 'payload'

export const ContentGridBlock: Block = {
  slug: 'contentgridBlock',
  interfaceName: 'ContentGridBlock',
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
