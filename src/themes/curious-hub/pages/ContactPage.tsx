'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { contactData } from '../data/contact'
import styles from '../components/Theme.module.css'

export function ContactPage() {
  const hero = contactData.hero
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  useEffect(() => {
    // Handle incoming Area of Interest query param
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const interest = urlParams.get('interest');
      if (interest) {
        const selectEl = document.getElementById('interest') as HTMLSelectElement;
        if (selectEl) {
          selectEl.value = interest;
        }
      }
    }
  }, [])

  return (
    <>
      <InnerHero body={hero.subtitle} eyebrow={hero.eyebrow} title={hero.title} image={hero.image} />

      {/* MAIN CONTACT CONTENT */}
      <section className={styles.innerSection}>
        <div className={styles.contactSplitCustom}>
          {/* Left side: Contact Cards & Info */}
          <div className="contact-info-cards">
            <ScrollReveal>
              <div className={styles.contactCardBox}>
                <h2 className={styles.contactCardTitle}><span>✉</span> {contactData.general.title}</h2>
                <p className={styles.sectionBody} style={{ marginBottom: '1.5rem' }}>{contactData.general.desc}</p>
                <a href={`mailto:${contactData.general.email}`} className={styles.contactCardLink}>{contactData.general.email}</a>
                <a href={`tel:${contactData.general.phone.replace(/\\s/g, '')}`} className={styles.contactCardLink}>{contactData.general.phone}</a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={1}>
              <div className={styles.contactCardBox}>
                <h2 className={styles.contactCardTitle}><span>⏰</span> Operating Hours</h2>
                {contactData.hours.map((h, i) => (
                  <div key={i} className={styles.contactHoursItem}>
                    <span>{h.days}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <div className={styles.contactCardBox}>
                <h2 className={styles.contactCardTitle}><span>📍</span> Global Locations</h2>
                {contactData.locations.map((loc, i) => (
                  <div key={i} className="location-item" style={{ marginBottom: i < contactData.locations.length - 1 ? '1.5rem' : '0' }}>
                    <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 600 }}>{loc.city}</h4>
                    <p className={styles.sectionBody} style={{ fontSize: '0.9rem' }}>{loc.address}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right side: Contact Form */}
          <ScrollReveal delay={1}>
            <div className={styles.premiumFormContainer}>
              <h2 className={styles.sectionTitle} style={{ color: 'var(--ch-text-light)', fontSize: '2rem', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                Start a Conversation
              </h2>
              <form className="premium-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for reaching out! We will get back to you shortly.'); }}>
                <div className={styles.formGroupCustom}>
                  <label htmlFor="name">Your Name</label>
                  <input type="text" id="name" name="name" placeholder="John Doe" required />
                </div>
                
                <div className={styles.formGroupCustom}>
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" placeholder="john@example.com" required />
                </div>

                <div className={styles.formGroupCustom}>
                  <label htmlFor="interest">Area of Interest</label>
                  <select id="interest" name="interest">
                    <option value="brand">New Brand Creation</option>
                    <option value="consulting">Restaurant Consulting</option>
                    <option value="b2b">B2B Solutions</option>
                    <option value="other">General Inquiry</option>
                  </select>
                </div>

                <div className={styles.formGroupCustom}>
                  <label htmlFor="message">Tell us about your project</label>
                  <textarea id="message" name="message" rows={5} placeholder="Share a few details..." required></textarea>
                </div>

                <button type="submit" className={styles.submitBtnCustom}>Send Message →</button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* INTERACTIVE OFFICE MAP SECTION */}
      <section className={`${styles.innerSection} ${styles.innerSectionAlt}`}>
        <div className={styles.servicesHeader} style={{ marginBottom: '2rem' }}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>{contactData.map.eyebrow}</p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                {contactData.map.title} <em className={styles.italic}>{contactData.map.italic}</em>
              </h2>
            </ScrollReveal>
          </div>
        </div>
        <ScrollReveal delay={2}>
          <p className={styles.sectionBody} style={{ marginBottom: '2rem' }}>{contactData.map.desc}</p>
        </ScrollReveal>
        
        <ScrollReveal delay={1}>
          <div className={styles.mapContainer}>
            <div className={styles.mapCanvas}>
              {/* SVG Vector Map Background */}
              <svg viewBox="0 0 1000 400" width="100%" height="100%" fill="var(--ch-border)" opacity="0.3" xmlns="http://www.w3.org/2000/svg">
                <path d="M150,150 Q160,140 180,160 T220,150 T280,180" stroke="var(--ch-accent)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                <path d="M400,220 Q500,180 650,210 T780,120" stroke="var(--ch-accent)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                <circle cx="200" cy="180" r="100" fill="var(--ch-border)" opacity="0.05" />
                <circle cx="700" cy="200" r="150" fill="var(--ch-border)" opacity="0.05" />
              </svg>
              
              {/* Markers */}
              {contactData.map.markers.map((marker, i) => (
                <div key={i} className={styles.mapMarker} style={{ left: marker.left, top: marker.top }}>
                  <div className={styles.mapMarkerLabel}>{marker.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ SECTION */}
      <section className={styles.innerSection}>
        <div className={styles.servicesHeader} style={{ marginBottom: 'clamp(40px, 6vw, 80px)' }}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>{contactData.faqs.eyebrow}</p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                {contactData.faqs.title} <em className={styles.italic}>{contactData.faqs.italic}</em>
              </h2>
            </ScrollReveal>
          </div>
        </div>

        <div className={styles.faqWrapContainer}>
          {contactData.faqs.items.map((faq, i) => {
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
    </>
  )
}
