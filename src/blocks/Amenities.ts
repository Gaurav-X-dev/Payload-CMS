import type { Block } from 'payload'

export const AmenitiesBlock: Block = {
  slug: 'amenitiesBlock',
  interfaceName: 'AmenitiesBlock',
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
