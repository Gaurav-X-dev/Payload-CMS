import Link from 'next/link'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { careersData } from '../data/careers'
import styles from '../components/Theme.module.css'

export function CareersPage() {
  return (
    <>
      <InnerHero
        body={careersData.hero.subtitle}
        eyebrow={careersData.hero.eyebrow}
        title={careersData.hero.title}
      />

      {/* OPEN POSITIONS */}
      <section className={styles.careersSection} id="open-positions">
        <div className={styles.servicesHeader} style={{ marginBottom: 'clamp(40px, 6vw, 80px)' }}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>Join Our Team</p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                Open <em className={styles.italic}>Positions.</em>
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal>
            <p className={styles.sectionBody}>
              We&apos;re always looking for curious, talented people who want to build the future of hospitality.
            </p>
          </ScrollReveal>
        </div>

        <div className={styles.careersGrid}>
          {careersData.positions.map((pos, i) => (
            <ScrollReveal delay={(i % 3) as 0 | 1 | 2 | 3 | 4} key={pos.title}>
              <article className={styles.careerCard}>
                <div className={styles.careerCardHeader}>
                  <span className={styles.careerDept}>{pos.department}</span>
                  <span className={styles.careerType}>{pos.type}</span>
                </div>
                <h3 className={styles.careerTitle}>{pos.title}</h3>
                <p className={styles.careerDesc}>{pos.description}</p>
                <div className={styles.careerFooter}>
                  <span className={styles.careerLocation}>📍 {pos.location}</span>
                  <Link className={styles.careerApply} href="/contact">
                    Apply →
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* VALUES */}
      {careersData.values && careersData.values.length > 0 && (
        <section className={styles.philosophySection} id="our-values">
          <div aria-hidden="true" className={styles.philosophyBgText}>VALUES</div>
          <div className={styles.philosophyHeader}>
            <div>
              <ScrollReveal>
                <p className={styles.sectionEyebrow} style={{ color: 'rgba(184,168,120,0.8)' }}>Why Work Here</p>
              </ScrollReveal>
              <ScrollReveal delay={1}>
                <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
                  Our <em style={{ color: 'var(--ch-accent)' }}>Values.</em>
                </h2>
              </ScrollReveal>
            </div>
          </div>
          <div className={styles.philosophyPillars}>
            {careersData.values.map((v, i) => (
              <ScrollReveal delay={(i % 5) as 0 | 1 | 2 | 3 | 4} key={v}>
                <div className={styles.pillar}>
                  <div className={styles.pillarNum}>0{i + 1}</div>
                  <div className={styles.pillarTitle}>{v}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div aria-hidden="true" className={styles.ctaBgText}>CAREERS</div>
        <ScrollReveal>
          <h2 className={styles.ctaTitle}>
            Don&apos;t See Your <em className={styles.italic}>Role?</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <p className={styles.ctaBody}>
            We&apos;re always open to conversations with talented people. Drop us a line.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <div className={styles.ctaButtons}>
            <a className={styles.btnWhite} href="mailto:hello@curiousladdoos.com" id="careers-cta-btn">
              Send Your CV →
            </a>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
