import type { Block, Field } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import { validateSafeURL } from '../validation/shared'
import { blockSettings } from './shared/blockSettings'

const mediaRelationship = (name: string, label: string): Field => ({
  name,
  type: 'relationship',
  relationTo: 'media',
  filterOptions: tenantRelationshipFilter('media'),
  hooks: { beforeValidate: [sameTenantRelationship('media')] },
  admin: {
    description: `${label}. Upload a responsive food or restaurant photograph; SVG is not recommended here.`,
  },
})

export const GheeRoastHomeStoryBlock: Block = {
  slug: 'gheeHomeStoryBlock',
  interfaceName: 'GheeRoastHomeStoryBlock',
  labels: {
    singular: 'Ghee Roast — Our Story',
    plural: 'Ghee Roast — Our Story Sections',
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
      name: 'eyebrow',
      type: 'text',
      maxLength: 100,
      admin: { description: 'Small orange label above the heading.', placeholder: 'Welcome to Ghee Roast' },
    },
    {
      type: 'row',
      fields: [
        { name: 'heading', type: 'text', required: true, maxLength: 180, admin: { placeholder: 'Where Tradition Meets Luxury.' } },
        { name: 'highlightedHeading', type: 'text', maxLength: 100, admin: { description: 'Optional highlighted continuation.' } },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 5_000,
      admin: { description: 'Use a blank line between paragraphs.' },
    },
    {
      name: 'images',
      type: 'group',
      admin: { description: 'The first image is large; the second and third form the lower collage row.' },
      fields: [
        mediaRelationship('primaryImage', 'Large primary image'),
        { name: 'primaryImageAlt', type: 'text', maxLength: 200, admin: { description: 'Optional override; otherwise Media Alt is used.' } },
        {
          type: 'row',
          fields: [
            mediaRelationship('secondaryImage', 'Lower-left image'),
            mediaRelationship('tertiaryImage', 'Lower-right image'),
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'secondaryImageAlt', type: 'text', maxLength: 200, admin: { description: 'Optional Media Alt override.' } },
            { name: 'tertiaryImageAlt', type: 'text', maxLength: 200, admin: { description: 'Optional Media Alt override.' } },
          ],
        },
        {
          name: 'imagePosition',
          dbName: 'img_pos',
          enumName: 'gr_story_img_pos',
          type: 'radio',
          defaultValue: 'left',
          options: [{ label: 'Images left', value: 'left' }, { label: 'Images right', value: 'right' }],
        },
      ],
    },
    {
      name: 'bulletPoints',
      type: 'array',
      maxRows: 8,
      admin: { initCollapsed: true, description: 'Short proof points shown with check marks.' },
      fields: [{ name: 'text', type: 'text', required: true, maxLength: 240 }],
    },
    {
      name: 'experienceBadge',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          type: 'row',
          fields: [
            { name: 'number', type: 'text', maxLength: 30, admin: { placeholder: '25+' } },
            { name: 'label', type: 'textarea', maxLength: 100, admin: { description: 'Line breaks are preserved.', placeholder: 'Years of\nTradition' } },
          ],
        },
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
            { name: 'label', type: 'text', maxLength: 80, admin: { placeholder: 'Read Our Full Story' } },
            { name: 'url', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value), admin: { description: 'Internal path such as /about or full https URL.' } },
          ],
        },
      ],
    },
    blockSettings(),
  ],
}
