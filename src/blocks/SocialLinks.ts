import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const SocialLinksBlock: Block = {
  slug: 'socialLinksBlock',
  interfaceName: 'SocialLinksBlock',
  labels: { singular: 'Social Media', plural: 'Social Media Sections' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Hide this section without removing its content or position.' },
    },
    sectionHeader(),
    {
      type: 'row',
      fields: [
        { name: 'showHandles', type: 'checkbox', defaultValue: true },
        { name: 'showDescriptions', type: 'checkbox', defaultValue: true },
      ],
    },
    blockSettings(),
  ],
}
