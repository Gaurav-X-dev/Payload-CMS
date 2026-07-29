import Image from 'next/image'
import { Icon } from '../components/Icon'
import { ActionLink, FeatureGrid, Gallery, PageHero, SectionHeading, Stats } from '../components/Shared'
import { cateringData } from '../data/catering'
import styles from '../components/Theme.module.css'

export function CateringPage() {
  return (
    <>
      <PageHero {...cateringData.hero} variant="catering" />
      <section className={`${styles.section} ${styles.overlapSection}`}>
        <div className={styles.container}><FeatureGrid features={cateringData.occasions} /></div>
      </section>
      <section className={styles.section}>
        <div className={`${styles.container} ${styles.twoColumn}`}>
          <Image alt={cateringData.experience.image.alt} height={680} src={cateringData.experience.image.src} width={720} />
          <div>
            <SectionHeading eyebrow={cateringData.experience.eyebrow} title={cateringData.experience.title} />
            <div className={styles.stackedFeatures}>
              {cateringData.experience.features.map((feature) => (
                <article key={feature.title}><span>{/^\d+$/.test(feature.icon) ? feature.icon : <Icon name={feature.icon} />}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div></article>
              ))}
            </div>
            <ActionLink href="/contact" label="Plan Your Event" />
          </div>
        </div>
      </section>
      <section className={styles.statsSection}><Stats items={cateringData.stats} /></section>
      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading center title="Catering Gallery" />
          <Gallery images={cateringData.gallery} />
        </div>
      </section>
    </>
  )
}
