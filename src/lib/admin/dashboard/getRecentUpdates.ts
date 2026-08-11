import type { CollectionSlug } from 'payload'

import { CONTENT_GROWTH_COLLECTIONS } from './contentCollections'
import type { DashboardQueryContext } from './types'

export type RecentUpdateItem = {
  collectionSlug: string
  docID: number | string
  status: null | string
  title: string
  updatedAt: string
}

const RESULT_LIMIT = 8
// Fetch a small, bounded slice per collection rather than everything, then merge + trim —
// keeps the query cheap even for a collection with many documents.
const PER_COLLECTION_LIMIT = RESULT_LIMIT

const readStatus = (record: Record<string, unknown>): null | string => {
  const status = record._status ?? record.status
  return typeof status === 'string' ? status : null
}

const readTitle = (record: Record<string, unknown>, titleField: string): string => {
  const value = record[titleField]
  return typeof value === 'string' && value.trim() ? value : `Untitled (#${String(record.id)})`
}

// Most recently updated documents across the curated content collections the current user can
// see, merged and sorted by real updatedAt. No actor attribution (that data doesn't exist — see
// getRecentActivity's documented limitation) — this only ever shows resource/collection/time.
export const getRecentUpdates = async ({
  payload,
  user,
  visibleCollectionSlugs,
}: DashboardQueryContext): Promise<RecentUpdateItem[]> => {
  const collectionsToQuery = CONTENT_GROWTH_COLLECTIONS.filter(({ slug }) =>
    visibleCollectionSlugs.has(slug),
  )

  const perCollectionResults = await Promise.all(
    collectionsToQuery.map(async ({ slug, titleField }) => {
      try {
        const result = await payload.find({
          collection: slug as CollectionSlug,
          depth: 0,
          limit: PER_COLLECTION_LIMIT,
          overrideAccess: false,
          pagination: false,
          select: {
            [titleField]: true,
            _status: true,
            status: true,
            updatedAt: true,
          },
          sort: '-updatedAt',
          user,
        })

        return result.docs.map((doc): RecentUpdateItem => {
          const record = doc as unknown as Record<string, unknown>
          return {
            collectionSlug: slug,
            docID: record.id as number | string,
            status: readStatus(record),
            title: readTitle(record, titleField),
            updatedAt: String(record.updatedAt),
          }
        })
      } catch (error) {
        payload.logger.error(
          `Dashboard Recent Updates: failed to query "${slug}" — ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        )
        return []
      }
    }),
  )

  return perCollectionResults
    .flat()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
    .slice(0, RESULT_LIMIT)
}
