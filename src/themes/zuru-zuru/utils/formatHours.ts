import type { ZuruZuruHoursRowData } from '../mappers/dynamicTypes'

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/**
 * Collapses the weekly hours array into a single "Mon – Sun: X – Y" line when every open day
 * shares the same open/close time (the common case for a single-shift restaurant), matching the
 * compact summary format the original static header/footer used. Falls back to the first open
 * day's hours if the week isn't uniform, rather than guessing at a more elaborate format.
 */
export function formatHoursSummary(hours: ZuruZuruHoursRowData[]): string {
  const open = hours.filter((row) => !row.isClosed && row.openTime && row.closeTime)
  if (open.length === 0) return ''

  const [first, ...rest] = open
  const uniform = rest.every((row) => row.openTime === first.openTime && row.closeTime === first.closeTime)
  const sorted = [...open].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))

  if (uniform && open.length === DAY_ORDER.length) {
    return `Mon – Sun: ${first.openTime} – ${first.closeTime}`
  }
  if (uniform) {
    return `${sorted[0].day.slice(0, 3)} – ${sorted[sorted.length - 1].day.slice(0, 3)}: ${first.openTime} – ${first.closeTime}`
  }
  return `${sorted[0].day}: ${sorted[0].openTime} – ${sorted[0].closeTime}`
}

/**
 * Groups a full weekly hours array into consecutive-day ranges (e.g. "Monday – Thursday: 12:00 PM
 * – 10:30 PM"), matching the Visit Us section's exact 3-line hours format. Unlike
 * formatHoursSummary (a single collapsed line for the header/footer), this preserves every
 * distinct shift rather than falling back to just the first one.
 */
export function groupBusinessHours(hours: ZuruZuruHoursRowData[]): string[] {
  const sorted = [...hours]
    .filter((row) => row.day)
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))

  const groups: { closeTime: string; days: string[]; isClosed: boolean; openTime: string }[] = []
  for (const row of sorted) {
    const last = groups[groups.length - 1]
    if (last && last.openTime === row.openTime && last.closeTime === row.closeTime && last.isClosed === row.isClosed) {
      last.days.push(row.day)
    } else {
      groups.push({ closeTime: row.closeTime, days: [row.day], isClosed: row.isClosed, openTime: row.openTime })
    }
  }

  return groups.map((group) => {
    const label = group.days.length > 1
      ? `${group.days[0]} – ${group.days[group.days.length - 1]}`
      : group.days[0]
    return group.isClosed ? `${label}: Closed` : `${label}: ${group.openTime} – ${group.closeTime}`
  })
}
