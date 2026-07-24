import type { Block } from 'payload'

export const LocationsBlock: Block = {
  slug: 'locationsBlock',
  interfaceName: 'LocationsBlock',
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
