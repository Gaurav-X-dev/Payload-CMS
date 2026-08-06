import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { linkField } from './shared/linkField'
import { mediaField } from './shared/mediaField'
import { sectionHeader } from './shared/sectionHeader'

export const ContentGridBlock: Block = {
  slug: 'contentgridBlock',
  interfaceName: 'ContentGridBlock',
  fields: [
    sectionHeader(),
    {
      name: 'presentation',
      type: 'select',
      defaultValue: 'grid',
      admin: {
        description: 'Controls section chrome (background, decorative text, wrapper) for themes with multiple grid styles. Themes that only use one style can leave this at Grid.',
      },
      options: [
        { label: 'Grid (default)', value: 'grid' },
        { label: 'Numbered Pillars', value: 'pillars' },
        { label: 'Edge / Media + Grid', value: 'edge' },
        { label: 'Industries', value: 'industries' },
        { label: 'B2B Cards', value: 'b2b' },
        { label: 'Services Preview', value: 'services' },
        { label: 'Compact Pills', value: 'partners' },
        { label: 'Numbered Value Cards', value: 'values' },
        { label: 'Mission / Vision (Media + 2 Items)', value: 'mission-vision' },
        { label: 'Benefits (Plain Cards)', value: 'benefits' },
      ],
    },
    {
      name: 'bgText',
      type: 'text',
      maxLength: 20,
      admin: {
        description: 'Numbered Pillars only: overrides the large decorative background word. Defaults to "PHILOSOPHY" if left blank.',
        condition: (_, siblingData) => siblingData?.presentation === 'pillars',
      },
    },
    mediaField(
      {
        name: 'media',
        admin: { description: 'Optional companion image shown beside the grid (used by the Edge / Media + Grid presentation).' },
      },
      { required: false },
    ),
    {
      name: 'mediaPosition',
      type: 'radio',
      defaultValue: 'left',
      options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }],
      admin: { condition: (_, siblingData) => Boolean(siblingData?.media?.item) },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 16,
      admin: { initCollapsed: true },
      fields: [
        { name: 'icon', type: 'text', maxLength: 50, admin: { description: 'An emoji/glyph rendered as-is, or a known icon keyword for this theme.' } },
        { name: 'title', type: 'text', required: true, maxLength: 120 },
        { name: 'description', type: 'textarea', maxLength: 1_000 },
        { name: 'enableLink', type: 'checkbox', defaultValue: false },
        linkField({
          name: 'link',
          admin: { condition: (_, siblingData) => siblingData?.enableLink },
        }),
      ],
    },
    blockSettings(),
  ],
}
