import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const NewsletterBlock: Block = {
  slug: 'newsletterBlock',
  interfaceName: 'NewsletterBlock',
  labels: { singular: 'Newsletter Signup', plural: 'Newsletter Signup Sections' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Hide this section without removing it from the layout.' },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'block',
      options: [
        { label: 'This block', value: 'block' },
        { label: 'Published Site Settings', value: 'site-settings' },
      ],
      admin: { description: 'Site Settings keeps Contact and global newsletter copy in sync.' },
    },
    sectionHeader(),
    {
      type: 'row',
      fields: [
        { name: 'placeholder', type: 'text', defaultValue: 'Enter your email address', maxLength: 120 },
        { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe', maxLength: 80 },
      ],
    },
    { name: 'highlightedWord', type: 'text', maxLength: 40 },
    { name: 'privacyText', type: 'text', maxLength: 300 },
    { name: 'successMessage', type: 'text', defaultValue: 'Thank you for joining the list.', maxLength: 300 },
    { name: 'errorMessage', type: 'text', defaultValue: 'We could not save your signup. Please try again later.', maxLength: 300 },
    blockSettings(),
  ],
}
