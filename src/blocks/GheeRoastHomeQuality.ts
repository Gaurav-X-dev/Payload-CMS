import type { Block } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import { validateSafeURL } from '../validation/shared'
import { blockSettings } from './shared/blockSettings'

export const GheeRoastHomeQualityBlock: Block = {
  slug: 'gheeHomeQualityBlock',
  interfaceName: 'GheeRoastHomeQualityBlock',
  labels: {
    singular: 'Ghee Roast — Quality Promise',
    plural: 'Ghee Roast — Quality Promise Sections',
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
    {
      type: 'row',
      fields: [
        { name: 'heading', type: 'textarea', required: true, maxLength: 160, admin: { description: 'Use a line break where required by the design.' } },
        { name: 'highlightedHeading', type: 'text', maxLength: 100, admin: { placeholder: 'Pure Ghee' } },
      ],
    },
    { name: 'description', type: 'textarea', required: true, maxLength: 3_000 },
    {
      type: 'row',
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
          admin: { description: 'Quality/ingredient photograph shown beside the copy.' },
        },
        { name: 'imageAlt', type: 'text', maxLength: 200, admin: { description: 'Optional override; otherwise Media Alt is used.' } },
      ],
    },
    {
      name: 'points',
      type: 'array',
      maxRows: 8,
      admin: { initCollapsed: true },
      fields: [
        { name: 'icon', type: 'text', maxLength: 50, admin: { placeholder: 'fire, heart, leaf, diamond' } },
        { name: 'title', type: 'text', maxLength: 100 },
        { name: 'text', type: 'textarea', required: true, maxLength: 500 },
      ],
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
    blockSettings(),
  ],
}
