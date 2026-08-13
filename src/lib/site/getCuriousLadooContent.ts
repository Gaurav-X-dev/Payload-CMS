import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  curiousLadooContentCacheArguments,
  emptyCuriousLadooContent,
  loadCuriousLadooContentWithPayload,
  type CuriousLadooContentResult,
  type CuriousLadooFind,
} from './curiousLadooContentCore'
import { resolveCuriousLadooTenantDocument } from './resolveCuriousLadooTenant'
import type { LocalSite } from './types'

export type { CuriousLadooContentResult } from './curiousLadooContentCore'

// P7: see getGheeRoastContent.ts for the full design rationale (identical pattern reused here).
const CONTENT_REVALIDATE_SECONDS = 300

const loadCuriousLadooContent = cache(async (
  host: string | null,
  pathname: string,
  siteHostname: string,
  siteKey: string,
): Promise<CuriousLadooContentResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyCuriousLadooContent('missing')
  }

  const tenant = await resolveCuriousLadooTenantDocument(siteKey)

  const loadCached = unstable_cache(
    async (
      cachedSiteKey: string,
      cachedPathname: string,
      cachedSiteHostname: string,
      cachedHost: string | null,
    ): Promise<CuriousLadooContentResult> => {
      const payload = await getPayload({ config: configPromise })
      const site: LocalSite = { hostname: cachedSiteHostname, key: cachedSiteKey, theme: 'curious-hub' }
      const find: CuriousLadooFind = async (args) => {
        const result = await payload.find(args)
        return { docs: result.docs as never }
      }
      return loadCuriousLadooContentWithPayload({
        find,
        host: cachedHost,
        pathname: cachedPathname,
        preResolvedTenant: tenant,
        site,
      })
    },
    ['curious-ladoo-content', siteKey, pathname],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: tenant ? [`tenant-${tenant.id}`] : [],
    },
  )

  return loadCached(siteKey, pathname, siteHostname, host)
})

export async function getCuriousLadooContent({
  host,
  pathname = '/',
  site,
}: {
  host: string | null
  pathname?: string
  site: LocalSite
}): Promise<CuriousLadooContentResult> {
  return loadCuriousLadooContent(...curiousLadooContentCacheArguments(host, pathname, site))
}
