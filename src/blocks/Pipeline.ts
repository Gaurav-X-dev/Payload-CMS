import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { linkField } from './shared/linkField'
import { sectionHeader } from './shared/sectionHeader'

export const PipelineBlock: Block = {
  slug: 'pipelineBlock',
  interfaceName: 'PipelineBlock',
  labels: { singular: 'Pipeline / Upcoming List', plural: 'Pipeline / Upcoming Lists' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader(),
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      admin: { description: 'Bulleted list of upcoming initiatives.' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 150,
          admin: { description: 'Bold lead-in text, e.g. "Project Roastery (Q1 2026):"' },
        },
        { name: 'description', type: 'textarea', maxLength: 500 },
      ],
    },
    { name: 'enableLink', type: 'checkbox', defaultValue: false },
    linkField({
      name: 'link',
      admin: { condition: (_, siblingData) => siblingData?.enableLink },
    }),
    {
      name: 'spotlight',
      type: 'group',
      admin: { description: 'Optional decorative callout box shown beside the list.' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        {
          type: 'row',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
          fields: [
            { name: 'icon', type: 'text', maxLength: 10, admin: { description: 'An emoji/glyph rendered as-is.' } },
            { name: 'title', type: 'text', maxLength: 120 },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 500,
          admin: { condition: (_, siblingData) => siblingData?.enabled },
        },
      ],
    },
    {
      name: 'spotlightPosition',
      type: 'radio',
      defaultValue: 'right',
      options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }],
      admin: { condition: (_, siblingData) => siblingData?.spotlight?.enabled },
    },
    blockSettings(),
  ],
}
