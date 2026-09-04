'use client'

import { useEffect, useState } from 'react'
import styles from './Theme.module.css'
import { BrandMark } from './BrandMark'

export function PageLoader() {
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
      <BrandMark className={styles.loaderBrandMark} />
      <div className={styles.loaderSubtitle}>Curious Ladoo</div>
      <div className={styles.loaderBar} />
    </div>
  )
}
