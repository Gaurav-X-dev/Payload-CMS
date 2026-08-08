import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  emptyZuruZuruHome,
  loadZuruZuruHomeWithPayload,
  zuruZuruHomeCacheArguments,
  type ZuruZuruFind,
  type ZuruZuruHomeResult,
} from './zuruZuruContentCore'
import type { LocalSite } from './types'

export type { ZuruZuruHomeResult } from './zuruZuruContentCore'

const loadZuruZuruHome = cache(async (
  host: string | null,
  siteHostname: string,
  siteKey: string,
): Promise<ZuruZuruHomeResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyZuruZuruHome('missing')
  }

  const payload = await getPayload({ config: configPromise })
  const site: LocalSite = { hostname: siteHostname, key: siteKey, theme: 'zuru-zuru' }
  const find: ZuruZuruFind = async (args) => {
    const result = await payload.find(args)
    return { docs: result.docs as never }
  }
  return loadZuruZuruHomeWithPayload({ find, host, site })
})

export async function getZuruZuruHome({
  host,
  site,
}: {
  host: string | null
  site: LocalSite
}): Promise<ZuruZuruHomeResult> {
  return loadZuruZuruHome(...zuruZuruHomeCacheArguments(host, site))
}
