'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { portfolioData } from '../data/portfolio'
import styles from '../components/Theme.module.css'

export function PortfolioPage() {
  const [filter, setFilter] = useState('all')

  const filteredItems = filter === 'all' 
    ? portfolioData.items 
    : portfolioData.items.filter(item => item.tags[0] === filter)

  return (
    <>
      <InnerHero
        body={portfolioData.hero.subtitle}
        eyebrow={portfolioData.hero.eyebrow}
        title={portfolioData.hero.title}
        image={(portfolioData.hero as any).image || '/themes/curious-hub/images/t2_interior.png'}
      />

      <section className={styles.innerSection}>
        <ScrollReveal>
          <div className={styles.portfolioFilterContainer}>
            <button 
              className={`${styles.portfolioFilterBtn} ${filter === 'all' ? styles.portfolioFilterBtnActive : ''}`}
              onClick={() => setFilter('all')}
            >
              All Projects
            </button>
            <button 
              className={`${styles.portfolioFilterBtn} ${filter === 'Restaurant Design' ? styles.portfolioFilterBtnActive : ''}`}
              onClick={() => setFilter('Restaurant Design')}
            >
              Restaurant Design
            </button>
            <button 
              className={`${styles.portfolioFilterBtn} ${filter === 'Menu Engineering' ? styles.portfolioFilterBtnActive : ''}`}
              onClick={() => setFilter('Menu Engineering')}
            >
              Menu Engineering
            </button>
            <button 
              className={`${styles.portfolioFilterBtn} ${filter === 'Turnkey Operations' ? styles.portfolioFilterBtnActive : ''}`}
              onClick={() => setFilter('Turnkey Operations')}
            >
              Turnkey Operations
            </button>
          </div>
        </ScrollReveal>

        <div className={styles.portfolioGridCustom} id="portfolioGrid">
          {filteredItems.map((item, i) => (
            <ScrollReveal delay={(i % 3) as 0 | 1 | 2 | 3 | 4} key={`${filter}-${item.title}`}>
              <div className={styles.portfolioItemCard}>
                <div className={styles.portfolioItemImg}>
                  <Image
                    alt={item.image.alt}
                    fill
                    loading={i < 3 ? 'eager' : 'lazy'}
                    src={item.image.src}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.portfolioItemBody}>
                  <span className={styles.portfolioItemCat}>{item.tags[0]}</span>
                  <h3 className={styles.portfolioItemTitle}>{item.title}</h3>
                  <p className={styles.portfolioItemDesc}>{item.description}</p>
                  <Link href="/contact" className={styles.portfolioItemLink} rel="noopener noreferrer" target="_blank">
                    Inquire on case &rarr;
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* BEFORE / AFTER DEMONSTRATION SECTION */}
      <section className={`${styles.innerSection} ${styles.innerSectionAlt}`}>
        <div className={styles.servicesHeader} style={{ marginBottom: '2rem' }}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>Transformation Showcase</p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                Before &amp; <em className={styles.italic}>After.</em>
              </h2>
            </ScrollReveal>
          </div>
        </div>
        <ScrollReveal delay={2}>
          <p className={styles.sectionBody}>A visual example of how we re-design un-optimized spaces into functional, premium dining layouts.</p>
        </ScrollReveal>

        <ScrollReveal delay={3}>
          <div className={styles.beforeAfterBox}>
            <div className={styles.beforeAfterImg}>
              <div className={styles.beforeAfterBadge}>Before (Raw Structure)</div>
              <div style={{ width: '100%', height: '100%', background: '#8A8680', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontFamily: '"Courier Prime", monospace', padding: '1rem', textAlign: 'center' }}>
                Unfinished Concrete Column Shell
              </div>
            </div>
            <div className={styles.beforeAfterImg}>
              <div className={styles.beforeAfterBadge} style={{ background: 'var(--ch-accent)', color: 'var(--ch-dark-2)' }}>After (Ghee Roast CP)</div>
              <Image src="/themes/curious-hub/images/ghee_roast.png" alt="Renovated restaurant interior with wood carving details" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div aria-hidden="true" className={styles.ctaBgText}>CURIOUS</div>
        <ScrollReveal>
          <p className={styles.ctaEyebrow}>Work with Us</p>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <h2 className={styles.ctaTitle}>
            Want to Turnaround Your<br /><em className={styles.italic}>Restaurant Business?</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <p className={styles.ctaBody}>We audit menu metrics, interior systems, and staff pipelines to rebuild underperforming F&amp;B properties.</p>
        </ScrollReveal>
        <ScrollReveal delay={3}>
          <div className={styles.ctaButtons}>
            <Link className={styles.btnWhite} href="/contact?interest=consulting" id="portfolio-cta-btn" rel="noopener noreferrer" target="_blank">
              Book a Brand Audit &rarr;
            </Link>
            <Link className={styles.btnOutlineWhite} href="/services" rel="noopener noreferrer" target="_blank">
              Our 15 Services ↗
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
