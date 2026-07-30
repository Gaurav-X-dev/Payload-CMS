import type { CSSProperties, ReactNode } from 'react'
import { BackToTop } from '../components/BackToTop'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Newsletter } from '../components/Newsletter'
import type { GheeRoastDynamicContent } from '../dynamicTypes'
import styles from '../components/Theme.module.css'

export function GheeRoastLayout({
  children,
  content,
  pathname,
  showNewsletter = true,
}: {
  children: ReactNode
  content: GheeRoastDynamicContent
  pathname: string
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

  return (
    <div className={styles.themeRoot} data-theme-site="ghee-roast" style={themeStyle}>
      {showAnnouncement && <aside className={styles.announcementBar}>{site.announcement.text}</aside>}
      <Header hasAnnouncement={showAnnouncement} navigation={headerNavigation} pathname={pathname} />
      <main>{children}</main>
      {showNewsletter && <Newsletter override={site.newsletter} />}
      <Footer footer={footer} site={site} />
      <BackToTop />
    </div>
  )
}
