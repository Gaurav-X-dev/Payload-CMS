import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const NewsletterBlock: Block = {
  slug: 'newsletterBlock',
  interfaceName: 'NewsletterBlock',
  fields: [
    sectionHeader(),
    {
      type: 'row',
      fields: [
        { name: 'placeholder', type: 'text', defaultValue: 'Enter your email address', maxLength: 120 },
        { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe', maxLength: 80 },
      ],
    },
    { name: 'privacyText', type: 'text', maxLength: 300 },
    blockSettings(),
  ],
}
