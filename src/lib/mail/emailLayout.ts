import { escapeHtml } from './renderTemplate'

export type TransactionalEmailLayoutInput = {
  bodyHtml: string
  buttonLabel?: string
  buttonUrl?: string
  footerText?: string
  headingText: string
  logoUrl?: string
  senderDisplayName: string
  supportEmail?: string
}

/**
 * Single, theme-agnostic, email-safe HTML shell shared by every tenant and every mail
 * type. Tenants only ever supply text content (heading/body/button label) through
 * EmailSettings — this file owns layout, spacing, and escaping so no per-tenant or
 * per-theme React email system is needed.
 */
export const buildTransactionalEmailHtml = ({
  bodyHtml,
  buttonLabel,
  buttonUrl,
  footerText,
  headingText,
  logoUrl,
  senderDisplayName,
  supportEmail,
}: TransactionalEmailLayoutInput): string => {
  const safeHeading = escapeHtml(headingText)
  const safeSender = escapeHtml(senderDisplayName)
  const safeFooterText = footerText ? escapeHtml(footerText) : ''
  const safeSupportEmail = supportEmail ? escapeHtml(supportEmail) : ''

  // Explicit height attribute (not just CSS) reserves layout space and is respected by
  // Outlook's Word-based rendering engine, which often ignores max-height/width styles.
  const logoBlock = logoUrl
    ? `<tr><td style="padding:0 0 24px 0;text-align:center;">
         <img src="${escapeHtml(logoUrl)}" alt="${safeSender}" height="48"
              style="display:inline-block;height:48px;max-width:220px;width:auto;" />
       </td></tr>`
    : ''

  const buttonBlock = buttonLabel && buttonUrl
    ? `<tr><td style="padding:28px 0 4px 0;text-align:center;">
         <a href="${escapeHtml(buttonUrl)}"
            style="display:inline-block;background-color:#111827;color:#ffffff;text-decoration:none;
                   font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;
                   padding:12px 28px;border-radius:6px;">
           ${escapeHtml(buttonLabel)}
         </a>
       </td></tr>`
    : ''

  const footerLines = [safeFooterText, safeSupportEmail ? `Support: ${safeSupportEmail}` : '']
    .filter(Boolean)
    .join('<br />')

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:480px;background-color:#ffffff;border-radius:8px;padding:32px;">
            ${logoBlock}
            <tr>
              <td style="font-size:20px;line-height:1.3;font-weight:700;color:#111827;padding-bottom:16px;">
                ${safeHeading}
              </td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#374151;">
                ${bodyHtml}
              </td>
            </tr>
            ${buttonBlock}
          </table>
          ${footerLines
            ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
                 <tr><td style="padding:20px 8px;text-align:center;font-size:12px;line-height:1.5;color:#9ca3af;">
                   ${footerLines}
                 </td></tr>
               </table>`
            : ''}
        </td>
      </tr>
    </table>
  </body>
</html>`
}
