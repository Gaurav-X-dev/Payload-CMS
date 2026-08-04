'use client'

import { useEffect, useRef } from 'react'
import styles from './Theme.module.css'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const isPointerFine = window.matchMedia('(pointer: fine)').matches
    if (!isPointerFine) {
      dot.style.display = 'none'
      ring.style.display = 'none'
      return
    }

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.15
      ringY += (mouseY - ringY) * 0.15
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`
      rafId = requestAnimationFrame(animate)
    }
    animate()

    const onMouseLeave = () => {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }
    const onMouseEnter = () => {
      dot.style.opacity = '1'
      ring.style.opacity = '1'
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div aria-hidden="true" className={styles.cursorDot} ref={dotRef} />
      <div aria-hidden="true" className={styles.cursorRing} ref={ringRef} />
    </>
  )
}
