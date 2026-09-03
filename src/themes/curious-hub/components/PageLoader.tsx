'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { CuriousLadooSiteData } from '../mappers/dynamicTypes'
import styles from './Theme.module.css'

export function PageLoader({ site }: { site?: CuriousLadooSiteData }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true)
      document.body.style.overflowY = 'auto'
    }, 2200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      aria-label="Loading"
      className={`${styles.pageLoader} ${loaded ? styles.pageLoaderLoaded : ''}`}
      role="status"
    >
      {site?.logo ? (
        <Image alt={site.logo.alt} className={styles.loaderLogoImg} height={150} priority src={site.logo.src} width={150} />
      ) : (
        <div className={styles.loaderLogo}>
          C<span>L</span>
        </div>
      )}
      <div className={styles.loaderSubtitle}>Curious Ladoo</div>
      <div className={styles.loaderBar} />
    </div>
  )
}
