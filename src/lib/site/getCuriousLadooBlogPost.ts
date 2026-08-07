import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  emptyCuriousLadooBlogPost,
  loadCuriousLadooBlogPostWithPayload,
  type CuriousLadooBlogPostResult,
  type CuriousLadooFind,
} from './curiousLadooContentCore'
import type { LocalSite } from './types'

export type { CuriousLadooBlogPostResult } from './curiousLadooContentCore'

const loadCuriousLadooBlogPost = cache(async (
  host: string | null,
  slug: string,
  siteHostname: string,
  siteKey: string,
): Promise<CuriousLadooBlogPostResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyCuriousLadooBlogPost('missing')
  }

  const payload = await getPayload({ config: configPromise })
  const site: LocalSite = { hostname: siteHostname, key: siteKey, theme: 'curious-hub' }
  const find: CuriousLadooFind = async (args) => {
    const result = await payload.find(args)
    return { docs: result.docs as never }
  }
  return loadCuriousLadooBlogPostWithPayload({ find, host, site, slug })
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
