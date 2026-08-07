export type CuriousLadooJsonLdEntry = Record<string, unknown>

/** A single "Home" crumb alone isn't a meaningful breadcrumb trail, so it's dropped rather than rendered. */
export function buildCuriousLadooBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): CuriousLadooJsonLdEntry | null {
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

/** Merges any number of JSON-LD entries (Organization, Breadcrumb, Article, ...) into one array, dropping null/undefined pieces — the single place every Curious Ladoo route combines its structured data before rendering exactly one <script> tag. */
export function combineCuriousLadooJsonLd(
  ...entries: (CuriousLadooJsonLdEntry | CuriousLadooJsonLdEntry[] | null | undefined)[]
): CuriousLadooJsonLdEntry[] {
  return entries.flatMap((entry) => (Array.isArray(entry) ? entry : entry ? [entry] : []))
}

/** Matches Ghee Roast's GheeRoastLayout.tsx serialization exactly: escapes `<` so a value containing `</script>` can never break out of the tag. */
export function serializeCuriousLadooJsonLd(entries: CuriousLadooJsonLdEntry[]): string | null {
  if (entries.length === 0) return null
  const payload = entries.length === 1 ? entries[0] : entries
  return JSON.stringify(payload).replace(/</g, '\\u003c')
}
