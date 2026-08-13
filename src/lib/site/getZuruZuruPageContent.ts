import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  emptyZuruZuruPage,
  loadZuruZuruPageWithPayload,
  zuruZuruPageCacheArguments,
  type ZuruZuruFind,
  type ZuruZuruPageResult,
} from './zuruZuruContentCore'
import { resolveZuruZuruTenantDocument } from './resolveZuruZuruTenant'
import type { LocalSite } from './types'

export type { ZuruZuruPageResult } from './zuruZuruContentCore'

// P7: see getGheeRoastContent.ts for the full design rationale (identical two-phase pattern).
const CONTENT_REVALIDATE_SECONDS = 300

const loadZuruZuruPage = cache(async (
  host: string | null,
  pathname: string,
  siteHostname: string,
  siteKey: string,
): Promise<ZuruZuruPageResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyZuruZuruPage('missing')
  }

  const site: LocalSite = { hostname: siteHostname, key: siteKey, theme: 'zuru-zuru' }
  // Shared, request-memoized tenant lookup — see resolveZuruZuruTenant.ts. When getZuruZuruShell
  // also resolves the same request, React's cache() collapses both calls into a single physical
  // tenant-table query instead of two. Reused below both for the cache tag AND as the
  // pre-resolved tenant passed into loadZuruZuruPageWithPayload, so wrapping this loader in
  // unstable_cache adds no additional tenant lookup.
  const tenant = await resolveZuruZuruTenantDocument(siteKey)

  const loadCached = unstable_cache(
    async (
      cachedSiteKey: string,
      cachedPathname: string,
      cachedSiteHostname: string,
      cachedHost: string | null,
    ): Promise<ZuruZuruPageResult> => {
      const payload = await getPayload({ config: configPromise })
      const cachedSite: LocalSite = { hostname: cachedSiteHostname, key: cachedSiteKey, theme: 'zuru-zuru' }
      const find: ZuruZuruFind = async (args) => {
        const result = await payload.find(args)
        return { docs: result.docs as never }
      }
      return loadZuruZuruPageWithPayload({ find, host: cachedHost, pathname: cachedPathname, site: cachedSite, tenant })
    },
    ['zuru-zuru-page', siteKey, pathname],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: tenant ? [`tenant-${tenant.id}`] : [],
    },
  )

  return loadCached(siteKey, pathname, siteHostname, host)
})

export async function getZuruZuruPageContent({
  host,
  pathname,
  site,
}: {
  host: string | null
  pathname: string
  site: LocalSite
}): Promise<ZuruZuruPageResult> {
  return loadZuruZuruPage(...zuruZuruPageCacheArguments(host, pathname, site))
}
