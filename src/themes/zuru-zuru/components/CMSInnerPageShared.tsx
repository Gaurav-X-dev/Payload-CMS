import type { ZuruZuruHeroBlockData, ZuruZuruSectionHeaderData } from '../mappers/dynamicTypes'

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
