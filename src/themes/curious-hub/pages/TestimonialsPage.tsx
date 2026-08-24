import Link from 'next/link'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { testimonialsData } from '../data/testimonials'
import styles from '../components/Theme.module.css'

export function TestimonialsPage() {
  return (
    <>
      <InnerHero
        body={testimonialsData.hero.subtitle}
        eyebrow={testimonialsData.hero.eyebrow}
        title={testimonialsData.hero.title}
      />

      <section
        aria-label="Client testimonials"
        className={styles.testimonialsSection}
        id="all-testimonials"
      >
        <div className={styles.testimonialsHeader}>
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ color: 'rgba(184,168,120,0.8)' }}>
              What Our Clients Say
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
              Real Stories. <em style={{ color: 'var(--ch-accent)', fontStyle: 'italic' }}>Real Results.</em>
            </h2>
          </ScrollReveal>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonialsData.testimonials.map((t, i) => (
            <ScrollReveal delay={(i % 3) as 0 | 1 | 2 | 3 | 4} key={t.author}>
              <article className={styles.testimonialCard}>
                <span aria-hidden="true" className={styles.testimonialQuoteMark}>&ldquo;</span>
                <p className={styles.testimonialText}>{t.quote}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.author}</div>
                    <div className={styles.testimonialRole}>{t.company}</div>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div aria-hidden="true" className={styles.ctaBgText}>STORIES</div>
        <ScrollReveal>
          <h2 className={styles.ctaTitle}>
            Ready to Write Your <em className={styles.italic}>Story?</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <div className={styles.ctaButtons}>
            <Link className={styles.btnWhite} href="/contact" id="testimonials-cta-btn" rel="noopener noreferrer" target="_blank">
              Let&apos;s Talk →
            </Link>
            <Link className={styles.btnOutlineWhite} href="/portfolio" rel="noopener noreferrer" target="_blank">
              View Portfolio ↗
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
