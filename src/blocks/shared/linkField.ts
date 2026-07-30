import type { GroupField } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../../hooks/sameTenantRelationship'
import { validateConfiguredLink } from '../../validation/shared'

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
          enumName: 'cms_link_kind',
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
          maxLength: 80,
        },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: 'pages',
          filterOptions: tenantRelationshipFilter('pages'),
          hooks: { beforeValidate: [sameTenantRelationship('pages')] },
          validate: (
            value: unknown,
            { siblingData }: { siblingData: unknown },
          ) => {
            const type = siblingData && typeof siblingData === 'object' && 'type' in siblingData
              ? siblingData.type
              : undefined
            if (type !== 'reference') return true
            return (
              typeof value === 'number'
              || typeof value === 'string'
              || Boolean(value && typeof value === 'object' && 'id' in value)
            )
              ? true
              : 'Select an internal page.'
          },
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'reference',
          },
        },
        {
          name: 'url',
          type: 'text',
          maxLength: 2048,
          validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
            const type = siblingData && typeof siblingData === 'object'
              ? (siblingData as Record<string, unknown>).type
              : undefined
            return type === 'reference'
              ? true
              : validateConfiguredLink(value, type)
          },
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
          enumName: 'cms_link_style',
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
          enumName: 'cms_link_size',
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
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
        {
          name: 'iconPosition',
          enumName: 'cms_link_icon_pos',
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
        { name: 'analyticsTrackingId', type: 'text', maxLength: 100, admin: { description: 'E.g., GTM ID.' } },
        { name: 'ariaLabel', type: 'text', maxLength: 200, admin: { description: 'Screen reader override.' } },
      ],
    },
    ...(overrides?.fields || []),
  ],
})
