import type { Payload, TypedUser } from 'payload'

import { getContentGrowth, type ContentGrowthResult } from './getContentGrowth'
import { getPublishingTrend, type PublishingTrendResult } from './getPublishingTrend'
import { getRecentUpdates, type RecentUpdateItem } from './getRecentUpdates'
import {
  getAPIStatus,
  getBackgroundJobsStatus,
  getStorageUsage,
  type APIStatus,
  type BackgroundJobsStatus,
  type StorageUsage,
} from './getSystemHealth'
import type { DashboardQueryContext } from './types'

export type DashboardData = {
  apiStatus: APIStatus
  backgroundJobs: BackgroundJobsStatus
  contentGrowth: ContentGrowthResult
  publishingTrend: PublishingTrendResult
  recentUpdates: RecentUpdateItem[]
  storageUsage: StorageUsage
}

const isSuperAdmin = (user: TypedUser | null | undefined): boolean =>
  Array.isArray(user?.roles) && user.roles.includes('super_admin')

// Single entry point the dashboard view calls. All independent, bounded, tenant-scoped queries
// run in parallel via Promise.all — never sequentially, never overrideAccess:true.
export const getDashboardData = async ({
  payload,
  user,
  visibleCollectionSlugs,
}: {
  payload: Payload
  user: TypedUser | null | undefined
  visibleCollectionSlugs: ReadonlySet<string>
}): Promise<DashboardData> => {
  const context: DashboardQueryContext = {
    isSuperAdmin: isSuperAdmin(user),
    payload,
    user,
    visibleCollectionSlugs,
  }

  const apiProbeCollection = ['pages', 'media', 'tenants'].find((slug) =>
    visibleCollectionSlugs.has(slug),
  )

  const [contentGrowth, publishingTrend, recentUpdates, apiStatus, storageUsage] =
    await Promise.all([
      getContentGrowth(context),
      getPublishingTrend(context),
      getRecentUpdates(context),
      apiProbeCollection
        ? getAPIStatus(context, apiProbeCollection)
        : Promise.resolve<APIStatus>({ latencyMs: null, state: 'unavailable' }),
      getStorageUsage(context),
    ])

  return {
    apiStatus,
    backgroundJobs: getBackgroundJobsStatus(),
    contentGrowth,
    publishingTrend,
    recentUpdates,
    storageUsage,
  }
}
