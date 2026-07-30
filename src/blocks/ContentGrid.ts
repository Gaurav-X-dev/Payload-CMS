import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const ContentGridBlock: Block = {
  slug: 'contentgridBlock',
  interfaceName: 'ContentGridBlock',
  fields: [
    sectionHeader(),
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 16,
      admin: { initCollapsed: true },
      fields: [
        { name: 'icon', type: 'text', maxLength: 50 },
        { name: 'title', type: 'text', required: true, maxLength: 120 },
        { name: 'description', type: 'textarea', maxLength: 1_000 },
      ],
    },
    blockSettings(),
  ],
}
