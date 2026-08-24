import Image from 'next/image'
import Link from 'next/link'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { brandsData } from '../data/brands'
import styles from '../components/Theme.module.css'

export function BrandsPage() {
  const hero = brandsData.hero
  return (
    <>
      <InnerHero body={hero.subtitle} eyebrow={hero.eyebrow} title={hero.title} image={hero.image} />

      {/* BRANDS SPOTLIGHT SECTION */}
      <section className={styles.innerSection}>
        <div className={styles.brandSpotlightSection}>
          {brandsData.brands.map((brand, i) => (
            <div id={brand.id} key={brand.id} className={`${styles.brandSpotlightItem} ${brand.reverse ? styles.reverse : ''}`}>
              {/* For normal layout, img comes first, then content. For reverse, content then img.
                  Wait, flex-direction: row-reverse in CSS might handle this, so we don't strictly need to reorder in DOM if CSS handles it. 
                  In original HTML, they manually swapped the DOM nodes for reverse. 
                  Let's conditionally swap the DOM nodes. */}
              {!brand.reverse ? (
                <>
                  <ScrollReveal className={styles.brandSpotlightImg} delay={(i % 2) as 0 | 1 | 2}>
                    <Image src={brand.image.src} alt={brand.image.alt} fill loading="lazy" style={{ objectFit: 'cover' }} />
                    <div className={styles.brandSpotlightAccentBox}>
                      <div className={styles.stat}>{brand.statValue}</div>
                      <div style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ch-accent)' }}>
                        {brand.statLabel}
                      </div>
                    </div>
                  </ScrollReveal>
                  <div className={styles.brandSpotlightContent}>
                    <ScrollReveal delay={1}>
                      <span className={styles.brandBadge}>{brand.badge}</span>
                      <h3>{brand.title}</h3>
                      <p className={styles.sectionBody}>{brand.desc}</p>
                    </ScrollReveal>
                    <ScrollReveal delay={2}>
                      <p className={styles.brandTestimonialQuote}>{brand.quote}</p>
                      <div className={styles.footerSocial} style={{ marginTop: '1.5rem', justifyContent: 'flex-start' }}>
                        {brand.links.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.footerSocialLink}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </ScrollReveal>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.brandSpotlightContent}>
                    <ScrollReveal delay={1}>
                      <span className={styles.brandBadge}>{brand.badge}</span>
                      <h3>{brand.title}</h3>
                      <p className={styles.sectionBody}>{brand.desc}</p>
                    </ScrollReveal>
                    <ScrollReveal delay={2}>
                      <p className={styles.brandTestimonialQuote}>{brand.quote}</p>
                      <div className={styles.footerSocial} style={{ marginTop: '1.5rem', justifyContent: 'flex-start' }}>
                        {brand.links.map((link, idx) => (
                          <Link
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.footerSocialLink}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </ScrollReveal>
                  </div>
                  <ScrollReveal className={styles.brandSpotlightImg} delay={(i % 2) as 0 | 1 | 2}>
                    <Image src={brand.image.src} alt={brand.image.alt} fill loading="lazy" style={{ objectFit: 'cover' }} />
                    <div className={styles.brandSpotlightAccentBox}>
                      <div className={styles.stat}>{brand.statValue}</div>
                      <div style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ch-accent)' }}>
                        {brand.statLabel}
                      </div>
                    </div>
                  </ScrollReveal>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* COLLABORATIONS & FUTURE PROJECTS */}
      <section id={brandsData.future.id} className={`${styles.innerSection} ${styles.innerSectionAlt}`}>
        <div className={styles.aboutStoryGrid}>
          <div>
            <ScrollReveal>
              <span className={styles.sectionEyebrow}>{brandsData.future.eyebrow}</span>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                {brandsData.future.title} <em className={styles.italic}>{brandsData.future.italic}</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className={styles.brushDivider}></div>
              <p className={styles.sectionBody} style={{ marginBottom: '1.5rem' }}>{brandsData.future.desc}</p>
              <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: '2rem' }}>
                {brandsData.future.list.map((item, i) => (
                  <li key={i} style={{ marginBottom: i === 0 ? '1rem' : '0', fontSize: '1rem', color: 'var(--ch-text)' }}>
                    <strong>✦ {item.text}</strong> {item.desc}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <Link href={brandsData.future.link.href} className={styles.aboutLink} rel="noopener noreferrer" target="_blank">
                {brandsData.future.link.label}
              </Link>
            </ScrollReveal>
          </div>
          <ScrollReveal className={styles.aboutStoryImage} style={{ background: 'var(--ch-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '1px solid var(--ch-border)' }} delay={1}>
            <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>{brandsData.future.imageBox.icon}</span>
            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              {brandsData.future.imageBox.title}
            </h4>
            <p className={styles.sectionBody} style={{ textAlign: 'center', fontSize: '0.9rem', padding: '0 2rem' }}>
              {brandsData.future.imageBox.desc}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" aria-label="Call to action" className={styles.ctaSection}>
        <div className={styles.ctaBgText} aria-hidden="true">{brandsData.cta.bgText}</div>
        <ScrollReveal>
          <p className={styles.ctaEyebrow}>{brandsData.cta.eyebrow}</p>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <h2 className={styles.ctaTitle} dangerouslySetInnerHTML={{ __html: brandsData.cta.title + ' <em class="' + styles.italic + '">' + brandsData.cta.italic + '</em>' }} />
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <p className={styles.ctaBody}>{brandsData.cta.body}</p>
        </ScrollReveal>
        <ScrollReveal delay={3}>
          <div className={styles.ctaButtons}>
            {brandsData.cta.buttons.map((btn, i) => (
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
