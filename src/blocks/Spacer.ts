import type { Block } from 'payload'

export const SpacerBlock: Block = {
  slug: 'spacerBlock',
  interfaceName: 'SpacerBlock',
  fields: [
    {
      name: 'size',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Extra large', value: 'xlarge' },
      ],
    },
  ],
}
