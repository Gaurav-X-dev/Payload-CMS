import { cache } from 'react'
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

const loadZuruZuruPage = cache(async (
  host: string | null,
  pathname: string,
  siteHostname: string,
  siteKey: string,
): Promise<ZuruZuruPageResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyZuruZuruPage('missing')
  }

  const payload = await getPayload({ config: configPromise })
  const site: LocalSite = { hostname: siteHostname, key: siteKey, theme: 'zuru-zuru' }
  const find: ZuruZuruFind = async (args) => {
    const result = await payload.find(args)
    return { docs: result.docs as never }
  }
  // Shared, request-memoized tenant lookup — see resolveZuruZuruTenant.ts. When
  // getZuruZuruShell also resolves the same request, React's cache() collapses both calls into
  // a single physical tenant-table query instead of two.
  const tenant = await resolveZuruZuruTenantDocument(siteKey)
  return loadZuruZuruPageWithPayload({ find, host, pathname, site, tenant })
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
