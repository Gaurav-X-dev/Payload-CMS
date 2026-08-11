import type { CollectionSlug, Where } from 'payload'

import { PUBLISHING_TREND_COLLECTIONS } from './contentCollections'
import {
  buildEmptyDayBuckets,
  incrementBucketForTimestamp,
  rangeStartISOString,
  totalBucketCount,
  type DayBucket,
} from './dateBuckets'
import type { DashboardQueryContext } from './types'

export type PublishingTrendResult = {
  caveat: string
  days: DayBucket[]
  hasAnyData: boolean
  total: number
}

const RANGE_DAYS = 7

// Real publishing activity over the last 7 days, for the two collections that actually have a
// publish workflow (blog-posts, pages). Only genuinely published documents are counted — never
// drafts. See contentCollections.ts for the exact, schema-verified field semantics used per
// collection; Pages' bucket uses updatedAt because it has no reliable auto-stamped
// first-published timestamp, which is surfaced to the UI as an explicit caveat rather than
// silently presented as exact publish history.
export const getPublishingTrend = async ({
  payload,
  user,
  visibleCollectionSlugs,
}: DashboardQueryContext): Promise<PublishingTrendResult> => {
  const days = buildEmptyDayBuckets(RANGE_DAYS)
  const rangeStart = rangeStartISOString(RANGE_DAYS)

  const collectionsToQuery = PUBLISHING_TREND_COLLECTIONS.filter(({ slug }) =>
    visibleCollectionSlugs.has(slug),
  )

  await Promise.all(
    collectionsToQuery.map(async (meta) => {
      const { publishedValue, slug, statusField, timestampFallbackField, timestampField } = meta

      const select: Record<string, true> = { [timestampField]: true }
      if (timestampFallbackField) select[timestampFallbackField] = true

      const where: Where = {
        and: [
          { [statusField]: { equals: publishedValue } },
          {
            or: [
              { [timestampField]: { greater_than_equal: rangeStart } },
              ...(timestampFallbackField
                ? [{ [timestampFallbackField]: { greater_than_equal: rangeStart } }]
                : []),
            ],
          },
        ],
      }

      try {
        const result = await payload.find({
          collection: slug as CollectionSlug,
          depth: 0,
          limit: 1000,
          overrideAccess: false,
          pagination: false,
          select,
          user,
          where,
        })

        for (const doc of result.docs) {
          const record = doc as unknown as Record<string, unknown>
          const primary = record[timestampField]
          const fallback = timestampFallbackField ? record[timestampFallbackField] : undefined
          const timestamp = (typeof primary === 'string' && primary) || (typeof fallback === 'string' ? fallback : undefined)
          incrementBucketForTimestamp(days, timestamp)
        }
      } catch (error) {
        payload.logger.error(
          `Dashboard Publishing Trend: failed to query "${slug}" — ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        )
      }
    }),
  )

  const total = totalBucketCount(days)

  return {
    caveat:
      collectionsToQuery.some((meta) => meta.slug === 'pages')
        ? 'Pages have no reliable "first published" timestamp in this schema, so their trend uses the last update time while published — not the exact publish moment.'
        : '',
    days,
    hasAnyData: total > 0,
    total,
  }
}
