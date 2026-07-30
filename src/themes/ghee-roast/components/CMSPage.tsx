import Image from 'next/image'
import type { CSSProperties } from 'react'
import type {
  GheeRoastDynamicContent,
  GheeRoastEventData,
  GheeRoastFAQData,
  GheeRoastLocationData,
  GheeRoastTeamMemberData,
} from '../dynamicTypes'
import {
  gheeRoastRelationshipIDs,
  safeGheeRoastHref,
  selectGheeRoastRelationships,
} from '../mappers/cmsContent'
import type { FeatureData, ImageData, LinkData, TestimonialData } from '../types'
import { GHEE_ROAST_SIMPLE_SECTION_BLOCK_TYPES } from '../utils/blockSupport'
import { ContactForm } from './ContactForm'
import { Newsletter } from './Newsletter'
import {
  ActionLink,
  FeatureGrid,
  FoodCard,
  Gallery,
  PageHero,
  SectionHeading,
  Stats,
  TestimonialCard,
} from './Shared'
import styles from './Theme.module.css'

type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' ? value as UnknownRecord : null

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  const item = record(value)
  return item && (typeof item.id === 'number' || typeof item.id === 'string')
    ? String(item.id)
    : null
}

const number = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const image = (
  value: unknown,
  tenantID?: number | string,
): ImageData | undefined => {
  const wrapper = record(value)
  const media = record(wrapper?.item) ?? record(wrapper?.media) ?? wrapper
  if (
    tenantID !== undefined &&
    relationshipID(media?.tenantId) !== String(tenantID)
  ) return undefined
  const src = text(media?.url)
  if (!src) return undefined
  return {
    alt: text(wrapper?.altOverride) || text(media?.alt) || text(media?.title),
    src,
  }
}

const pageHref = (
  value: unknown,
  tenantID?: number | string,
): string => {
  const page = record(value)
  if (
    !page ||
    tenantID === undefined ||
    relationshipID(page.tenantId) !== String(tenantID)
  ) return ''
  if (page.isHomePage === true) return '/'
  const slug = text(page.slug)
  return slug ? `/${slug.replace(/^\/+/, '')}` : ''
}

const link = (
  value: unknown,
  tenantID?: number | string,
): LinkData | undefined => {
  const item = record(value)
  if (!item || item.disabled === true) return undefined
  const label = text(item.label)
  const type = text(item.type)
  const href = type === 'reference'
    ? pageHref(item.reference, tenantID)
    : safeGheeRoastHref(item.url, type)
  return label && href ? { href, label } : undefined
}

const heading = (block: UnknownRecord) => {
  const section = record(block.sectionHeader)
  return {
    center: text(section?.alignment) === 'center',
    eyebrow: text(section?.eyebrow) || undefined,
    text: text(section?.description) || text(section?.subtitle) || undefined,
    title: text(section?.title) || text(block.title),
  }
}

const blockStyle = (
  block: UnknownRecord,
  tenantID?: number | string,
): CSSProperties => {
  const settings = record(block.settings)
  const media = image(settings?.backgroundImage, tenantID)
  return media
    ? {
        backgroundImage: `linear-gradient(rgb(38 51 34 / ${Math.min(100, Math.max(0, number(settings?.overlayOpacity, 70))) / 100}), rgb(38 51 34 / ${Math.min(100, Math.max(0, number(settings?.overlayOpacity, 70))) / 100})), url("${media.src.replace(/["\\]/g, '')}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }
    : {}
}

const blockClassName = (block: UnknownRecord): string => {
  const settings = record(block.settings)
  const background = text(settings?.backgroundColor)
  return [
    styles.section,
    background === 'surface' ? styles.sectionAlt : '',
    ['primary', 'dark'].includes(background) ? styles.darkSection : '',
  ].filter(Boolean).join(' ')
}

const lexicalText = (value: unknown): string => {
  const node = record(value)
  if (!node) return ''
  const ownText = text(node.text)
  const children = Array.isArray(node.children)
    ? node.children.map(lexicalText).filter(Boolean).join(node.type === 'paragraph' ? ' ' : '\n')
    : ''
  return [ownText, children].filter(Boolean).join('')
}

function TeamCards({ members }: { members: GheeRoastTeamMemberData[] }) {
  if (!members.length) return <p className={styles.cmsEmpty}>Team profiles will appear here when published.</p>
  return <div className={styles.cmsCardGrid}>{members.map((member) => (
    <article className={styles.cmsCard} key={member.id}>
      {member.photo && <Image alt={member.photo.alt} height={420} src={member.photo.src} unoptimized width={420} />}
      <h3>{member.name}</h3>
      <strong>{member.role}</strong>
      {member.bio && <p>{member.bio}</p>}
      {member.quote && <blockquote>“{member.quote}”</blockquote>}
    </article>
  ))}</div>
}

function EventCards({ events }: { events: GheeRoastEventData[] }) {
  if (!events.length) return <p className={styles.cmsEmpty}>There are no published events right now.</p>
  return <div className={styles.cmsCardGrid}>{events.map((event) => (
    <article className={styles.cmsCard} key={event.id}>
      {event.image && <Image alt={event.image.alt} height={360} src={event.image.src} unoptimized width={560} />}
      {Number.isFinite(Date.parse(event.startsAt)) && <time dateTime={event.startsAt}>
        {new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(event.startsAt))}
      </time>}
      <h3>{event.title}</h3>
      <p>{event.summary}</p>
      {event.locationName && <small>{event.locationName}</small>}
      {event.bookingUrl && <ActionLink href={event.bookingUrl} label="Book now" />}
    </article>
  ))}</div>
}

function FAQList({ items }: { items: GheeRoastFAQData[] }) {
  if (!items.length) return <p className={styles.cmsEmpty}>No frequently asked questions have been published.</p>
  return <div className={styles.faqs}>{items.map((item) => (
    <details key={item.id}><summary>{item.question}</summary><p>{item.answer}</p></details>
  ))}</div>
}

function LocationCards({ locations }: { locations: GheeRoastLocationData[] }) {
  if (!locations.length) return <p className={styles.cmsEmpty}>Location details are being updated.</p>
  return <div className={styles.cmsCardGrid}>{locations.map((location) => (
    <article className={styles.cmsCard} key={location.id}>
      <h3>{location.title}</h3>
      {location.description && <p>{location.description}</p>}
      <address>{location.address}{location.city && <><br />{location.city}</>}</address>
      {location.phone && <a href={`tel:${location.phone}`}>{location.phone}</a>}
      {location.email && <a href={`mailto:${location.email}`}>{location.email}</a>}
      {location.mapsUrl && <ActionLink href={location.mapsUrl} label="View map" />}
    </article>
  ))}</div>
}

function CMSBlock({
  block,
  content,
  index,
}: {
  block: UnknownRecord
  content: GheeRoastDynamicContent
  index: number
}) {
  const type = text(block.blockType)
  if (!type || type === 'heroBlock') return null
  const section = heading(block)
  const key = text(block.id) || `${type}-${index}`
  const settings = record(block.settings)
  const htmlID = text(settings?.htmlId) || undefined
  const limit = Math.max(1, number(block.limit, 24))
  const tenantID = content.site.tenantID
  const wrapper = (children: React.ReactNode, options?: { bare?: boolean; light?: boolean }) => (
    <section className={options?.bare ? undefined : blockClassName(block)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      <div className={styles.container}>
        {section.title && <SectionHeading {...section} light={options?.light ?? ['primary', 'dark'].includes(text(settings?.backgroundColor))} />}
        {children}
      </div>
    </section>
  )

  if (type === 'featurestripBlock' || type === 'contentgridBlock' || type === 'stepsBlock') {
    const rawItems = Array.isArray(block.items) ? block.items : Array.isArray(block.steps) ? block.steps : []
    const features: FeatureData[] = rawItems
      .map((entry, itemIndex) => {
        const item = record(entry)
        return {
          description: text(item?.description),
          icon: text(item?.icon) || String(itemIndex + 1),
          title: text(item?.title),
        }
      })
      .filter((item) => item.title)
    return wrapper(features.length ? <FeatureGrid features={features} /> : <p className={styles.cmsEmpty}>Add at least one item in Payload.</p>)
  }

  if (type === 'cardgridBlock') {
    const cards = (Array.isArray(block.cards) ? block.cards : [])
      .map((entry) => record(entry))
      .filter((entry): entry is UnknownRecord => entry !== null)
    return wrapper(cards.length ? <div className={styles.cmsCardGrid}>{cards.map((card, cardIndex) => {
      const cardImage = image(card.image, tenantID)
      const cardLink = card.enableLink ? link(card.link, tenantID) : undefined
      return <article className={styles.cmsCard} key={text(card.id) || `${text(card.title)}-${cardIndex}`}>
        {cardImage && <Image alt={cardImage.alt} height={360} src={cardImage.src} unoptimized width={560} />}
        <h3>{text(card.title)}</h3>
        {text(card.description) && <p>{text(card.description)}</p>}
        {cardLink && <ActionLink {...cardLink} />}
      </article>
    })}</div> : <p className={styles.cmsEmpty}>Add cards in Payload to publish this section.</p>)
  }

  if (type === 'splitBlock') {
    const splitImage = image(block.image, tenantID)
    const points = (Array.isArray(block.points) ? block.points : [])
      .map((entry) => text(record(entry)?.text))
      .filter(Boolean)
    const ctas = record(block.ctaGroup)
    const primary = ctas?.enablePrimary !== false ? link(ctas?.primaryCTA, tenantID) : undefined
    const secondary = ctas?.enableSecondary ? link(ctas?.secondaryCTA, tenantID) : undefined
    const copy = <div>
      {section.title && <SectionHeading {...section} />}
      <p>{text(block.body)}</p>
      {points.length > 0 && <ul className={styles.checkList}>{points.map((point) => <li key={point}>{point}</li>)}</ul>}
      {(primary || secondary) && <div className={styles.actions}>
        {primary && <ActionLink {...primary} />}
        {secondary && <ActionLink {...secondary} variant="outline" />}
      </div>}
    </div>
    return <section className={blockClassName(block)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      <div className={`${styles.container} ${styles.twoColumn}`}>
        {text(block.imagePosition) !== 'right' && splitImage && <Image alt={splitImage.alt} height={680} src={splitImage.src} unoptimized width={720} />}
        {copy}
        {text(block.imagePosition) === 'right' && splitImage && <Image alt={splitImage.alt} height={680} src={splitImage.src} unoptimized width={720} />}
      </div>
    </section>
  }

  if (type === 'statsBlock') {
    const stats = (Array.isArray(block.stats) ? block.stats : [])
      .map((entry) => record(entry))
      .filter((entry): entry is UnknownRecord => entry !== null)
      .map((entry) => [text(entry.value), text(entry.label)])
      .filter(([value, label]) => value && label)
    return wrapper(stats.length ? <Stats items={stats} /> : <p className={styles.cmsEmpty}>Add statistics in Payload.</p>)
  }

  if (type === 'testimonialsBlock') {
    let items: TestimonialData[] = content.collections.testimonials
    if (text(block.source) === 'manual') {
      items = selectGheeRoastRelationships(items, block.testimonials, { empty: 'none' })
    } else if (block.featuredOnly !== false) {
      items = items.filter((item) => item.isFeatured === true)
    }
    return wrapper(items.length ? <div className={styles.testimonialGrid}>{items.slice(0, limit).map((item) => <TestimonialCard key={item.id ?? item.name} testimonial={item} />)}</div> : <p className={styles.cmsEmpty}>No testimonials are published.</p>, { light: true })
  }

  if (type === 'galleryBlock') {
    let items = content.collections.gallery
    if (text(block.source) === 'manual') {
      items = selectGheeRoastRelationships(items, block.items, { empty: 'none' })
    } else {
      const category = text(block.category)
      if (category && category !== 'all') {
        items = items.filter((item) => item.category === category)
      }
      if (block.featuredOnly === true) {
        items = items.filter((item) => item.isFeatured === true)
      }
    }
    items = items.slice(0, limit)
    return wrapper(items.length ? <Gallery images={items} /> : <p className={styles.cmsEmpty}>No gallery images are published.</p>)
  }

  if (type === 'menushowcaseBlock') {
    const categoryIDs = gheeRoastRelationshipIDs(block.categories)
    const items = content.collections.menu.items
      .filter((item) => !categoryIDs.size || (
        item.categoryID !== undefined &&
        categoryIDs.has(String(item.categoryID))
      ))
      .filter((item) => block.featuredOnly === false || item.isFeatured === true)
      .slice(0, limit)
    return wrapper(items.length ? <div className={styles.foodGrid}>{items.map((item) => <FoodCard item={item} key={item.id ?? item.name} />)}</div> : <p className={styles.cmsEmpty}>No available menu items are published.</p>)
  }

  if (type === 'teamBlock') {
    return wrapper(<TeamCards members={selectGheeRoastRelationships(content.collections.team, block.members).slice(0, limit)} />)
  }

  if (type === 'eventsBlock') {
    const events = selectGheeRoastRelationships(content.collections.events, block.events)
      .filter((event) => block.featuredOnly !== true || event.isFeatured === true)
      .slice(0, limit)
    return wrapper(<EventCards events={events} />)
  }

  if (type === 'faqBlock') {
    return wrapper(<FAQList items={selectGheeRoastRelationships(content.collections.faqs, block.items).slice(0, limit)} />)
  }

  if (type === 'locationsBlock') {
    return wrapper(<LocationCards locations={selectGheeRoastRelationships(content.collections.locations, block.locations).slice(0, limit)} />)
  }

  if (type === 'ctaBlock') {
    const ctas = record(block.ctaGroup)
    const primary = ctas?.enablePrimary !== false ? link(ctas?.primaryCTA, tenantID) : undefined
    const secondary = ctas?.enableSecondary ? link(ctas?.secondaryCTA, tenantID) : undefined
    return <section className={styles.cta} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      {section.eyebrow && <span>{section.eyebrow}</span>}
      {section.title && <h2>{section.title}</h2>}
      {section.text && <p>{section.text}</p>}
      {(primary || secondary) && <div className={styles.actions}>
        {primary && <ActionLink {...primary} variant="accent" />}
        {secondary && <ActionLink {...secondary} variant="outline" />}
      </div>}
    </section>
  }

  if (type === 'newsletterBlock') {
    return <Newsletter key={key} override={{
      buttonLabel: text(block.buttonLabel) || content.site.newsletter.buttonLabel,
      description: section.text || content.site.newsletter.description,
      enabled: true,
      highlightedWord: content.site.newsletter.highlightedWord,
      placeholder: text(block.placeholder) || content.site.newsletter.placeholder,
      privacyText: text(block.privacyText) || content.site.newsletter.privacyText,
      title: section.title || content.site.newsletter.title,
    }} />
  }

  if (type === 'formBlock') {
    return wrapper(<ContactForm
      formType={text(block.formType) || 'contact'}
      submitLabel={text(block.submitLabel) || 'Send message'}
      successMessage={text(block.successMessage) || 'Thank you. We will be in touch shortly.'}
    />)
  }

  if (type === 'richtextBlock') {
    const body = lexicalText(record(block.content)?.root ?? block.content)
    return wrapper(body ? <div className={styles.cmsRichText}>{body.split(/\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div> : <p className={styles.cmsEmpty}>Add content in Payload.</p>)
  }

  if (type === 'spacerBlock') {
    return <div aria-hidden className={styles[`spacer_${text(block.size) || 'medium'}`]} key={key} />
  }

  if (GHEE_ROAST_SIMPLE_SECTION_BLOCK_TYPES.has(type)) {
    const title = text(block.title)
    const subtitle = text(block.subtitle)
    return wrapper(
      title || subtitle
        ? <div className={styles.cmsRichText}>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        : <p className={styles.cmsEmpty}>Add content in Payload.</p>,
    )
  }

  return null
}

export function CMSPage({
  content,
  includeHero = true,
}: {
  content: GheeRoastDynamicContent
  includeHero?: boolean
}) {
  const page = content.page
  if (!page) return null
  const bodyBlocks = page.layout.filter((block) => text(block.blockType) !== 'heroBlock')
  return <>
    {includeHero && !page.isHomePage && <PageHero
      eyebrow={page.hero?.eyebrow}
      subtitle={page.hero?.subtitle || page.metaDescription || ''}
      title={page.hero?.title || page.title}
    />}
    {bodyBlocks.map((block, index) => <CMSBlock block={block} content={content} index={index} key={text(block.id) || `${text(block.blockType)}-${index}`} />)}
  </>
}
