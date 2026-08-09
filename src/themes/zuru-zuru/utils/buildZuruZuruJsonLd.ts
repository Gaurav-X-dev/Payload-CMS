export type ZuruZuruJsonLdEntry = Record<string, unknown>

/** A single "Home" crumb alone isn't a meaningful breadcrumb trail, so it's dropped rather than rendered. */
export function buildZuruZuruBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): ZuruZuruJsonLdEntry | null {
  if (items.length < 2) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      item: item.url,
      name: item.name,
      position: index + 1,
    })),
  }
}

/** Merges any number of JSON-LD entries (Restaurant, Breadcrumb, ...) into one array, dropping null/undefined pieces — the single place every Zuru Zuru route combines its structured data before rendering exactly one <script> tag. */
export function combineZuruZuruJsonLd(
  ...entries: (ZuruZuruJsonLdEntry | ZuruZuruJsonLdEntry[] | null | undefined)[]
): ZuruZuruJsonLdEntry[] {
  return entries.flatMap((entry) => (Array.isArray(entry) ? entry : entry ? [entry] : []))
}

/** Matches Ghee Roast's/Curious Ladoo's layout serialization exactly: escapes `<` so a value containing `</script>` can never break out of the tag. */
export function serializeZuruZuruJsonLd(entries: ZuruZuruJsonLdEntry[]): string | null {
  if (entries.length === 0) return null
  const payload = entries.length === 1 ? entries[0] : entries
  return JSON.stringify(payload).replace(/</g, '\\u003c')
}
