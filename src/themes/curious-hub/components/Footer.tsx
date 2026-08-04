import Link from 'next/link'
import { footerData } from '../data/footer'
import { curiousHubSiteData } from '../data/site'
import styles from './Theme.module.css'

export function Footer() {
  return (
    <footer aria-label="Footer" className={styles.footer} id="footer">
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>
            Curious <span>Laddoos</span>
          </div>
          <div className={styles.footerTagline}>{curiousHubSiteData.tagline}</div>
          <p className={styles.footerDesc}>{curiousHubSiteData.description}</p>
          <div className={styles.footerSocial}>
            {curiousHubSiteData.social.map((s) => (
              <a
                aria-label={s.ariaLabel}
                className={styles.footerSocialLink}
                href={s.href}
                key={s.label}
              >
                {s.label}
              </a>
            ))}
          </div>
          <div className={styles.footerContact}>
            <div className={styles.footerContactItem}>
              <span>✉</span> {curiousHubSiteData.email}
            </div>
            <div className={styles.footerContactItem}>
              <span>📍</span> {curiousHubSiteData.address}
            </div>
          </div>
        </div>

        {footerData.columns.map((col) => (
          <div className={styles.footerCol} key={col.title}>
            <div className={styles.footerColTitle}>{col.title}</div>
            <ul>
              {col.links.map((link, i) => (
                <li key={`${link.label}-${link.href}-${i}`}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>{curiousHubSiteData.copyright}</p>
        <div className={styles.footerLinks}>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Use</Link>
          <Link href="#">Sitemap</Link>
        </div>
      </div>
    </footer>
  )
}
