import type { ReactNode } from 'react'
import styles from './Theme.module.css'

type SectionHeadingProps = {
  align?: 'center' | 'left'
  body?: string
  eyebrow?: string
  light?: boolean
  title: ReactNode
}

export function SectionHeading({ align = 'left', body, eyebrow, light = false, title }: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? styles.sectionHeadingCenter : styles.sectionHeading}>
      {eyebrow && (
        <p
          className={styles.sectionEyebrow}
          style={light ? { color: 'rgba(184,168,120,0.8)' } : undefined}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`${styles.sectionTitle} ${light ? styles.sectionTitleLight : ''}`}>{title}</h2>
      {body && (
        <p className={`${styles.sectionBody} ${light ? styles.sectionBodyLight : ''}`}>{body}</p>
      )}
    </div>
  )
}

type InnerHeroProps = {
  body?: string
  eyebrow?: string
  title: string
  image?: string
}

export function InnerHero({ body, eyebrow, title, image }: InnerHeroProps) {
  return (
    <section className={styles.innerHero}>
      <div className={styles.innerHeroContent}>
        {eyebrow && <span className={styles.innerHeroEyebrow}>{eyebrow}</span>}
        <h1 className={styles.innerHeroTitle}>{title}</h1>
        {body && <p className={styles.innerHeroBody}>{body}</p>}
      </div>
      {image && (
        <div className={styles.innerHeroImgWrap}>
          <img src={image} alt={title} />
        </div>
      )}
    </section>
  )
}
