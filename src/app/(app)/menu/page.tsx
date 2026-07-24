import React from 'react'
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
