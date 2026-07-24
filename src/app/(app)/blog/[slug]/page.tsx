import React from 'react'
import { headers } from 'next/headers'
import { Header } from '../../../../components/layout/Header'
import { Footer } from '../../../../components/layout/Footer'
import { notFound } from 'next/navigation'

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const headersList = await headers()
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
