import type { ReactNode } from 'react'
import { BackToTop } from '../components/BackToTop'
import { CustomCursor } from '../components/CustomCursor'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { NoiseOverlay } from '../components/NoiseOverlay'
import { PageLoader } from '../components/PageLoader'
import type { CuriousLadooFooterData, CuriousLadooNavigationData, CuriousLadooSiteData } from '../mappers/dynamicTypes'
import styles from '../components/Theme.module.css'
import '../styles/theme.css'

/** CMS props are optional: pages not yet converted to CMS omit them and keep today's static chrome. */
export function CuriousHubLayout({
  children,
  footer,
  nav,
  pathname,
  site,
  tagline,
}: {
  children: ReactNode
  footer?: CuriousLadooFooterData
  nav?: CuriousLadooNavigationData
  pathname: string
  site?: CuriousLadooSiteData
  tagline?: string
}) {
  return (
    <div className={styles.themeRoot} data-theme-site="curious-hub">
      <NoiseOverlay />
      <CustomCursor />
      <PageLoader />
      <Header nav={nav} pathname={pathname} tagline={tagline} />
      <main>{children}</main>
      <Footer footer={footer} site={site} />
      <BackToTop />
    </div>
  )
}
