import type { Field } from 'payload'
import { mediaField } from './mediaField'
import { linkField } from './linkField'

export const cardItemFields: Field[] = [
  mediaField({
    name: 'image',
    admin: { description: 'Card featured image' },
  }),
  {
    name: 'title',
    type: 'text',
    required: true,
  },
  {
    name: 'description',
    type: 'textarea',
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    defaultValue: false,
  },
  linkField({
    name: 'link',
    admin: {
      condition: (_, siblingData) => siblingData?.enableLink,
    },
  }),
]
