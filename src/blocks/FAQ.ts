import type { Block } from 'payload'

export const FAQBlock: Block = {
  slug: 'faqBlock',
  interfaceName: 'FAQBlock',
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
