import Image from 'next/image'
import { Icon } from './Icon'
import { splitTitleMeta } from '../utils/foldedTitles'
import type { ZuruZuruHeroBlockData, ZuruZuruMediaData, ZuruZuruSectionHeaderData, ZuruZuruStoryBlockData } from '../mappers/dynamicTypes'

/**
 * Matches Shared.tsx's `PageHero` markup/classes exactly (background-image hero used by every
 * inner page), but sources its background from a CMS Media URL instead of the static `image()`
 * asset-path helper, since Payload media URLs are already complete paths. Shared by every
 * CMS-driven Zuru Zuru inner page (Menu, About, ...).
 */
export function CMSPageHero({ block }: { block: ZuruZuruHeroBlockData }) {
  if (!block.heading) return null
  const backgroundSrc = block.backgroundImage?.src
  const style = backgroundSrc
    ? { backgroundImage: `linear-gradient(rgba(17,17,17,.7),rgba(17,17,17,.7)),url('${backgroundSrc}')` }
    : undefined
  return (
    <section className="zz-page-hero" style={style}>
      <div className="zz-container">
        {block.eyebrow && <span>{block.eyebrow}</span>}
        <h1>{block.heading}</h1>
        <p>{block.description}</p>
      </div>
    </section>
  )
}

/**
 * Matches Shared.tsx's `SectionHeader` markup/classes exactly — the simpler inner-page section
 * header (no Japanese-text span, no forced centering), distinct from the Home page's own
 * SectionHeader treatment in CMSHomePage.tsx.
 */
export function CMSSectionHeader({ dark, header }: { dark?: boolean; header: ZuruZuruSectionHeaderData }) {
  if (!header.title) return null
  return (
    <header className={`zz-section-header ${dark ? 'zz-on-dark' : ''}`}>
      {header.eyebrow && <span className="zz-section-subtitle">{header.eyebrow}</span>}
      <h2>{header.title}</h2>
      {header.description && <p>{header.description}</p>}
    </header>
  )
}

export type PlainCardGridItem = {
  description: string
  icon?: string
  image?: ZuruZuruMediaData
  title: string
}

/**
 * Matches Shared.tsx's `CardGrid` markup/classes exactly (`zz-content-grid zz-grid-N` /
 * `zz-content-card` / `zz-card-copy` / `zz-card-meta`). Used by every inner page whose original
 * design shows a plain title+description card grid (with or without an image/icon) — the original
 * component has no stored `columns` field on `contentgridBlock`, so the column count is derived
 * from the item count (4 items -> 4 columns, matching every current usage; otherwise the same
 * 3-column default `CardGrid` itself falls back to).
 */
export function PlainCardGrid({ items }: { items: PlainCardGridItem[] }) {
  if (items.length === 0) return null
  const columns = items.length === 4 ? 4 : 3
  return (
    <div className={`zz-content-grid zz-grid-${columns}`}>
      {items.map((item) => {
        const { meta, title } = splitTitleMeta(item.title)
        return (
          <article className="zz-content-card" key={item.title}>
            {item.image && (
              <div className="zz-card-image">
                <Image alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" src={item.image.src} />
              </div>
            )}
            <div className="zz-card-copy">
              {item.icon && <Icon name={item.icon} size={38} weight="regular" />}
              {meta && <span className="zz-card-meta">{meta}</span>}
              <h3>{title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

/**
 * Matches the About page's "Our Roots" / Private Dining's intro section markup exactly — a plain
 * two-column story panel (`zz-section-alt` / `zz-split-layout` / `zz-story-image`), no CTA/quote/
 * stat-badge. Shared by every inner page whose original design uses this exact treatment (the
 * Chefs page's spotlight uses a different class, `zz-portrait`, and stays page-specific).
 */
export function StorySimplePanel({ block }: { block: ZuruZuruStoryBlockData }) {
  if (!block.title) return null
  const imageFirst = block.imagePosition === 'left'
  const textCol = (
    <div>
      {block.eyebrow && <span className="zz-section-subtitle">{block.eyebrow}</span>}
      <h2>{block.title}</h2>
      {block.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </div>
  )
  const imageCol = block.image && (
    <div className="zz-story-image">
      <Image alt={block.imageAlt || block.title} fill sizes="(max-width:800px) 100vw,50vw" src={block.image.src} />
    </div>
  )
  return (
    <section className="zz-section-alt"><div className="zz-container zz-split-layout">
      {imageFirst ? <>{imageCol}{textCol}</> : <>{textCol}{imageCol}</>}
    </div></section>
  )
}

/**
 * Matches the original's flat `zz-benefits` pill list exactly (Careers' Perks & Benefits,
 * Locations' Guest Amenities — same shape, two different pages). Reuses `contentgridBlock`'s
 * existing `'partners'` presentation value (already defined as "Compact Pills"), which needs only
 * a `title` per item — description/icon are left unset and ignored.
 */
export function BenefitsPills({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null
  return (
    <div className="zz-benefits">
      {labels.map((label) => <span key={label}>{label}</span>)}
    </div>
  )
}
