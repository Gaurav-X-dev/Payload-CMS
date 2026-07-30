import type { Metadata } from 'next'
import type { GheeRoastContentResult } from '../../../lib/site/gheeRoastContentCore'
import type { PageMetadataData } from '../types'

export function buildGheeRoastMetadata({
  content,
  registeredMetadata,
}: {
  content: GheeRoastContentResult
  registeredMetadata?: PageMetadataData
}): Metadata {
  if (
    content.tenantState === 'inactive'
    || content.tenantState === 'missing'
    || (!content.page && !registeredMetadata)
  ) {
    return {}
  }

  const page = content.page
  const baseTitle = page?.metaTitle
    || page?.title
    || registeredMetadata?.title
    || content.site.siteName
  const title = content.seo.titlePattern?.includes('%s')
    ? content.seo.titlePattern.replace('%s', baseTitle)
    : baseTitle
  const description = page?.metaDescription
    || registeredMetadata?.description
    || content.seo.description
    || content.site.description
  const image = page?.metaImage || content.seo.ogImage
  const robotsValue = page?.noIndex
    ? 'noindex, follow'
    : content.seo.robots || 'index, follow'
  const [robotsIndex = 'index', robotsFollow = 'follow'] = robotsValue
    .split(',')
    .map((value) => value.trim())

  return {
    alternates: {
      canonical: page?.canonicalUrl || content.seo.canonicalUrl,
    },
    description,
    openGraph: {
      description: content.seo.ogDescription || description,
      images: image ? [{ alt: image.alt, url: image.src }] : undefined,
      siteName: content.seo.ogSiteName || content.site.siteName,
      title: content.seo.ogTitle || title,
      type: 'website',
    },
    robots: {
      follow: robotsFollow !== 'nofollow',
      index: robotsIndex !== 'noindex',
    },
    title,
    twitter: {
      card: content.seo.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
      creator: content.seo.twitterCreator,
      description,
      images: image ? [image.src] : undefined,
      site: content.seo.twitterSite,
      title,
    },
  }
}
