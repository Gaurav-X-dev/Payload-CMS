import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { linkField } from './shared/linkField'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const StoryBlock: Block = {
  slug: 'storyBlock',
  interfaceName: 'StoryBlock',
  labels: { singular: 'Story Panel', plural: 'Story Panels' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    {
      name: 'layout',
      type: 'radio',
      defaultValue: 'panel',
      options: [
        { label: 'Text + Image Panel', value: 'panel' },
        { label: 'Full-bleed Image Overlay', value: 'overlay' },
        { label: 'Simple (Inner Page)', value: 'simple' },
      ],
    },
    { name: 'eyebrow', type: 'text', maxLength: 100 },
    { name: 'title', type: 'text', maxLength: 200, admin: { condition: (_, siblingData) => siblingData?.layout !== 'overlay' } },
    {
      name: 'accentPhrase',
      type: 'text',
      maxLength: 100,
      admin: { description: 'Optional trailing phrase rendered with the theme\'s accent/italic styling.', condition: (_, siblingData) => siblingData?.layout !== 'overlay' },
    },
    { name: 'quote', type: 'textarea', maxLength: 400 },
    {
      name: 'body',
      type: 'textarea',
      maxLength: 2_000,
      admin: { description: 'Separate multiple paragraphs with a blank line.', condition: (_, siblingData) => siblingData?.layout !== 'overlay' },
    },
    {
      name: 'attribution',
      type: 'text',
      maxLength: 100,
      admin: { description: 'Optional line shown under the quote (overlay layout only).', condition: (_, siblingData) => siblingData?.layout === 'overlay' },
    },
    {
      type: 'row',
      admin: { condition: (_, siblingData) => siblingData?.layout !== 'overlay' },
      fields: [
        {
          name: 'media',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
        {
          name: 'secondaryMedia',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
          admin: { description: 'Optional second, smaller accent image shown overlapping the primary image.' },
        },
      ],
    },
    {
      name: 'overlayMedia',
      type: 'relationship',
      relationTo: 'media',
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
      admin: { condition: (_, siblingData) => siblingData?.layout === 'overlay' },
    },
    {
      name: 'mediaAlt',
      type: 'text',
      admin: { description: 'Alt text for the primary/overlay image.' },
    },
    {
      name: 'imagePosition',
      type: 'radio',
      defaultValue: 'right',
      options: [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }],
      admin: { condition: (_, siblingData) => siblingData?.layout !== 'overlay' },
    },
    {
      name: 'statBadge',
      type: 'group',
      admin: { condition: (_, siblingData) => siblingData?.layout === 'panel' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        {
          type: 'row',
          admin: { condition: (_, siblingData) => siblingData?.enabled },
          fields: [
            { name: 'value', type: 'text', maxLength: 20, admin: { placeholder: '15+' } },
            { name: 'label', type: 'text', maxLength: 60 },
          ],
        },
      ],
    },
    {
      name: 'enableCta',
      type: 'checkbox',
      defaultValue: false,
      admin: { condition: (_, siblingData) => siblingData?.layout === 'panel' },
    },
    linkField({
      name: 'cta',
      admin: { condition: (_, siblingData) => siblingData?.layout === 'panel' && siblingData?.enableCta },
    }),
    blockSettings(),
  ],
}
