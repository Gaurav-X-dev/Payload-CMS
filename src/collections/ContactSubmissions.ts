import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import {
  canDeleteTenantContent,
  canUpdateTenantContent,
} from '../access/tenantContext'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'createdAt'],
  },
  access: {
    read: tenantIsolation,
    create: () => true, // Public forms can submit
    update: canUpdateTenantContent,
    delete: canDeleteTenantContent,
  },
  fields: [
    tenantField(),
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
      ]
    },
    {
      type: 'row',
      fields: [
        { 
          name: 'type', 
          type: 'select', 
          required: true,
          index: true,
          options: ['general', 'catering', 'franchise', 'careers']
        },
        { 
          name: 'status', 
          type: 'select', 
          defaultValue: 'new',
          index: true,
          options: ['new', 'read', 'resolved']
        },
      ]
    },
    { name: 'message', type: 'textarea', required: true },
  ],
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          // Trigger email notification based on type (e.g. Careers goes to HR)
          console.log(`New contact submission from ${doc.name} for ${doc.type}`)
        }
      }
    ]
  }
}
