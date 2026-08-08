import Link from 'next/link'
import { footerData } from '../data/footer'
import { curiousHubSiteData } from '../data/site'
import { CuriousHubSocialIcon } from '../iconRegistry'
import type { CuriousLadooFooterData, CuriousLadooSiteData } from '../mappers/dynamicTypes'
import styles from './Theme.module.css'

/** CMS Footer/Site are optional: pages not yet converted to CMS omit them and keep today's static footer. */
export function Footer({
  footer,
  site,
}: {
  footer?: CuriousLadooFooterData
  site?: CuriousLadooSiteData
}) {
  const columns = footer && footer.columns.length > 0
    ? footer.columns
    : footerData.columns.map((col) => ({
        links: col.links.map((link) => ({ label: link.label, url: link.href })),
        title: col.title,
      }))
  const copyright = footer?.copyright || curiousHubSiteData.copyright
  const tagline = site?.tagline || curiousHubSiteData.tagline
  const description = site?.description || curiousHubSiteData.description
  const social = site && site.social.length > 0 ? site.social : curiousHubSiteData.social
  const email = site?.email || curiousHubSiteData.email
  const address = site?.address || curiousHubSiteData.address

  return (
    <footer aria-label="Footer" className={styles.footer} id="footer">
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>
            Curious <span>Ladoo</span>
          </div>
          <div className={styles.footerTagline}>{tagline}</div>
          <p className={styles.footerDesc}>{description}</p>
          <div className={styles.footerSocial}>
            {social.map((s) => (
              <a
                aria-label={s.label}
                className={styles.footerSocialLink}
                href={s.href}
                key={s.label}
              >
                <CuriousHubSocialIcon name={s.icon ?? s.label} />
              </a>
            ))}
          </div>
          <div className={styles.footerContact}>
            <div className={styles.footerContactItem}>
              <span>✉</span> {email}
            </div>
            <div className={styles.footerContactItem}>
              <span>📍</span> {address}
            </div>
          </div>
        </div>

        {columns.map((col) => (
          <div className={styles.footerCol} key={col.title}>
            <div className={styles.footerColTitle}>{col.title}</div>
            <ul>
              {col.links.map((link, i) => (
                <li key={`${link.label}-${link.url}-${i}`}>
                  <Link href={link.url}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>{copyright}</p>
        <div className={styles.footerLinks}>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Use</Link>
          <Link href="#">Sitemap</Link>
        </div>
      </div>
    </footer>
  )
}
