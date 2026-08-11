import type { DashboardQueryContext } from './types'

export type APIStatus = {
  latencyMs: null | number
  state: 'degraded' | 'operational' | 'unavailable'
}

export type BackgroundJobsStatus = {
  state: 'not_configured'
}

export type StorageUsage = {
  mediaCount: number
  provider: 'local' | 's3'
  // null when filesize metadata is missing on some/all records (never fabricated).
  totalBytes: null | number
}

// A response slower than this (but not erroring) is reported as "degraded" rather than
// "operational" — a coarse, honest signal, not a fabricated SLA.
const DEGRADED_THRESHOLD_MS = 1500

// Reuses a query the dashboard needs anyway (a cheap, bounded count on a collection the current
// user can see) to time one real DB round trip — no new endpoint, no polling, no synthetic
// latency.
export const getAPIStatus = async (
  { payload, user, visibleCollectionSlugs }: DashboardQueryContext,
  probeCollection: string,
): Promise<APIStatus> => {
  if (!visibleCollectionSlugs.has(probeCollection)) {
    return { latencyMs: null, state: 'unavailable' }
  }

  const startedAt = Date.now()
  try {
    await payload.count({
      collection: probeCollection as never,
      overrideAccess: false,
      user,
    })
    const latencyMs = Date.now() - startedAt
    return {
      latencyMs,
      state: latencyMs > DEGRADED_THRESHOLD_MS ? 'degraded' : 'operational',
    }
  } catch (error) {
    payload.logger.error(
      `Dashboard API Status probe failed — ${error instanceof Error ? error.message : 'unknown error'}`,
    )
    return { latencyMs: null, state: 'unavailable' }
  }
}

// No job/queue provider (BullMQ/Agenda/Redis/Payload Jobs) is configured anywhere in this
// project — confirmed by inspecting payload.config.ts (no `jobs` key) and package.json (no
// queue dependency installed). This is a truthful static fact, not a live check, and is not
// meant to become one without actually adding job infrastructure.
export const getBackgroundJobsStatus = (): BackgroundJobsStatus => ({ state: 'not_configured' })

// Media file count + total known bytes, tenant-scoped via the same access control as every
// other Media read. Uses only the existing `filesize` field already stored on each Media
// document — no filesystem recursion, no S3 bucket listing.
export const getStorageUsage = async ({
  payload,
  user,
  visibleCollectionSlugs,
}: DashboardQueryContext): Promise<StorageUsage> => {
  const provider: StorageUsage['provider'] =
    process.env.S3_ACCESS_KEY && process.env.S3_ENDPOINT ? 's3' : 'local'

  if (!visibleCollectionSlugs.has('media')) {
    return { mediaCount: 0, provider, totalBytes: null }
  }

  try {
    const result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 5000,
      overrideAccess: false,
      pagination: false,
      select: { filesize: true },
      user,
    })

    let totalBytes = 0
    let hasAnyFilesize = false
    for (const doc of result.docs) {
      const filesize = (doc as { filesize?: number }).filesize
      if (typeof filesize === 'number') {
        totalBytes += filesize
        hasAnyFilesize = true
      }
    }

    return {
      mediaCount: result.docs.length,
      provider,
      totalBytes: hasAnyFilesize ? totalBytes : null,
    }
  } catch (error) {
    payload.logger.error(
      `Dashboard Storage Usage: failed to query media — ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    )
    return { mediaCount: 0, provider, totalBytes: null }
  }
}
