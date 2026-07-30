import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    sectionHeader(),
    {
      name: 'formType',
      type: 'select',
      required: true,
      defaultValue: 'contact',
      options: [
        { label: 'Contact enquiry', value: 'contact' },
        { label: 'Reservation request', value: 'reservation' },
        { label: 'Catering enquiry', value: 'catering' },
      ],
    },
    { name: 'submitLabel', type: 'text', defaultValue: 'Send message', maxLength: 80 },
    { name: 'successMessage', type: 'text', defaultValue: 'Thank you. We will be in touch shortly.', maxLength: 300 },
    blockSettings(),
  ],
}
