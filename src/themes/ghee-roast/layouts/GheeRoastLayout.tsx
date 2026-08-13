import type { CSSProperties, ReactNode } from 'react'
import { BackToTop } from '../components/BackToTop'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Newsletter } from '../components/Newsletter'
import type { GheeRoastDynamicContent } from '../dynamicTypes'
import styles from '../components/Theme.module.css'
import '../styles/theme.css'

export function GheeRoastLayout({
  children,
  content,
  pathname,
  showChrome = true,
  showNewsletter = true,
}: {
  children: ReactNode
  content: GheeRoastDynamicContent
  pathname: string
  showChrome?: boolean
  showNewsletter?: boolean
}) {
  const { footer, navigation, site } = content
  const themeStyle = {
    ...(site.theme.primaryColor ? { '--gr-primary': site.theme.primaryColor } : {}),
    ...(site.theme.accentColor ? { '--gr-accent': site.theme.accentColor } : {}),
    ...(site.theme.backgroundColor ? { '--gr-bg': site.theme.backgroundColor } : {}),
    ...(site.theme.headingFont ? { '--gr-heading': `'${site.theme.headingFont}', sans-serif` } : {}),
    ...(site.theme.bodyFont ? { '--gr-body': `'${site.theme.bodyFont}', sans-serif` } : {}),
    ...(site.theme.cardRadius ? { '--gr-card-radius': site.theme.cardRadius } : {}),
    ...(site.theme.headingTransform ? { '--gr-heading-transform': site.theme.headingTransform } : {}),
  } as CSSProperties
  const showAnnouncement = site.announcement.enabled && Boolean(site.announcement.text)
  const headerNavigation = {
    ...navigation,
    brandName: navigation.brandName || site.siteName,
    logo: navigation.logo || site.logo,
    tagline: navigation.tagline || site.tagline,
  }
  const jsonLd = content.seo.jsonLd
    ? JSON.stringify(content.seo.jsonLd).replace(/</g, '\\u003c')
    : null

  return (
    <>
      {/* Next.js hoists <link> elements found anywhere in the tree into the document <head> —
          rendering these here (rather than the shared root layout) means only Ghee Roast
          visitors download Ghee Roast's fonts (Oswald + Inter), not all 3 tenants' fonts. Same
          families/weights the site previously loaded from the shared link, just scoped. */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className={styles.themeRoot} data-theme-site="ghee-roast" style={themeStyle}>
        {jsonLd && <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />}
        {showChrome && showAnnouncement && <aside className={styles.announcementBar}>{site.announcement.text}</aside>}
        {showChrome && <Header hasAnnouncement={showAnnouncement} navigation={headerNavigation} pathname={pathname} />}
        <main>{children}</main>
        {showChrome && showNewsletter && <Newsletter override={site.newsletter} />}
        {showChrome && <Footer footer={footer} navigation={headerNavigation} site={site} />}
        {showChrome && <BackToTop />}
      </div>
    </>
  )
}
