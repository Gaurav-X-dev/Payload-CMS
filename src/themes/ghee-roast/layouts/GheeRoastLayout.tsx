import type { ReactNode } from 'react'
import { BackToTop } from '../components/BackToTop'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Newsletter } from '../components/Newsletter'
import styles from '../components/Theme.module.css'

export function GheeRoastLayout({
  children,
  pathname,
  showNewsletter = true,
}: {
  children: ReactNode
  pathname: string
  showNewsletter?: boolean
}) {
  return (
    <div className={styles.themeRoot} data-theme-site="ghee-roast">
      <Header pathname={pathname} />
      <main>{children}</main>
      {showNewsletter && <Newsletter />}
      <Footer />
      <BackToTop />
    </div>
  )
}
