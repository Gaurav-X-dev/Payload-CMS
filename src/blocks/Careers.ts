import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const CareersBlock: Block = {
  slug: 'careersBlock',
  interfaceName: 'CareersBlock',
  labels: { singular: 'Open Positions List', plural: 'Open Positions Lists' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader(),
    {
      name: 'positions',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 24,
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 120 },
        { name: 'department', type: 'text', required: true, maxLength: 60 },
        { name: 'type', type: 'text', required: true, maxLength: 40, admin: { description: 'e.g. Full-time, Contract, Remote.' } },
        { name: 'location', type: 'text', required: true, maxLength: 120 },
        { name: 'description', type: 'textarea', maxLength: 500 },
      ],
    },
    blockSettings(),
  ],
}
