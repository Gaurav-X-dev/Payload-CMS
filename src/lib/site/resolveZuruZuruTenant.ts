import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Tenant } from '../../payload-types'

// Shared by getZuruZuruShell.ts and getZuruZuruPageContent.ts. Both previously did their own,
// separately react-`cache()`-wrapped `payload.find({collection:'tenants',...})` call — since
// each lived in a different `cache()` closure, React never deduped between them, so a single
// Zuru Zuru page render always cost 2 tenant-table queries instead of 1 (see M3 performance
// audit). Extracting the tenant lookup into its own `cache()`-wrapped function, called by both,
// lets React's per-request memoization collapse it back down to one physical query when both
// the shell and the page are resolved in the same request — the normal case.
//
// Deliberately still lives in the "outer" (getPayload-connected) layer, not in
// zuruZuruContentCore.ts — that file is intentionally kept free of any real Payload connection
// so its `loadZuruZuru*WithPayload` functions stay unit-testable via an injected `find` fake.
export const resolveZuruZuruTenantDocument = cache(async (siteKey: string): Promise<Tenant | null> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'tenants',
    depth: 1,
    draft: false,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    sort: 'id',
    where: { slug: { equals: siteKey } },
  })
  if (result.docs.length > 1) {
    throw new Error(`Ambiguous Zuru Zuru tenant resolution: expected at most one document, received ${result.docs.length}.`)
  }
  return result.docs[0] ?? null
})
