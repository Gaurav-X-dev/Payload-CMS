import Image from 'next/image'
import Link from 'next/link'
import type { CardData } from '../types'
import { image } from '../data/site'
import { Icon } from './Icon'

export function PageHero({ background = 'chef.png', eyebrow, title, text }: { background?: string; eyebrow?: string; text: string; title: string }) {
  return <section className="zz-page-hero" style={{ backgroundImage: `linear-gradient(rgba(17,17,17,.7),rgba(17,17,17,.7)),url('${image(background)}')` }}><div className="zz-container">{eyebrow && <span>{eyebrow}</span>}<h1>{title}</h1><p>{text}</p></div></section>
}

export function SectionHeader({ dark = false, eyebrow, text, title }: { dark?: boolean; eyebrow?: string; text?: string; title: string }) {
  return <header className={`zz-section-header ${dark ? 'zz-on-dark' : ''}`}>{eyebrow && <span className="zz-section-subtitle">{eyebrow}</span>}<h2>{title}</h2>{text && <p>{text}</p>}</header>
}

export function CardGrid({ cards, className = '', columns = 3 }: { cards: CardData[]; className?: string; columns?: number }) {
  return <div className={`zz-content-grid zz-grid-${columns} ${className}`}>{cards.map((card, index) => <article className="zz-content-card" key={`${card.title}-${index}`}>{card.image && <div className="zz-card-image"><Image alt={card.title} fill sizes="(max-width: 768px) 100vw, 33vw" src={image(card.image)} /></div>}<div className="zz-card-copy">{card.icon && <Icon name={card.icon} size={38} weight="regular" />} {card.meta && <span className="zz-card-meta">{card.meta}</span>}<h3>{card.title}</h3><p>{card.description}</p></div></article>)}</div>
}

export function CTA({ href = '/reservation', label = 'Reserve a Table', text, title }: { href?: string; label?: string; text: string; title: string }) {
  return <section className="zz-cta-section"><div className="zz-container"><h2>{title}</h2><p>{text}</p><Link className="zz-btn zz-btn-accent" href={href}>{label}<Icon name="arrow" /></Link></div></section>
}

export function FormField({ label, name, options, placeholder, type = 'text' }: { label: string; name: string; options?: string[]; placeholder?: string; type?: string }) {
  return <label className={`zz-form-group ${type === 'textarea' ? 'zz-full-width' : ''}`}><span>{label}</span>{type === 'select' ? <select name={name} required><option value="">{placeholder ?? 'Select...'}</option>{options?.map((option) => <option key={option}>{option}</option>)}</select> : type === 'textarea' ? <textarea name={name} placeholder={placeholder} rows={5} /> : <input name={name} placeholder={placeholder} required type={type} />}</label>
}
