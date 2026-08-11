import type { IncomingAuthType, PayloadRequest } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { resolvePublicTenantID } from '../../access/tenantContext'
import { resolveTenantMailContext, type TenantMailContext } from './tenantMailContext'
import { buildTransactionalEmailHtml } from './emailLayout'
import { renderHtmlFromPlainText, renderPlainText, type TemplateVariables } from './renderTemplate'
import { sendTenantEmail } from './smtpTransport'

type ForgotPasswordAuthConfig = NonNullable<IncomingAuthType['forgotPassword']>
type GenerateEmailHTML = NonNullable<ForgotPasswordAuthConfig['generateEmailHTML']>
type GenerateEmailSubject = NonNullable<ForgotPasswordAuthConfig['generateEmailSubject']>

const FALLBACK_SUBJECT = 'Reset your password'
const FALLBACK_HEADING = 'Reset your password'
const FALLBACK_BODY =
  'We received a request to reset your password. Use the button below to choose a new one. If you did not request this, you can safely ignore this email.'
const FALLBACK_BUTTON_LABEL = 'Reset Password'
const FALLBACK_SENDER_NAME = 'Account Security'

// Reused within one request so generateEmailHTML and generateEmailSubject (both called
// by Payload's official forgotPassword operation) resolve tenant + EmailSettings once.
const FORGOT_PASSWORD_CONTENT_CACHE_KEY = 'forgotPasswordEmailContent'

const buildResetUrl = (req: PayloadRequest, token: string): string =>
  formatAdminURL({
    adminRoute: req.payload.config.routes.admin,
    path: `${req.payload.config.admin.routes.reset}/${token}`,
    serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  })

const resolveForgotPasswordEmailContent = async (
  req: PayloadRequest,
  token: string,
  user: { email?: unknown; name?: unknown } | undefined,
): Promise<{ html: string; subject: string }> => {
  const cached = req.context?.[FORGOT_PASSWORD_CONTENT_CACHE_KEY]
  if (cached && typeof cached === 'object') {
    return cached as { html: string; subject: string }
  }

  // Forgot-password requests are unauthenticated by nature — tenant is resolved from the
  // trusted request hostname (resolvePublicTenantID), never from any client-submitted value.
  const tenantID = await resolvePublicTenantID(req)
  const resetUrl = buildResetUrl(req, token)

  let mailContext: TenantMailContext | null = null
  if (tenantID) {
    mailContext = await resolveTenantMailContext(req.payload, tenantID)
  }

  const template = mailContext?.emailSettings?.forgotPasswordEmail
  const useTemplate = Boolean(template) && template?.enabled !== false

  // Deliberately excludes {{password}} — Forgot Password must never be able to render a
  // current password, so the variable is structurally absent, not just unused.
  const currentYear = String(new Date().getFullYear())
  const variables: TemplateVariables = {
    current_year: currentYear,
    // Kept as an alias only — {{current_year}} is the documented/seeded placeholder; this
    // just protects against a template that was hand-typed with the older {{year}} name.
    year: currentYear,
    reset_url: resetUrl,
    site_name: mailContext?.siteName || 'your account',
    support_email: mailContext?.supportEmail || '',
    user_email: typeof user?.email === 'string' ? user.email : '',
    user_name: typeof user?.name === 'string' ? user.name : '',
  }

  const rawSubject = useTemplate && typeof template?.subject === 'string' && template.subject ? template.subject : FALLBACK_SUBJECT
  const rawHeading = useTemplate && typeof template?.heading === 'string' && template.heading ? template.heading : FALLBACK_HEADING
  const rawBody = useTemplate && typeof template?.body === 'string' && template.body ? template.body : FALLBACK_BODY
  const buttonLabel =
    useTemplate && typeof template?.buttonLabel === 'string' && template.buttonLabel
      ? template.buttonLabel
      : FALLBACK_BUTTON_LABEL

  // Footer text is CMS content too — it must go through the same placeholder substitution as
  // subject/heading/body, or {{current_year}} (and any other placeholder) renders literally.
  const rawFooterText = mailContext?.emailSettings?.footer?.footerText
  const footerText = rawFooterText ? renderPlainText(rawFooterText, variables) : undefined

  const subject = renderPlainText(rawSubject, variables)
  const html = buildTransactionalEmailHtml({
    bodyHtml: renderHtmlFromPlainText(rawBody, variables),
    buttonLabel,
    buttonUrl: resetUrl,
    footerText,
    headingText: renderPlainText(rawHeading, variables),
    logoUrl: mailContext?.logoUrl ?? undefined,
    senderDisplayName: mailContext?.senderDisplayName || FALLBACK_SENDER_NAME,
    supportEmail: mailContext?.supportEmail || undefined,
  })
  const text = renderPlainText(rawBody, variables)

  const content = { html, subject }
  if (req.context) req.context[FORGOT_PASSWORD_CONTENT_CACHE_KEY] = content

  // The real, tenant-SMTP send happens HERE, as a side effect of building the content — see
  // the architecture note in the M2.6 checkpoint: Payload's official forgotPassword operation
  // always performs its own internal `email.sendEmail(...)` call right after this hook returns,
  // using whatever single global adapter is configured. No `email` adapter is registered in
  // payload.config.ts, so that internal call lands on Payload's harmless built-in console
  // adapter (a log line only, no external delivery) — this is the one and only real send.
  if (tenantID && mailContext && variables.user_email) {
    try {
      const result = await sendTenantEmail(req.payload, mailContext, {
        html,
        subject,
        text,
        to: variables.user_email,
      })
      if (result.ok) {
        req.payload.logger.info(`Forgot Password email delivered (tenant ${tenantID}).`)
      } else {
        req.payload.logger.warn(`Forgot Password email not delivered (tenant ${tenantID}): ${result.reason}.`)
      }
    } catch (error) {
      req.payload.logger.error({
        err: error instanceof Error ? error.message : 'Unknown mail error',
        msg: `Forgot Password email delivery failed (tenant ${tenantID}).`,
      })
    }
  } else if (!tenantID) {
    req.payload.logger.warn('Forgot Password email skipped: could not resolve a tenant from the request.')
  }

  return content
}

export const generateForgotPasswordEmailHTML: GenerateEmailHTML = async (args) => {
  if (!args?.req || !args.token) return FALLBACK_BODY
  const { html } = await resolveForgotPasswordEmailContent(args.req, args.token, args.user)
  return html
}

export const generateForgotPasswordEmailSubject: GenerateEmailSubject = async (args) => {
  if (!args?.req || !args.token) return FALLBACK_SUBJECT
  const { subject } = await resolveForgotPasswordEmailContent(args.req, args.token, args.user)
  return subject
}
