'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { ZuruZuruSiteData } from '../mappers/dynamicTypes'

export function PageLoader({ site }: { site?: ZuruZuruSiteData }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      aria-label="Loading"
      className={`zz-page-loader ${loaded ? 'zz-page-loader-loaded' : ''}`}
      role="status"
    >
      {site?.logo ? (
        <Image alt={site.logo.alt} className="zz-loader-logo-img" height={90} priority src={site.logo.src} width={90} />
      ) : (
        <div className="zz-loader-logo">
          Zuru<span>ズル</span>
        </div>
      )}
      <div className="zz-loader-subtitle">A Ramen Diner</div>
      <div className="zz-loader-bar" />
    </div>
  )
}
