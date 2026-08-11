import type { Payload, TypedUser } from 'payload'

// Shared query context for every dashboard data-layer function. Deliberately carries the real
// authenticated `user` (never a synthetic/override context) so every query below can run with
// `overrideAccess: false` and inherit each collection's own already-audited tenant-isolation
// access control (tenantPublicRead, etc.) — the dashboard never bypasses access control for
// convenience.
export type DashboardQueryContext = {
  isSuperAdmin: boolean
  payload: Payload
  // Slugs the current user is actually permitted to see (from Payload's own visibleEntities) —
  // queries are further restricted to this set so a role that can't see a collection at all
  // never gets asked about it.
  visibleCollectionSlugs: ReadonlySet<string>
  user: TypedUser | null | undefined
}
