import type { Block } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import { validateSafeURL } from '../validation/shared'

export const HeroBlock: Block = {
  slug: 'heroBlock',
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
      maxLength: 100,
    },
    {
      name: 'heading',
      type: 'textarea',
      required: true,
      maxLength: 200,
      admin: {
        description: 'Use line breaks to preserve the theme heading layout.',
      },
    },
    {
      name: 'highlightedHeading',
      type: 'text',
      maxLength: 100,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 1000,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'orderPlatformsLabel',
          type: 'text',
          defaultValue: 'Also available on',
          maxLength: 100,
          admin: { description: 'Label shown before configured delivery platform links.' },
        },
        {
          name: 'stampText',
          type: 'textarea',
          defaultValue: 'Slow\nRoasted\nIn Ghee\nWith Love',
          maxLength: 120,
          admin: { description: 'Use line breaks to control the circular hero stamp.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'primaryCTALabel', type: 'text', maxLength: 80 },
        {
          name: 'primaryCTAURL',
          type: 'text',
          maxLength: 2048,
          validate: (value: unknown) => validateSafeURL(value),
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'secondaryCTALabel', type: 'text', maxLength: 80 },
        {
          name: 'secondaryCTAURL',
          type: 'text',
          maxLength: 2048,
          validate: (value: unknown) => validateSafeURL(value),
        },
      ],
    },
    {
      name: 'desktopBackgroundImage',
      type: 'relationship',
      relationTo: 'media',
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    {
      name: 'mobileBackgroundImage',
      type: 'relationship',
      relationTo: 'media',
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    {
      name: 'foregroundImage',
      type: 'relationship',
      relationTo: 'media',
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    {
      name: 'imageAlt',
      type: 'text',
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      min: 0,
      max: 100,
    },
  ],
}
