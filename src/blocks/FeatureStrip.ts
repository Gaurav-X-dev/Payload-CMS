import type { Block } from 'payload'

export const FeatureStripBlock: Block = {
  slug: 'featurestripBlock',
  interfaceName: 'FeatureStripBlock',
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
