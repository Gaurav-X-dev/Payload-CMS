import type { Payload } from 'payload'
import type { TenantID } from '../../access/tenantContext'
import { buildTransactionalEmailHtml } from './emailLayout'
import { escapeHtml } from './renderTemplate'
import { sendTenantEmail } from './smtpTransport'
import { resolveTenantMailContext } from './tenantMailContext'

type ContactSubmissionDoc = {
  email: string
  message: string
  name: string
  phone?: null | string
  subject?: null | string
  type: string
}

/**
 * Routes every contact-form submission to the tenant's own configured SMTP (EmailSettings) — the
 * same shared mailer used for welcome/forgot-password emails, no separate third-party provider.
 * The recipient is EmailSettings.smtp.contactNotificationEmail specifically: a dedicated field
 * that lives alongside the SMTP config itself (distinct from Tenant.contact.contactEmail, which is
 * the public-facing address shown on the site).
 */
export async function sendContactNotification(
  payload: Payload,
  tenantID: TenantID,
  submission: ContactSubmissionDoc,
): Promise<{ ok: boolean; reason?: string }> {
  try {
    const mailContext = await resolveTenantMailContext(payload, tenantID)
    const notifyEmail = mailContext.emailSettings?.smtp?.contactNotificationEmail

    if (!notifyEmail) {
      payload.logger.info(
        `Contact notification skipped for tenant ${tenantID}: no Contact Form Notification Email configured in EmailSettings.`,
      )
      return { ok: false, reason: 'no_recipient' }
    }

    const rows = [
      ['Name', submission.name],
      ['Email', submission.email],
      submission.phone ? ['Phone', submission.phone] : null,
      ['Type', submission.type],
      submission.subject ? ['Subject', submission.subject] : null,
    ].filter((row): row is [string, string] => row !== null)

    const bodyHtml = [
      ...rows.map(([label, value]) => `<strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}`),
      `<strong>Message:</strong><br />${escapeHtml(submission.message).replace(/\r\n|\r|\n/g, '<br />')}`,
    ].join('<br /><br />')

    const html = buildTransactionalEmailHtml({
      bodyHtml,
      headingText: 'New Contact Form Submission',
      logoUrl: mailContext.logoUrl ?? undefined,
      senderDisplayName: mailContext.senderDisplayName || 'Your site',
    })

    const text = [
      ...rows.map(([label, value]) => `${label}: ${value}`),
      `Message:\n${submission.message}`,
    ].join('\n\n')

    const result = await sendTenantEmail(payload, mailContext, {
      html,
      subject: `New ${submission.type} enquiry from ${submission.name}`,
      text,
      to: notifyEmail,
    })

    if (!result.ok) {
      payload.logger.warn(`Contact notification failed for tenant ${tenantID}: ${result.reason}.`)
      return { ok: false, reason: result.reason }
    }

    return { ok: true }
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Contact notification failed for tenant ${tenantID}.`,
    })
    return { ok: false, reason: 'exception' }
  }
}
