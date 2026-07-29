'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { gheeRoastNavigation } from '../data/navigation'
import { gheeRoastSiteData } from '../data/site'
import { Icon } from './Icon'
import styles from './Theme.module.css'

export function Header({ pathname }: { pathname: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 50)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const onDark = pathname !== '/'

  return (
    <>
      <header className={`${styles.header} ${onDark ? styles.headerOnDark : ''} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.headerInner}>
          <Link className={styles.logo} href="/" aria-label="Very Good Ghee Roast home">
            <Image
              alt={gheeRoastSiteData.logo.alt}
              height={52}
              priority
              src={gheeRoastSiteData.logo.src}
              width={52}
            />
            <span><strong>Very Good</strong><small>Flavours that stay</small></span>
          </Link>
          <nav aria-label="Primary navigation" className={styles.desktopNav}>
            {gheeRoastNavigation.map((item) => item.href === '/menu' ? (
              <div className={styles.navDropdown} key={item.href}>
                <Link aria-current={pathname === item.href ? 'page' : undefined} className={pathname === item.href ? styles.activeNav : undefined} href={item.href}>
                  {item.label}<Icon className={styles.dropdownCaret} name="caretDown" weight="bold" />
                </Link>
                <div className={styles.dropdownMenu}>
                  <Link href="/menu"><Icon name="map" weight="fill" />Delhi Menu</Link>
                  <Link href="/menu"><Icon name="map" weight="fill" />Gurugram Menu</Link>
                </div>
              </div>
            ) : (
              <Link
                aria-current={pathname === item.href ? 'page' : undefined}
                className={pathname === item.href ? styles.activeNav : undefined}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link className={styles.orderButton} href="/menu">
            Order online
          </Link>
          <button
            aria-controls="ghee-roast-mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={styles.menuToggle}
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`} id="ghee-roast-mobile-menu">
        <nav aria-label="Mobile navigation">
          {gheeRoastNavigation.map((item) => (
            <Link
              aria-current={pathname === item.href ? 'page' : undefined}
              href={item.href}
              key={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
