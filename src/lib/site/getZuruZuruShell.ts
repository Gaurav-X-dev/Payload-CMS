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
import { resolveZuruZuruTenantDocument } from './resolveZuruZuruTenant'
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
  // Shared, request-memoized tenant lookup — see resolveZuruZuruTenant.ts. When
  // getZuruZuruPageContent also resolves the same request, React's cache() collapses both
  // calls into a single physical tenant-table query instead of two.
  const tenant = await resolveZuruZuruTenantDocument(siteKey)
  return loadZuruZuruShellWithPayload({ find, host, site, tenant })
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
