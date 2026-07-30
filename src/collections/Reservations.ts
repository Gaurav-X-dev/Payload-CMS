import type { CollectionConfig, FieldAccess } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import {
  canDeleteTenantContent,
  canUpdateTenantContent,
  isSuperAdminUser,
  isTenantAdminUser,
} from '../access/tenantContext'
import {
  normalizeEmail,
  normalizeIndianMobile,
  normalizeName,
  validateEmail,
  validateFiniteInteger,
  validateIndianMobile,
  validateName,
} from '../validation/shared'

const canManageReservationFields: FieldAccess = ({ req }) =>
  isSuperAdminUser(req.user) || isTenantAdminUser(req.user)

export const Reservations: CollectionConfig = {
  slug: 'reservations',
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'date', 'time', 'guests', 'status'],
  },
  access: {
    read: tenantIsolation, // Public cannot read reservations
    create: () => true,    // Public frontend form can submit reservations
    update: canUpdateTenantContent,
    delete: canDeleteTenantContent,
  },
  fields: [
    tenantField(),
    {
      type: 'row',
      fields: [
        {
          name: 'customerName',
          type: 'text',
          required: true,
          maxLength: 100,
          validate: validateName,
          hooks: { beforeValidate: [({ value }) => normalizeName(value)] },
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          validate: validateEmail,
          hooks: { beforeValidate: [({ value }) => normalizeEmail(value)] },
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          maxLength: 10,
          validate: validateIndianMobile,
          hooks: { beforeValidate: [({ value }) => normalizeIndianMobile(value)] },
        },
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', required: true, index: true },
        { name: 'time', type: 'text', required: true, maxLength: 20 },
        {
          name: 'guests',
          type: 'number',
          required: true,
          min: 1,
          max: 50,
          validate: (value: unknown) => validateFiniteInteger(value, { min: 1, max: 50 }),
        },
      ]
    },
    {
      type: 'row',
      fields: [
        { 
          name: 'status', 
          type: 'select', 
          defaultValue: 'pending',
          index: true,
          options: ['pending', 'confirmed', 'cancelled', 'completed'],
          access: {
            create: canManageReservationFields,
            update: canManageReservationFields,
          },
        },
        { name: 'specialOccasion', type: 'select', options: ['birthday', 'anniversary', 'business', 'other'] },
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'branch', type: 'text', maxLength: 100, admin: { description: 'Specific location if multi-location is active.' } },
        {
          name: 'bookingSource',
          type: 'text',
          defaultValue: 'website',
          maxLength: 50,
          access: {
            create: canManageReservationFields,
            update: canManageReservationFields,
          },
        },
        {
          name: 'tableNumber',
          type: 'text',
          maxLength: 50,
          access: {
            create: canManageReservationFields,
            update: canManageReservationFields,
          },
          admin: { description: 'For future POS / table management sync.' },
        },
      ]
    },
    { name: 'notes', type: 'textarea', maxLength: 2_000, admin: { description: 'Customer requests.' } },
    {
      name: 'internalNotes',
      type: 'textarea',
      maxLength: 5_000,
      access: {
        create: canManageReservationFields,
        update: canManageReservationFields,
      },
      admin: { description: 'Staff notes. Not visible to customer.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'notificationsSent',
          type: 'checkbox',
          defaultValue: false,
          access: {
            create: canManageReservationFields,
            update: canManageReservationFields,
          },
        },
        {
          name: 'reminderStatus',
          type: 'select',
          defaultValue: 'none',
          options: ['none', 'sent', 'confirmed'],
          access: {
            create: canManageReservationFields,
            update: canManageReservationFields,
          },
        },
      ]
    },
    {
      name: 'cancellationReason',
      type: 'text',
      maxLength: 500,
      access: {
        create: canManageReservationFields,
        update: canManageReservationFields,
      },
      admin: { condition: (_, siblingData) => siblingData.status === 'cancelled' },
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          // Trigger email/SMS notification to restaurant staff
          console.log(`New reservation created for ${doc.customerName}`)
        }
      }
    ]
  }
}
