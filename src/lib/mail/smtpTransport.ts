import nodemailer from 'nodemailer'
import type { Payload } from 'payload'
import { decryptSecret } from './smtpCrypto'
import type { TenantMailContext } from './tenantMailContext'

export type TenantSmtpConfig = {
  fromAddress: string
  fromName: string
  host: string
  port: number
  replyTo?: string
  secure: boolean
  username: string
}

type ResolvedTenantSmtp =
  | { config: TenantSmtpConfig; ok: true; password: string }
  | { ok: false; reason: string }

/** Never falls back to another tenant's config — only ever reads the smtp.* group already resolved for this one tenant. */
const resolveTenantSmtpConfig = (mailContext: TenantMailContext): ResolvedTenantSmtp => {
  const smtp = mailContext.emailSettings?.smtp

  if (!smtp || smtp.enabled !== true) {
    return { ok: false, reason: 'smtp_disabled' }
  }
  if (!smtp.host || !smtp.port || !smtp.username || !smtp.fromAddress) {
    return { ok: false, reason: 'smtp_incomplete' }
  }
  if (!smtp.passwordEncrypted) {
    return { ok: false, reason: 'smtp_password_missing' }
  }

  let password: string
  try {
    password = decryptSecret(smtp.passwordEncrypted)
  } catch {
    return { ok: false, reason: 'smtp_password_decrypt_failed' }
  }

  return {
    config: {
      fromAddress: smtp.fromAddress,
      fromName: smtp.fromName || mailContext.senderDisplayName,
      host: smtp.host,
      port: smtp.port,
      replyTo: smtp.replyTo || undefined,
      secure: smtp.secure === true,
      username: smtp.username,
    },
    ok: true,
    password,
  }
}

export type SendTenantEmailInput = {
  html: string
  subject: string
  text: string
  to: string
}

export type SendTenantEmailResult = { ok: true } | { ok: false; reason: string }

/**
 * The one shared send path for every tenant. Resolves and creates a transport fresh on every
 * call (no caching — correctness and isolation over optimization, per design). Never shares one
 * tenant's credentials with another; if this tenant's SMTP isn't enabled/complete/decryptable,
 * delivery is skipped and logged — it never substitutes a different tenant's account.
 */
export const sendTenantEmail = async (
  payload: Payload,
  mailContext: TenantMailContext,
  message: SendTenantEmailInput,
): Promise<SendTenantEmailResult> => {
  const emailSettingsID = mailContext.emailSettings?.id
  const resolved = resolveTenantSmtpConfig(mailContext)

  if (!resolved.ok) {
    payload.logger.warn(
      `Email skipped (EmailSettings ${emailSettingsID ?? 'none'}): ${resolved.reason}.`,
    )
    return { ok: false, reason: resolved.reason }
  }

  const { config, password } = resolved

  try {
    const options: any = {
      auth: { pass: password, user: config.username },
      host: config.host,
      port: config.port,
      secure: config.secure,
      // Workaround for Railway IPv6 ENETUNREACH issues when resolving smtp.gmail.com
      family: 4,
    }
    const transport = nodemailer.createTransport(options)

    await transport.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      html: message.html,
      replyTo: config.replyTo,
      subject: message.subject,
      text: message.text,
      to: message.to,
    })

    payload.logger.info(`Email delivered (EmailSettings ${emailSettingsID}, host ${config.host}).`)
    return { ok: true }
  } catch (error) {
    payload.logger.error({
      err: error instanceof Error ? error.message : 'Unknown SMTP error',
      msg: `SMTP send failed (EmailSettings ${emailSettingsID}, host ${config.host}).`,
    })
    return { ok: false, reason: 'smtp_send_failed' }
  }
}
