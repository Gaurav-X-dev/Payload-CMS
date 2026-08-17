import { promises as dns } from 'node:dns'
import { isIP } from 'node:net'

/**
 * Forces SMTP connections onto IPv4 by resolving the host ourselves.
 *
 * Why this is necessary (confirmed from Railway production logs:
 * `connect ENETUNREACH 2a00:1450:4025:401::6c:587`):
 *
 * Railway containers have an IPv6 interface (its private network is IPv6-only) but no route to
 * the public IPv6 internet. Nodemailer's own resolver treats that interface as proof that IPv6
 * "is supported" (`isFamilySupported` in nodemailer/lib/shared/index.js), resolves BOTH A and
 * AAAA records, concatenates them, and then picks ONE address **at random**
 * (`formatDNSValue`). Roughly half of all sends therefore began on an unroutable IPv6 address.
 *
 * The previously-applied `family: 4` transport option does not prevent this. By the time
 * nodemailer reaches `net.connect` it has already replaced the hostname with a resolved IP
 * literal, and Node ignores `family` when the host is not a hostname — so the option was inert.
 *
 * Resolving to an A record here and handing nodemailer an IPv4 literal is the only reliable fix.
 * The original hostname is returned alongside it as `servername` so TLS/SNI and certificate
 * verification still happen against the real hostname — see buildSmtpTransportOptions.
 */

/** Injectable for tests — the real implementation performs a DNS query. */
export type SmtpAddressLookup = (hostname: string) => Promise<string[]>

export const DEFAULT_SMTP_DNS_TIMEOUT_MS = 5_000

/**
 * `dns.lookup` (getaddrinfo) rather than `dns.resolve4` (c-ares) on purpose: it honours
 * /etc/hosts, container DNS and search domains, so a self-hosted relay addressed by a service
 * name keeps working. `family: 4` is meaningful here because this IS a hostname resolution.
 */
const defaultLookup: SmtpAddressLookup = async (hostname) => {
  const records = await dns.lookup(hostname, { all: true, family: 4 })
  return records.map((record) => record.address)
}

export type SmtpHostResolution =
  | { address: string; ok: true; servername?: string }
  | { ok: false; reason: string }

const withTimeout = async <T>(work: Promise<T>, timeoutMs: number): Promise<T> => {
  let timer: NodeJS.Timeout | undefined
  try {
    return await Promise.race([
      work,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('DNS lookup timed out.')), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * Resolves an SMTP host to a connectable IPv4 literal.
 *
 * An address the operator configured literally is honoured as-is (both families) — forcing IPv4
 * is about which record we pick out of DNS, not about overriding an explicit address. Only a
 * hostname is resolved, and only ever to an A record.
 *
 * Failure is fast and reason-coded rather than thrown: a mail send must never become a
 * long-running or crashing operation, and the caller logs the reason without any credential.
 */
export const resolveSmtpHostIPv4 = async (
  host: string,
  {
    lookup = defaultLookup,
    timeoutMs = DEFAULT_SMTP_DNS_TIMEOUT_MS,
  }: { lookup?: SmtpAddressLookup; timeoutMs?: number } = {},
): Promise<SmtpHostResolution> => {
  const hostname = typeof host === 'string' ? host.trim() : ''
  if (!hostname) return { ok: false, reason: 'smtp_host_missing' }

  // Already an IP literal — the operator addressed the relay explicitly. Connect to exactly
  // that, and do not invent a servername (there is no hostname to verify a certificate against).
  if (isIP(hostname) !== 0) return { address: hostname, ok: true }

  let addresses: string[]
  try {
    addresses = await withTimeout(lookup(hostname), timeoutMs)
  } catch {
    // Deliberately does not surface the DNS error object: the reason code is enough to act on,
    // and this keeps the hostname the only host-derived value that ever reaches a log line.
    return { ok: false, reason: 'smtp_dns_ipv4_lookup_failed' }
  }

  const address = addresses.find((candidate) => isIP(candidate) === 4)
  if (!address) return { ok: false, reason: 'smtp_dns_no_ipv4_address' }

  return { address, ok: true, servername: hostname }
}
