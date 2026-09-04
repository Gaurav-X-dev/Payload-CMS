import type { ReactNode } from 'react'
import { BackToTop } from '../components/BackToTop'
import { CustomCursor } from '../components/CustomCursor'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { NoiseOverlay } from '../components/NoiseOverlay'
import { PageLoader } from '../components/PageLoader'
import type { CuriousLadooFooterData, CuriousLadooNavigationData, CuriousLadooSiteData } from '../mappers/dynamicTypes'
import { serializeCuriousLadooJsonLd, type CuriousLadooJsonLdEntry } from '../utils/buildCuriousLadooJsonLd'
import styles from '../components/Theme.module.css'
import '../styles/theme.css'

/** CMS props are optional: pages not yet converted to CMS omit them and keep today's static chrome. */
export function CuriousHubLayout({
  children,
  footer,
  jsonLd,
  nav,
  pathname,
  site,
  tagline,
}: {
  children: ReactNode
  footer?: CuriousLadooFooterData
  jsonLd?: CuriousLadooJsonLdEntry[]
  nav?: CuriousLadooNavigationData
  pathname: string
  site?: CuriousLadooSiteData
  tagline?: string
}) {
  const jsonLdScript = jsonLd ? serializeCuriousLadooJsonLd(jsonLd) : null
  return (
    <>
      {/* See GheeRoastLayout.tsx for why this lives here rather than the shared root layout —
          scopes font loading to Curious Ladoo's own families (Inter, Playfair Display, Courier
          Prime, Cormorant Garamond, Noto Serif JP — all referenced as literal font-family
          strings throughout Theme.module.css, not via a CSS variable like the other 2 themes). */}
      <link href="https://fonts.googleapis.com/css2?family=Shrikhand&display=swap" rel="stylesheet" />
      <link href="https://api.fontshare.com/v2/css?f[]=open-sauce@300,400,500,600,700&display=swap" rel="stylesheet" />
      <div className={styles.themeRoot} data-theme-site="curious-hub">
        {jsonLdScript && <script dangerouslySetInnerHTML={{ __html: jsonLdScript }} type="application/ld+json" />}
        <NoiseOverlay />
        <CustomCursor />
        <PageLoader site={site} />
        <Header nav={nav} pathname={pathname} site={site} tagline={tagline} />
        <main>{children}</main>
        <Footer footer={footer} site={site} />
        <BackToTop />
      </div>
    </>
  )
}
