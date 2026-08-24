import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { canDeleteTenantContent, canUpdateTenantContent, normalizeTenantID } from '../access/tenantContext'
import { normalizeEmail, validateEmail } from '../validation/shared'
import { sendNewsletterWelcomeEmail } from '../lib/mail/sendNewsletterWelcomeEmail'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'tenantId', 'createdAt'],
  },
  access: {
    read: tenantIsolation,
    create: () => true, // Public newsletter signup forms
    update: canUpdateTenantContent,
    delete: canDeleteTenantContent,
  },
  fields: [
    tenantField(),
    {
      name: 'email',
      type: 'email',
      required: true,
      validate: async (value: unknown, { id, operation, req, siblingData }) => {
        const emailValidation = validateEmail(value)
        if (emailValidation !== true) return emailValidation

        const tenantID = normalizeTenantID((siblingData as Record<string, unknown> | undefined)?.tenantId)
        if (!tenantID) return true // assignTenant's own error takes precedence over this check

        const existing = await req.payload.find({
          collection: 'newsletter-subscribers',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          pagination: false,
          where: {
            and: [
              { email: { equals: normalizeEmail(value) } },
              { tenantId: { equals: tenantID } },
              ...(operation === 'update' && id ? [{ id: { not_equals: id } }] : []),
            ],
          },
        })
        if (existing.docs.length) return 'This email is already subscribed.'
        return true
      },
      hooks: { beforeValidate: [({ value }) => normalizeEmail(value)] },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        const tenantID = normalizeTenantID(doc.tenantId)
        if (!tenantID) {
          req.payload.logger.warn(`Newsletter welcome email skipped for subscriber ${doc.id}: no tenant on the document.`)
          return doc
        }

        const result = await sendNewsletterWelcomeEmail(req.payload, tenantID, doc.email)

        if (result.ok) {
          req.payload.logger.info(`Newsletter welcome email sent for subscriber ${doc.id} (tenant ${tenantID}).`)
        } else {
          req.payload.logger.warn(`Newsletter welcome email not sent for subscriber ${doc.id} (tenant ${tenantID}): ${result.reason}.`)
        }

        return doc
      },
    ],
  },
}
