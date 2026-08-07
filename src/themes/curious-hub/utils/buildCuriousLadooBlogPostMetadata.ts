import type { Metadata } from 'next'
import type { CuriousLadooBlogPostResult } from '../../../lib/site/getCuriousLadooBlogPost'
import { mapCuriousLadooBlogPost } from '../mappers/cmsContent'
import {
  buildCuriousLadooBreadcrumbJsonLd,
  combineCuriousLadooJsonLd,
  type CuriousLadooJsonLdEntry,
} from './buildCuriousLadooJsonLd'
import { parseRobotsDirective } from './buildCuriousLadooMetadata'

export function buildCuriousLadooBlogPostMetadata({
  content,
  hostname,
}: {
  content: CuriousLadooBlogPostResult
  hostname: string
}): Metadata {
  if (content.tenantState !== 'active' || !content.post) return {}

  const { post, seo, site } = mapCuriousLadooBlogPost(content)
  if (!post) return {}

  const canonical = `https://${hostname}/blog/${post.slug}`
  const image = post.metaImage || post.coverImage

  return {
    alternates: { canonical },
    description: post.metaDescription || undefined,
    icons: site.favicon ? { icon: site.favicon.src } : undefined,
    keywords: post.tags.length ? post.tags : undefined,
    openGraph: {
      authors: post.authorName || undefined,
      description: post.metaDescription || undefined,
      images: image ? [{ alt: image.alt, url: image.src }] : undefined,
      modifiedTime: post.modifiedDate || undefined,
      publishedTime: post.publishedDateISO || undefined,
      siteName: seo.ogSiteName || site.name || undefined,
      tags: post.tags.length ? post.tags : undefined,
      title: post.metaTitle || undefined,
      type: 'article',
      url: canonical,
    },
    robots: parseRobotsDirective(seo.robots),
    title: post.metaTitle || undefined,
    twitter: {
      card: seo.twitterCard,
      creator: seo.twitterCreator || undefined,
      description: post.metaDescription || undefined,
      images: image ? [image.src] : undefined,
      site: seo.twitterSite || undefined,
      title: post.metaTitle || undefined,
    },
  }
}

/**
 * Returns the raw JSON-LD entries (Article/BlogPosting + Breadcrumb) rather than a serialized
 * string — the detail route combines these with any other entries and renders them through
 * CuriousHubLayout's single `jsonLd` prop, the same path every Page-based route uses, instead of
 * maintaining a second ad-hoc <script> rendering site.
 */
export function buildCuriousLadooBlogPostJsonLd({
  content,
  hostname,
}: {
  content: CuriousLadooBlogPostResult
  hostname: string
}): CuriousLadooJsonLdEntry[] {
  if (content.tenantState !== 'active' || !content.post) return []

  const { post, site } = mapCuriousLadooBlogPost(content)
  if (!post) return []

  const canonical = `https://${hostname}/blog/${post.slug}`
  const image = post.metaImage || post.coverImage

  const article: CuriousLadooJsonLdEntry = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    author: post.authorName ? { '@type': 'Person', name: post.authorName } : undefined,
    dateModified: post.modifiedDate || post.publishedDateISO || undefined,
    datePublished: post.publishedDateISO || undefined,
    description: post.metaDescription || undefined,
    headline: post.title,
    image: image ? [image.src] : undefined,
    keywords: post.tags.length ? post.tags.join(', ') : undefined,
    mainEntityOfPage: canonical,
    publisher: site.name ? { '@type': 'Organization', name: site.name } : undefined,
  }

  const breadcrumb = buildCuriousLadooBreadcrumbJsonLd([
    { name: 'Home', url: `https://${hostname}/` },
    { name: 'Journal', url: `https://${hostname}/blog` },
    { name: post.title, url: canonical },
  ])

  return combineCuriousLadooJsonLd(article, breadcrumb)
}
