import type {
  CollectionConfig,
  EmailFieldValidation,
  NumberFieldValidation,
  TextFieldValidation,
} from 'payload'
import { tenantField } from '../fields/tenantField'
import { canUpdateTenantContent, tenantContentMutations } from '../access/tenantContext'
import { validateEmail, validateFiniteInteger } from '../validation/shared'
import { encryptSecret } from '../lib/mail/smtpCrypto'

const isSmtpEnabled = (siblingData: unknown): boolean =>
  Boolean(siblingData && typeof siblingData === 'object' && (siblingData as Record<string, unknown>).enabled === true)

const validateSmtpHost: TextFieldValidation = (value, { siblingData }) => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) return isSmtpEnabled(siblingData) ? 'SMTP Host is required when SMTP is enabled.' : true
  return normalized.length <= 255 ? true : 'SMTP Host must not exceed 255 characters.'
}

const validateSmtpPort: NumberFieldValidation = (value, { siblingData }) => {
  if (value === undefined || value === null) {
    return isSmtpEnabled(siblingData) ? 'SMTP Port is required when SMTP is enabled.' : true
  }
  return validateFiniteInteger(value as number, { min: 1, max: 65535 })
}

const validateSmtpUsername: TextFieldValidation = (value, { siblingData }) => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) return isSmtpEnabled(siblingData) ? 'SMTP Username is required when SMTP is enabled.' : true
  return true
}

const validateSmtpFromAddress: EmailFieldValidation = (value, { siblingData }) =>
  validateEmail(value, { required: isSmtpEnabled(siblingData) })

const SMTP_PASSWORD_REQUIRED_MESSAGE = 'SMTP Password is required the first time SMTP is enabled.'

/**
 * Field `validate` functions don't receive the original document directly (unlike collection
 * hooks), so — only when a password is actually required and none was freshly typed — this
 * looks the existing encrypted value up by ID with overrideAccess (bypassing
 * passwordEncrypted's own access.read: false, which is scoped to normal API/Admin reads, not
 * this internal server-side check).
 */
const validateSmtpPassword: TextFieldValidation = async (value, { id, req, siblingData }) => {
  const hasNewValue = typeof value === 'string' && value.trim().length > 0
  if (!isSmtpEnabled(siblingData) || hasNewValue) return true

  if (!id) return SMTP_PASSWORD_REQUIRED_MESSAGE

  const existing = await req.payload.findByID({
    id,
    collection: 'email-settings',
    depth: 0,
    overrideAccess: true,
  })
  const hasExisting = typeof existing?.smtp?.passwordEncrypted === 'string' && existing.smtp.passwordEncrypted.length > 0
  return hasExisting ? true : SMTP_PASSWORD_REQUIRED_MESSAGE
}

const validateSmtpFromName: TextFieldValidation = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized.length <= 100 ? true : 'From Name must not exceed 100 characters.'
}

const smtpEnabledCondition = (_data: unknown, siblingData: unknown) => isSmtpEnabled(siblingData)

/**
 * EmailSettings Collection
 *
 * Purpose: Tenant-scoped, admin-editable content AND transport configuration for the shared
 * mailer (Welcome Email + Forgot Password Email), sent via each tenant's own SMTP account
 * (e.g. Hostinger) through a single shared Nodemailer service. One document per tenant.
 *
 * Design Decisions:
 * 1. No cross-tenant fallback: the mailer only ever reads the ONE tenant's own smtp.* config —
 *    there is no code path anywhere that substitutes another tenant's credentials.
 * 2. SMTP password is never stored as readable plaintext. `smtp.password` is a virtual,
 *    admin-input-only field; its beforeChange hook encrypts a new value into
 *    `smtp.passwordEncrypted` (AES-256-GCM, see ../lib/mail/smtpCrypto.ts) and never persists the
 *    plaintext itself. `smtp.passwordEncrypted` is locked out of the API/Admin entirely
 *    (`access.read: () => false`) — even a Super Admin never receives the ciphertext through a
 *    normal read; only server-side mail code (using `overrideAccess: true`) can decrypt it.
 *    `smtp.passwordConfigured` is a safe, non-secret boolean for Admin UI feedback.
 * 3. Not readable by Tenant Members: this collection now holds SMTP secrets, so read access is
 *    tightened to the same Super-Admin/Tenant-Admin-only scope as write access.
 */
export const EmailSettings: CollectionConfig = {
  slug: 'email-settings',
  admin: {
    useAsTitle: 'id',
    description: 'Manage SMTP delivery, Welcome Email, and Forgot Password Email content for this tenant. Limited to one document per tenant.',
  },
  access: {
    read: canUpdateTenantContent,
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ unique: true }), // 1:1 Tenant-Scoped Global

    {
      type: 'tabs',
      tabs: [
        {
          label: 'SMTP',
          fields: [
            {
              name: 'smtp',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false, label: 'SMTP Enabled' },
                {
                  name: 'host',
                  type: 'text',
                  label: 'SMTP Host',
                  validate: validateSmtpHost,
                  admin: { condition: smtpEnabledCondition, placeholder: 'smtp.hostinger.com' },
                },
                {
                  type: 'row',
                  admin: { condition: smtpEnabledCondition },
                  fields: [
                    {
                      name: 'port',
                      type: 'number',
                      label: 'SMTP Port',
                      min: 1,
                      max: 65535,
                      validate: validateSmtpPort,
                      admin: { placeholder: '465' },
                    },
                    { name: 'secure', type: 'checkbox', defaultValue: false, label: 'Use SSL/TLS' },
                  ],
                },
                {
                  name: 'username',
                  type: 'text',
                  label: 'SMTP Username',
                  validate: validateSmtpUsername,
                  admin: { condition: smtpEnabledCondition },
                },
                {
                  name: 'password',
                  type: 'text',
                  label: 'SMTP Password',
                  virtual: true,
                  validate: validateSmtpPassword,
                  admin: {
                    condition: smtpEnabledCondition,
                    description: 'Leave blank to keep the existing password. Enter a new value to replace it.',
                    placeholder: '••••••••',
                    // Payload's own field sanitizer force-sets admin.readOnly = true for every
                    // virtual field unless explicitly overridden (payload/dist/fields/config/
                    // sanitize.js) — virtual fields are normally read-only display values. This
                    // field is intentionally virtual (no DB column; see the beforeChange hook
                    // below) but must still accept typed input, so readOnly is explicitly forced
                    // back to false here.
                    readOnly: false,
                  },
                  hooks: {
                    // Payload's own beforeChange field pipeline runs, in order: condition →
                    // field hooks → field validate → transform-for-storage — validate runs
                    // AFTER this hook for the SAME field. Clearing `value` here (e.g. `delete
                    // siblingData.password`) would make the subsequent re-validation pass see an
                    // empty field and reject a legitimately-typed password. That clearing isn't
                    // needed for security anyway: `virtual: true` means Drizzle has no
                    // `smtp_password` column to write to at all, and create/update responses are
                    // built from a fresh `payload.db.create()`/`update()` result (a real DB
                    // round-trip), not from this in-memory value — so a virtual field can never
                    // appear in a response regardless of what's left here after this hook runs.
                    beforeChange: [
                      ({ siblingData, value }) => {
                        if (typeof value === 'string' && value.trim().length > 0) {
                          siblingData.passwordEncrypted = encryptSecret(value.trim())
                        }
                        return value
                      },
                    ],
                  },
                },
                {
                  name: 'passwordEncrypted',
                  type: 'text',
                  admin: { hidden: true },
                  access: {
                    create: () => false,
                    read: () => false,
                    update: () => false,
                  },
                },
                {
                  name: 'passwordConfigured',
                  type: 'checkbox',
                  virtual: true,
                  label: 'Password Configured',
                  admin: { condition: smtpEnabledCondition, readOnly: true },
                  hooks: {
                    afterRead: [
                      ({ siblingData }) =>
                        Boolean(
                          siblingData && typeof siblingData === 'object' &&
                          (siblingData as Record<string, unknown>).passwordEncrypted,
                        ),
                    ],
                  },
                },
                {
                  name: 'fromAddress',
                  type: 'email',
                  label: 'From Address',
                  validate: validateSmtpFromAddress,
                  admin: { condition: smtpEnabledCondition },
                },
                {
                  name: 'fromName',
                  type: 'text',
                  label: 'From Name',
                  validate: validateSmtpFromName,
                  admin: { condition: smtpEnabledCondition },
                },
                {
                  name: 'replyTo',
                  type: 'email',
                  label: 'Reply-To',
                  validate: ((value) => validateEmail(value, { required: false })) as EmailFieldValidation,
                  admin: { condition: smtpEnabledCondition, description: 'Optional — defaults to no reply-to header if left blank.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Welcome Email',
          fields: [
            {
              name: 'welcomeEmail',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                {
                  name: 'subject',
                  type: 'text',
                  required: true,
                  maxLength: 150,
                  admin: { description: 'Supports {{user_name}}, {{user_email}}, {{site_name}}, {{current_year}}.' },
                },
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                  maxLength: 150,
                  admin: { description: 'Supports the same placeholders as the subject.' },
                },
                {
                  name: 'body',
                  type: 'textarea',
                  required: true,
                  maxLength: 5000,
                  admin: {
                    description:
                      'Plain text only (no HTML). Supports {{user_name}}, {{user_email}}, {{password}}, {{site_name}}, {{login_url}}, {{support_email}}, {{current_year}}.',
                  },
                },
                { name: 'buttonLabel', type: 'text', maxLength: 60, defaultValue: 'Log In' },
              ],
            },
          ],
        },
        {
          label: 'Forgot Password Email',
          fields: [
            {
              name: 'forgotPasswordEmail',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                {
                  name: 'subject',
                  type: 'text',
                  required: true,
                  maxLength: 150,
                  admin: { description: 'Supports {{user_name}}, {{user_email}}, {{site_name}}, {{current_year}}.' },
                },
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                  maxLength: 150,
                  admin: { description: 'Supports the same placeholders as the subject.' },
                },
                {
                  name: 'body',
                  type: 'textarea',
                  required: true,
                  maxLength: 5000,
                  admin: {
                    description:
                      'Plain text only (no HTML). Supports {{user_name}}, {{user_email}}, {{site_name}}, {{reset_url}}, {{support_email}}, {{current_year}}. {{password}} is never available here.',
                  },
                },
                { name: 'buttonLabel', type: 'text', maxLength: 60, defaultValue: 'Reset Password' },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footer',
              type: 'group',
              fields: [
                {
                  name: 'supportEmail',
                  type: 'email',
                  admin: { description: 'Defaults to Contact Email (Tenant Settings) if left blank.' },
                },
                { name: 'footerText', type: 'text', maxLength: 300 },
              ],
            },
          ],
        },
      ],
    },
  ],
}
