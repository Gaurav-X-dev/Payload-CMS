'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Theme.module.css'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4
  tag?: 'article' | 'div' | 'li' | 'section'
  style?: React.CSSProperties
}

const delayClassMap = {
  0: styles.reveal,
  1: `${styles.reveal} ${styles.revealDelay1}`,
  2: `${styles.reveal} ${styles.revealDelay2}`,
  3: `${styles.reveal} ${styles.revealDelay3}`,
  4: `${styles.reveal} ${styles.revealDelay4}`,
} as const

export function ScrollReveal({ children, className, delay = 0, tag: Tag = 'div', style }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.revealed)
          observer.unobserve(el)
        }
      },
      { rootMargin: '0px', threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const revealClass = delayClassMap[delay]
  const combined = className ? `${revealClass} ${className}` : revealClass

  return (
    // @ts-expect-error — dynamic tag type is sound here
    <Tag className={combined} ref={ref} style={style}>
      {children}
    </Tag>
  )
}
