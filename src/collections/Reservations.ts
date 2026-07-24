import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import {
  canDeleteTenantContent,
  canUpdateTenantContent,
} from '../access/tenantContext'

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
        { name: 'customerName', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text', required: true },
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'date', type: 'date', required: true, index: true },
        { name: 'time', type: 'text', required: true },
        { name: 'guests', type: 'number', required: true, min: 1 },
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
          options: ['pending', 'confirmed', 'cancelled', 'completed']
        },
        { name: 'specialOccasion', type: 'select', options: ['birthday', 'anniversary', 'business', 'other'] },
      ]
    },
    {
      type: 'row',
      fields: [
        { name: 'branch', type: 'text', admin: { description: 'Specific location if multi-location is active.' } },
        { name: 'bookingSource', type: 'text', defaultValue: 'website' },
        { name: 'tableNumber', type: 'text', admin: { description: 'For future POS / table management sync.' } },
      ]
    },
    { name: 'notes', type: 'textarea', admin: { description: 'Customer requests.' } },
    { name: 'internalNotes', type: 'textarea', admin: { description: 'Staff notes. Not visible to customer.' } },
    {
      type: 'row',
      fields: [
        { name: 'notificationsSent', type: 'checkbox', defaultValue: false },
        { name: 'reminderStatus', type: 'select', defaultValue: 'none', options: ['none', 'sent', 'confirmed'] },
      ]
    },
    { name: 'cancellationReason', type: 'text', admin: { condition: (_, siblingData) => siblingData.status === 'cancelled' } },
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
