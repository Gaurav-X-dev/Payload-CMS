import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  emptyGheeRoastContent,
  gheeRoastContentCacheArguments,
  loadGheeRoastContentWithPayload,
  type GheeRoastContentResult,
  type GheeRoastFindArgs,
} from './gheeRoastContentCore'
import { gheeRoastLegacyFallbacksEnabled } from './themeFallbacks'
import { resolveGheeRoastTenantDocument } from './resolveGheeRoastTenant'
import type { LocalSite, LocalThemeKey } from './types'

export type { GheeRoastContentResult } from './gheeRoastContentCore'

// P7: persistent, cross-request cache for the expensive multi-collection content fetch.
// Bounded time-based revalidation as a safety net alongside tag-based invalidation (below) —
// see the M3 cache-architecture proposal for the full design rationale.
const CONTENT_REVALIDATE_SECONDS = 300

const loadGheeRoastContent = cache(async (
  host: string | null,
  pathname: string,
  siteHostname: string,
  siteKey: string,
  siteTheme: LocalThemeKey,
): Promise<GheeRoastContentResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyGheeRoastContent({
      fallbacksEnabled: false,
      tenantState: 'missing',
    })
  }

  // Cheap, request-deduped lookup used only to compute the tenant tag below, so the existing
  // invalidateTenantCache hook's revalidateTag(`tenant-${id}`) actually invalidates a real
  // persistent cache entry. Tenant state/access decisions are made only inside
  // loadGheeRoastContentWithPayload (unchanged), which still runs on every genuine cache miss.
  const tenant = await resolveGheeRoastTenantDocument(siteKey)

  // Constructed per call rather than once at module scope so `tags` below can depend on the
  // just-resolved tenant id — unstable_cache's persistent lookup is keyed by `keyParts` plus
  // the arguments passed to the returned function, not by JS closure/object identity, so
  // recreating this wrapper on every call does not defeat cross-request caching.
  const loadCached = unstable_cache(
    async (
      cachedSiteKey: string,
      cachedPathname: string,
      cachedSiteHostname: string,
      cachedSiteTheme: LocalThemeKey,
      cachedHost: string | null,
    ): Promise<GheeRoastContentResult> => {
      const payload = await getPayload({ config: configPromise })
      const site: LocalSite = {
        hostname: cachedSiteHostname,
        key: cachedSiteKey,
        theme: cachedSiteTheme,
      }
      return loadGheeRoastContentWithPayload({
        fallbacksEnabled: gheeRoastLegacyFallbacksEnabled(),
        find: async (args: GheeRoastFindArgs) => {
          const result = await payload.find(args)
          return { docs: result.docs }
        },
        host: cachedHost,
        pathname: cachedPathname,
        // gheeRoastContentCore.ts intentionally keeps a loose Record<string, unknown> shape for
        // tenant documents (see its `Document` type) rather than depending on payload-types.
        preResolvedTenant: tenant as unknown as Record<string, unknown> | null,
        site,
      })
    },
    // Static prefix + siteKey + normalizedPathname — never raw hostname, so a tenant's
    // production domain and its dev `.localhost` alias share one cache entry instead of
    // fragmenting it. `host` is still passed through as a call argument purely so
    // loadGheeRoastContentWithPayload can perform its own resolveLocalSite re-validation on a
    // miss; it is not part of the cache-identity contract described in the M3 proposal.
    ['ghee-roast-content', siteKey, pathname],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: tenant ? [`tenant-${tenant.id}`] : [],
    },
  )

  return loadCached(siteKey, pathname, siteHostname, siteTheme, host)
})

export async function getGheeRoastContent({
  host,
  pathname = '/',
  site,
}: {
  host: string | null
  pathname?: string
  site: LocalSite
}): Promise<GheeRoastContentResult> {
  return loadGheeRoastContent(...gheeRoastContentCacheArguments(host, pathname, site))
}
