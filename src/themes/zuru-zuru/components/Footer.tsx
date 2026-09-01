import Image from 'next/image'
import Link from 'next/link'
import { footerColumns, image } from '../data/site'
import type { ZuruZuruFooterData, ZuruZuruSiteData } from '../mappers/dynamicTypes'
import { formatHoursSummary, formatMealServiceHours } from '../utils/formatHours'
import { Icon } from './Icon'

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
  const mealServiceHours = site ? formatMealServiceHours(site.hours) : null
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
            {mealServiceHours ? (
              <>
                <h4 className="zz-hours-heading">Hours</h4>
                <ul className="zz-footer-hours">
                  {mealServiceHours.map((line) => <li key={line}><strong>{line}</strong></li>)}
                </ul>
              </>
            ) : hoursSummary && (
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
