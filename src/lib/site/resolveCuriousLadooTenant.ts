import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Tenant } from '../../payload-types'

// Request-memoized (React cache()) tenant lookup by slug — computes the `tenant-${id}` tag for
// the persistent content caches in getCuriousLadooContent.ts and getCuriousLadooBlogPost.ts (P7),
// AND (when passed through as `preResolvedTenant`) is reused directly as the rendered `tenant`,
// so depth must be enough to populate branding.logo/branding.favicon as full Media objects, not
// just their raw IDs. Mirrors resolveZuruZuruTenant.ts's existing pattern (P5).
export const resolveCuriousLadooTenantDocument = cache(async (siteKey: string): Promise<null | Tenant> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'tenants',
    depth: 1,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    sort: 'id',
    where: { slug: { equals: siteKey } },
  })
  if (result.docs.length > 1) {
    throw new Error(`Ambiguous Curious Ladoo tenant resolution: expected at most one document, received ${result.docs.length}.`)
  }
  return result.docs[0] ?? null
})
