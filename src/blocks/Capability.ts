import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { linkField } from './shared/linkField'
import { mediaField } from './shared/mediaField'
import { sectionHeader } from './shared/sectionHeader'
import { validateHTMLID } from '../validation/pageLayout'

export const CapabilityBlock: Block = {
  slug: 'capabilityBlock',
  interfaceName: 'CapabilityBlock',
  labels: { singular: 'Capability Detail List', plural: 'Capability Detail Lists' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader(),
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 20,
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'number', type: 'text', maxLength: 10, admin: { description: 'Displayed index badge, e.g. 01.', placeholder: '01' } },
            {
              name: 'anchorId',
              type: 'text',
              maxLength: 80,
              validate: (value: unknown) => validateHTMLID(value),
              admin: { description: 'Optional #anchor for this item (used for anchor links elsewhere on the site).' },
            },
          ],
        },
        { name: 'title', type: 'text', required: true, maxLength: 150 },
        { name: 'description', type: 'textarea', required: true, maxLength: 1_500 },
        {
          name: 'features',
          type: 'array',
          maxRows: 12,
          admin: { description: 'Short checklist bullets shown beneath the description.' },
          fields: [{ name: 'text', type: 'text', required: true, maxLength: 200 }],
        },
        { name: 'enableLink', type: 'checkbox', defaultValue: false },
        linkField({
          name: 'link',
          admin: { condition: (_, siblingData) => siblingData?.enableLink },
        }),
        mediaField({ name: 'media', admin: { description: 'Image shown beside this item.' } }),
        {
          name: 'reverse',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Flip this item to place the image on the opposite side.' },
        },
      ],
    },
    blockSettings(),
  ],
}
