import type { GroupField } from 'payload'
import { sameTenantRelationship } from '../../hooks/sameTenantRelationship'

export const linkField = (overrides?: Partial<GroupField>): GroupField => ({
  name: 'link',
  type: 'group',
  admin: {
    description: 'Universal link configuration.',
  },
  ...overrides,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'reference',
          options: [
            { label: 'Internal Page', value: 'reference' },
            { label: 'Custom URL', value: 'custom' },
            { label: 'Anchor', value: 'anchor' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          hooks: { beforeValidate: [sameTenantRelationship('pages')] },
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'reference',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => ['custom', 'anchor', 'email', 'phone'].includes(siblingData?.type),
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'newTab', type: 'checkbox', defaultValue: false },
        { name: 'nofollow', type: 'checkbox', defaultValue: false, admin: { description: 'SEO override.' } },
        { name: 'disabled', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'buttonStyle',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Ghost', value: 'ghost' },
            { label: 'Text Only', value: 'text' },
          ],
        },
        {
          name: 'buttonSize',
          type: 'select',
          defaultValue: 'medium',
          options: [
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
          name: 'icon',
          type: 'relationship',
          relationTo: 'media',
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
        {
          name: 'iconPosition',
          type: 'radio',
          defaultValue: 'left',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.icon),
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'analyticsTrackingId', type: 'text', admin: { description: 'E.g., GTM ID.' } },
        { name: 'ariaLabel', type: 'text', admin: { description: 'Screen reader override.' } },
      ],
    },
    ...(overrides?.fields || []),
  ],
})
