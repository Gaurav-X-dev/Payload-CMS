import Image from 'next/image'
import Link from 'next/link'
import type { FeatureData, FoodItemData, ImageData, PageHeroData, TestimonialData } from '../types'
import { Icon } from './Icon'
import styles from './Theme.module.css'

export function PageHero({ eyebrow, subtitle, title, variant = 'inner' }: PageHeroData & { variant?: 'catering' | 'contact' | 'inner' }) {
  return (
    <section className={`${styles.pageHero} ${variant === 'catering' ? styles.cateringHero : ''} ${variant === 'contact' ? styles.contactHero : ''}`}>
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

export function ActionLink({ href, icon = 'arrow', label, variant = 'primary' }: {
  href: string
  icon?: string
  label: string
  variant?: 'accent' | 'outline' | 'primary' | 'split'
}) {
  const className = `${styles.action} ${styles[variant]}`
  const content = <>{label}<Icon className={styles.actionIcon} name={icon} weight="bold" /></>
  return href.startsWith('/') ? <Link className={className} href={href}>{content}</Link> : (
    <a className={className} href={href}>{content}</a>
  )
}

export function FeatureGrid({ features }: { features: FeatureData[] }) {
  return (
    <div className={styles.featureGrid}>
      {features.map((feature) => (
        <article className={styles.featureCard} key={feature.title}>
          <span>{/^\d+$/.test(feature.icon) ? feature.icon : <Icon name={feature.icon} weight="fill" />}</span>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </article>
      ))}
    </div>
  )
}

export function FoodCard({ item, compact = false }: { compact?: boolean; item: FoodItemData }) {
  return (
    <article className={`${styles.foodCard} ${compact ? styles.foodCardCompact : ''}`}>
      <div className={styles.foodImage}>
        <Image alt={item.image.alt} fill sizes={compact ? '(max-width: 768px) 100vw, 180px' : '(max-width: 768px) 100vw, 33vw'} src={item.image.src} />
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
  return (
    <figure className={styles.testimonial}>
      <div aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" weight="fill" />)}</div>
      <blockquote>“{testimonial.quote}”</blockquote>
      <figcaption><strong>{testimonial.name}</strong><span>{testimonial.attribution}</span></figcaption>
    </figure>
  )
}

export function Gallery({ images }: { images: ImageData[] }) {
  return (
    <div className={styles.gallery}>
      {images.map((image) => (
        <div key={`${image.src}-${image.alt}`}>
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
