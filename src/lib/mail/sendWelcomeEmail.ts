import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'
import { getUserTenantIDs } from '../../access/tenantContext'
import { resolveTenantMailContext } from './tenantMailContext'
import { renderHtmlFromPlainText, renderPlainText, type TemplateVariables } from './renderTemplate'
import { buildTransactionalEmailHtml } from './emailLayout'
import { sendTenantEmail } from './smtpTransport'

const WELCOME_EMAIL_PASSWORD_CONTEXT_KEY = 'welcomeEmailPlaintextPassword'

/**
 * Captures the plaintext password entered on the ORIGINAL create request, one hook step
 * before Payload's own local auth strategy hashes it and deletes it from the document.
 * Stored only in this request's `req.context` — never written back into `data`, never
 * logged, never persisted. Skipped entirely for seed/bootstrap operations so automated
 * imports never trigger a credential email.
 */
export const captureWelcomeEmailPassword: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (
    operation !== 'create' ||
    req.context?.developmentSeed === true ||
    req.context?.developmentReset === true
  ) {
    return data
  }

  const password = typeof data?.password === 'string' ? data.password : undefined
  if (password) {
    req.context[WELCOME_EMAIL_PASSWORD_CONTEXT_KEY] = password
  }

  return data
}

/**
 * Sends the Welcome Email after a genuinely new user is created — never on update, role
 * change, tenant change, or a later password change, since this hook only fires on
 * `operation === 'create'` and only finds a password when captureWelcomeEmailPassword
 * actually stored one for THIS request.
 */
export const sendWelcomeEmailAfterCreate: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const password = req.context?.[WELCOME_EMAIL_PASSWORD_CONTEXT_KEY]
  if (req.context) delete req.context[WELCOME_EMAIL_PASSWORD_CONTEXT_KEY]

  if (typeof password !== 'string' || !password) {
    return doc
  }

  const tenantIDs = getUserTenantIDs({ tenants: doc.tenants })

  if (tenantIDs.length === 0) {
    req.payload.logger.info(
      `Welcome email skipped for user ${doc.id}: user has no tenant to resolve EmailSettings from.`,
    )
    return doc
  }
  if (tenantIDs.length > 1) {
    req.payload.logger.warn(
      `Welcome email skipped for user ${doc.id}: user belongs to ${tenantIDs.length} tenants (${tenantIDs.join(', ')}) — no unambiguous EmailSettings to use.`,
    )
    return doc
  }

  const tenantID = tenantIDs[0]

  try {
    const mailContext = await resolveTenantMailContext(req.payload, tenantID)
    const template = mailContext.emailSettings?.welcomeEmail

    if (!template || template.enabled === false) {
      req.payload.logger.info(
        `Welcome email skipped for user ${doc.id}: no enabled Welcome Email template configured for tenant ${tenantID}.`,
      )
      return doc
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/admin`
    const currentYear = String(new Date().getFullYear())
    const variables: TemplateVariables = {
      current_year: currentYear,
      // Kept as an alias only — {{current_year}} is the documented/seeded placeholder; this
      // just protects against a template that was hand-typed with the older {{year}} name.
      year: currentYear,
      login_url: loginUrl,
      password,
      site_name: mailContext.siteName,
      support_email: mailContext.supportEmail,
      user_email: typeof doc.email === 'string' ? doc.email : '',
      user_name: typeof doc.name === 'string' ? doc.name : '',
    }

    const rawSubject = template.subject
    const rawHeading = template.heading
    const rawBody = template.body
    const buttonLabel = template.buttonLabel || undefined

    // Footer text is CMS content too — it must go through the same placeholder substitution as
    // subject/heading/body, or {{current_year}} (and any other placeholder) renders literally.
    const rawFooterText = mailContext.emailSettings?.footer?.footerText
    const footerText = rawFooterText ? renderPlainText(rawFooterText, variables) : undefined

    const subject = renderPlainText(rawSubject, variables)
    const html = buildTransactionalEmailHtml({
      bodyHtml: renderHtmlFromPlainText(rawBody, variables),
      buttonLabel,
      buttonUrl: buttonLabel ? loginUrl : undefined,
      footerText,
      headingText: renderPlainText(rawHeading, variables),
      logoUrl: mailContext.logoUrl ?? undefined,
      senderDisplayName: mailContext.senderDisplayName,
      supportEmail: mailContext.supportEmail || undefined,
    })
    const text = renderPlainText(rawBody, variables)

    if (!variables.user_email) {
      req.payload.logger.warn(`Welcome email skipped for user ${doc.id}: user has no email address.`)
      return doc
    }

    const result = await sendTenantEmail(req.payload, mailContext, {
      html,
      subject,
      text,
      to: variables.user_email,
    })

    if (result.ok) {
      req.payload.logger.info(`Welcome email delivered for user ${doc.id} (tenant ${tenantID}).`)
    } else {
      req.payload.logger.warn(
        `Welcome email not delivered for user ${doc.id} (tenant ${tenantID}): ${result.reason}.`,
      )
    }
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: `Welcome email delivery failed for user ${doc.id} (tenant ${tenantID}).`,
    })
  }

  return doc
}
