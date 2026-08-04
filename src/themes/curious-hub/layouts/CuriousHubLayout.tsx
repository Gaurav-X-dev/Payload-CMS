import type { ReactNode } from 'react'
import { BackToTop } from '../components/BackToTop'
import { CustomCursor } from '../components/CustomCursor'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { NoiseOverlay } from '../components/NoiseOverlay'
import { PageLoader } from '../components/PageLoader'
import styles from '../components/Theme.module.css'
import '../styles/theme.css'

export function CuriousHubLayout({
  children,
  pathname,
}: {
  children: ReactNode
  pathname: string
}) {
  return (
    <div className={styles.themeRoot} data-theme-site="curious-hub">
      <NoiseOverlay />
      <CustomCursor />
      <PageLoader />
      <Header pathname={pathname} />
      <main>{children}</main>
      <Footer />
      <BackToTop />
    </div>
  )
}
