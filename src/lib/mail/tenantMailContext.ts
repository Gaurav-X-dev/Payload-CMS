import type { Payload } from 'payload'
import type { TenantID } from '../../access/tenantContext'
import type { EmailSetting, Media, SiteSetting, Tenant } from '../../payload-types'

export type TenantMailContext = {
  emailSettings: EmailSetting | null
  logoUrl: string | null
  senderDisplayName: string
  siteName: string
  siteUrl: string | null
  supportEmail: string
  tenantName: string
}

/**
 * Email clients (Gmail, Outlook, ...) fetch images from their own servers, not the recipient's
 * machine — a URL that only resolves on the developer's own machine (localhost and equivalents)
 * can never load there, regardless of how it's built.
 */
const isPubliclyReachableBase = (rawBase: string): boolean => {
  try {
    // WHATWG URL bracket-wraps IPv6 literals in .hostname (e.g. "::1" becomes "[::1]").
    const { hostname } = new URL(rawBase)
    return !(
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost')
    )
  } catch {
    return false
  }
}

const joinUrl = (base: string, path: string): string => `${base}${path.startsWith('/') ? '' : '/'}${path}`

/**
 * Builds an absolute, externally-reachable URL for a (possibly relative) media path, or null
 * if none can be built without inventing one. Priority:
 *   1. Already absolute (e.g. S3/CDN-hosted media) — independently reachable regardless of any
 *      server URL config.
 *   2. PUBLIC_EMAIL_ASSET_BASE_URL — an explicit, operator-configured public base (a CDN, a
 *      dev tunnel, ...) for exactly this situation: NEXT_PUBLIC_SERVER_URL itself isn't public.
 *   3. NEXT_PUBLIC_SERVER_URL, if it's genuinely public (the normal production case).
 */
export const toAbsoluteUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url

  const explicitBase = process.env.PUBLIC_EMAIL_ASSET_BASE_URL || ''
  if (explicitBase && isPubliclyReachableBase(explicitBase)) {
    return joinUrl(explicitBase, url)
  }

  const serverBase = process.env.NEXT_PUBLIC_SERVER_URL || ''
  if (serverBase && isPubliclyReachableBase(serverBase)) {
    return joinUrl(serverBase, url)
  }

  return null
}

/**
 * Local-development fallback for when neither PUBLIC_EMAIL_ASSET_BASE_URL nor
 * NEXT_PUBLIC_SERVER_URL is externally reachable (typical `localhost` dev). Rather than omit
 * the logo, fetch the media file from wherever THIS server can already reach it — a localhost
 * URL is reachable from the server process itself, just not from an external mail client — and
 * inline the bytes as a data: URI. Mainstream email clients (Gmail, Apple Mail, modern Outlook)
 * render data: URIs directly, with no external network request at all, so this shows the real
 * tenant logo without ever needing (or inventing) a public URL. Never used in production: a
 * real deployment always has a genuinely public NEXT_PUBLIC_SERVER_URL, so `toAbsoluteUrl`
 * above already succeeds there and this function is never reached.
 */
const embedAsDataUri = async (relativeUrl: string, mimeType: string | null | undefined): Promise<string | null> => {
  const serverBase = process.env.NEXT_PUBLIC_SERVER_URL || ''
  if (!serverBase) return null

  try {
    const response = await fetch(joinUrl(serverBase, relativeUrl))
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const contentType = mimeType || response.headers.get('content-type') || 'image/png'
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

const resolveLogoUrl = async (logo: Media | null): Promise<string | null> => {
  if (!logo?.url) return null

  const absolute = toAbsoluteUrl(logo.url)
  if (absolute) return absolute

  // Already-absolute URLs are returned above and never reach here; only a genuinely relative,
  // no-public-base-available path falls through to the local dev embed.
  if (/^https?:\/\//i.test(logo.url)) return null
  return embedAsDataUri(logo.url, logo.mimeType)
}

/**
 * Resolves everything the shared mailer needs for one tenant in a single place:
 * branding/contact/business-name already living on Tenants and SiteSettings (reused,
 * never duplicated into EmailSettings) plus the tenant's own EmailSettings templates.
 */
export const resolveTenantMailContext = async (
  payload: Payload,
  tenantID: TenantID,
): Promise<TenantMailContext> => {
  const [tenantResult, siteSettingsResult, emailSettingsResult] = await Promise.all([
    payload.find({
      collection: 'tenants',
      depth: 1,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { id: { equals: tenantID } },
    }),
    payload.find({
      collection: 'site-settings',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { tenantId: { equals: tenantID } },
    }),
    payload.find({
      collection: 'email-settings',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { tenantId: { equals: tenantID } },
    }),
  ])

  const tenant: Tenant | undefined = tenantResult.docs[0]
  const siteSettings: SiteSetting | undefined = siteSettingsResult.docs[0]
  const emailSettings: EmailSetting | null = emailSettingsResult.docs[0] ?? null

  const tenantName = tenant?.name ?? ''
  const logo: Media | null = tenant?.branding?.logo && typeof tenant.branding.logo === 'object' ? tenant.branding.logo : null
  const logoUrl = await resolveLogoUrl(logo)

  const businessName = siteSettings?.businessName ?? ''
  const tenantContactEmail = tenant?.contact?.contactEmail ?? ''
  const footerSupportEmail = emailSettings?.footer?.supportEmail ?? ''
  const primaryDomain = tenant?.domains?.find((entry) => entry.domain)?.domain
  const siteUrl = primaryDomain ? `https://${primaryDomain}` : null

  return {
    emailSettings,
    logoUrl,
    senderDisplayName: businessName || tenantName,
    siteName: businessName || tenantName,
    siteUrl,
    supportEmail: footerSupportEmail || tenantContactEmail,
    tenantName,
  }
}
