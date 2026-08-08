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
