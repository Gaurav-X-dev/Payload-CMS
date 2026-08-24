import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { groupBusinessHours } from '../utils/formatHours'
import { splitOmotenashiEmphasis, splitSeasonTitle } from '../utils/foldedTitles'
import type {
  ZuruZuruCardGridBlockData,
  ZuruZuruContentGridBlockData,
  ZuruZuruDishBadge,
  ZuruZuruFeatureStripBlockData,
  ZuruZuruHeroBlockData,
  ZuruZuruLocationsBlockData,
  ZuruZuruMenuShowcaseBlockData,
  ZuruZuruPageBlockData,
  ZuruZuruSectionHeaderData,
  ZuruZuruSiteData,
  ZuruZuruStoryBlockData,
  ZuruZuruTestimonialsBlockData,
} from '../mappers/dynamicTypes'

/** Fixed display text per badge type, matching the original static markup (`zz-dish-badge zz-${badgeType}`). The original data used "Best Seller" and "Popular" interchangeably for the same 'popular' type; since the schema stores only a type (not free text), "Popular" was kept as the single canonical label. */
const DISH_BADGE_LABELS: Record<ZuruZuruDishBadge, string> = {
  chef: "Chef's Choice",
  new: 'New',
  popular: 'Popular',
}

function withLineBreaks(text: string) {
  return text.split('\n').map((line, i, lines) => (
    <span key={line}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))
}

function withOmotenashiEmphasis(text: string): ReactNode {
  const parts = splitOmotenashiEmphasis(text)
  if (parts.length === 1) return text
  return parts.map((part, i) => (part === 'Omotenashi' ? <em key={i}>{part}</em> : part))
}

/** Splits on blank lines into separate <p> tags; the first paragraph keeps the "lead" treatment. */
function renderStoryParagraphs(body: string) {
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return paragraphs.map((paragraph, i) => (
    <p className={i === 0 ? 'zz-story-lead' : 'zz-story-muted'} key={paragraph}>{withOmotenashiEmphasis(paragraph)}</p>
  ))
}

function SectionHeader({ header }: { header: ZuruZuruSectionHeaderData }) {
  if (!header.title) return null
  return (
    <div className="zz-section-header">
      <div className="zz-section-subtitle zz-centered">{header.eyebrow}</div>
      <h2>{header.title} <span className="zz-jp-text">{header.japanese}</span></h2>
      {header.description && <p>{header.description}</p>}
    </div>
  )
}

function HeroSection({ block }: { block: ZuruZuruHeroBlockData }) {
  if (!block.heading) return null
  return (
    <section className="zz-home-hero">
      <div className="zz-container zz-hero-inner">
        <div className="zz-hero-left">
          <h1 className="zz-hero-heading">
            {withLineBreaks(block.heading)}
            {block.highlightedHeading && (
              <>
                <br />
                <em>{block.highlightedHeading}</em>
              </>
            )}
          </h1>
          {block.description && <p className="zz-hero-subtitle">{block.description}</p>}
          <div className="zz-hero-cta">
            {block.primaryCTA && (
              <Link className="zz-btn zz-btn-primary" href={block.primaryCTA.url} rel="noopener noreferrer" target="_blank"><span>{block.primaryCTA.label}</span></Link>
            )}
            {block.secondaryCTA && (
              <Link className="zz-btn zz-btn-outline" href={block.secondaryCTA.url} rel="noopener noreferrer" target="_blank"><span>{block.secondaryCTA.label}</span></Link>
            )}
          </div>
        </div>
        <div className="zz-hero-visual">
          <span className="zz-brush-circle" />
          {block.image && (
            <Image alt={block.imageAlt || block.heading} className="zz-chef-image" height={420} priority src={block.image.src} width={420} />
          )}
          <span className="zz-chopsticks"><i /><i /></span>
          <span className="zz-jp-decoration">良い食事<br />いつも</span>
          {block.stampText && <span className="zz-jp-stamp"><span>{block.stampText}</span></span>}
        </div>
      </div>
      <span className="zz-scroll-label">Scroll</span>
    </section>
  )
}

function FeatureStripSection({ block }: { block: ZuruZuruFeatureStripBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className="zz-features-section">
      <div className="zz-container">
        <div className="zz-features-row">
          {block.items.map((item) => (
            <article className="zz-feature-block" key={item.title}>
              <Icon className="zz-feature-icon" name={item.icon} weight="regular" />
              <div><h4>{item.title}</h4><p>{item.description}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CuisineCardGrid({ block }: { block: ZuruZuruCardGridBlockData }) {
  return (
    <section><div className="zz-container">
      <SectionHeader header={block.header} />
      <div className="zz-home-categories">
        {block.cards.map((card, i) => {
          const wide = i === 0 || i === block.cards.length - 1
          return (
            <article className={`zz-home-category ${wide ? 'zz-wide' : ''}`} key={card.title}>
              {card.image && (
                <Image alt={card.title} fill sizes={wide ? '(max-width: 768px) 92vw, 46vw' : '(max-width: 768px) 92vw, 23vw'} src={card.image.src} />
              )}
              <div><h3>{card.title}</h3><p>{card.description}</p></div>
            </article>
          )
        })}
      </div>
    </div></section>
  )
}

function DiningCardGrid({ block }: { block: ZuruZuruCardGridBlockData }) {
  return (
    <section><div className="zz-container">
      <SectionHeader header={block.header} />
      <div className="zz-home-experiences">
        {block.cards.map((card) => (
          <article key={card.title}>
            {card.image && <Image alt={card.title} fill sizes="(max-width: 768px) 92vw, 30vw" src={card.image.src} />}
            <div><h4>{card.title}</h4><p>{card.description}</p></div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function SeasonsCardGrid({ block }: { block: ZuruZuruCardGridBlockData }) {
  return (
    <section className="zz-section-alt"><div className="zz-container">
      <SectionHeader header={block.header} />
      <div className="zz-home-seasons">
        {block.cards.map((card) => {
          const { name, season } = splitSeasonTitle(card.title)
          return (
            <article key={card.title}>
              <div className="zz-home-season-image">
                {card.image && <Image alt={season} fill sizes="(max-width: 768px) 92vw, 23vw" src={card.image.src} />}
              </div>
              <div className="zz-home-season-body">
                <h4>{season} {name && <small>{name}</small>}</h4>
                <p>{card.description}</p>
                {card.link && <Link href={card.link.url}>{card.link.label}</Link>}
              </div>
            </article>
          )
        })}
      </div>
    </div></section>
  )
}

function CardGridSection({ block }: { block: ZuruZuruCardGridBlockData }) {
  if (block.cards.length === 0) return null
  if (block.variant === 'dining') return <DiningCardGrid block={block} />
  if (block.variant === 'seasons') return <SeasonsCardGrid block={block} />
  return <CuisineCardGrid block={block} />
}

function StorySection({ block }: { block: ZuruZuruStoryBlockData }) {
  if (!block.title) return null
  return (
    <section className="zz-section-alt"><div className="zz-container zz-home-story">
      <div className="zz-home-story-image">
        {block.image && <Image alt={block.imageAlt || block.title} height={680} sizes="(max-width: 992px) 92vw, 46vw" src={block.image.src} width={760} />}
      </div>
      <div>
        {block.eyebrow && <span className="zz-section-subtitle">{block.eyebrow}</span>}
        <h2>{block.title}</h2>
        {block.body && renderStoryParagraphs(block.body)}
        <div className="zz-story-japanese">おもてなし</div>
        {block.cta && <Link className="zz-btn zz-btn-outline" href={block.cta.url} rel="noopener noreferrer" target="_blank"><span>{block.cta.label}</span></Link>}
      </div>
    </div></section>
  )
}

function MenuShowcaseSection({ block }: { block: ZuruZuruMenuShowcaseBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section><div className="zz-container">
      <SectionHeader header={block.header} />
      <div className="zz-home-dishes">
        {block.items.map((dish) => (
          <article className="zz-home-dish" key={dish.id}>
            <div className="zz-home-dish-image">
              {dish.image && <Image alt={dish.name} fill sizes="(max-width: 768px) 92vw, 30vw" src={dish.image.src} />}
              {dish.badge && <span className={`zz-dish-badge zz-${dish.badge}`}>{DISH_BADGE_LABELS[dish.badge]}</span>}
            </div>
            <div className="zz-home-dish-body">
              <div className="zz-home-dish-meta"><h3>{dish.name}</h3><strong>${dish.price}</strong></div>
              <p>{dish.description}</p>
              <div className="zz-home-dish-info">
                {dish.calories != null && <span>♨ {dish.calories} cal</span>}
                <span className="zz-spicy-level">
                  {[0, 1, 2].map((dot) => <i className={dot < dish.heat ? 'zz-active' : ''} key={dot} />)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {block.cta && <div className="zz-home-center"><Link className="zz-btn zz-btn-outline" href={block.cta.url} rel="noopener noreferrer" target="_blank"><span>{block.cta.label}</span></Link></div>}
    </div></section>
  )
}

function ServicesGrid({ block }: { block: ZuruZuruContentGridBlockData }) {
  return (
    <section className="zz-section-alt"><div className="zz-container">
      <SectionHeader header={block.header} />
      <div className="zz-home-services">
        {block.items.map((item) => (
          <article key={item.title}>
            <Icon name={item.icon} size={44} weight="thin" />
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function ReasonsGrid({ block }: { block: ZuruZuruContentGridBlockData }) {
  return (
    <section><div className="zz-container">
      <SectionHeader header={block.header} />
      <div className="zz-home-reasons">
        {block.items.map((item) => (
          <article key={item.title}>
            <span><Icon name={item.icon} size={30} weight="regular" /></span>
            <div><h4>{item.title}</h4><p>{item.description}</p></div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function ContentGridSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return block.presentation === 'services' ? <ServicesGrid block={block} /> : <ReasonsGrid block={block} />
}

function TestimonialsSection({ block }: { block: ZuruZuruTestimonialsBlockData }) {
  const testimonial = block.items[0]
  if (!testimonial) return null
  return (
    <section className="zz-section-dark zz-home-testimonial"><div className="zz-container">
      <SectionHeader header={block.header} />
      <div className="zz-home-testimonial-wrap">
        <div className="zz-home-stars">{Array.from({ length: testimonial.rating }, () => '★').join(' ')}</div>
        <blockquote>{testimonial.review}</blockquote>
        <div className="zz-home-author">
          {testimonial.photo && <Image alt={testimonial.name} height={64} src={testimonial.photo.src} width={64} />}
          <div><strong>{testimonial.name}</strong><span>{testimonial.role}</span></div>
        </div>
      </div>
    </div></section>
  )
}

function LocationsSection({ block, site }: { block: ZuruZuruLocationsBlockData; site: ZuruZuruSiteData }) {
  const location = block.location
  if (!location) return null
  const hourLines = groupBusinessHours(location.hours)
  return (
    <section><div className="zz-container">
      <SectionHeader header={block.header} />
      <div className="zz-home-location">
        {block.showMap && (
          <div className="zz-home-map">
            <Icon name="map" size={48} />
            <p>Google Maps Integration<br />{location.address.split('\n')[0]}</p>
          </div>
        )}
        <div className="zz-home-location-info">
          <h4>Address</h4>
          <p>{withLineBreaks(location.address)}</p>
          {hourLines.length > 0 && (
            <>
              <h4>Opening Hours</h4>
              <ul>{hourLines.map((line) => <li key={line}>{line}</li>)}</ul>
            </>
          )}
          {location.parking && (<><h4>Parking</h4><p>{location.parking}</p></>)}
          {(site.phone || site.email) && (
            <>
              <h4>Contact</h4>
              <p>
                {site.phone && <>☎ {site.phone}</>}
                {site.phone && site.email && <br />}
                {site.email && <>✉ {site.email}</>}
              </p>
            </>
          )}
          <Link className="zz-btn zz-btn-outline" href="/locations" rel="noopener noreferrer" target="_blank"><span>All Locations</span></Link>
        </div>
      </div>
    </div></section>
  )
}

export function ZuruZuruHomeSection({ block, site }: { block: ZuruZuruPageBlockData; site: ZuruZuruSiteData }) {
  switch (block.type) {
    case 'hero': return <HeroSection block={block.data} />
    case 'featureStrip': return <FeatureStripSection block={block.data} />
    case 'cardGrid': return <CardGridSection block={block.data} />
    case 'story': return <StorySection block={block.data} />
    case 'menuShowcase': return <MenuShowcaseSection block={block.data} />
    case 'contentGrid': return <ContentGridSection block={block.data} />
    case 'testimonials': return <TestimonialsSection block={block.data} />
    case 'locations': return <LocationsSection block={block.data} site={site} />
    default: return null
  }
}

export function CMSHomePage({ blocks, site }: { blocks: ZuruZuruPageBlockData[]; site: ZuruZuruSiteData }) {
  return (
    <>
      {blocks.map((block, i) => <ZuruZuruHomeSection block={block} key={i} site={site} />)}
    </>
  )
}
