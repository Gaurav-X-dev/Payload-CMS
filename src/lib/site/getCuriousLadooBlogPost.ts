import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  emptyCuriousLadooBlogPost,
  loadCuriousLadooBlogPostWithPayload,
  type CuriousLadooBlogPostResult,
  type CuriousLadooFind,
} from './curiousLadooContentCore'
import { resolveCuriousLadooTenantDocument } from './resolveCuriousLadooTenant'
import type { LocalSite } from './types'

export type { CuriousLadooBlogPostResult } from './curiousLadooContentCore'

// P7: see getGheeRoastContent.ts for the full design rationale (identical pattern reused here).
// Blog post slugs are already stable, URL-safe identifiers — no path normalization needed
// beyond what the route itself already guarantees.
const CONTENT_REVALIDATE_SECONDS = 300

const loadCuriousLadooBlogPost = cache(async (
  host: string | null,
  slug: string,
  siteHostname: string,
  siteKey: string,
): Promise<CuriousLadooBlogPostResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyCuriousLadooBlogPost('missing')
  }

  const tenant = await resolveCuriousLadooTenantDocument(siteKey)

  const loadCached = unstable_cache(
    async (
      cachedSiteKey: string,
      cachedSlug: string,
      cachedSiteHostname: string,
      cachedHost: string | null,
    ): Promise<CuriousLadooBlogPostResult> => {
      const payload = await getPayload({ config: configPromise })
      const site: LocalSite = { hostname: cachedSiteHostname, key: cachedSiteKey, theme: 'curious-hub' }
      const find: CuriousLadooFind = async (args) => {
        const result = await payload.find(args)
        return { docs: result.docs as never }
      }
      return loadCuriousLadooBlogPostWithPayload({
        find,
        host: cachedHost,
        preResolvedTenant: tenant,
        site,
        slug: cachedSlug,
      })
    },
    ['curious-ladoo-blog-post', siteKey, slug],
    {
      revalidate: CONTENT_REVALIDATE_SECONDS,
      tags: tenant ? [`tenant-${tenant.id}`] : [],
    },
  )

  return loadCached(siteKey, slug, siteHostname, host)
})

export async function getCuriousLadooBlogPost({
  host,
  site,
  slug,
}: {
  host: string | null
  site: LocalSite
  slug: string
}): Promise<CuriousLadooBlogPostResult> {
  return loadCuriousLadooBlogPost(host, slug, site.hostname, site.key)
}
