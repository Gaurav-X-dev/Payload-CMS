import Image from 'next/image'
import Link from 'next/link'
import { gheeRoastSiteData } from '../data/site'
import { Icon } from './Icon'
import styles from './Theme.module.css'

const exploreLinks = [
  ['/', 'Home'],
  ['/menu', 'The Menu'],
  ['/about', 'Our Story'],
  ['/quality', 'Quality Promise'],
] as const

const serviceLinks = [
  ['/delivery', 'Order Delivery'],
  ['/catering', 'Luxury Catering'],
  ['/menu?location=delhi', 'Delhi Menu'],
  ['/menu?location=gurugram', 'Gurugram Menu'],
  ['/contact', 'Contact Us'],
] as const

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Link className={styles.footerLogo} href="/">
              <Image alt="VERY GOOD GHEE ROAST" height={55} src={gheeRoastSiteData.logo.src} width={55} />
              <span>VERY GOOD<br /><strong>GHEE ROAST</strong></span>
            </Link>
            <p>{gheeRoastSiteData.description}</p>
            <em>&ldquo;{gheeRoastSiteData.tagline}&rdquo;</em>
            <div className={styles.socials}>
              <a aria-label="Instagram" href="https://www.instagram.com/verygoodgheeroast/"><Icon name="instagram" weight="fill" /></a>
              <a aria-label="Facebook" href="#"><Icon name="facebook" weight="fill" /></a>
              <a aria-label="YouTube" href="#"><Icon name="youtube" weight="fill" /></a>
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h3>Explore</h3>
            <ul>
              {exploreLinks.map(([href, label]) => (
                <li key={href}><Link href={href}><Icon name="caretRight" weight="bold" />{label}</Link></li>
              ))}
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Services</h3>
            <ul>
              {serviceLinks.map(([href, label]) => (
                <li key={href}><Link href={href}><Icon name="caretRight" weight="bold" />{label}</Link></li>
              ))}
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Get In Touch</h3>
            <ul className={styles.footerContact}>
              <li><Icon name="map" weight="fill" /><div><strong>Delivery Kitchen</strong><span>Delhi &amp; Gurugram, India</span></div></li>
              <li><Icon name="phone" weight="fill" /><div><a href="tel:+919910213465">+91 99102 13465</a></div></li>
              <li><Icon name="clock" weight="fill" /><div><span className={styles.contactPrimary}>1 PM – 10 PM</span><small>Tuesdays Closed</small></div></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 VERY GOOD GHEE ROAST. All Rights Reserved.</span>
          <nav aria-label="Legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Refund Policy</a>
            <a href="#">Sitemap</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
