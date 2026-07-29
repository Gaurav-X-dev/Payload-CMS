import Image from 'next/image'
import { aboutData } from '../data/about'
import { ActionLink, PageHero, Stats } from '../components/Shared'
import { Icon } from '../components/Icon'
import styles from '../components/Theme.module.css'

export function AboutPage() {
  return (
    <>
      <PageHero {...aboutData.hero} />

      <section className={`${styles.section} ${styles.aboutOrigin}`}>
        <div className={styles.container}>
          <div className={styles.originGrid}>
            <div className={styles.originText}>
              <span className={styles.eyebrow}>{aboutData.origin.eyebrow}</span>
              <h2>Born in Kundapur,<br />Raised on Pure Ghee</h2>
              {aboutData.origin.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <span className={styles.originSignature}>{aboutData.origin.quote}</span>
            </div>
            <div className={styles.originImage}>
              <Image alt={aboutData.origin.image.alt} fill sizes="(max-width: 800px) 90vw, 45vw" src={aboutData.origin.image.src} />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.aboutTimelineSection}`}>
        <div className={styles.container}>
          <header className={`${styles.sourceSectionHeader} ${styles.onDark}`}>
            <span>Our Journey</span>
            <h2>Three Decades of Milestones</h2>
            <p>{aboutData.timelineIntroduction}</p>
          </header>
          <div className={styles.aboutTimeline}>
            {aboutData.timeline.map((item) => (
              <article className={styles.timelineItem} key={item.year}>
                <span className={styles.timelineDot} aria-hidden="true" />
                <div className={styles.timelineText}>
                  <strong>{item.year}</strong>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <div className={styles.timelineImage}>
                  <Image alt={item.image.alt} fill sizes="(max-width: 900px) 80vw, 42vw" src={item.image.src} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.aboutFounder}`}>
        <div className={styles.container}>
          <div className={styles.founderGrid}>
            <div className={styles.founderImage}>
              <span><Icon name="chef" weight="fill" />{aboutData.founder.badge}</span>
              <Image alt={aboutData.founder.image.alt} fill sizes="(max-width: 800px) 90vw, 35vw" src={aboutData.founder.image.src} />
            </div>
            <div className={styles.founderText}>
              <span className={styles.eyebrow}>{aboutData.founder.eyebrow}</span>
              <h2>{aboutData.founder.title}</h2>
              <strong className={styles.founderName}>{aboutData.founder.name}</strong>
              {aboutData.founder.paragraphs.map((paragraph, index) => (
                <p key={paragraph}>{index === 2 ? <><span>His philosophy is simple: </span><strong>If you can taste the shortcut, you&apos;ve already failed.</strong><span> It&apos;s this uncompromising standard that has kept VGGR&apos;s flavour consistent from Kundapur to Connaught Place.</span></> : paragraph}</p>
              ))}
              <blockquote className={styles.founderQuote}>
                <p>{aboutData.founder.quote}</p>
                <cite>{aboutData.founder.citation}</cite>
              </blockquote>
              <ActionLink href="/menu" label="Experience the Flavour" variant="primary" />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.aboutValues}`}>
        <div className={styles.container}>
          <header className={styles.sourceSectionHeader}>
            <span>What We Stand For</span>
            <h2>Our Values</h2>
            <p>{aboutData.valuesIntroduction}</p>
          </header>
          <div className={styles.valuesGrid}>
            {aboutData.values.map((value) => (
              <article key={value.title}>
                <span><Icon name={value.icon} weight="fill" /></span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.aboutStats}><Stats items={aboutData.stats} /></section>
      <section className={styles.aboutCta}>
        <div className={styles.container}>
          <span>The Proof Is In The Plate</span>
          <h2>Taste the Legacy</h2>
          <p>Thirty years of heritage, twelve secret spices, and one cast-iron promise — every bite will stay with you.</p>
          <ActionLink href="/menu" label="Explore Our Menu" variant="accent" />
        </div>
      </section>
    </>
  )
}
