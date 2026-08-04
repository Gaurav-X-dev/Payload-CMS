'use client'

import Link from 'next/link'
import { useState } from 'react'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { faqsData } from '../data/faqs'
import styles from '../components/Theme.module.css'

export function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<null | number>(null)

  return (
    <>
      <InnerHero
        body={faqsData.hero.subtitle}
        eyebrow={faqsData.hero.eyebrow}
        title={faqsData.hero.title}
      />

      <section className={styles.faqsSection} id="all-faqs">
        <div className={styles.servicesHeader} style={{ marginBottom: 'clamp(40px, 6vw, 80px)' }}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>Frequently Asked</p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                Got <em className={styles.italic}>Questions?</em>
              </h2>
            </ScrollReveal>
          </div>
        </div>

        <div className={styles.faqWrap}>
          {faqsData.faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <ScrollReveal delay={(i % 4) as 0 | 1 | 2 | 3 | 4} key={faq.question}>
                <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
                  <button
                    aria-controls={`faq-answer-${i}`}
                    aria-expanded={isOpen}
                    className={styles.faqQuestion}
                    id={`faq-btn-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    type="button"
                  >
                    <span>{faq.question}</span>
                    <span className={styles.faqIcon} aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    aria-labelledby={`faq-btn-${i}`}
                    className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}
                    id={`faq-answer-${i}`}
                    role="region"
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div aria-hidden="true" className={styles.ctaBgText}>FAQ</div>
        <ScrollReveal>
          <h2 className={styles.ctaTitle}>
            Still Have <em className={styles.italic}>Questions?</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <div className={styles.ctaButtons}>
            <Link className={styles.btnWhite} href="/contact" id="faqs-cta-btn">
              Contact Us →
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
