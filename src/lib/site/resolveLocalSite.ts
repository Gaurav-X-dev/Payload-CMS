import { resolveHostname } from './resolveHostname'
import type { LocalSite } from './types'

const gheeRoastSite = {
  hostname: 'ghee-roast.localhost',
  key: 'ghee-roast',
  theme: 'ghee-roast',
} as const satisfies LocalSite

const zuruZuruSite = {
  hostname: 'zuru-zuru.localhost',
  key: 'zuru-zuru',
  theme: 'zuru-zuru',
} as const satisfies LocalSite

const curiousHubSite = {
  hostname: 'curious-hub.localhost',
  // Matches the seeded Tenant.slug ('curious-ladoo'), not the internal theme key — see
  // resolvePublicTenantID, which looks up the tenant by this value. The theme key below stays
  // 'curious-hub' deliberately (documented in docs/CURIOUS_LADOO_MIGRATION.md).
  key: 'curious-ladoo',
  theme: 'curious-hub',
} as const satisfies LocalSite

export const localSiteRegistry: Readonly<Record<string, LocalSite>> = {
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
}

export function resolveLocalSite(host: string | null | undefined): LocalSite | null {
  const hostname = resolveHostname(host)
  return localSiteRegistry[hostname] ?? null
}
