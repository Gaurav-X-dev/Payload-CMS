'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { navigationData as curiousHubNavigation } from '../data/navigation'
import type { CuriousLadooNavigationData } from '../mappers/dynamicTypes'
import type { NavItemData } from '../types'
import { BrandMark } from './BrandMark'
import styles from './Theme.module.css'

/** CMS Nav/Site are optional: pages not yet converted to CMS omit them and keep today's static nav. */
export function Header({
  nav,
  pathname,
  tagline,
}: {
  nav?: CuriousLadooNavigationData
  pathname: string
  tagline?: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const items: NavItemData[] = nav && nav.links.length > 0
    ? nav.links.map((link) => ({ href: link.url, label: link.label.toUpperCase() }))
    : curiousHubNavigation
  const brandName = nav?.brandName || 'Curious Ladoo'
  const brandTagline = tagline || 'Building Hospitality Brands'
  const ctaLabel = nav?.cta?.label || "Let's Talk"
  const ctaHref = nav?.cta?.url || '/contact'

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
        <Link aria-label={`${brandName} Home`} className={styles.navLogo} href="/">
          <BrandMark className={styles.navLogoMark} />
          <div className={styles.navLogoText}>
            <span className={styles.brandName}>{brandName}</span>
            <span className={styles.brandTagline}>{brandTagline}</span>
          </div>
        </Link>

        <ul className={styles.navLinks} role="list">
          {items.map((item) => (
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
          <Link className={styles.navCta} href={ctaHref} id="nav-collaborate-btn" rel="noopener noreferrer" target="_blank">
            {ctaLabel}
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
        {items.map((item) => (
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
        <Link
          className={styles.mobileNavCta}
          href={ctaHref}
          onClick={() => setMenuOpen(false)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {ctaLabel}
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </nav>
    </>
  )
}
