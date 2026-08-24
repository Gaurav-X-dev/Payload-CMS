import type { Payload } from 'payload'
import type { TenantID } from '../../access/tenantContext'
import { buildTransactionalEmailHtml } from './emailLayout'
import { escapeHtml } from './renderTemplate'
import { sendTenantEmail } from './smtpTransport'
import { resolveTenantMailContext } from './tenantMailContext'

/**
 * Sends the subscriber-facing "Welcome to the community" email after a newsletter signup, via
 * the tenant's own configured SMTP (EmailSettings) — the same shared mailer used for contact
 * notifications and welcome/forgot-password emails.
 */
export async function sendNewsletterWelcomeEmail(
  payload: Payload,
  tenantID: TenantID,
  subscriberEmail: string,
): Promise<{ ok: boolean; reason?: string }> {
  try {
    const mailContext = await resolveTenantMailContext(payload, tenantID)
    const siteName = mailContext.senderDisplayName || 'our community'

    const bodyHtml = [
      `<p>Thank you for subscribing! You're now part of the ${escapeHtml(siteName)} community.</p>`,
      `<p>We'll keep you posted with our latest updates, offers, and news.</p>`,
    ].join('')

    const html = buildTransactionalEmailHtml({
      bodyHtml,
      buttonLabel: mailContext.siteUrl ? 'Visit Our Website' : undefined,
      buttonUrl: mailContext.siteUrl ?? undefined,
      headingText: `Welcome to ${mailContext.senderDisplayName || 'the Community'}!`,
      logoUrl: mailContext.logoUrl ?? undefined,
      senderDisplayName: mailContext.senderDisplayName || 'Our team',
    })

    const text = [
      `Thank you for subscribing! You're now part of the ${siteName} community.`,
      `We'll keep you posted with our latest updates, offers, and news.`,
      ...(mailContext.siteUrl ? [`Visit us: ${mailContext.siteUrl}`] : []),
    ].join('\n\n')

    const result = await sendTenantEmail(payload, mailContext, {
      html,
      subject: `Welcome to ${siteName}!`,
      text,
      to: subscriberEmail,
    })

    if (!result.ok) {
      payload.logger.warn(`Newsletter welcome email failed for tenant ${tenantID}: ${result.reason}.`)
      return { ok: false, reason: result.reason }
    }

    return { ok: true }
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Newsletter welcome email failed for tenant ${tenantID}.`,
    })
    return { ok: false, reason: 'exception' }
  }
}
