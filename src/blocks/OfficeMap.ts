import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const OfficeMapBlock: Block = {
  slug: 'officeMapBlock',
  interfaceName: 'OfficeMapBlock',
  labels: { singular: 'Decorative Office Map', plural: 'Decorative Office Maps' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader(),
    {
      name: 'markers',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 12,
      admin: {
        description: 'Illustrative markers on the decorative map, positioned by percentage. Not tied to real coordinates.',
        initCollapsed: true,
      },
      fields: [
        { name: 'label', type: 'text', required: true, maxLength: 120 },
        { name: 'left', type: 'text', required: true, maxLength: 10, admin: { placeholder: '65%' } },
        { name: 'top', type: 'text', required: true, maxLength: 10, admin: { placeholder: '52%' } },
      ],
    },
    blockSettings(),
  ],
}
