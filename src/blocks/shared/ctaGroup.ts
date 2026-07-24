import type { GroupField } from 'payload'
import { linkField } from './linkField'

export const ctaGroup = (overrides?: Partial<GroupField>): GroupField => ({
  name: 'ctaGroup',
  type: 'group',
  admin: {
    description: 'Call to Action links.',
  },
  ...overrides,
  fields: [
    {
      name: 'alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'enablePrimary',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'enableSecondary',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    linkField({
      name: 'primaryCTA',
      admin: {
        condition: (_, siblingData) => siblingData?.enablePrimary,
      },
    }),
    linkField({
      name: 'secondaryCTA',
      admin: {
        condition: (_, siblingData) => siblingData?.enableSecondary,
      },
    }),
    ...(overrides?.fields || []),
  ],
})
