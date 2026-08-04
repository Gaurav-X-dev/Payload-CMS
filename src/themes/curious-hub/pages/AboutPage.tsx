import Image from 'next/image'
import Link from 'next/link'
import { InnerHero } from '../components/Shared'
import { ScrollReveal } from '../components/ScrollReveal'
import { aboutData } from '../data/about'
import styles from '../components/Theme.module.css'

export function AboutPage() {
  const hero = aboutData.hero
  return (
    <>
      <InnerHero body={hero.subtitle} eyebrow={hero.eyebrow} title={hero.title} image="/themes/curious-hub/images/banner_about.png" />

      {/* STORY SECTION */}
      <section id="story" className={styles.innerSection}>
        <div className={styles.aboutStoryGrid}>
          <ScrollReveal className={styles.aboutStoryImage}>
            <Image
              src="/themes/curious-hub/images/team_about.png"
              alt="Curious Laddoos creative directors collaborating in office"
              width={800}
              height={600}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              loading="lazy"
            />
          </ScrollReveal>
          <div>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>
                {aboutData.story.title} <em className={styles.italic}>{aboutData.story.italic}</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className={styles.brushDivider}></div>
              <p className={styles.sectionBody} style={{ marginBottom: '1.2rem' }}>{aboutData.story.p1}</p>
              <p className={styles.sectionBody}>{aboutData.story.p2}</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section id="philosophy" className={`${styles.innerSection} ${styles.innerSectionAlt}`}>
        <div className={styles.aboutStoryGrid}>
          <div>
            <ScrollReveal>
              <span className={styles.sectionEyebrow}>{aboutData.mission.eyebrow}</span>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>
                {aboutData.mission.title} <em className={styles.italic}>{aboutData.mission.italic}</em>
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={2}>
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.8rem' }}>{aboutData.mission.missionTitle}</h4>
                <p className={styles.sectionBody}>{aboutData.mission.missionDesc}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={3}>
              <div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.8rem' }}>{aboutData.mission.visionTitle}</h4>
                <p className={styles.sectionBody}>{aboutData.mission.visionDesc}</p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal className={styles.aboutStoryImage} delay={1}>
            <Image
              src="/themes/curious-hub/images/office_tokyo.png"
              alt="Curious Laddoos clean modern minimalist design headquarters"
              width={800}
              height={600}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              loading="lazy"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className={styles.innerSection}>
        <ScrollReveal>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {aboutData.values.title} <em className={styles.italic}>{aboutData.values.italic}</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <p className={styles.sectionBody} style={{ textAlign: 'center', margin: '0 auto 3rem' }}>{aboutData.values.desc}</p>
        </ScrollReveal>
        
        <div className={styles.valuesGrid}>
          {aboutData.values.items.map((val, i) => (
            <ScrollReveal delay={(i % 5) as 0 | 1 | 2 | 3 | 4} key={val.number}>
              <div className={styles.valueCard}>
                <div className={styles.valueNum}>{val.number}</div>
                <h3 className={styles.valueTitle}>{val.title}</h3>
                <p className={styles.sectionBody} style={{ fontSize: '0.9rem' }}>{val.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section id="leadership" className={`${styles.innerSection} ${styles.innerSectionAlt}`}>
        <ScrollReveal>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {aboutData.leadership.title} <em className={styles.italic}>{aboutData.leadership.italic}</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <p className={styles.sectionBody} style={{ textAlign: 'center', margin: '0 auto 4rem' }}>{aboutData.leadership.desc}</p>
        </ScrollReveal>

        <div className={styles.leadershipGrid}>
          {aboutData.leadership.items.map((leader, i) => (
            <ScrollReveal delay={(i % 3) as 0 | 1 | 2 | 3 | 4} key={leader.name}>
              <div className={styles.leaderCard}>
                <div className={styles.leaderPhoto}>
                  <Image alt={leader.image.alt} fill loading="lazy" src={leader.image.src} style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.leaderName}>{leader.name}</div>
                <div className={styles.leaderRole}>{leader.role}</div>
                <p className={styles.leaderBio}>{leader.bio}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* JOURNEY SECTION */}
      <section id="journey" className={styles.innerSection}>
        <ScrollReveal>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            {aboutData.journey.title} <em className={styles.italic}>{aboutData.journey.italic}</em>
          </h2>
        </ScrollReveal>
        
        <div className={styles.journeyTimeline}>
          {aboutData.journey.items.map((m, i) => (
            <ScrollReveal delay={(i % 5) as 0 | 1 | 2 | 3 | 4} key={m.year}>
              <div className={styles.journeyMilestone}>
                <div className={styles.journeyYear}>{m.year}</div>
                <div className={styles.journeyEvent}>{m.event}</div>
                <p className={styles.journeyDesc}>{m.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="cta" aria-label="Call to action" className={styles.ctaSection}>
        <div className={styles.ctaBgText} aria-hidden="true">{aboutData.cta.bgText}</div>
        <ScrollReveal>
          <p className={styles.ctaEyebrow}>{aboutData.cta.eyebrow}</p>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <h2 className={styles.ctaTitle} dangerouslySetInnerHTML={{ __html: aboutData.cta.title + ' <em class="' + styles.italic + '">' + aboutData.cta.italic + '</em>' }} />
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <p className={styles.ctaBody}>{aboutData.cta.body}</p>
        </ScrollReveal>
        <ScrollReveal delay={3}>
          <div className={styles.ctaButtons}>
            {aboutData.cta.buttons.map((btn, i) => (
              <Link key={i} href={btn.href} className={styles[btn.type]}>
                {btn.label}
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
