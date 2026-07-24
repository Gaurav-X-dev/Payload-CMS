import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'richtextBlock',
  interfaceName: 'RichTextBlock',
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
