import type { CollectionConfig, FieldAccess } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import {
  canDeleteTenantContent,
  canUpdateTenantContent,
  isSuperAdminUser,
  isTenantAdminUser,
  normalizeTenantID,
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
import { sendContactNotification } from '../lib/mail/sendContactNotification'

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
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        const tenantID = normalizeTenantID(doc.tenantId)
        if (!tenantID) {
          req.payload.logger.warn(`Contact notification skipped for submission ${doc.id}: no tenant on the document.`)
          return doc
        }

        const result = await sendContactNotification(req.payload, tenantID, {
          email: doc.email,
          message: doc.message,
          name: doc.name,
          phone: doc.phone,
          subject: doc.subject,
          type: doc.type,
        })

        if (result.ok) {
          req.payload.logger.info(`Contact notification sent for submission ${doc.id} (tenant ${tenantID}).`)
        } else {
          req.payload.logger.warn(`Contact notification not sent for submission ${doc.id} (tenant ${tenantID}): ${result.reason}.`)
        }

        return doc
      }
    ]
  }
}
