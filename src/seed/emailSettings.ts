import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'

export type EmailSettingsSeedResult = {
  tenants: Record<string, 'created' | 'updated'>
}

const findFirst = async <TSlug extends Parameters<Payload['find']>[0]['collection']>(
  payload: Payload,
  collection: TSlug,
  where: NonNullable<Parameters<Payload['find']>[0]['where']>,
) => {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where,
  })
  return result.docs[0]
}

type TenantEmailCopy = {
  businessName: string
  slug: string
}

const TENANT_COPY: TenantEmailCopy[] = [
  { businessName: 'Ghee Roast', slug: 'ghee-roast' },
  { businessName: 'Curious Ladoo', slug: 'curious-ladoo' },
  { businessName: 'Zuru Zuru', slug: 'zuru-zuru' },
]

/**
 * Default CMS-managed copy for a brand-new tenant. Every field written here remains fully
 * editable afterward in Payload Admin (EmailSettings) — this seed exists only so each tenant
 * starts with valid, complete content instead of an empty required field. `{{site_name}}`,
 * `{{support_email}}`, etc. are real placeholders resolved at send time, not pre-filled, so the
 * copy stays correct even if a tenant's business name or contact email changes later.
 */
const buildEmailSettingsData = ({ businessName }: TenantEmailCopy) => ({
  // SMTP starts disabled and unconfigured for every tenant — no fake credentials, no fake
  // encrypted passwords, no real Hostinger credentials, ever seeded. An admin must explicitly
  // enable and configure it per tenant through Payload Admin before any real email can send.
  smtp: {
    enabled: false,
  },
  welcomeEmail: {
    body:
      'Your account for {{site_name}} has been created.\n\n' +
      'Email: {{user_email}}\n' +
      'Password: {{password}}\n\n' +
      'Please log in and change your password after your first sign-in.\n\n' +
      'Questions? Contact us at {{support_email}}.',
    buttonLabel: 'Log In',
    enabled: true,
    heading: 'Welcome to {{site_name}}, {{user_name}}!',
    subject: 'Welcome to {{site_name}}',
  },
  forgotPasswordEmail: {
    body:
      'We received a request to reset the password for {{user_email}} on {{site_name}}.\n\n' +
      'Use the button below to choose a new password. If you did not request this, you can ' +
      'safely ignore this email.\n\n' +
      'Questions? Contact us at {{support_email}}.',
    buttonLabel: 'Reset Password',
    enabled: true,
    heading: 'Reset your password',
    subject: 'Reset your {{site_name}} password',
  },
  footer: {
    footerText: `© {{current_year}} ${businessName}. All rights reserved.`,
  },
})

export async function seedEmailSettingsContent(payload: Payload): Promise<EmailSettingsSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the EmailSettings seed as.')
  }
  const user = superAdmin as User

  const tenants: EmailSettingsSeedResult['tenants'] = {}

  for (const tenantCopy of TENANT_COPY) {
    const tenant = await findFirst(payload, 'tenants', { slug: { equals: tenantCopy.slug } })
    if (!tenant) {
      throw new Error(
        `Tenant "${tenantCopy.slug}" not found. Seed that tenant's core data before running the EmailSettings seed.`,
      )
    }

    const data = buildEmailSettingsData(tenantCopy)
    const existing = await findFirst(payload, 'email-settings', { tenantId: { equals: tenant.id } })

    if (existing) {
      await payload.update({
        id: existing.id,
        collection: 'email-settings',
        data,
        overrideAccess: true,
        user,
      })
      tenants[tenantCopy.slug] = 'updated'
    } else {
      await payload.create({
        collection: 'email-settings',
        data: { ...data, tenantId: tenant.id },
        overrideAccess: true,
        user,
      })
      tenants[tenantCopy.slug] = 'created'
    }
  }

  payload.logger.info('EmailSettings seed completed.')

  return { tenants }
}
