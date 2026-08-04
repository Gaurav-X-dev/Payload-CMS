'use client'

import { useEffect, useRef } from 'react'
import styles from './Theme.module.css'

type TickerBrandData = {
  description: string
  icon: string
  iconStyle?: string
  name: string
}

type TickerProps = {
  brands: TickerBrandData[]
}

export function Ticker({ brands }: TickerProps) {
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return

    // Duplicate children for seamless continuous loop
    const children = Array.from(inner.children)
    children.forEach((child) => {
      const clone = child.cloneNode(true)
      inner.appendChild(clone)
    })

    let pos = 0
    let rafId: number
    const speed = 0.55

    const animate = () => {
      pos -= speed
      const totalWidth = inner.scrollWidth / 2
      if (Math.abs(pos) >= totalWidth) pos = 0
      inner.style.transform = `translateX(${pos}px)`
      rafId = requestAnimationFrame(animate)
    }
    animate()

    return () => cancelAnimationFrame(rafId)
  }, [brands])

  return (
    <section aria-label="Our brands overview" className={styles.brandsTicker} id="brands-ticker">
      <div className={styles.tickerLabel}>OUR BRANDS</div>
      <div className={styles.tickerWrap}>
        <div className={styles.brandsTickerInner} ref={innerRef}>
          {brands.map((brand, i) => (
            <div className={styles.tickerBrand} key={`${brand.name}-${i}`}>
              <span
                className={styles.tickerBrandIcon}
                style={brand.iconStyle ? { fontSize: brand.iconStyle } : undefined}
              >
                {brand.icon}
              </span>
              <div className={styles.tickerBrandInfo}>
                <div className={styles.tickerBrandName}>{brand.name}</div>
                <div className={styles.tickerBrandDesc}>{brand.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
