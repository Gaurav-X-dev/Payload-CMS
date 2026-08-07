import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'
import type { BlogPost, Page } from '@/payload-types'

/**
 * Curious Ladoo only, per this milestone's scope. Ghee Roast and Zuru Zuru hosts (and any
 * unresolvable host) get an empty sitemap rather than a 404 — Next.js's file-convention route
 * always returns a valid (possibly empty) sitemap.xml, and this route is shared infrastructure
 * we don't want to remove or repurpose for the other two tenants.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const site = resolveLocalSite(host)
  if (!site || site.theme !== 'curious-hub') return []

  const payload = await getPayload({ config: configPromise })

  const tenantResult = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: site.key } },
  })
  const tenant = tenantResult.docs[0]
  if (!tenant || tenant.isActive === false) return []
  const tenantID = tenant.id

  const [pagesResult, postsResult] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: { and: [{ tenantId: { equals: tenantID } }, { _status: { equals: 'published' } }] },
    }),
    payload.find({
      collection: 'blog-posts',
      depth: 0,
      limit: 200,
      overrideAccess: true,
      pagination: false,
      where: { and: [{ tenantId: { equals: tenantID } }, { status: { equals: 'published' } }] },
    }),
  ])

  const origin = `https://${site.hostname}`
  const pageEntries: MetadataRoute.Sitemap = (pagesResult.docs as Page[]).map((page) => ({
    changeFrequency: page.isHomePage ? 'weekly' : 'monthly',
    lastModified: page.updatedAt ? new Date(page.updatedAt) : undefined,
    priority: page.isHomePage ? 1 : page.slug === 'blog' ? 0.7 : 0.8,
    url: page.isHomePage ? origin : `${origin}/${page.slug}`,
  }))
  const postEntries: MetadataRoute.Sitemap = (postsResult.docs as BlogPost[]).map((post) => ({
    changeFrequency: 'monthly',
    lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
    priority: 0.6,
    url: `${origin}/blog/${post.slug}`,
  }))

  return [...pageEntries, ...postEntries]
}
