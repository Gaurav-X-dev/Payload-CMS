import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Tenant } from '../../payload-types'

// Cheap, request-memoized (React cache()) tenant lookup by slug, used ONLY to compute the
// `tenant-${id}` tag for the persistent content caches in getCuriousLadooContent.ts and
// getCuriousLadooBlogPost.ts (P7) — it does NOT gate access or decide tenant state; that logic
// stays exactly where it already lived, inside loadCuriousLadooContentWithPayload /
// loadCuriousLadooBlogPostWithPayload, which still run unchanged on a genuine cache miss.
// Mirrors resolveZuruZuruTenant.ts's existing pattern (P5).
export const resolveCuriousLadooTenantDocument = cache(async (siteKey: string): Promise<null | Tenant> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'tenants',
    depth: 0,
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
