import { ActionLink, FeatureGrid, PageHero, SectionHeading } from '../components/Shared'
import { deliveryData } from '../data/delivery'
import styles from '../components/Theme.module.css'

export function DeliveryPage() {
  return (
    <>
      <PageHero {...deliveryData.hero} />
      <section className={`${styles.section} ${styles.overlapSection}`}>
        <div className={`${styles.container} ${styles.platformGrid}`}>
          {deliveryData.platforms.map((platform) => (
            <article key={platform.name}><strong>{platform.name.slice(0, 1)}</strong><div><h2>{platform.name}</h2><p>{platform.description}</p></div><ActionLink href={platform.href} label="Order Now" /></article>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}><SectionHeading center eyebrow="The Process" title="How It Works" /><FeatureGrid features={deliveryData.steps} /></div>
      </section>
      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.container}>
          <SectionHeading center light title="Delivery Zones" />
          <div className={styles.zoneGrid}>{deliveryData.zones.map((zone) => <article key={zone.title}><h3>{zone.title}</h3><p>{zone.description}</p></article>)}</div>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}><SectionHeading center title="Our Delivery Promise" /><FeatureGrid features={deliveryData.promises} /></div>
      </section>
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <SectionHeading center title="Common Questions" />
          <div className={styles.faqs}>{deliveryData.faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </div>
      </section>
      <section className={styles.cta}><h2>Ready for a Feast?</h2><div className={styles.actions}>{deliveryData.platforms.map((platform) => <ActionLink href={platform.href} key={platform.name} label={`Order on ${platform.name}`} variant="accent" />)}</div></section>
    </>
  )
}
