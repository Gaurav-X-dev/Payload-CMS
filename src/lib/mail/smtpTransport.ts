import nodemailer from 'nodemailer'
import type { Payload } from 'payload'
import { decryptSecret } from './smtpCrypto'
import { resolveSmtpHostIPv4 } from './smtpDns'
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

/**
 * Every caller of sendTenantEmail is awaited inside a Payload hook, and Payload awaits its
 * afterChange hooks *before* committing the request's database transaction
 * (payload/dist/collections/operations/create.js). A send that stalls therefore stalls the whole
 * HTTP request AND holds a Postgres pool connection open for the duration.
 *
 * Nodemailer's own defaults are far too long for a request-blocking path: 2 minutes to establish
 * a connection, 30 seconds for the SMTP greeting, and 10 minutes of socket inactivity. On a host
 * that silently drops outbound SMTP (a blocked egress port, an unreachable relay) that is a
 * multi-minute hang on an operation the user already sees as finished. These bounds cap the
 * worst case at a few seconds and surface a real ETIMEDOUT in the logs instead.
 */
const SMTP_CONNECTION_TIMEOUT_MS = 10_000
const SMTP_GREETING_TIMEOUT_MS = 10_000
const SMTP_SOCKET_TIMEOUT_MS = 20_000

export type SmtpTransportOptions = {
  auth: { pass: string; user: string }
  connectionTimeout: number
  greetingTimeout: number
  host: string
  port: number
  secure: boolean
  servername?: string
  socketTimeout: number
  tls?: { servername: string }
}

/**
 * Exported so both the timeout contract above and the IPv4/SNI contract below are assertable
 * without opening a real socket.
 *
 * `host` is an IPv4 literal already resolved by resolveSmtpHostIPv4 — that, not the previous
 * (inert) `family: 4` option, is what actually keeps the connection off IPv6. `family` is
 * deliberately NOT set here: nodemailer would hand an IP literal to `net.connect`, where Node
 * ignores it, so it only ever created the false impression that IPv6 had been ruled out.
 *
 * Because the host is now an IP, `servername` must carry the original hostname or TLS would have
 * nothing to verify against. Nodemailer honours it on both TLS paths:
 *   - implicit TLS (`secure: true`, e.g. port 465) — smtp-connection sets `opts.servername` from
 *     `this.servername` before `tls.connect`;
 *   - STARTTLS (`secure: false`, e.g. port 587) — `_upgradeConnection` does the same on upgrade.
 * `tls.servername` is set alongside it so the intent survives either path. Node verifies the
 * certificate against `servername` when present, and `rejectUnauthorized` is left at its secure
 * default — nothing here weakens certificate validation.
 */
export const buildSmtpTransportOptions = (
  config: TenantSmtpConfig,
  password: string,
  connection: { address: string; servername?: string },
): SmtpTransportOptions => ({
  auth: { pass: password, user: config.username },
  connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
  greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
  host: connection.address,
  port: config.port,
  secure: config.secure,
  socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
  ...(connection.servername
    ? { servername: connection.servername, tls: { servername: connection.servername } }
    : {}),
})

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

  // Resolve to IPv4 BEFORE building the transport. On failure nothing is dialled at all, so an
  // undeliverable host costs one bounded DNS lookup instead of a connection timeout.
  const connection = await resolveSmtpHostIPv4(config.host)
  if (!connection.ok) {
    payload.logger.error(
      `SMTP send skipped (EmailSettings ${emailSettingsID}, host ${config.host}): ${connection.reason}.`,
    )
    return { ok: false, reason: connection.reason }
  }

  const transport = nodemailer.createTransport(
    buildSmtpTransportOptions(config, password, connection),
  )

  try {
    await transport.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      html: message.html,
      replyTo: config.replyTo,
      subject: message.subject,
      text: message.text,
      to: message.to,
    })

    // The resolved address is logged deliberately: it is the one piece of evidence that proves
    // the connection went out over IPv4, and an SMTP server's public IP is not a secret.
    payload.logger.info(
      `Email delivered (EmailSettings ${emailSettingsID}, host ${config.host} via ${connection.address}).`,
    )
    return { ok: true }
  } catch (error) {
    payload.logger.error({
      err: error instanceof Error ? error.message : 'Unknown SMTP error',
      msg: `SMTP send failed (EmailSettings ${emailSettingsID}, host ${config.host} via ${connection.address}).`,
    })
    return { ok: false, reason: 'smtp_send_failed' }
  } finally {
    // A transport is created per call (no pooling, by design). Closing it releases any socket
    // left behind by a timed-out or errored attempt instead of letting it idle out on its own.
    transport.close()
  }
}
