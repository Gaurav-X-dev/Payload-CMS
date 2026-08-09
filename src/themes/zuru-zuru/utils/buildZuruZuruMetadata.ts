import type { Metadata } from 'next'
import type { ZuruZuruPageMetaData, ZuruZuruSEOData, ZuruZuruSiteData } from '../mappers/dynamicTypes'

/** Kept as the single source of truth for how a "robots" directive string turns into Next.js's structured `robots` metadata field. */
export function parseRobotsDirective(
  value: string,
  { noIndex = false }: { noIndex?: boolean } = {},
): Metadata['robots'] {
  if (noIndex) return { follow: true, index: false }
  const directive = value || 'index, follow'
  const [indexPart = 'index', followPart = 'follow'] = directive.split(',').map((part) => part.trim())
  return {
    follow: followPart !== 'nofollow',
    index: indexPart !== 'noindex',
  }
}

export function buildZuruZuruMetadata({
  hostname,
  page,
  pathname,
  seo,
  site,
}: {
  hostname: string
  page: ZuruZuruPageMetaData | null
  pathname: string
  seo: ZuruZuruSEOData
  site: ZuruZuruSiteData
}): Metadata {
  if (!page) return {}

  // A `metaTitle` is treated as the complete, final title an editor deliberately wrote (every
  // Zuru Zuru page's seeded metaTitle already ends in "— Zuru Zuru"), so it is used verbatim.
  // Only the raw fallback (the page's plain title, which never includes the brand name) is run
  // through the tenant's %s pattern — this avoids ever doubling the brand name.
  const title = page.metaTitle
    || (seo.titlePattern.includes('%s') && page.title ? seo.titlePattern.replace('%s', page.title) : page.title)
    || site.name
  const description = page.metaDescription || seo.description || site.description
  const image = page.metaImage || seo.ogImage
  const canonical = page.canonicalUrl || `https://${hostname}${pathname}`

  return {
    alternates: { canonical },
    description: description || undefined,
    icons: site.favicon ? { icon: site.favicon.src } : undefined,
    keywords: seo.keywords.length ? seo.keywords : undefined,
    openGraph: {
      description: seo.ogDescription || description || undefined,
      images: image ? [{ alt: image.alt, url: image.src }] : undefined,
      siteName: seo.ogSiteName || site.name || undefined,
      title: seo.ogTitle || title || undefined,
      type: 'website',
      url: canonical,
    },
    robots: parseRobotsDirective(seo.robots, { noIndex: page.noIndex }),
    title: title || undefined,
    twitter: {
      card: seo.twitterCard,
      creator: seo.twitterCreator || undefined,
      description: description || undefined,
      images: image ? [image.src] : undefined,
      site: seo.twitterSite || undefined,
      title: title || undefined,
    },
    verification: seo.googleSiteVerification || seo.bingSiteVerification
      ? {
          google: seo.googleSiteVerification || undefined,
          other: seo.bingSiteVerification ? { 'msvalidate.01': seo.bingSiteVerification } : undefined,
        }
      : undefined,
  }
}
