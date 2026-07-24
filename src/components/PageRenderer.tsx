import React from 'react'
import { Header } from './layout/Header'
import { Footer } from './layout/Footer'
import { BlockRenderer } from './BlockRenderer'

export const PageRenderer: React.FC<{ page: any, tenant: any }> = ({ page, tenant }) => {
  return (
    <div className="page-wrapper" data-tenant={tenant?.slug}>
      <Header tenant={tenant} />
      <main>
        {page?.layout && <BlockRenderer blocks={page.layout} />}
      </main>
      <Footer tenant={tenant} />
    </div>
  )
}
