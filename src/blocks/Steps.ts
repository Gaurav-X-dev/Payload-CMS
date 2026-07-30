import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const StepsBlock: Block = {
  slug: 'stepsBlock',
  interfaceName: 'StepsBlock',
  fields: [
    sectionHeader(),
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      admin: { initCollapsed: true },
      fields: [
        { name: 'label', type: 'text', maxLength: 40, admin: { placeholder: 'Step 1 or 08:00 AM' } },
        { name: 'icon', type: 'text', maxLength: 50 },
        { name: 'title', type: 'text', required: true, maxLength: 120 },
        { name: 'description', type: 'textarea', required: true, maxLength: 1_000 },
      ],
    },
    blockSettings(),
  ],
}
