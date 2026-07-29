'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { mobileNavigation, navigation, image } from '../data/site'
import { Icon } from './Icon'

export function Header({ pathname }: { pathname: string }) {
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

  return (
    <>
      {pathname === '/' && (
        <div className="zz-announcement-bar">
          <div className="zz-container">
            <div className="zz-announcement-left"><span className="zz-inline-icon"><Icon name="flag" size={13} /> Grand Summer Festival — <Link href="/events">20% Off This Weekend</Link></span><i /><span>Mon – Sun: 12:00 PM – 11:00 PM</span></div>
            <div className="zz-announcement-right"><span className="zz-inline-icon"><Icon name="phone" size={13} /> +91 11 4052 7373</span><i /><Link href="/reservation">Book a Table</Link></div>
          </div>
        </div>
      )}
      <header className={`zz-header ${pathname === '/' ? 'zz-has-announcement' : 'zz-header-inner'} ${scrolled ? 'zz-scrolled' : ''} ${open ? 'zz-menu-open' : ''}`}>
        <div className="zz-nav-container">
          <Link className="zz-logo" href="/"><Image alt="Zuru Zuru Izakaya" height={58} priority src={image('zuruzuru_logo.png')} width={58} /><span className="zz-brand-name">Zuru Zuru</span></Link>
          <ul className="zz-nav-links">
            {navigation.map(([href, label]) => (
              <li key={href}>
                <Link className={pathname === href ? 'zz-active' : ''} href={href}>{label}{href === '/menu' && <Icon name="caretDown" size={11} weight="bold" />}</Link>
                {href === '/menu' && <ul className="zz-nav-dropdown"><li><Link href="/menu?location=delhi">Delhi Menu</Link></li><li><Link href="/menu?location=gurugram">Gurugram Menu</Link></li></ul>}
              </li>
            ))}
          </ul>
          <div className="zz-nav-right">
            <Link className="zz-btn zz-btn-primary zz-btn-sm" href="/reservation"><span>Reserve</span></Link>
            <button aria-expanded={open} aria-label={open ? 'Close Menu' : 'Open Menu'} className={`zz-hamburger ${open ? 'zz-active' : ''}`} onClick={() => setOpen(!open)} type="button"><span /><span /><span /></button>
          </div>
        </div>
      </header>
      <nav aria-label="Mobile navigation" className={`zz-mobile-menu ${open ? 'zz-active' : ''}`}>
        {mobileNavigation.map(([href, label]) => <Link href={href} key={`${href}-${label}`} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
    </>
  )
}
