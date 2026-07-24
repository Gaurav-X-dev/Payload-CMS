import type { Block } from 'payload'

export const SubBrandsBlock: Block = {
  slug: 'subbrandsBlock',
  interfaceName: 'SubBrandsBlock',
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
