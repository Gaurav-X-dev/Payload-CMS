import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { FeatureData, FoodItemData, ImageData, PageHeroData, TestimonialData } from '../types'
import { Icon } from './Icon'
import styles from './Theme.module.css'

export function PageHero({ eyebrow, image, overlayOpacity, subtitle, title, variant = 'inner' }: PageHeroData & { variant?: 'catering' | 'contact' | 'inner' }) {
  // When a CMS-editor-set hero image exists, it takes over the background via inline style
  // (same dark overlay convention CMSPage.tsx's blockStyle() uses elsewhere). Without one, the
  // section falls back to its existing CSS background (solid color, or the catering variant's
  // hardcoded image) exactly as before — never a broken/missing background.
  const style: CSSProperties | undefined = image
    ? {
        backgroundImage: `linear-gradient(rgb(38 51 34 / ${Math.min(100, Math.max(0, overlayOpacity ?? 70)) / 100}), rgb(38 51 34 / ${Math.min(100, Math.max(0, overlayOpacity ?? 70)) / 100})), url("${image.src.replace(/["\\]/g, '')}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }
    : undefined
  return (
    <section className={`${styles.pageHero} ${variant === 'catering' ? styles.cateringHero : ''} ${variant === 'contact' ? styles.contactHero : ''}`} style={style}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span>{eyebrow ?? title}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  )
}

export function SectionHeading({ center = false, eyebrow, title, text, light = false }: {
  center?: boolean
  eyebrow?: string
  light?: boolean
  text?: string
  title: string
}) {
  return (
    <header className={`${styles.sectionHeading} ${light ? styles.lightHeading : ''} ${center ? styles.centerHeading : ''}`}>
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </header>
  )
}

export function ActionLink({ ariaLabel, href, icon = 'arrow', label, newTab, nofollow, variant = 'primary' }: {
  ariaLabel?: string
  href: string
  icon?: string
  label: string
  newTab?: boolean
  nofollow?: boolean
  variant?: 'accent' | 'outline' | 'primary' | 'split'
}) {
  const className = `${styles.action} ${styles[variant]}`
  const content = <>{label}<Icon className={styles.actionIcon} name={icon} weight="bold" /></>
  const rel = [nofollow ? 'nofollow' : '', 'noopener', 'noreferrer'].filter(Boolean).join(' ')
  return href.startsWith('/') ? <Link aria-label={ariaLabel} className={className} href={href} rel={rel} target="_blank">{content}</Link> : (
    <a aria-label={ariaLabel} className={className} href={href} rel={rel} target="_blank">{content}</a>
  )
}

export function FeatureGrid({ features }: { features: FeatureData[] }) {
  return (
    <div className={styles.featureGrid} data-feature-count={features.length}>
      {features.map((feature, index) => {
        const customSVGMask = feature.iconSource === 'custom-svg' && feature.customIcon
          ? `url(${JSON.stringify(feature.customIcon.src)})`
          : undefined

        return (
          <article className={styles.featureCard} key={feature.renderKey ?? `feature-${index}-${feature.title}`}>
            <span>
              {customSVGMask
                ? <span
                    aria-hidden="true"
                    className={styles.featureSvgMask}
                    style={{ maskImage: customSVGMask, WebkitMaskImage: customSVGMask }}
                  />
                : /^\d+$/.test(feature.icon)
                  ? feature.icon
                  : <Icon name={feature.icon} weight="fill" />}
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        )
      })}
    </div>
  )
}

export function FoodCard({ item, compact = false }: { compact?: boolean; item: FoodItemData }) {
  return (
    <article className={`${styles.foodCard} ${compact ? styles.foodCardCompact : ''}`}>
      <div className={styles.foodImage}>
        {item.image && <Image alt={item.image.alt} fill sizes={compact ? '(max-width: 768px) 100vw, 180px' : '(max-width: 768px) 100vw, 33vw'} src={item.image.src} />}
        {item.badge && <span>{item.badge}</span>}
      </div>
      <div className={styles.foodBody}>
        <div><h3>{item.name}</h3><strong>{item.price}</strong></div>
        <p>{item.description}</p>
        {item.meta && <ul>{item.meta.map((meta) => <li key={meta}>{meta}</li>)}</ul>}
      </div>
    </article>
  )
}

export function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  const rating = Math.min(5, Math.max(1, Math.round(testimonial.rating ?? 5)))
  return (
    <figure className={styles.testimonial}>
      <div aria-label={`${rating} out of 5 stars`}>{Array.from({ length: rating }, (_, index) => <Icon key={index} name="star" weight="fill" />)}</div>
      <blockquote>“{testimonial.quote}”</blockquote>
      <figcaption><strong>{testimonial.name}</strong><span>{testimonial.attribution}</span></figcaption>
    </figure>
  )
}

export function Gallery({ images }: { images: ImageData[] }) {
  return (
    <div className={styles.gallery}>
      {images.map((image) => (
        <div key={image.id ?? `${image.src}-${image.alt}`}>
          <Image alt={image.alt} fill sizes="(max-width: 768px) 50vw, 25vw" src={image.src} />
        </div>
      ))}
    </div>
  )
}

export function Stats({ items }: { items: string[][] }) {
  return (
    <div className={styles.stats}>
      {items.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
    </div>
  )
}
