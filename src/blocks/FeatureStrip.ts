import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'

export const FeatureStripBlock: Block = {
  slug: 'featurestripBlock',
  interfaceName: 'FeatureStripBlock',
  labels: { singular: 'Feature Strip', plural: 'Feature Strips' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'radio',
          defaultValue: 'manual',
          options: [
            { label: 'Items in this block', value: 'manual' },
            { label: 'Ghee Roast Brand Features from Site Settings', value: 'site-settings' },
          ],
          admin: {
            description: 'Site Settings keeps reusable Brand Feature content in one place; this block controls its position in the page layout.',
          },
        },
        {
          name: 'presentation',
          type: 'select',
          defaultValue: 'cards',
          options: [
            { label: 'Reusable Cards', value: 'cards' },
            { label: 'Ghee Roast Brand Strip', value: 'ghee-home-brand' },
          ],
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      maxRows: 6,
      validate: (value: unknown, { siblingData }) => {
        const source = siblingData && typeof siblingData === 'object'
          ? (siblingData as Record<string, unknown>).source
          : undefined
        if (source === 'site-settings') return true
        return Array.isArray(value) && value.length > 0
          ? true
          : 'Add at least one Feature Strip item or select Site Settings as the source.'
      },
      admin: {
        description: 'Short trust signals or selling points displayed in a compact strip.',
        initCollapsed: true,
        condition: (_, siblingData) => siblingData?.source !== 'site-settings',
      },
      fields: [
        { name: 'icon', type: 'text', maxLength: 50, admin: { placeholder: 'leaf' } },
        { name: 'title', type: 'text', required: true, maxLength: 100 },
        { name: 'description', type: 'textarea', maxLength: 300 },
      ],
    },
    blockSettings(),
  ],
}
