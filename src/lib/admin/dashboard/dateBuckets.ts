// Pure date-bucketing helpers shared by Content Growth and Publishing Trend. Kept
// framework/DB-free so they're independently unit-testable without a live database.

export type DayBucket = {
  count: number
  date: string // YYYY-MM-DD, UTC
  label: string // e.g. "Mon"
}

const SHORT_DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Returns the last `days` UTC calendar days (oldest first, today last), as empty buckets.
export const buildEmptyDayBuckets = (days: number, now: Date = new Date()): DayBucket[] => {
  const startOfTodayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const buckets: DayBucket[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayMs = startOfTodayUTC - offset * 24 * 60 * 60 * 1000
    const day = new Date(dayMs)
    buckets.push({
      count: 0,
      date: day.toISOString().slice(0, 10),
      label: SHORT_DAY_LABELS[day.getUTCDay()],
    })
  }

  return buckets
}

export const rangeStartISOString = (days: number, now: Date = new Date()): string => {
  const startOfTodayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return new Date(startOfTodayUTC - (days - 1) * 24 * 60 * 60 * 1000).toISOString()
}

// Increments the bucket matching `isoTimestamp`'s UTC calendar day, if it falls within the
// provided buckets. Timestamps outside the range are silently ignored (defensive — a query
// bug elsewhere should not crash the dashboard).
export const incrementBucketForTimestamp = (
  buckets: DayBucket[],
  isoTimestamp: string | null | undefined,
): void => {
  if (!isoTimestamp) return
  const day = isoTimestamp.slice(0, 10)
  const bucket = buckets.find((candidate) => candidate.date === day)
  if (bucket) bucket.count += 1
}

export const totalBucketCount = (buckets: DayBucket[]): number =>
  buckets.reduce((sum, bucket) => sum + bucket.count, 0)
