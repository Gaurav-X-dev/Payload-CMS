import type { GroupField } from 'payload'
import { sameTenantRelationship } from '../../hooks/sameTenantRelationship'

export const blockSettings = (): GroupField => ({
  name: 'settings',
  type: 'group',
  admin: {
    description: 'Appearance and visibility settings for this block.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'backgroundColor',
          type: 'select',
          defaultValue: 'transparent',
          options: [
            { label: 'Transparent', value: 'transparent' },
            { label: 'Surface', value: 'surface' },
            { label: 'Primary', value: 'primary' },
            { label: 'Accent', value: 'accent' },
            { label: 'Dark', value: 'dark' },
          ],
        },
        {
          name: 'containerWidth',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'Standard (1200px)', value: 'standard' },
            { label: 'Wide (1440px)', value: 'wide' },
            { label: 'Full Width (100vw)', value: 'full' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'backgroundImage',
          type: 'relationship',
          relationTo: 'media',
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
          admin: {
            description: 'Optional image to place behind the block.',
          },
        },
        {
          name: 'overlayOpacity',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: '0-100 opacity for the background overlay.',
            condition: (_, siblingData) => Boolean(siblingData?.backgroundImage),
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'paddingTop',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
        },
        {
          name: 'paddingBottom',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'visibility',
          type: 'select',
          hasMany: true,
          defaultValue: ['desktop', 'tablet', 'mobile'],
          options: [
            { label: 'Desktop', value: 'desktop' },
            { label: 'Tablet', value: 'tablet' },
            { label: 'Mobile', value: 'mobile' },
          ],
        },
        {
          name: 'animation',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Fade In', value: 'fade-in' },
            { label: 'Slide Up', value: 'slide-up' },
            { label: 'Zoom In', value: 'zoom-in' },
            { label: 'Stagger Children', value: 'stagger' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customClasses',
          type: 'text',
          admin: {
            description: 'Inject custom CSS classes for developer overrides.',
          },
        },
        {
          name: 'htmlId',
          type: 'text',
          admin: {
            description: 'Used for #anchor links. Must be unique.',
          },
        },
      ],
    },
  ],
})
