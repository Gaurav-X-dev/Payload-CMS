import Image from 'next/image'
import Link from 'next/link'
import { footerColumns, image } from '../data/site'
import type { ZuruZuruFooterData, ZuruZuruNewsletterData, ZuruZuruSiteData } from '../mappers/dynamicTypes'
import { formatHoursSummary } from '../utils/formatHours'
import { Icon } from './Icon'

/** CMS Site Settings newsletter config is optional: absent/disabled falls back to today's static copy. */
export function Newsletter({ newsletter }: { newsletter?: ZuruZuruNewsletterData }) {
  if (newsletter && !newsletter.enabled) return null
  const title = newsletter?.title || 'Join Our Inner Circle'
  const description = newsletter?.description || 'Receive exclusive recipes, event invitations, and special offers directly in your inbox. No spam, just Japanese inspiration.'
  const placeholder = newsletter?.placeholder || 'Enter your email address'
  const buttonLabel = newsletter?.buttonLabel || 'Subscribe'
  return (
    <section className="zz-nl-section zz-section-alt">
      <div className="zz-container">
        <div className="zz-section-subtitle zz-centered">Stay Connected</div>
        <h2 className="zz-heading-section zz-text-center">{title}</h2>
        <p className="zz-section-desc zz-text-center zz-newsletter-copy">{description}</p>
        <form className="zz-nl-form"><label className="zz-visually-hidden" htmlFor="zz-newsletter">Email address</label><input id="zz-newsletter" placeholder={placeholder} type="email" /><button type="button">{buttonLabel}</button></form>
      </div>
    </section>
  )
}

/** CMS Footer/Site Settings are optional: absent data keeps today's static footer content. */
export function Footer({
  footer,
  site,
}: {
  footer?: ZuruZuruFooterData
  site?: ZuruZuruSiteData
}) {
  const columns = footer && footer.columns.length > 0
    ? footer.columns
    : footerColumns.map(([heading, links]) => ({
        links: links.map(([href, label]) => ({ label, url: href })),
        title: heading,
      }))
  const brandName = site?.name || 'Zuru Zuru'
  const description = site?.description
  const logoSrc = site?.logo?.src || image('zuruzuru_logo.png')
  const logoAlt = site?.logo?.alt || 'Zuru Zuru'
  const social = site?.social ?? []
  const address = site?.address
  const phone = site?.phone
  const email = site?.email
  const hoursSummary = site ? formatHoursSummary(site.hours) : ''
  const copyright = footer?.copyright || '© 2026 Zuru Zuru Izakaya. All Rights Reserved.'
  const bottomLinks = footer && footer.bottomLinks.length > 0
    ? footer.bottomLinks
    : [
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Terms of Service', url: '/terms' },
        { label: 'FAQ', url: '/faq' },
      ]

  return (
    <footer className="zz-footer">
      <div className="zz-container">
        <div className="zz-footer-grid">
          <div className="zz-footer-about">
            <div className="zz-footer-brand-container"><Image alt={logoAlt} className="zz-footer-logo" height={62} src={logoSrc} width={62} /><span className="zz-brand-name">{brandName}</span></div>
            {description && <p>{description}</p>}
            <div className="zz-footer-social">
              {social.map((entry) => (
                <a aria-label={entry.label} href={entry.href} key={entry.label}><Icon name={entry.icon.toLowerCase()} /></a>
              ))}
            </div>
          </div>
          {columns.map((column) => <div className="zz-footer-links" key={column.title}><h4>{column.title}</h4>{column.links.map((link) => <Link href={link.url} key={link.url}>{link.label}</Link>)}</div>)}
          <div>
            <h4>Contact</h4>
            <ul className="zz-footer-contact">
              {address && <li><Icon name="map" /> {address}</li>}
              {phone && <li><Icon name="phone" /> {phone}</li>}
              {email && <li><Icon name="email" /> {email}</li>}
            </ul>
            {hoursSummary && (
              <>
                <h4 className="zz-hours-heading">Hours</h4>
                <ul className="zz-footer-hours"><li><strong>{hoursSummary}</strong></li></ul>
              </>
            )}
          </div>
        </div>
        <div className="zz-footer-bottom"><p>{copyright}</p><div>{bottomLinks.map((link) => <Link href={link.url} key={link.url}>{link.label}</Link>)}</div></div>
      </div>
    </footer>
  )
}
