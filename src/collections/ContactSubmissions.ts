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
  validateIndianMobile,
  validateName,
} from '../validation/shared'
import { validateContactSubmissionSubject } from '../hooks/validateContactSubmissionSubject'

const canManageSubmissionFields: FieldAccess = ({ req }) =>
  isSuperAdminUser(req.user) || isTenantAdminUser(req.user)

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
        {
          name: 'name',
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
          maxLength: 10,
          validate: (value: unknown) => validateIndianMobile(value, { required: false }),
          hooks: { beforeValidate: [({ value }) => normalizeIndianMobile(value)] },
        },
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
          options: ['new', 'read', 'resolved'],
          access: {
            create: canManageSubmissionFields,
            update: canManageSubmissionFields,
          },
        },
      ]
    },
    {
      name: 'subject',
      type: 'text',
      maxLength: 80,
      admin: { description: 'Required for new public enquiries. Optional on historical records for backwards compatibility.' },
    },
    { name: 'message', type: 'textarea', required: true, maxLength: 5000 },
  ],
  hooks: {
    beforeValidate: [validateContactSubmissionSubject],
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
