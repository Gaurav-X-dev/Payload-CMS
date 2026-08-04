import Link from 'next/link'
import styles from '../components/Theme.module.css'

export function WorkInProgressPage() {
  return (
    <section className={styles.innerSection} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>Coming Soon</p>
        <h1 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>
          Something Exciting Is <em className={styles.italic}>Coming.</em>
        </h1>
        <p className={styles.sectionBody} style={{ maxWidth: '480px', margin: '0 auto 2rem' }}>
          We&apos;re working hard on this page. In the meantime, explore the rest of what we do.
        </p>
        <Link className={styles.aboutLink} href="/">
          Back to Home →
        </Link>
      </div>
    </section>
  )
}
