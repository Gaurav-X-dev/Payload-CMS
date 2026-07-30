import Image from 'next/image'
import Link from 'next/link'
import type {
  GheeRoastFooterData,
  GheeRoastNavigationItem,
  GheeRoastSiteData,
} from '../dynamicTypes'
import { Icon } from './Icon'
import styles from './Theme.module.css'

function FooterLink({ item }: { item: GheeRoastNavigationItem }) {
  const content = <><Icon name="caretRight" weight="bold" />{item.label}</>
  return item.href.startsWith('/')
    ? <Link href={item.href}>{content}</Link>
    : <a href={item.href} rel={item.newTab ? 'noreferrer' : undefined} target={item.newTab ? '_blank' : undefined}>{content}</a>
}

export function Footer({
  footer,
  site,
}: {
  footer: GheeRoastFooterData
  site: GheeRoastSiteData
}) {
  const year = new Date().getFullYear()
  const copyright = footer.copyright.replaceAll('{year}', String(year))

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Link className={styles.footerLogo} href="/">
              {site.logo && <Image alt={site.logo.alt} height={55} src={site.logo.src} unoptimized width={55} />}
              <span>{site.siteName}</span>
            </Link>
            {site.description && <p>{site.description}</p>}
            {site.tagline && <em>&ldquo;{site.tagline}&rdquo;</em>}
            {site.socials.length > 0 && <div className={styles.socials}>
              {site.socials.map((social) => (
                <a aria-label={social.label} href={social.href} key={`${social.platform}-${social.href}`} rel="noreferrer" target="_blank">
                  <Icon name={social.platform} weight="fill" />
                </a>
              ))}
            </div>}
          </div>
          {footer.columns.map((column) => (
            <div className={styles.footerColumn} key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((item) => <li key={`${item.href}-${item.label}`}><FooterLink item={item} /></li>)}
              </ul>
            </div>
          ))}
          <div className={styles.footerColumn}>
            {footer.contactHeading && <h3>{footer.contactHeading}</h3>}
            <ul className={styles.footerContact}>
              {site.contact.address && <li><Icon name="map" weight="fill" /><div><span>{site.contact.address}</span></div></li>}
              {site.contact.phone && <li><Icon name="phone" weight="fill" /><div><a href={`tel:${site.contact.phone}`}>{site.contact.phone}</a></div></li>}
              {site.contact.email && <li><Icon name="mail" weight="fill" /><div><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></div></li>}
              {site.contact.hours.length > 0 && <li><Icon name="clock" weight="fill" /><div>{site.contact.hours.map((line) => <span className={styles.contactPrimary} key={line}>{line}</span>)}</div></li>}
            </ul>
          </div>
        </div>
        {(copyright || footer.bottomLinks.length > 0) && <div className={styles.footerBottom}>
          {copyright && <span>{copyright}</span>}
          {footer.bottomLinks.length > 0 && <nav aria-label="Legal">
            {footer.bottomLinks.map((item) => item.href.startsWith('/')
              ? <Link href={item.href} key={`${item.href}-${item.label}`}>{item.label}</Link>
              : <a href={item.href} key={`${item.href}-${item.label}`} rel={item.newTab ? 'noreferrer' : undefined} target={item.newTab ? '_blank' : undefined}>{item.label}</a>)}
          </nav>}
        </div>}
      </div>
    </footer>
  )
}
