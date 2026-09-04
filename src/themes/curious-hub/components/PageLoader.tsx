'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { CuriousLadooSiteData } from '../mappers/dynamicTypes'
import styles from './Theme.module.css'
import { BrandMark } from './BrandMark'

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
      {site?.logo?.src ? (
        <Image
          alt={site.logo.alt || 'Curious Ladoo logo'}
          className={styles.loaderLogoImg}
          height={150}
          priority
          sizes="150px"
          src={site.logo.src}
          width={150}
        />
      ) : (
        <BrandMark className={styles.loaderBrandMark} />
      )}
      <div className={styles.loaderSubtitle}>Curious Ladoo</div>
      <div className={styles.loaderBar} />
    </div>
  )
}
