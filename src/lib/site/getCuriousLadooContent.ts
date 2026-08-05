import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  curiousLadooContentCacheArguments,
  emptyCuriousLadooContent,
  loadCuriousLadooContentWithPayload,
  type CuriousLadooContentResult,
  type CuriousLadooFind,
} from './curiousLadooContentCore'
import type { LocalSite } from './types'

export type { CuriousLadooContentResult } from './curiousLadooContentCore'

const loadCuriousLadooContent = cache(async (
  host: string | null,
  pathname: string,
  siteHostname: string,
  siteKey: string,
): Promise<CuriousLadooContentResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyCuriousLadooContent('missing')
  }

  const payload = await getPayload({ config: configPromise })
  const site: LocalSite = { hostname: siteHostname, key: siteKey, theme: 'curious-hub' }
  const find: CuriousLadooFind = async (args) => {
    const result = await payload.find(args)
    return { docs: result.docs as never }
  }
  return loadCuriousLadooContentWithPayload({ find, host, pathname, site })
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
