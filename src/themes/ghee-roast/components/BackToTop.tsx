'use client'

import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import styles from './Theme.module.css'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <button
      aria-label="Scroll to top"
      className={`${styles.backToTop} ${visible ? styles.backToTopVisible : ''}`}
      onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })}
      type="button"
    >
      <Icon name="arrow" weight="bold" />
    </button>
  )
}
