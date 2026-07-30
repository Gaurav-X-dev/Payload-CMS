import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { ctaGroup } from './shared/ctaGroup'
import { sectionHeader } from './shared/sectionHeader'

export const CTABlock: Block = {
  slug: 'ctaBlock',
  interfaceName: 'CTABlock',
  fields: [
    sectionHeader(),
    ctaGroup({ admin: { description: 'Primary and optional secondary CTA.' } }),
    blockSettings(),
  ],
}
