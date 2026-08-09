import type { Metadata } from 'next'
import React from 'react'
import { headers } from 'next/headers'
import { Header } from '../../../components/layout/Header'
import { Footer } from '../../../components/layout/Footer'
import { getZuruZuruMetadata } from '@/lib/site/getZuruZuruMetadata'
import { renderLocalThemePage } from '@/lib/site/renderLocalThemePage'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'

/**
 * Curious Ladoo and Ghee Roast previously had no `generateMetadata` here at all (metadata fully
 * inherited from the root layout) — returning `{}` for every other theme preserves that exact
 * behavior. Only Zuru Zuru (Milestone Z8) gets real metadata from this route.
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host')
  const site = resolveLocalSite(host)
  if (site?.theme === 'zuru-zuru') {
    return getZuruZuruMetadata({ host, pathname: '/blog', site })
  }
  return {}
}

export default async function BlogListPage() {
  const headersList = await headers()
  const localSite = resolveLocalSite(headersList.get('host'))

  if (localSite) {
    return renderLocalThemePage('/blog')
  }

  const tenantConfigStr = headersList.get('x-tenant-config')
  const tenantConfig = tenantConfigStr ? JSON.parse(tenantConfigStr) : null
  
  if (!tenantConfig?.features?.enableBlog) {
    return <div>Blog is disabled for this tenant.</div>
  }

  return (
    <div className="page-wrapper" data-tenant={tenantConfig?.slug}>
      <Header tenant={tenantConfig} />
      <main>
        <section className="blog-container">
          <h1>Latest Updates</h1>
          {/* Blog listing implementation goes here */}
        </section>
      </main>
      <Footer tenant={tenantConfig} />
    </div>
  )
}
