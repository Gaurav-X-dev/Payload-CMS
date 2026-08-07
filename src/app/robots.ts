import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'

/**
 * Curious Ladoo gets a real sitemap reference and its own host in the rule set, per this
 * milestone's scope. Every other host (Ghee Roast, Zuru Zuru, unresolved) gets the same
 * universal "disallow /admin" rule with no sitemap reference — sensible crawler hygiene that
 * applies regardless of tenant, not new tenant-specific behavior, and this route previously
 * 404'd for every host, so nothing here removes or repurposes anything Ghee Roast/Zuru Zuru
 * already had.
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

  return {
    rules: { allow: '/', disallow: '/admin', userAgent: '*' },
  }
}
