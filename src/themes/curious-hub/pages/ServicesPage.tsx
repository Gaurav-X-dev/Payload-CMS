'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { servicesData } from '../data/services'
import styles from '../components/Theme.module.css'

export function ServicesPage() {
  const hero = servicesData.hero
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  return (
    <>
      <InnerHero body={hero.subtitle} eyebrow={hero.eyebrow} title={hero.title} image={hero.image} />

      {/* SERVICES OVERVIEW INTRO */}
      <section className={styles.innerSection}>
        <div className={styles.servicesOverviewIntro}>
          <div>
            <ScrollReveal>
              <h2 className={styles.sectionTitle}>
                {servicesData.overview.title} <em className={styles.italic}>{servicesData.overview.italic}</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <div className={styles.brushDivider}></div>
            </ScrollReveal>
          </div>
          <div>
            <ScrollReveal delay={2}>
              <p className={styles.sectionBody}>{servicesData.overview.desc}</p>
            </ScrollReveal>
          </div>
        </div>

        {/* Core Services Deep Dive */}
        <div className={styles.serviceDetailsWrap}>
          {servicesData.blocks.map((block, i) => (
            <div id={block.id} key={block.id} className={`${styles.serviceDetailBlock} ${block.reverse ? styles.reverse : ''}`}>
              <ScrollReveal className={styles.serviceDetailImageWrap} delay={(i % 2) as 0 | 1 | 2}>
                <Image src={block.image.src} alt={block.image.alt} fill loading="lazy" style={{ objectFit: 'cover' }} />
              </ScrollReveal>
              <div className={styles.serviceDetailContent}>
                <ScrollReveal delay={1}>
                  <span className={styles.sectionEyebrow}>{block.number}</span>
                  <h3>{block.title}</h3>
                  <p className={styles.sectionBody} style={{ marginBottom: '1.5rem' }}>{block.desc}</p>
                </ScrollReveal>
                <ScrollReveal delay={2}>
                  <div className={styles.serviceDetailFeatures}>
                    {block.features.map((feature, idx) => (
                      <div key={idx} className={styles.serviceFeatureItem}>
                        <span>✓</span> {feature}
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={3}>
                  <Link href={block.link.href} className={styles.aboutLink} rel="noopener noreferrer" target="_blank">
                    {block.link.label}
                  </Link>
                </ScrollReveal>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS / TECHNOLOGY SHOWCASE */}
      <section className={`${styles.innerSection} ${styles.innerSectionAlt}`}>
        <ScrollReveal>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {servicesData.advantage.title} <em className={styles.italic}>{servicesData.advantage.italic}</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <p className={styles.sectionBody} style={{ textAlign: 'center', margin: '0 auto 4rem' }}>
            {servicesData.advantage.desc}
          </p>
        </ScrollReveal>

        <div className={styles.valuesGrid}>
          {servicesData.advantage.items.map((item, i) => (
            <ScrollReveal delay={(i % 3) as 0 | 1 | 2} key={item.title}>
              <div className={styles.valueCard} style={{ height: '100%' }}>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {item.title}
                </h4>
                <p className={styles.sectionBody} style={{ fontSize: '0.9rem', color: 'var(--ch-text)' }}>
                  {item.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* SERVICES FAQs */}
      <section className={styles.innerSection}>
        <ScrollReveal>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            {servicesData.faqs.title} <em className={styles.italic}>{servicesData.faqs.italic}</em>
          </h2>
        </ScrollReveal>

        <div className={styles.faqWrapContainer}>
          {servicesData.faqs.items.map((faq, i) => {
            const isActive = openFaqIndex === i
            return (
              <ScrollReveal delay={(i % 3) as 0 | 1 | 2} key={i}>
                <div className={`${styles.faqTabAccordion} ${isActive ? styles.faqTabAccordionActive : ''}`}>
                  <div 
                    className={styles.faqTabHeader} 
                    onClick={() => setOpenFaqIndex(isActive ? null : i)}
                  >
                    <h4>{faq.question}</h4>
                    <span className={styles.faqTabIcon}>+</span>
                  </div>
                  <div className={styles.faqTabContent}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" aria-label="Call to action" className={styles.ctaSection}>
        <div className={styles.ctaBgText} aria-hidden="true">{servicesData.cta.bgText}</div>
        <ScrollReveal>
          <p className={styles.ctaEyebrow}>{servicesData.cta.eyebrow}</p>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <h2 className={styles.ctaTitle} dangerouslySetInnerHTML={{ __html: servicesData.cta.title + ' <em class="' + styles.italic + '">' + servicesData.cta.italic + '</em>' }} />
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <p className={styles.ctaBody}>{servicesData.cta.body}</p>
        </ScrollReveal>
        <ScrollReveal delay={3}>
          <div className={styles.ctaButtons}>
            {servicesData.cta.buttons.map((btn, i) => (
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
