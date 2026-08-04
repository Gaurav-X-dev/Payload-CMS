'use client'

import { useEffect, useRef } from 'react'
import styles from './Theme.module.css'

type AnimatedCounterProps = {
  suffix?: string
  target: number
}

export function AnimatedCounter({ suffix = '', target }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 2000
          const fps = 60
          const increment = target / (duration / (1000 / fps))
          let current = 0

          const tick = () => {
            current += increment
            if (current < target) {
              el.textContent = String(Math.ceil(current))
              requestAnimationFrame(tick)
            } else {
              el.textContent = String(target)
            }
          }
          tick()
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return (
    <span className={styles.metricNumber}>
      <span className={styles.counter} ref={ref}>
        0
      </span>
      {suffix && <span className={styles.metricSuffix}>{suffix}</span>}
    </span>
  )
}
