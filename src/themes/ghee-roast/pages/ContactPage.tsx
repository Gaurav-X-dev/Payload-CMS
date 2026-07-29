import { ContactForm } from '../components/ContactForm'
import { Icon } from '../components/Icon'
import { PageHero, SectionHeading } from '../components/Shared'
import { contactData } from '../data/contact'
import styles from '../components/Theme.module.css'

export function ContactPage() {
  return (
    <>
      <PageHero {...contactData.hero} variant="contact" />
      <section className={styles.contactContent}>
        <div className={`${styles.container} ${styles.contactGrid}`}>
          <ContactForm fields={contactData.fields} />
          <div className={styles.contactDetails}>
            {contactData.locations.map((location) => (
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
        <p><Icon name="map" weight="fill" />Currently operating as premium cloud kitchens in Delhi &amp; Gurugram.</p>
      </section>
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <SectionHeading center eyebrow="Connect With Us" title="Follow Our Journey" />
          <div className={styles.socialCards}>
            <a className={styles.instagramCard} href="https://instagram.com/verygoodgheeroast">
              <span><Icon name="instagram" weight="fill" /><span><strong>Instagram</strong><small>@verygoodgheeroast</small></span></span>
              <b>Follow Us</b>
            </a>
            <a className={styles.facebookCard} href="#">
              <span><Icon name="facebook" weight="fill" /><span><strong>Facebook</strong><small>@verygoodgheeroast</small></span></span>
              <b>Follow Us</b>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
