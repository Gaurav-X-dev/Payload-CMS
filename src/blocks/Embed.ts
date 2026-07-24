import type { Block } from 'payload'

export const EmbedBlock: Block = {
  slug: 'embedBlock',
  interfaceName: 'EmbedBlock',
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
