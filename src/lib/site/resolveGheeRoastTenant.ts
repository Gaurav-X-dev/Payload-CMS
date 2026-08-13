import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Tenant } from '../../payload-types'

// Request-memoized (React cache()) tenant lookup by slug. Also reused by
// loadGheeRoastContentWithPayload as the pre-resolved tenant on a cache miss, so this must stay
// at depth:2 — mapGheeRoastSite() reads tenant.branding.logo (a media relationship), which needs
// depth:2 to be populated. Feeding it a shallower document would silently break the site logo.
export const resolveGheeRoastTenantDocument = cache(async (siteKey: string): Promise<null | Tenant> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'tenants',
    depth: 2,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    sort: 'id',
    where: { slug: { equals: siteKey } },
  })
  if (result.docs.length > 1) {
    throw new Error(`Ambiguous Ghee Roast tenant resolution: expected at most one document, received ${result.docs.length}.`)
  }
  return result.docs[0] ?? null
})
