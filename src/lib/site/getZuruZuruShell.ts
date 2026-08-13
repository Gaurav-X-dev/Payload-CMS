import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  emptyZuruZuruShell,
  loadZuruZuruShellWithPayload,
  zuruZuruShellCacheArguments,
  type ZuruZuruFind,
  type ZuruZuruShellResult,
} from './zuruZuruContentCore'
import { resolveZuruZuruTenantDocument } from './resolveZuruZuruTenant'
import type { LocalSite } from './types'

export type { ZuruZuruShellResult } from './zuruZuruContentCore'

// P7: see getGheeRoastContent.ts for the full design rationale (identical two-phase pattern).
const CONTENT_REVALIDATE_SECONDS = 300

const loadZuruZuruShell = cache(async (
  host: string | null,
  siteHostname: string,
  siteKey: string,
): Promise<ZuruZuruShellResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyZuruZuruShell('missing')
  }

  const site: LocalSite = { hostname: siteHostname, key: siteKey, theme: 'zuru-zuru' }
  // Shared, request-memoized tenant lookup — see resolveZuruZuruTenant.ts. When
  // getZuruZuruPageContent also resolves the same request, React's cache() collapses both
  // calls into a single physical tenant-table query instead of two. Reused below both for the
  // cache tag AND as the pre-resolved tenant passed into loadZuruZuruShellWithPayload, so
  // wrapping this loader in unstable_cache adds no additional tenant lookup.
  const tenant = await resolveZuruZuruTenantDocument(siteKey)

  const loadCached = unstable_cache(
    async (
      cachedSiteHostname: string,
      cachedSiteKey: string,
      cachedHost: string | null,
    ): Promise<ZuruZuruShellResult> => {
      const payload = await getPayload({ config: configPromise })
      const cachedSite: LocalSite = { hostname: cachedSiteHostname, key: cachedSiteKey, theme: 'zuru-zuru' }
      const find: ZuruZuruFind = async (args) => {
        const result = await payload.find(args)
        return { docs: result.docs as never }
      }
      return loadZuruZuruShellWithPayload({ find, host: cachedHost, site: cachedSite, tenant })
    },
    ['zuru-zuru-shell', siteKey],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: tenant ? [`tenant-${tenant.id}`] : [],
    },
  )

  return loadCached(siteHostname, siteKey, host)
})

export async function getZuruZuruShell({
  host,
  site,
}: {
  host: string | null
  site: LocalSite
}): Promise<ZuruZuruShellResult> {
  return loadZuruZuruShell(...zuruZuruShellCacheArguments(host, site))
}
