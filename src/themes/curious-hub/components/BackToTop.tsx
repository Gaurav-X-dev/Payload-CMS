'use client'

import { useEffect, useState } from 'react'
import styles from './Theme.module.css'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const scrollToTop = () => window.scrollTo({ behavior: 'smooth', top: 0 })

  return (
    <button
      aria-label="Back to top"
      className={`${styles.backToTop} ${visible ? styles.backToTopVisible : ''}`}
      id="back-to-top"
      onClick={scrollToTop}
      type="button"
    >
      ↑
    </button>
  )
}
