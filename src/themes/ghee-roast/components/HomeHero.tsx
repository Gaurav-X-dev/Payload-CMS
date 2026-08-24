import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'
import type { GheeRoastHeroData } from '../dynamicTypes'
import type { LinkData } from '../types'
import { ActionLink } from './Shared'
import { Icon } from './Icon'
import styles from './Theme.module.css'

export function HomeHero({
  hero,
  orderLinks,
}: {
  hero: GheeRoastHeroData
  orderLinks: LinkData[]
}) {
  if (!hero.enabled) return null

  const safeCSSURL = (value: string): string =>
    `url("${value.replace(/["\\\r\n]/g, '')}")`
  const backgroundStyle = hero.backgroundImage
    ? {
        '--gr-hero-background': safeCSSURL(hero.backgroundImage.src),
        '--gr-hero-mobile-background': safeCSSURL(hero.mobileBackgroundImage?.src ?? hero.backgroundImage.src),
        '--gr-hero-overlay': String((hero.overlayOpacity ?? 0) / 100),
      } as CSSProperties
    : undefined

  return <section
    className={`${styles.homeHero} ${hero.backgroundImage ? styles.homeHeroWithBackground : ''}`}
    style={backgroundStyle}
  >
    <div className={styles.heroCopy}>
      {hero.eyebrow && <span>{hero.eyebrow}</span>}
      <h1>{hero.heading.split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}<em>{hero.highlightedHeading}</em></h1>
      {hero.description && <p>{hero.description}</p>}
      {(hero.primaryCTA || hero.secondaryCTA) && <div className={styles.actions}>
        {hero.primaryCTA && <ActionLink href={hero.primaryCTA.href} label={hero.primaryCTA.label} />}
        {hero.secondaryCTA && <ActionLink href={hero.secondaryCTA.href} icon="moped" label={hero.secondaryCTA.label} variant="outline" />}
      </div>}
      {orderLinks.length > 0 && <div className={styles.heroApps}>
        {hero.orderPlatformsLabel && <span>{hero.orderPlatformsLabel}</span>}
        {orderLinks.map((item) => {
          const lowerLabel = item.label.toLowerCase()
          const isSwiggy = lowerLabel.includes('swiggy')
          const isZomato = lowerLabel.includes('zomato')
          const className = isSwiggy ? styles.swiggyLink : isZomato ? styles.zomatoLink : undefined

          let linkContent: ReactNode = item.label
          if (isSwiggy) linkContent = <><strong>S</strong> Swiggy</>
          if (isZomato) linkContent = 'zomato'

          return <a className={className} href={item.href} key={`${item.label}-${item.href}`} rel="noopener noreferrer" target="_blank">{linkContent}</a>
        })}
      </div>}
    </div>
    {hero.image && <div className={styles.heroDish}>
      <span className={styles.heroGlow} />
      <picture className={styles.heroPicture}>
        {hero.mobileImage && <source media="(max-width: 700px)" srcSet={hero.mobileImage.src} />}
        <Image alt={hero.image.alt} fill priority sizes="(max-width: 900px) 80vw, 45vw" src={hero.image.src} unoptimized />
      </picture>
      {hero.stampText && <span className={styles.heroStamp}>
        <Icon name="heart" weight="fill" />
        <span>{hero.stampText.split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</span>
      </span>}
    </div>}
  </section>
}
