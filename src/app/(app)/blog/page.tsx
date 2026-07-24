import React from 'react'
import { headers } from 'next/headers'
import { Header } from '../../../components/layout/Header'
import { Footer } from '../../../components/layout/Footer'

export default async function BlogListPage() {
  const headersList = await headers()
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
