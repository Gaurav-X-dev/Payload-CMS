import type { Block } from 'payload'

export const BlogPreviewBlock: Block = {
  slug: 'blogpreviewBlock',
  interfaceName: 'BlogPreviewBlock',
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
