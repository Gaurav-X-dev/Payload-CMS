import { localSiteRegistry } from '../site/resolveLocalSite'

/**
 * Builds the Payload CORS/CSRF allowlist.
 *
 * Production logs showed every request warning:
 *   `Request origin "https://payload-cms-production-6ff4.up.railway.app" is not in the
 *    CORS/CSRF allowlist.`
 *
 * The cause was simply that nothing was configured: Payload defaults `cors: []`, `csrf: []` and
 * `serverURL: ''` (payload/dist/config/defaults.js), so `getRequestOrigin` had an empty allowlist
 * to test the Host header against, failed the check, and fell back to an empty request origin.
 *
 * Populating this list is the whole fix — `getRequestOrigin` returns the Host-derived origin as
 * soon as it appears here. See payload.config.ts for why `serverURL` is intentionally left unset.
 *
 * The allowlist is assembled from three sources, and never contains `*`:
 *   1. `localSiteRegistry` — already the single source of truth for which hostnames this
 *      deployment serves, so the Railway production domains and any custom tenant domain added
 *      there are trusted automatically instead of drifting out of sync with a second list.
 *   2. `NEXT_PUBLIC_SERVER_URL` — the canonical public origin.
 *   3. `PAYLOAD_TRUSTED_ORIGINS` — an optional, operator-controlled comma-separated list, for
 *      origins that legitimately reach the API without serving a themed site (a separate admin
 *      domain, a staging alias) and so do not belong in the site registry.
 */

/** Hostnames that only ever exist on a developer machine. */
const isLocalHostname = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '::1' ||
  hostname.endsWith('.local') ||
  hostname.endsWith('.localhost')

/**
 * Normalizes to a canonical `scheme://host[:port]` origin, or null if the value is not a usable
 * http(s) origin. `URL.origin` does the hard parts for us: it lowercases the host, drops any
 * path, query, fragment and trailing slash, and omits the port when it is the scheme default —
 * so `https://Example.com:443/admin/` and `https://example.com` normalize to the same string.
 *
 * A scheme is REQUIRED. Guessing one is how an allowlist silently ends up trusting `http://` when
 * the operator meant `https://` (and `new URL('localhost:3000')` parses `localhost:` as the
 * protocol, which is worse). An entry without a scheme is rejected rather than repaired.
 */
export const normalizeOrigin = (value: null | string | undefined): null | string => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw || raw === '*') return null
  if (!/^https?:\/\//i.test(raw)) return null

  try {
    const url = new URL(raw)
    return url.hostname ? url.origin : null
  } catch {
    return null
  }
}

/** Splits `PAYLOAD_TRUSTED_ORIGINS` (comma-separated) into normalized origins. */
export const parseTrustedOriginList = (value: null | string | undefined): string[] =>
  (typeof value === 'string' ? value.split(',') : [])
    .map((entry) => normalizeOrigin(entry))
    .filter((origin): origin is string => origin !== null)

export type TrustedOriginOptions = {
  extraOrigins?: null | string
  /** Defaults to `NODE_ENV !== 'production'`. */
  includeDevelopmentOrigins?: boolean
  serverURL?: null | string
}

/** The port `next dev` uses, and therefore the port development origins carry. */
const DEVELOPMENT_PORT = 3000

/**
 * Registry hostnames become origins: real domains as `https://`, developer aliases as
 * `http://<host>:3000` and only when development origins are requested. `::1` is skipped — a bare
 * IPv6 literal is not a valid URL host (it would need brackets) and `localhost` already covers it.
 */
const registryOrigins = (includeDevelopmentOrigins: boolean): string[] => {
  const origins: string[] = []

  for (const hostname of Object.keys(localSiteRegistry)) {
    if (isLocalHostname(hostname)) {
      if (!includeDevelopmentOrigins || hostname === '::1') continue
      const devOrigin = normalizeOrigin(`http://${hostname}:${DEVELOPMENT_PORT}`)
      if (devOrigin) origins.push(devOrigin)
      continue
    }

    const productionOrigin = normalizeOrigin(`https://${hostname}`)
    if (productionOrigin) origins.push(productionOrigin)
  }

  return origins
}

/**
 * Returns the deduplicated, sorted allowlist. Sorted purely so the value is stable and
 * diff-friendly across restarts; order carries no meaning to Payload.
 */
export const buildTrustedOrigins = ({
  extraOrigins = process.env.PAYLOAD_TRUSTED_ORIGINS,
  includeDevelopmentOrigins = process.env.NODE_ENV !== 'production',
  serverURL = process.env.NEXT_PUBLIC_SERVER_URL,
}: TrustedOriginOptions = {}): string[] => {
  const origins = new Set<string>(registryOrigins(includeDevelopmentOrigins))

  const canonical = normalizeOrigin(serverURL)
  if (canonical) origins.add(canonical)

  for (const origin of parseTrustedOriginList(extraOrigins)) {
    origins.add(origin)
  }

  return [...origins].sort()
}
