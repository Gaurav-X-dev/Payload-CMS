import type { Block } from 'payload'

export const PackagesBlock: Block = {
  slug: 'packagesBlock',
  interfaceName: 'PackagesBlock',
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
