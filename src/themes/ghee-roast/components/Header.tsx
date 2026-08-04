'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import type { GheeRoastNavigationData } from '../dynamicTypes'
import { Icon } from './Icon'
import styles from './Theme.module.css'

export function Header({
  hasAnnouncement = false,
  navigation,
  pathname,
}: {
  hasAnnouncement?: boolean
  navigation: GheeRoastNavigationData
  pathname: string
}) {
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
  const hasIdentity = Boolean(navigation.logo || navigation.brandName)
  const itemRel = (item: { newTab?: boolean; nofollow?: boolean }): string | undefined =>
    [item.nofollow ? 'nofollow' : '', item.newTab ? 'noreferrer' : ''].filter(Boolean).join(' ') || undefined

  return (
    <>
      <header className={`${styles.header} ${hasAnnouncement ? styles.headerBelowAnnouncement : ''} ${onDark ? styles.headerOnDark : ''} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.headerInner}>
          {hasIdentity ? (
            <Link className={styles.logo} href="/" aria-label={`${navigation.brandName || 'Ghee Roast'} home`}>
              {navigation.logo && (
                <Image
                  alt={navigation.logo.alt}
                  height={52}
                  priority
                  src={navigation.logo.src}
                  unoptimized
                  width={52}
                />
              )}
              {navigation.brandName && (
                <span>
                  <strong>{navigation.brandName}</strong>
                  {navigation.tagline && <small>{navigation.tagline}</small>}
                </span>
              )}
            </Link>
          ) : <span aria-hidden className={styles.logo} />}
          <nav aria-label="Primary navigation" className={styles.desktopNav}>
            {navigation.items.map((item, itemIndex) => item.children?.length ? (
              <div className={styles.navDropdown} key={item.renderKey ?? `nav-${itemIndex}-${item.href}-${item.label}`}>
                <Link aria-current={pathname === item.href ? 'page' : undefined} className={pathname === item.href ? styles.activeNav : undefined} href={item.href} rel={itemRel(item)} target={item.newTab ? '_blank' : undefined}>
                  {item.label}<Icon className={styles.dropdownCaret} name="caretDown" weight="bold" />
                </Link>
                <div className={styles.dropdownMenu}>
                  {item.children.map((child, childIndex) => (
                    <Link href={child.href} key={child.renderKey ?? `nav-${itemIndex}-child-${childIndex}-${child.href}-${child.label}`} rel={itemRel(child)} target={child.newTab ? '_blank' : undefined}>
                      <Icon name="map" weight="fill" />{child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                aria-current={pathname === item.href ? 'page' : undefined}
                className={pathname === item.href ? styles.activeNav : undefined}
                href={item.href}
                key={item.renderKey ?? `nav-${itemIndex}-${item.href}-${item.label}`}
                rel={itemRel(item)}
                target={item.newTab ? '_blank' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {navigation.cta.enabled && <Link className={styles.orderButton} href={navigation.cta.href}>{navigation.cta.label}</Link>}
          {navigation.items.length > 0 && <button
            aria-controls="ghee-roast-mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={styles.menuToggle}
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span /><span /><span />
          </button>}
        </div>
      </header>
      {navigation.items.length > 0 && <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`} id="ghee-roast-mobile-menu">
        <nav aria-label="Mobile navigation">
          {navigation.items.map((item, itemIndex) => (
            <Fragment key={item.renderKey ?? `mobile-nav-${itemIndex}-${item.href}-${item.label}`}>
              <Link
                aria-current={pathname === item.href ? 'page' : undefined}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                rel={itemRel(item)}
                target={item.newTab ? '_blank' : undefined}
              >
                {item.label}
              </Link>
              {item.children?.map((child, childIndex) => (
                <Link
                  href={child.href}
                  key={child.renderKey ?? `mobile-nav-${itemIndex}-child-${childIndex}-${child.href}-${child.label}`}
                  onClick={() => setMenuOpen(false)}
                  rel={itemRel(child)}
                  target={child.newTab ? '_blank' : undefined}
                >
                  {child.label}
                </Link>
              ))}
            </Fragment>
          ))}
        </nav>
      </div>}
    </>
  )
}
