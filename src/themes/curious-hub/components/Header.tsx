'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { navigationData as curiousHubNavigation } from '../data/navigation'
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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav
        aria-label="Main navigation"
        className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}
        id="navbar"
        role="navigation"
      >
        <Link aria-label="Curious Laddoos Home" className={styles.navLogo} href="/">
          <div className={styles.navLogoMark}>CL</div>
          <div className={styles.navLogoText}>
            <span className={styles.brandName}>Curious Laddoos</span>
            <span className={styles.brandTagline}>Building Hospitality Brands</span>
          </div>
        </Link>

        <ul className={styles.navLinks} role="list">
          {curiousHubNavigation.map((item) => (
            <li className={styles.navItem} key={item.href}>
              <Link
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                href={item.href}
              >
                {item.label}
              </Link>
              {item.megaMenu && item.megaMenu.length > 0 && (
                <div className={styles.megaMenu} role="menu">
                  {item.megaMenu.map((sub) => (
                    <div className={styles.megaMenuItem} key={sub.href}>
                      <Link href={sub.href} role="menuitem">
                        {sub.label}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.navRight}>
          <Link className={styles.navCta} href="/contact" id="nav-collaborate-btn">
            Let&apos;s Talk
          </Link>
          <button
            aria-controls="curious-hub-mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={styles.hamburger}
            id="hamburgerBtn"
            onClick={() => setMenuOpen((o) => !o)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <nav
        aria-hidden={!menuOpen}
        aria-label="Mobile navigation"
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ''}`}
        id="curious-hub-mobile-menu"
      >
        {curiousHubNavigation.map((item) => (
          <Link
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={styles.mobileNavLink}
            href={item.href}
            key={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
