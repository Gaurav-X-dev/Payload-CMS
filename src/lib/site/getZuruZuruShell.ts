import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  emptyZuruZuruShell,
  loadZuruZuruShellWithPayload,
  zuruZuruShellCacheArguments,
  type ZuruZuruFind,
  type ZuruZuruShellResult,
} from './zuruZuruContentCore'
import type { LocalSite } from './types'

export type { ZuruZuruShellResult } from './zuruZuruContentCore'

const loadZuruZuruShell = cache(async (
  host: string | null,
  siteHostname: string,
  siteKey: string,
): Promise<ZuruZuruShellResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyZuruZuruShell('missing')
  }

  const payload = await getPayload({ config: configPromise })
  const site: LocalSite = { hostname: siteHostname, key: siteKey, theme: 'zuru-zuru' }
  const find: ZuruZuruFind = async (args) => {
    const result = await payload.find(args)
    return { docs: result.docs as never }
  }
  return loadZuruZuruShellWithPayload({ find, host, site })
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
