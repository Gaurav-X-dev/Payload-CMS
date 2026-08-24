import Image from 'next/image'
import Link from 'next/link'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { howWeWorkData } from '../data/howWeWork'
import styles from '../components/Theme.module.css'

export function HowWeWorkPage() {
  const hero = howWeWorkData.hero
  return (
    <>
      <InnerHero body={hero.subtitle} eyebrow={hero.eyebrow} title={hero.title} image={hero.image} />

      {/* TIMELINE SECTION */}
      <section className={styles.innerSection}>
        <div className={styles.timelineVisualContainer}>
          <div className={styles.timelineVisualLine}></div>

          {howWeWorkData.timeline.map((step, i) => (
            <div key={step.num} className={styles.timelineVisualNode}>
              <div className={styles.timelineVisualDot}></div>
              <div className={styles.timelineVisualContent}>
                <ScrollReveal>
                  <div className={styles.timelineNodeNum}>{step.num}</div>
                  <h3 className={styles.timelineNodeTitle}>{step.title}</h3>
                </ScrollReveal>
                <ScrollReveal delay={1}>
                  <p className={styles.sectionBody}>{step.desc}</p>
                </ScrollReveal>
              </div>
              <ScrollReveal className={styles.timelineVisualImg} delay={(i % 2) as 0 | 1 | 2}>
                <Image src={step.image.src} alt={step.image.alt} fill loading="lazy" style={{ objectFit: 'cover' }} />
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>

      {/* LIFE CYCLE DETAILS / STATS */}
      <section className={`${styles.innerSection} ${styles.innerSectionAlt}`}>
        <div className={styles.aboutStoryGrid}>
          <div>
            <ScrollReveal>
              <span className={styles.sectionEyebrow}>{howWeWorkData.lifecycle.eyebrow}</span>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                {howWeWorkData.lifecycle.title} <em className={styles.italic}>{howWeWorkData.lifecycle.italic}</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className={styles.brushDivider}></div>
              <p className={styles.sectionBody} style={{ marginBottom: '1.5rem' }}>{howWeWorkData.lifecycle.p1}</p>
              <p className={styles.sectionBody}>{howWeWorkData.lifecycle.p2}</p>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={1} className={styles.aboutStoryImage} style={{ background: 'var(--ch-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '1px solid var(--ch-border)', padding: '3rem' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '4rem', fontWeight: 700, color: 'var(--ch-accent)', lineHeight: 1, marginBottom: '1rem' }}>
              {howWeWorkData.lifecycle.statBox.value}
            </div>
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              {howWeWorkData.lifecycle.statBox.title}
            </h4>
            <p className={styles.sectionBody} style={{ textAlign: 'center', fontSize: '0.9rem' }}>
              {howWeWorkData.lifecycle.statBox.desc}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" aria-label="Call to action" className={styles.ctaSection}>
        <div className={styles.ctaBgText} aria-hidden="true">{howWeWorkData.cta.bgText}</div>
        <ScrollReveal>
          <p className={styles.ctaEyebrow}>{howWeWorkData.cta.eyebrow}</p>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <h2 className={styles.ctaTitle} dangerouslySetInnerHTML={{ __html: howWeWorkData.cta.title + ' <em class="' + styles.italic + '">' + howWeWorkData.cta.italic + '</em>' }} />
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <p className={styles.ctaBody}>{howWeWorkData.cta.body}</p>
        </ScrollReveal>
        <ScrollReveal delay={3}>
          <div className={styles.ctaButtons}>
            {howWeWorkData.cta.buttons.map((btn, i) => (
              <Link key={i} href={btn.href} className={styles[btn.type]} rel="noopener noreferrer" target="_blank">
                {btn.label}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
