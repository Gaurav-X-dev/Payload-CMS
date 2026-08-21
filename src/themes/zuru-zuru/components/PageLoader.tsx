'use client'

import { useEffect, useState } from 'react'

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
      className={`zz-page-loader ${loaded ? 'zz-page-loader-loaded' : ''}`}
      role="status"
    >
      <div className="zz-loader-logo">
        Zuru<span>ズル</span>
      </div>
      <div className="zz-loader-subtitle">A Ramen Diner</div>
      <div className="zz-loader-bar" />
    </div>
  )
}
