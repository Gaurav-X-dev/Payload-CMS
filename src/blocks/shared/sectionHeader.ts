import type { GroupField } from 'payload'

export const sectionHeader = (overrides?: Partial<GroupField>): GroupField => ({
  name: 'sectionHeader',
  type: 'group',
  admin: {
    description: 'Standardized section title and description.',
  },
  ...overrides,
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Small accented text above the title.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'headingTag',
          enumName: 'cms_section_tag',
          type: 'select',
          defaultValue: 'h2',
          options: [
            { label: 'H1 (Use strictly once per page)', value: 'h1' },
            { label: 'H2 (Default section header)', value: 'h2' },
            { label: 'H3 (Sub-section)', value: 'h3' },
            { label: 'H4', value: 'h4' },
          ],
        },
      ],
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'alignment',
          enumName: 'cms_section_align',
          type: 'select',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        {
          name: 'maxWidth',
          enumName: 'cms_section_width',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Narrow', value: 'narrow' },
            { label: 'Wide', value: 'wide' },
          ],
        },
      ],
    },
    ...(overrides?.fields || []),
  ],
})
