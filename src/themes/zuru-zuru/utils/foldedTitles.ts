/**
 * Milestone Z9 — design-parity fixes. Several original card titles were folded together with a
 * subtitle/meta value at seed time because no dedicated field existed for the second piece
 * (Milestones Z4/Z5/Z7). Each function here splits one of those known, consistently-formatted
 * strings back apart for display, restoring the original's separate styled slot without any
 * schema change. Kept in one plain (non-JSX) module so the split logic is independently testable.
 */

/** Menu items: "English Name · Japanese Name" (Milestone Z4) -> MenuBrowser's separate `japanese` slot. Splits on the first " · ". */
export function splitDishName(title: string): { japanese: string; name: string } {
  const separatorIndex = title.indexOf(' · ')
  if (separatorIndex === -1) return { japanese: '', name: title }
  return { japanese: title.slice(separatorIndex + 3), name: title.slice(0, separatorIndex) }
}

/** Home's Seasonal Collections: "Spring · 春 · Sakura" (Milestone Z3) -> a separate `<small>` poetic name. Splits on the LAST " · " (the season+kanji portion itself contains one). */
export function splitSeasonTitle(title: string): { name: string; season: string } {
  const lastSeparator = title.lastIndexOf(' · ')
  if (lastSeparator === -1) return { name: '', season: title }
  return { name: title.slice(lastSeparator + 3), season: title.slice(0, lastSeparator) }
}

/** Card grid titles ending in a trailing "(...)" meta (About's Philosophy pillars, Franchise's tiers, Private Dining's packages — Milestones Z5/Z7) -> a separate `zz-card-meta` span, parens stripped. */
const TRAILING_PAREN_META = /^(.+?)\s+\(([^()]+)\)$/

export function splitTitleMeta(title: string): { meta: string; title: string } {
  const match = TRAILING_PAREN_META.exec(title)
  return match ? { meta: match[2], title: match[1] } : { meta: '', title }
}

/** Location titles: "Name — Status" (Milestone Z7) -> a separate `zz-card-meta` status badge span. The flagship location (seeded before this convention existed, shared with Home/Contact) has no " — " and passes through unchanged. */
export function splitLocationBadge(title: string): { badge: string; name: string } {
  const separator = title.indexOf(' — ')
  if (separator === -1) return { badge: '', name: title }
  return { badge: title.slice(separator + 3), name: title.slice(0, separator) }
}

/**
 * The original italicizes the single word "Omotenashi" inline wherever it appears in Home's story
 * body (Milestone Z3); the plain-text `body` field can't carry inline emphasis. Returns the pieces
 * around each occurrence so the renderer can interleave `<em>` elements — kept JSX-free here so the
 * splitting logic itself is testable independent of React.
 */
export function splitOmotenashiEmphasis(text: string): string[] {
  return text.split(/(Omotenashi)/)
}

/**
 * The original's mobile menu isn't the full nav link list in order: `mobileNavigation` in
 * data/site.ts takes the desktop set minus its last item, inserts every mobile-only extra
 * (Private Dining/Events/Blog), then puts that last desktop item (Contact) at the very end.
 * Reproduces that generically from any CMS Nav list shaped like
 * `[...desktopLinkCount desktop links, ...mobile-only extras]`, so it isn't tied to today's
 * specific link labels.
 */
export function buildMobileNavOrder<T>(allLinks: T[], desktopLinkCount: number): T[] {
  const desktopLinks = allLinks.slice(0, desktopLinkCount)
  return [...desktopLinks.slice(0, -1), ...allLinks.slice(desktopLinkCount), ...desktopLinks.slice(-1)]
}
