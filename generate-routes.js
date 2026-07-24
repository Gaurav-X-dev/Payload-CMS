const fs = require('fs');
const path = require('path');

const createDir = (dir) => {
  const p = path.join(__dirname, 'src', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

createDir('app/(app)/menu');
createDir('app/(app)/blog/[slug]');
createDir('providers');

const menuPage = `import React from 'react'
import { headers } from 'next/headers'
import { Header } from '../../../components/layout/Header'
import { Footer } from '../../../components/layout/Footer'

export default async function MenuPage() {
  const headersList = await headers()
  const tenantConfigStr = headersList.get('x-tenant-config')
  const tenantConfig = tenantConfigStr ? JSON.parse(tenantConfigStr) : null
  
  if (!tenantConfig?.features?.enableMenu) {
    return <div>Menu is disabled for this tenant.</div>
  }

  return (
    <div className="page-wrapper" data-tenant={tenantConfig?.slug}>
      <Header tenant={tenantConfig} />
      <main>
        <section className="menu-container">
          <h1>Our Menu</h1>
          {/* Menu implementation goes here */}
        </section>
      </main>
      <Footer tenant={tenantConfig} />
    </div>
  )
}
`;

const blogListPage = `import React from 'react'
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
`;

const blogDetailPage = `import React from 'react'
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
`;

const tenantProvider = `'use client'

import React, { createContext, useContext } from 'react'

const TenantContext = createContext<any>(null)

export const TenantProvider: React.FC<{
  tenant: any
  children: React.ReactNode
}> = ({ tenant, children }) => {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => useContext(TenantContext)
`;

fs.writeFileSync(path.join(__dirname, 'src', 'app', '(app)', 'menu', 'page.tsx'), menuPage);
fs.writeFileSync(path.join(__dirname, 'src', 'app', '(app)', 'blog', 'page.tsx'), blogListPage);
fs.writeFileSync(path.join(__dirname, 'src', 'app', '(app)', 'blog', '[slug]', 'page.tsx'), blogDetailPage);
fs.writeFileSync(path.join(__dirname, 'src', 'providers', 'TenantProvider.tsx'), tenantProvider);

console.log('Routes and providers created successfully.');
