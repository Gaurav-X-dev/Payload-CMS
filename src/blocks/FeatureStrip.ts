import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'

export const FeatureStripBlock: Block = {
  slug: 'featurestripBlock',
  interfaceName: 'FeatureStripBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      admin: { description: 'Short trust signals or selling points displayed in a compact strip.' },
      fields: [
        { name: 'icon', type: 'text', maxLength: 50, admin: { placeholder: 'leaf' } },
        { name: 'title', type: 'text', required: true, maxLength: 100 },
        { name: 'description', type: 'textarea', maxLength: 300 },
      ],
    },
    blockSettings(),
  ],
}
