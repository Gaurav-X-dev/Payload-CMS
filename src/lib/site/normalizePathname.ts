// Single, shared path-normalization strategy — previously duplicated (with subtly different
// behavior) across all 3 themes' own utils/normalizePathname.ts. Ghee Roast's and Curious Hub's
// copies were byte-identical to each other but did NOT strip query strings/hash fragments;
// Zuru Zuru's copy did. This adopts Zuru Zuru's more complete behavior as the one standard,
// since every call site across all 3 themes uses the result purely as a route/content identity
// key (never to read query params — that's Next.js's separate `searchParams`), so stripping an
// incidental query string is strictly more correct everywhere, not a behavior regression.
//
// Used directly by the P7 cache-key builders (getGheeRoastContent.ts, getCuriousLadooContent.ts,
// getZuruZuruPageContent.ts) so that e.g. `/menu`, `menu`, `/menu/`, `//menu`, and
// `/menu?ref=ad` all resolve to the same cache entry instead of fragmenting it.
export function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname || pathname === '/') return '/'
  const withoutQueryOrHash = pathname.split('?')[0]!.split('#')[0]!
  const segments = withoutQueryOrHash.split('/').filter(Boolean)
  if (segments.length === 0) return '/'
  return `/${segments.join('/')}`
}
