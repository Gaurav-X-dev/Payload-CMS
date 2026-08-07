import type { Metadata } from 'next'
import React from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { Header } from '../../../../components/layout/Header'
import { Footer } from '../../../../components/layout/Footer'
import { getCuriousLadooBlogPost } from '@/lib/site/getCuriousLadooBlogPost'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'
import { CuriousHubLayout } from '@/themes/curious-hub/layouts/CuriousHubLayout'
import { BlogPostPage } from '@/themes/curious-hub/components/BlogPostPage'
import { mapCuriousLadooBlogPost } from '@/themes/curious-hub/mappers/cmsContent'
import {
  buildCuriousLadooBlogPostJsonLd,
  buildCuriousLadooBlogPostMetadata,
} from '@/themes/curious-hub/utils/buildCuriousLadooBlogPostMetadata'

type BlogDetailRouteProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BlogDetailRouteProps): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const host = headersList.get('host')
  const site = resolveLocalSite(host)
  if (!site || site.theme !== 'curious-hub') return {}

  const content = await getCuriousLadooBlogPost({ host, site, slug })
  return buildCuriousLadooBlogPostMetadata({ content, hostname: site.hostname })
}

export default async function BlogDetailPage({
  params,
}: BlogDetailRouteProps) {
  const { slug } = await params
  const headersList = await headers()
  const host = headersList.get('host')
  const site = resolveLocalSite(host)

  if (site) {
    if (site.theme !== 'curious-hub') notFound()

    const content = await getCuriousLadooBlogPost({ host, site, slug })
    const mapped = mapCuriousLadooBlogPost(content)
    // No published post exists for this slug/tenant, or the tenant is inactive/missing: fail
    // closed rather than guess across tenants.
    if (!mapped.post) notFound()

    const jsonLd = buildCuriousLadooBlogPostJsonLd({ content, hostname: site.hostname })

    return (
      <CuriousHubLayout
        footer={mapped.footer}
        jsonLd={jsonLd}
        nav={mapped.navigation}
        pathname={`/blog/${slug}`}
        site={mapped.site}
        tagline={mapped.site.tagline}
      >
        <BlogPostPage post={mapped.post} />
      </CuriousHubLayout>
    )
  }

  const tenantConfigStr = headersList.get('x-tenant-config')
  const tenantConfig = tenantConfigStr ? JSON.parse(tenantConfigStr) : null

  if (!tenantConfig?.features?.enableBlog) {
    notFound()
  }

  return (
    <div className="page-wrapper" data-tenant={tenantConfig?.slug}>
      <Header tenant={tenantConfig} />
      <main>
        <article className="blog-article">
          <h1>Blog Post: {slug}</h1>
          {/* Blog detail implementation goes here */}
        </article>
      </main>
      <Footer tenant={tenantConfig} />
    </div>
  )
}
