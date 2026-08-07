import type { Block } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import {
  DEFAULT_CONTACT_SUBJECT_OPTIONS,
  validateContactSubjectRows,
} from '../validation/contactPage'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

const trimText = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Hide this form section without deleting its configuration.' },
    },
    sectionHeader(),
    {
      name: 'formType',
      type: 'select',
      required: true,
      defaultValue: 'contact',
      options: [
        { label: 'Contact enquiry', value: 'contact' },
        { label: 'Reservation request', value: 'reservation' },
        { label: 'Catering enquiry', value: 'catering' },
      ],
    },
    {
      name: 'subjectOptions',
      type: 'array',
      maxRows: 12,
      defaultValue: DEFAULT_CONTACT_SUBJECT_OPTIONS.map((option) => ({ ...option })),
      validate: (value: unknown) => validateContactSubjectRows(value),
      admin: {
        description: 'Allowed subjects shown in Contact and Catering forms. Values are also verified before submission.',
        condition: (_, siblingData) => siblingData?.formType !== 'reservation',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 80,
          hooks: { beforeValidate: [({ value }) => trimText(value)] },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          maxLength: 80,
          hooks: { beforeValidate: [({ value }) => trimText(value)] },
        },
      ],
    },
    { name: 'submitLabel', type: 'text', defaultValue: 'Send message', maxLength: 80 },
    { name: 'successMessage', type: 'text', defaultValue: 'Thank you. We will be in touch shortly.', maxLength: 300 },
    { name: 'errorMessage', type: 'text', defaultValue: 'We could not submit the form. Please check your details or contact the restaurant directly.', maxLength: 300 },
    {
      name: 'showContactInfoCards',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Curious Ladoo only: shows General Inquiries / Operating Hours / Locations cards beside the form, sourced from the primary Location and Site Settings business hours.',
      },
    },
    {
      name: 'sideImage',
      type: 'relationship',
      relationTo: 'media',
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
      admin: { description: 'Optional Contact image. When omitted, the form uses a clean single-column layout.' },
    },
    {
      name: 'imageAlt',
      type: 'text',
      maxLength: 250,
      hooks: { beforeValidate: [({ value }) => trimText(value)] },
      admin: {
        description: 'Overrides Media alt text for this section.',
        condition: (_, siblingData) => Boolean(siblingData?.sideImage),
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'imagePosition',
          type: 'select',
          defaultValue: 'right',
          options: [
            { label: 'Right', value: 'right' },
            { label: 'Left', value: 'left' },
          ],
        },
        {
          name: 'imageFit',
          type: 'select',
          defaultValue: 'cover',
          options: [
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
          ],
        },
        {
          name: 'formCardStyle',
          type: 'select',
          defaultValue: 'elevated',
          options: [
            { label: 'Elevated', value: 'elevated' },
            { label: 'Bordered', value: 'bordered' },
            { label: 'Flat', value: 'flat' },
          ],
        },
      ],
    },
    blockSettings(),
  ],
}
