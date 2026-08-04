'use client'

import Image from 'next/image'
import Link from 'next/link'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { blogData } from '../data/blog'
import styles from '../components/Theme.module.css'

export function BlogPage() {
  const hero = blogData.hero
  return (
    <>
      <InnerHero body={hero.subtitle} eyebrow={hero.eyebrow} title={hero.title} image={hero.image} />

      {/* BLOG MAIN CONTENT */}
      <section className={styles.innerSection}>
        
        {/* Featured Article */}
        <ScrollReveal>
          <div className={styles.blogFeaturedBanner}>
            <div className={styles.blogFeaturedImg}>
              <Image src={blogData.featured.image.src} alt={blogData.featured.image.alt} fill loading="lazy" style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.blogFeaturedContent}>
              <span className={styles.sectionEyebrow}>{blogData.featured.eyebrow}</span>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', margin: '1rem 0', lineHeight: 1.2, color: 'var(--ch-dark)' }}>
                {blogData.featured.title}
              </h3>
              <p className={styles.sectionBody} style={{ fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                {blogData.featured.desc}
              </p>
              <span style={{ fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ch-accent)', fontWeight: 600 }}>
                {blogData.featured.link}
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Articles Grid */}
        <div className={styles.blogMainGrid}>
          {blogData.articles.map((article, i) => (
            <ScrollReveal delay={(i % 3) as 0 | 1 | 2} key={i}>
              <div className={styles.journalCard} style={{ display: 'flex', flexDirection: 'column', background: 'var(--ch-surface)', border: '1px solid var(--ch-border)', borderRadius: 'var(--ch-radius-lg)', overflow: 'hidden' }}>
                <div className={styles.journalCardImage} style={{ height: '220px', position: 'relative' }}>
                  <Image src={article.image.src} alt={article.image.alt} fill loading="lazy" style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.journalCardBody} style={{ padding: '2rem' }}>
                  <div className={styles.journalCardTag} style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ch-accent)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {article.tag}
                  </div>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: '1rem', lineHeight: 1.3, color: 'var(--ch-dark)' }}>
                    {article.title}
                  </h4>
                  <p className={styles.sectionBody} style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {article.excerpt}
                  </p>
                  <div className={styles.journalCardMeta} style={{ fontSize: '0.72rem', color: 'var(--ch-text-muted)' }}>
                    {article.date}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Newsletter subscription */}
        <ScrollReveal>
          <div className={styles.blogNewsletterBox}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '1rem' }}>
              {blogData.newsletter.title}
            </h3>
            <p className={styles.sectionBody} style={{ margin: '0 auto', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
              {blogData.newsletter.desc}
            </p>
            <form className={styles.blogNewsletterForm} onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing! Our next report will arrive in your inbox soon.'); }}>
              <input type="email" className={styles.blogNewsletterInput} placeholder={blogData.newsletter.placeholder} required />
              <button type="submit" className={styles.blogNewsletterBtn}>
                {blogData.newsletter.button}
              </button>
            </form>
          </div>
        </ScrollReveal>

      </section>
    </>
  )
}
