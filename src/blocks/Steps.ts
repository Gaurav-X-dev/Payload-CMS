import type { Block } from 'payload'

export const StepsBlock: Block = {
  slug: 'stepsBlock',
  interfaceName: 'StepsBlock',
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
