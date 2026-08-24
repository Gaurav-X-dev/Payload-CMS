import type { ReactNode } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { BackToTop } from '../components/Interactive'
import { Newsletter } from '../components/Newsletter'
import { PageLoader } from '../components/PageLoader'
import type { ZuruZuruFooterData, ZuruZuruNavigationData, ZuruZuruSiteData } from '../mappers/dynamicTypes'
import { serializeZuruZuruJsonLd, type ZuruZuruJsonLdEntry } from '../utils/buildZuruZuruJsonLd'
import '../styles/theme.css'

/** CMS props are optional: pages not yet converted to CMS (all of them, until Milestone Z3+)
 * omit them and the Header/Footer/Newsletter fall back to today's static chrome content. */
export function ZuruZuruLayout({
  children,
  footer,
  jsonLd,
  nav,
  pathname,
  site,
}: {
  children: ReactNode
  footer?: ZuruZuruFooterData
  jsonLd?: ZuruZuruJsonLdEntry[]
  nav?: ZuruZuruNavigationData
  pathname: string
  site?: ZuruZuruSiteData
}) {
  const jsonLdScript = jsonLd ? serializeZuruZuruJsonLd(jsonLd) : null
  return (
    <>
      {/* See GheeRoastLayout.tsx for why this lives here rather than the shared root layout —
          scopes font loading to Zuru Zuru's own families (Playfair Display, Inter, Noto Serif JP). */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Serif+JP:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="zuru-zuru-theme">
        {jsonLdScript && <script dangerouslySetInnerHTML={{ __html: jsonLdScript }} type="application/ld+json" />}
        <PageLoader />
        <Header nav={nav} pathname={pathname} site={site} />
        <main>{children}</main>
        <Newsletter newsletter={site?.newsletter} />
        <Footer footer={footer} site={site} />
        <BackToTop />
      </div>
    </>
  )
}
