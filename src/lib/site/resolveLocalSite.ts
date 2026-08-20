import { resolveHostname } from './resolveHostname'
import type { LocalSite } from './types'

type LocalSiteMatch = Omit<LocalSite, 'hostname'>

const gheeRoastSite = {
  key: 'ghee-roast',
  theme: 'ghee-roast',
} as const satisfies LocalSiteMatch

const zuruZuruSite = {
  key: 'zuru-zuru',
  theme: 'zuru-zuru',
} as const satisfies LocalSiteMatch

const curiousHubSite = {
  // Matches the seeded Tenant.slug ('curious-ladoo'), not the internal theme key — see
  // resolvePublicTenantID, which looks up the tenant by this value. The theme key below stays
  // 'curious-hub' deliberately (documented in docs/CURIOUS_LADOO_MIGRATION.md).
  key: 'curious-ladoo',
  theme: 'curious-hub',
} as const satisfies LocalSiteMatch

/**
 * Every hostname (dev alias or real production domain) that should resolve to each theme.
 * `resolveLocalSite` returns the *actual* matched hostname as `LocalSite.hostname` (not a fixed
 * value from this table) — that field feeds canonical URLs, sitemap.xml, robots.txt, and JSON-LD
 * (see CuriousHubPageRenderer.tsx, app/sitemap.ts, app/robots.ts), so it must always be the real
 * domain the request came in on, or those URLs would point at a dev-only hostname in production.
 *
 * To add a real production domain: add its hostname (and its `www.` variant, if used) as a new
 * key below, pointing at the matching site constant. No other file needs to change.
 */
export const localSiteRegistry: Readonly<Record<string, LocalSiteMatch>> = {
  'curious-hub.local': curiousHubSite,
  'curious-hub.localhost': curiousHubSite,
  'curious-ladoo.local': curiousHubSite,
  'curious-ladoo.localhost': curiousHubSite,
  'ghee-roast.local': gheeRoastSite,
  'ghee-roast.localhost': gheeRoastSite,
  'zuru-zuru.local': zuruZuruSite,
  'zuru-zuru.localhost': zuruZuruSite,
  localhost: curiousHubSite,
  '127.0.0.1': curiousHubSite,
  '::1': curiousHubSite,
  // Production Domains
  'curiousladdoo.com': curiousHubSite,
  'www.curiousladdoo.com': curiousHubSite,
  'zuruzuru.in': zuruZuruSite,
  'www.zuruzuru.in': zuruZuruSite,
  'verygoodgheeroast.in': gheeRoastSite,
  'www.verygoodgheeroast.in': gheeRoastSite,
}

export function resolveLocalSite(host: string | null | undefined): LocalSite | null {
  const hostname = resolveHostname(host)
  const match = localSiteRegistry[hostname]
  if (match) return { ...match, hostname }

  // Railway-generated deployment/preview subdomains only. These are hostnames Railway itself
  // issues for this project, so treating them as the Curious Hub site is a deliberate operator
  // choice, not a guess about an arbitrary caller's Host header.
  if (hostname.endsWith('.railway.app')) {
    return { ...curiousHubSite, hostname }
  }

  // Everything else must fail safe. Substring matching (`hostname.includes('ghee')`) and a
  // blanket default to one tenant were both tried here and are wrong for the same reason: the
  // Host header is caller-controlled, so any permissive rule lets an unrecognized — or forged —
  // host select a real tenant. That leaks one tenant's public content onto an unknown domain and,
  // via resolvePublicTenantID, attributes public form submissions to a tenant the request never
  // legitimately identified.
  //
  // Returning null is also what keeps the CMS-managed domain allowlist alive: resolvePublicTenantID
  // only falls through to its `domains.domain` tenant lookup when this returns null. A permanent
  // production domain belongs in `localSiteRegistry` above (for rendering) and in that tenant's
  // `domains` array (for tenant resolution) — never in a heuristic here.
  return null
}

