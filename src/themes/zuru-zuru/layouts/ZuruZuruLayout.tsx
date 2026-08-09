import type { ReactNode } from 'react'
import { Footer, Newsletter } from '../components/Footer'
import { Header } from '../components/Header'
import { BackToTop } from '../components/Interactive'
import type { ZuruZuruFooterData, ZuruZuruNavigationData, ZuruZuruSiteData } from '../mappers/dynamicTypes'
import { serializeZuruZuruJsonLd, type ZuruZuruJsonLdEntry } from '../utils/buildZuruZuruJsonLd'

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
    <div className="zuru-zuru-theme">
      {jsonLdScript && <script dangerouslySetInnerHTML={{ __html: jsonLdScript }} type="application/ld+json" />}
      <Header nav={nav} pathname={pathname} site={site} />
      <main>{children}</main>
      <Newsletter newsletter={site?.newsletter} />
      <Footer footer={footer} site={site} />
      <BackToTop />
    </div>
  )
}
