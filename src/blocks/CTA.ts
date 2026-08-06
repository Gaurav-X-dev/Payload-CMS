import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { ctaGroup } from './shared/ctaGroup'
import { sectionHeader } from './shared/sectionHeader'

export const CTABlock: Block = {
  slug: 'ctaBlock',
  interfaceName: 'CTABlock',
  fields: [
    sectionHeader(),
    {
      name: 'bgText',
      type: 'text',
      maxLength: 20,
      admin: { description: 'Overrides the large decorative background text. Defaults to the site name\'s first word if left blank.' },
    },
    ctaGroup({ admin: { description: 'Primary and optional secondary CTA.' } }),
    blockSettings(),
  ],
}
