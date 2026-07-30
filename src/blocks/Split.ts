import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { ctaGroup } from './shared/ctaGroup'
import { mediaField } from './shared/mediaField'
import { sectionHeader } from './shared/sectionHeader'

export const SplitBlock: Block = {
  slug: 'splitBlock',
  interfaceName: 'SplitBlock',
  fields: [
    sectionHeader(),
    { name: 'body', type: 'textarea', required: true, maxLength: 5_000 },
    {
      name: 'points',
      type: 'array',
      maxRows: 12,
      fields: [{ name: 'text', type: 'text', required: true, maxLength: 300 }],
    },
    mediaField({ name: 'image', admin: { description: 'Image shown beside the copy.' } }),
    {
      name: 'imagePosition',
      type: 'radio',
      defaultValue: 'left',
      options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }],
    },
    ctaGroup(),
    blockSettings(),
  ],
}
