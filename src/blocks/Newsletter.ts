import type { Block } from 'payload'

export const NewsletterBlock: Block = {
  slug: 'newsletterBlock',
  interfaceName: 'NewsletterBlock',
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
