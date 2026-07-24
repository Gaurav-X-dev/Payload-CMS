import type { Field } from 'payload'

export const statItemFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'prefix',
        type: 'text',
        admin: { description: 'e.g., "$"' },
      },
      {
        name: 'value',
        type: 'number',
        required: true,
      },
      {
        name: 'suffix',
        type: 'text',
        admin: { description: 'e.g., "K+", "%"' },
      },
    ],
  },
  {
    name: 'label',
    type: 'text',
    required: true,
  },
]
