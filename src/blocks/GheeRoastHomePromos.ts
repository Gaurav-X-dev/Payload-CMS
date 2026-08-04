import type { Block } from 'payload'
import { validateSafeURL } from '../validation/shared'
import { blockSettings } from './shared/blockSettings'

export const GheeRoastHomePromosBlock: Block = {
  slug: 'gheeHomePromosBlock',
  interfaceName: 'GheeRoastHomePromosBlock',
  labels: {
    singular: 'Ghee Roast — Promotional Split',
    plural: 'Ghee Roast — Promotional Splits',
  },
  admin: {
    group: 'Ghee Roast Home',
    components: {
      Label: {
        exportName: 'GheeHomeBlockLabel',
        path: './components/admin/GheeHomeBlockLabel',
      },
    },
  },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Home promotions', maxLength: 100, admin: { description: 'Admin row label only; it is not shown publicly.' } },
    {
      name: 'promos',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 2,
      admin: { initCollapsed: true, description: 'One or two promotional panels. Array order controls left/right placement.' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'eyebrow', type: 'text', maxLength: 100 },
        { name: 'heading', type: 'text', required: true, maxLength: 180 },
        { name: 'description', type: 'textarea', required: true, maxLength: 2_000 },
        {
          name: 'bulletPoints',
          type: 'array',
          maxRows: 8,
          admin: { initCollapsed: true },
          fields: [{ name: 'text', type: 'text', required: true, maxLength: 240 }],
        },
        {
          name: 'cta',
          type: 'group',
          admin: { description: 'The button renders only when both label and URL are present.' },
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            {
              type: 'row',
              fields: [
                { name: 'label', type: 'text', maxLength: 80 },
                { name: 'url', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value) },
              ],
            },
          ],
        },
      ],
    },
    blockSettings(),
  ],
}
