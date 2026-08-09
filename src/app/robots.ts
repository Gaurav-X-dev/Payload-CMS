import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import configPromise from '@payload-config'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'

/**
 * Curious Ladoo and Zuru Zuru (Milestone Z8) get a real sitemap reference and their own host in
 * the rule set. Ghee Roast and any unresolved host get the same universal "disallow /admin" rule
 * with no sitemap reference — sensible crawler hygiene that applies regardless of tenant, not new
 * tenant-specific behavior, and this route previously 404'd for every host, so nothing here
 * removes or repurposes anything Ghee Roast already had.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const site = resolveLocalSite(host)

  if (site && site.theme === 'curious-hub') {
    return {
      rules: { allow: '/', disallow: '/admin', userAgent: '*' },
      sitemap: `https://${site.hostname}/sitemap.xml`,
    }
  }

  if (site && site.theme === 'zuru-zuru') {
    return zuruZuruRobots(site)
  }

  return {
    rules: { allow: '/', disallow: '/admin', userAgent: '*' },
  }
}

/**
 * Milestone Z8. If the tenant's site-wide SEO document is configured to noindex everything,
 * robots.txt disallows the whole site instead of just the admin panel — otherwise (the default,
 * and today's actual configuration), the standard "disallow /admin" rule applies with a real
 * sitemap reference.
 */
async function zuruZuruRobots(site: { hostname: string; key: string }): Promise<MetadataRoute.Robots> {
  const payload = await getPayload({ config: configPromise })
  const tenantResult = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: site.key } },
  })
  const tenantID = tenantResult.docs[0]?.id

  const seoResult = tenantID
    ? await payload.find({
        collection: 'seo',
        depth: 0,
        limit: 2,
        overrideAccess: true,
        pagination: false,
        where: { tenantId: { equals: tenantID } },
      })
    : { docs: [] }
  const siteWideRobots = seoResult.docs[0]?.robots ?? ''
  const siteWideNoIndex = siteWideRobots.startsWith('noindex')

  return {
    rules: siteWideNoIndex
      ? { disallow: '/', userAgent: '*' }
      : { allow: '/', disallow: '/admin', userAgent: '*' },
    sitemap: `https://${site.hostname}/sitemap.xml`,
  }
}
