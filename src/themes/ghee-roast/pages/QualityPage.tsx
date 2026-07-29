import Image from 'next/image'
import { ActionLink, FeatureGrid, PageHero, SectionHeading } from '../components/Shared'
import { qualityData } from '../data/quality'
import styles from '../components/Theme.module.css'

export function QualityPage() {
  return (
    <>
      <PageHero {...qualityData.hero} />
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.twoColumn}`}>
          <Image alt="Fresh hand-sourced ingredients" height={680} src="/themes/ghee-roast/images/quality_ingredients.png" width={720} />
          <div>
            <SectionHeading eyebrow="Our Zero-Shortcut Philosophy" title={qualityData.philosophy.title} />
            {qualityData.philosophy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <blockquote className={styles.pullQuote}>“{qualityData.philosophy.quote}”</blockquote>
            <ul className={styles.checkList}>{qualityData.philosophy.points.map((point) => <li key={point}>{point}</li>)}</ul>
          </div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.sectionAlt}`}><div className={styles.container}><SectionHeading center eyebrow="From Source to Plate" title="The Ingredients We Choose" /><FeatureGrid features={qualityData.ingredients} /></div></section>
      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.container}>
          <SectionHeading center eyebrow="Why It Changes Everything" light title="The Ghee Difference" />
          <div className={styles.comparison} role="table" aria-label="Ghee and refined oil comparison">
            <div role="row"><strong role="columnheader">Attribute</strong><strong role="columnheader">Pure Ghee</strong><strong role="columnheader">Refined Oil</strong></div>
            {qualityData.comparison.map((row) => <div key={row[0]} role="row">{row.map((cell, index) => <span key={cell} role={index === 0 ? 'rowheader' : 'cell'}>{cell}</span>)}</div>)}
          </div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading center eyebrow="How Every Day Begins" title="Our Daily Process" />
          <div className={styles.dailyProcess}>{qualityData.process.map(([time, title, description], index) => <article key={time}><strong>{index + 1}</strong><span>{time}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </div>
      </section>
      <section className={`${styles.section} ${styles.sectionAlt}`}><div className={styles.container}><SectionHeading center eyebrow="Our Commitments to You" title="The VGGR Quality Pledges" /><FeatureGrid features={qualityData.pledges} /></div></section>
      <section className={styles.cta}><span>The Proof Is In The Plate</span><h2>Taste the Difference</h2><p>Read about quality, or experience it one bite at a time.</p><ActionLink href="/menu" label="Explore Our Menu" variant="accent" /></section>
    </>
  )
}
