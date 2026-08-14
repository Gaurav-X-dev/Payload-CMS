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
  'payload-cms-production-6ff4.up.railway.app': curiousHubSite,
  'payload-cms-production-486a.up.railway.app': zuruZuruSite,
}

export function resolveLocalSite(host: string | null | undefined): LocalSite | null {
  const hostname = resolveHostname(host)
  const match = localSiteRegistry[hostname]
  return match ? { ...match, hostname } : null
}
