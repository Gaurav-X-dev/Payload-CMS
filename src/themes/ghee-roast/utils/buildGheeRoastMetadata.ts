import type { Metadata } from 'next'
import type { GheeRoastContentResult } from '../../../lib/site/gheeRoastContentCore'

export function buildGheeRoastMetadata({
  content,
}: {
  content: GheeRoastContentResult
}): Metadata {
  if (
    content.tenantState === 'inactive'
    || content.tenantState === 'missing'
  ) {
    return {}
  }

  const page = content.page
  const baseTitle = page?.metaTitle
    || page?.title
    || content.site.siteName
  const title = content.seo.titlePattern?.includes('%s') && baseTitle
    ? content.seo.titlePattern.replace('%s', baseTitle)
    : baseTitle
  const description = page?.metaDescription
    || content.seo.description
    || content.site.description
  const image = page?.metaImage || content.seo.ogImage
  const canonical = page?.canonicalUrl || content.seo.canonicalUrl
  const robotsValue = !page || page.noIndex
    ? 'noindex, follow'
    : content.seo.robots || 'index, follow'
  const [robotsIndex = 'index', robotsFollow = 'follow'] = robotsValue
    .split(',')
    .map((value) => value.trim())

  return {
    alternates: canonical ? { canonical } : undefined,
    description: description || undefined,
    icons: content.site.favicon ? { icon: content.site.favicon.src } : undefined,
    keywords: content.seo.keywords?.length ? content.seo.keywords : undefined,
    openGraph: {
      description: content.seo.ogDescription || description || undefined,
      images: image ? [{ alt: image.alt, url: image.src }] : undefined,
      siteName: content.seo.ogSiteName || content.site.siteName || undefined,
      title: content.seo.ogTitle || title || undefined,
      type: 'website',
    },
    robots: {
      follow: robotsFollow !== 'nofollow',
      index: robotsIndex !== 'noindex',
    },
    title: title || undefined,
    twitter: {
      card: content.seo.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
      creator: content.seo.twitterCreator,
      description: description || undefined,
      images: image ? [image.src] : undefined,
      site: content.seo.twitterSite,
      title: title || undefined,
    },
    verification: content.seo.googleSiteVerification || content.seo.bingSiteVerification
      ? {
          google: content.seo.googleSiteVerification,
          other: content.seo.bingSiteVerification
            ? { 'msvalidate.01': content.seo.bingSiteVerification }
            : undefined,
        }
      : undefined,
  }
}
