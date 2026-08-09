'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { mobileNavigation, navigation, image } from '../data/site'
import type { ZuruZuruNavigationData, ZuruZuruSiteData } from '../mappers/dynamicTypes'
import { formatHoursSummary } from '../utils/formatHours'
import { buildMobileNavOrder } from '../utils/foldedTitles'
import { Icon } from './Icon'

type NavItem = { children: { label: string; url: string }[]; label: string; url: string }

/** The original desktop nav shows a fixed 7 links; anything beyond that was mobile-only overflow
 * in the static design. Mirrored here as a slice of the same ordered CMS list, matching the
 * original's own technique (`mobileNavigation = [...navigation.slice(0, 6), ...]`) rather than
 * inventing a desktop/mobile flag the Nav collection doesn't have. */
const DESKTOP_LINK_COUNT = 7

/** CMS Nav/SiteSettings are optional: not-yet-populated or unreachable data keeps today's static chrome. */
export function Header({
  nav,
  pathname,
  site,
}: {
  nav?: ZuruZuruNavigationData
  pathname: string
  site?: ZuruZuruSiteData
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
        document.body.scrollTop,
        document.scrollingElement?.scrollTop ?? 0,
      )
      setScrolled(scrollTop > 60)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    window.visualViewport?.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', onScroll, { capture: true })
      window.visualViewport?.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const allLinks: NavItem[] = nav && nav.links.length > 0
    ? nav.links
    : navigation.map(([href, label]) => ({ children: [], label, url: href }))
  const desktopLinks = allLinks.slice(0, DESKTOP_LINK_COUNT)
  const mobileLinks: { label: string; url: string }[] = nav && nav.links.length > 0
    ? buildMobileNavOrder(allLinks, DESKTOP_LINK_COUNT)
    : mobileNavigation.map(([href, label]) => ({ label, url: href }))

  const brandName = nav?.brandName || 'Zuru Zuru'
  const logoSrc = nav?.logo?.src || site?.logo?.src || image('zuruzuru_logo.png')
  const logoAlt = nav?.logo?.alt || site?.logo?.alt || 'Zuru Zuru Izakaya'
  const ctaLabel = nav?.cta?.label || 'Reserve'
  const ctaUrl = nav?.cta?.url || '/reservation'

  const hoursSummary = site ? formatHoursSummary(site.hours) : 'Mon – Sun: 12:00 PM – 11:00 PM'
  const announcementEnabled = site ? site.announcement.enabled : true
  const announcementText = site?.announcement.text || 'Grand Summer Festival — 20% Off This Weekend'
  const phone = site?.phone || '+91 11 4052 7373'

  return (
    <>
      {pathname === '/' && announcementEnabled && (
        <div className="zz-announcement-bar">
          <div className="zz-container">
            <div className="zz-announcement-left"><span className="zz-inline-icon"><Icon name="flag" size={13} /> {announcementText}</span>{hoursSummary && <><i /><span>{hoursSummary}</span></>}</div>
            <div className="zz-announcement-right">{phone && <span className="zz-inline-icon"><Icon name="phone" size={13} /> {phone}</span>}<i /><Link href={ctaUrl}>{ctaLabel}</Link></div>
          </div>
        </div>
      )}
      <header className={`zz-header ${pathname === '/' ? 'zz-has-announcement' : 'zz-header-inner'} ${scrolled ? 'zz-scrolled' : ''} ${open ? 'zz-menu-open' : ''}`}>
        <div className="zz-nav-container">
          <Link className="zz-logo" href="/"><Image alt={logoAlt} height={58} priority src={logoSrc} width={58} /><span className="zz-brand-name">{brandName}</span></Link>
          <ul className="zz-nav-links">
            {desktopLinks.map((item) => (
              <li key={item.url}>
                <Link className={pathname === item.url ? 'zz-active' : ''} href={item.url}>{item.label}{item.children.length > 0 && <Icon name="caretDown" size={11} weight="bold" />}</Link>
                {item.children.length > 0 && (
                  <ul className="zz-nav-dropdown">
                    {item.children.map((child) => <li key={child.url}><Link href={child.url}>{child.label}</Link></li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="zz-nav-right">
            <Link className="zz-btn zz-btn-primary zz-btn-sm" href={ctaUrl}><span>{ctaLabel}</span></Link>
            <button aria-expanded={open} aria-label={open ? 'Close Menu' : 'Open Menu'} className={`zz-hamburger ${open ? 'zz-active' : ''}`} onClick={() => setOpen(!open)} type="button"><span /><span /><span /></button>
          </div>
        </div>
      </header>
      <nav aria-label="Mobile navigation" className={`zz-mobile-menu ${open ? 'zz-active' : ''}`}>
        {mobileLinks.map((item) => <Link href={item.url} key={item.url} onClick={() => setOpen(false)}>{item.label}</Link>)}
      </nav>
    </>
  )
}
