import type { CollectionSlug } from 'payload'

import { CONTENT_GROWTH_COLLECTIONS } from './contentCollections'
import {
  buildEmptyDayBuckets,
  incrementBucketForTimestamp,
  rangeStartISOString,
  totalBucketCount,
  type DayBucket,
} from './dateBuckets'
import type { DashboardQueryContext } from './types'

export type ContentGrowthResult = {
  days: DayBucket[]
  hasAnyData: boolean
  total: number
}

const RANGE_DAYS = 7

// Real content-creation activity over the last 7 days, across every tenant-scoped CMS content
// collection the current user can see. One bounded, field-limited query per collection (never a
// full-document load), run in parallel, bucketed by day in application code. Never fabricates a
// bar: a genuinely quiet week renders as real zeros, surfaced by the caller as an empty state.
export const getContentGrowth = async ({
  payload,
  user,
  visibleCollectionSlugs,
}: DashboardQueryContext): Promise<ContentGrowthResult> => {
  const days = buildEmptyDayBuckets(RANGE_DAYS)
  const rangeStart = rangeStartISOString(RANGE_DAYS)

  const collectionsToQuery = CONTENT_GROWTH_COLLECTIONS.filter(({ slug }) =>
    visibleCollectionSlugs.has(slug),
  )

  const perCollectionTimestamps = await Promise.all(
    collectionsToQuery.map(async ({ slug }) => {
      try {
        const result = await payload.find({
          collection: slug as CollectionSlug,
          depth: 0,
          limit: 1000,
          overrideAccess: false,
          pagination: false,
          select: { createdAt: true },
          user,
          where: {
            createdAt: { greater_than_equal: rangeStart },
          },
        })
        return result.docs.map((doc) => (doc as { createdAt?: string }).createdAt)
      } catch (error) {
        payload.logger.error(
          `Dashboard Content Growth: failed to query "${slug}" — ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        )
        return []
      }
    }),
  )

  for (const timestamps of perCollectionTimestamps) {
    for (const timestamp of timestamps) {
      incrementBucketForTimestamp(days, timestamp)
    }
  }

  const total = totalBucketCount(days)

  return { days, hasAnyData: total > 0, total }
}
