import { ContactForm } from '../components/ContactForm'
import { Icon } from '../components/Icon'
import { PageHero, SectionHeading } from '../components/Shared'
import { contactData } from '../data/contact'
import styles from '../components/Theme.module.css'
import type { GheeRoastPageProps } from '../dynamicTypes'

export function ContactPage({ content }: GheeRoastPageProps) {
  const cmsLocations = content.collections.locations
  const socialLinks = content.site.socials
  return (
    <>
      <PageHero {...(content.page?.hero ?? contactData.hero)} variant="contact" />
      <section className={styles.contactContent}>
        <div className={`${styles.container} ${styles.contactGrid}`}>
          <ContactForm fields={contactData.fields} />
          <div className={styles.contactDetails}>
            {(cmsLocations.length ? cmsLocations.map((location) => ({
              icon: 'map',
              lines: [location.address, location.city, location.phone || '', location.email || ''].filter(Boolean),
              title: location.title,
            })) : contactData.locations).map((location) => (
              <article key={location.title}>
                <Icon name={location.icon} weight="fill" />
                <div><h2>{location.title}</h2>{location.lines.map((line) => <p key={line}>{line}</p>)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.mapSection} aria-labelledby="contact-map-heading">
        <h2 id="contact-map-heading">Find Us On The Map</h2>
        <p><Icon name="map" weight="fill" />{content.site.contact.address || 'Currently operating as premium delivery kitchens in Delhi & Gurugram.'}</p>
      </section>
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <SectionHeading center eyebrow="Connect With Us" title="Follow Our Journey" />
          {socialLinks.length > 0
            ? <div className={styles.socialCards}>{socialLinks.map((social) => (
                <a
                  className={social.platform === 'instagram' ? styles.instagramCard : social.platform === 'facebook' ? styles.facebookCard : styles.socialCard}
                  href={social.href}
                  key={`${social.platform}-${social.href}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span><Icon name={social.platform} weight="fill" /><span><strong>{social.label}</strong><small>{content.site.siteName}</small></span></span>
                  <b>Follow Us</b>
                </a>
              ))}</div>
            : <p className={styles.cmsEmpty}>Social profiles are being updated.</p>}
        </div>
      </section>
    </>
  )
}
