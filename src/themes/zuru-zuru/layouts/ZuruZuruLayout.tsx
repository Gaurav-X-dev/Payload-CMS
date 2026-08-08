import type { ReactNode } from 'react'
import { Footer, Newsletter } from '../components/Footer'
import { Header } from '../components/Header'
import { BackToTop } from '../components/Interactive'
import type { ZuruZuruFooterData, ZuruZuruNavigationData, ZuruZuruSiteData } from '../mappers/dynamicTypes'

/** CMS props are optional: pages not yet converted to CMS (all of them, until Milestone Z3+)
 * omit them and the Header/Footer/Newsletter fall back to today's static chrome content. */
export function ZuruZuruLayout({
  children,
  footer,
  nav,
  pathname,
  site,
}: {
  children: ReactNode
  footer?: ZuruZuruFooterData
  nav?: ZuruZuruNavigationData
  pathname: string
  site?: ZuruZuruSiteData
}) {
  return (
    <div className="zuru-zuru-theme">
      <Header nav={nav} pathname={pathname} site={site} />
      <main>{children}</main>
      <Newsletter newsletter={site?.newsletter} />
      <Footer footer={footer} site={site} />
      <BackToTop />
    </div>
  )
}
