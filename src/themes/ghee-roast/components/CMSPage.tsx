import Image from 'next/image'
import type { CSSProperties } from 'react'
import type {
  GheeRoastDynamicContent,
  GheeRoastEventData,
  GheeRoastFAQData,
  GheeRoastLocationData,
  GheeRoastSocialData,
  GheeRoastTeamMemberData,
} from '../dynamicTypes'
import {
  gheeRoastRelationshipIDs,
  safeGheeRoastHref,
  selectGheeRoastRelationships,
} from '../mappers/cmsContent'
import type { FeatureData, ImageData, LinkData, TestimonialData } from '../types'
import { GHEE_ROAST_SIMPLE_SECTION_BLOCK_TYPES } from '../utils/blockSupport'
import { resolveGheeRoastBlockMedia } from '../utils/cmsBlockMedia'
import type { MediaSizeContext } from '../../../lib/media/resolveMediaVariant'
import { resolveGheeRoastHomeLayout } from '../utils/homeLayout'
import {
  gheeRoastLocationMapHref,
  sortGheeRoastContactLocations,
} from '../utils/contactPage'
import { ContactForm } from './ContactForm'
import { HomeHero } from './HomeHero'
import { Icon } from './Icon'
import { Newsletter } from './Newsletter'
import { MenuExplorer } from './MenuExplorer'
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
  mediaValues: unknown[] = [],
  sizeContext?: MediaSizeContext,
): ImageData | undefined => resolveGheeRoastBlockMedia(value, tenantID, undefined, mediaValues, sizeContext)

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
  return label && href ? {
    ariaLabel: text(item.ariaLabel) || undefined,
    href,
    label,
    newTab: item.newTab === true,
    nofollow: item.nofollow === true,
  } : undefined
}

const simpleLink = (labelValue: unknown, urlValue: unknown): LinkData | undefined => {
  const label = text(labelValue)
  const href = safeGheeRoastHref(urlValue)
  return label && href ? { href, label } : undefined
}

const paragraphs = (value: unknown): string[] =>
  text(value).split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)

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
  const media = image(settings?.backgroundImage, tenantID, [], 'hero')
  return media
    ? {
        backgroundImage: `linear-gradient(rgb(38 51 34 / ${Math.min(100, Math.max(0, number(settings?.overlayOpacity, 70))) / 100}), rgb(38 51 34 / ${Math.min(100, Math.max(0, number(settings?.overlayOpacity, 70))) / 100})), url("${media.src.replace(/["\\]/g, '')}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }
    : {}
}

const blockModifierClassName = (block: UnknownRecord): string => {
  const settings = record(block.settings)
  const background = text(settings?.backgroundColor)
  const visibility = Array.isArray(settings?.visibility)
    ? settings.visibility.filter((value): value is string => typeof value === 'string')
    : []
  const customClasses = text(settings?.customClasses)
    .split(/\s+/)
    .filter((value) => /^[A-Za-z_][A-Za-z0-9_-]*$/.test(value))
  return [
    background === 'surface' ? styles.sectionAlt : '',
    ['primary', 'dark'].includes(background) ? styles.darkSection : '',
    text(settings?.paddingTop) === 'none' ? styles.blockPaddingTopNone : '',
    text(settings?.paddingTop) === 'small' ? styles.blockPaddingTopSmall : '',
    text(settings?.paddingTop) === 'large' ? styles.blockPaddingTopLarge : '',
    text(settings?.paddingBottom) === 'none' ? styles.blockPaddingBottomNone : '',
    text(settings?.paddingBottom) === 'small' ? styles.blockPaddingBottomSmall : '',
    text(settings?.paddingBottom) === 'large' ? styles.blockPaddingBottomLarge : '',
    visibility.length > 0 && !visibility.includes('desktop') ? styles.blockHideDesktop : '',
    visibility.length > 0 && !visibility.includes('tablet') ? styles.blockHideTablet : '',
    visibility.length > 0 && !visibility.includes('mobile') ? styles.blockHideMobile : '',
    Array.isArray(settings?.visibility) && visibility.length === 0 ? styles.blockHidden : '',
    text(settings?.animation) === 'fade-in' ? styles.blockFadeIn : '',
    text(settings?.animation) === 'slide-up' ? styles.blockSlideUp : '',
    text(settings?.animation) === 'zoom-in' ? styles.blockZoomIn : '',
    text(settings?.animation) === 'stagger' ? styles.blockStagger : '',
    ...customClasses,
  ].filter(Boolean).join(' ')
}

const blockClassName = (block: UnknownRecord, baseClassName = styles.section): string =>
  [baseClassName, blockModifierClassName(block)].filter(Boolean).join(' ')

const blockContainerClassName = (block: UnknownRecord): string => {
  const width = text(record(block.settings)?.containerWidth)
  return [
    styles.container,
    width === 'wide' ? styles.blockContainerWide : '',
    width === 'full' ? styles.blockContainerFull : '',
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

function LocationCards({ locations, showMap }: { locations: GheeRoastLocationData[]; showMap: boolean }) {
  if (!locations.length) return <p className={styles.cmsEmpty}>Location details are being updated.</p>
  return <div className={styles.contactLocationGrid} data-location-count={locations.length}>{locations.map((location) => {
    const mapHref = showMap ? gheeRoastLocationMapHref(location) : null
    const locality = [location.city, location.state, location.postalCode].filter(Boolean).join(', ')
    return <article className={styles.contactLocationCard} key={location.id}>
      <span className={styles.locationIcon}><Icon name="map" weight="fill" /></span>
      {location.isPrimary && <small className={styles.primaryLocation}>Primary location</small>}
      <h3>{location.title}</h3>
      {location.description && <p>{location.description}</p>}
      {location.deliveryZones.length > 0 && <p className={styles.deliveryZones}><strong>Delivery zones:</strong> {location.deliveryZones.join(', ')}</p>}
      <address>{location.address}{locality && <><br />{locality}</>}{location.country && <><br />{location.country}</>}</address>
      <div className={styles.locationContactLinks}>
        {location.phone && <a href={`tel:${location.phone}`}><Icon name="phone" />{location.phone}</a>}
        {location.email && <a href={`mailto:${location.email}`}>{location.email}</a>}
      </div>
      {location.businessHours.length > 0 && <div className={styles.locationHours}>
        <strong><Icon name="clock" />Business hours</strong>
        {location.businessHours.map((hours) => <span key={hours}>{hours}</span>)}
      </div>}
      {mapHref && <a
        aria-label={`Open ${location.title} in Google Maps`}
        className={`${styles.action} ${styles.accent} ${styles.locationMapAction}`}
        href={mapHref}
        rel="noopener noreferrer"
        target="_blank"
      >{location.mapButtonLabel}<Icon className={styles.actionIcon} name="arrow" weight="bold" /></a>}
    </article>
  })}</div>
}

function SocialCards({
  items,
  showDescriptions,
  showHandles,
}: {
  items: GheeRoastSocialData[]
  showDescriptions: boolean
  showHandles: boolean
}) {
  if (!items.length) return <p className={styles.cmsEmpty}>Social links are being updated.</p>
  return <div className={styles.cmsSocialGrid} data-social-count={items.length}>
    {items.map((item) => <article className={styles.cmsSocialCard} key={item.renderKey}>
      <span className={styles.socialIcon}><Icon name={item.icon} weight="fill" /></span>
      <div>
        <h3>{item.displayLabel}</h3>
        {showHandles && item.handle && <strong>{item.handle}</strong>}
        {showDescriptions && item.description && <p>{item.description}</p>}
      </div>
      <a
        aria-label={`${item.ctaLabel} (${item.newTab ? 'opens in a new tab' : 'external link'})`}
        className={`${styles.action} ${styles.accent}`}
        href={item.href}
        rel={item.newTab ? 'noopener noreferrer' : undefined}
        target={item.newTab ? '_blank' : undefined}
      >{item.ctaLabel}<Icon className={styles.actionIcon} name="arrow" weight="bold" /></a>
    </article>)}
  </div>
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
  const settings = record(block.settings)
  if (!type || block.enabled === false || settings?.enabled === false) return null
  const section = heading(block)
  const key = text(block.id) || `${type}-${index}`
  const htmlID = text(settings?.htmlId) || undefined
  const limit = Math.max(1, number(block.limit, 24))
  const tenantID = content.site.tenantID
  const wrapper = (children: React.ReactNode, options?: { bare?: boolean; light?: boolean }) => (
    <section className={options?.bare ? undefined : blockClassName(block)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      <div className={blockContainerClassName(block)}>
        {section.title && <SectionHeading {...section} light={options?.light ?? ['primary', 'dark'].includes(text(settings?.backgroundColor))} />}
        {children}
      </div>
    </section>
  )

  if (type === 'heroBlock') {
    return content.page?.isHomePage
      ? <HomeHero hero={content.hero} key={key} orderLinks={content.site.orderLinks} />
      : null
  }

  if (type === 'gheeHomeStoryBlock') {
    const images = record(block.images)
    const storyImages = [
      { alt: images?.primaryImageAlt, key: 'primary', value: images?.primaryImage },
      { alt: images?.secondaryImageAlt, key: 'secondary', value: images?.secondaryImage },
      { alt: images?.tertiaryImageAlt, key: 'tertiary', value: images?.tertiaryImage },
    ].map((entry) => ({ ...entry, image: image({ altOverride: entry.alt, item: entry.value }, tenantID, [], 'card') }))
      .filter((entry): entry is typeof entry & { image: ImageData } => Boolean(entry.image))
    const points = (Array.isArray(block.bulletPoints) ? block.bulletPoints : [])
      .map((entry) => ({ id: text(record(entry)?.id), text: text(record(entry)?.text) }))
      .filter((entry) => entry.text)
    const badge = record(block.experienceBadge)
    const badgeNumber = text(badge?.number)
    const badgeLabel = text(badge?.label)
    const cta = record(block.cta)
    const storyCTA = cta?.enabled === false ? undefined : simpleLink(cta?.label, cta?.url)
    const storyTitle = [text(block.heading), text(block.highlightedHeading)].filter(Boolean).join(' ')
    const imageRight = text(images?.imagePosition) === 'right'
    const collage = storyImages.length > 0 && <div className={styles.imageCollage}>
      {storyImages.map((entry) => <Image alt={entry.image.alt || 'Ghee Roast story'} height={500} key={entry.key} src={entry.image.src} unoptimized width={600} />)}
      {badge?.enabled !== false && (badgeNumber || badgeLabel) && <span className={styles.legacyBadge}>
        {badgeNumber && <strong>{badgeNumber}</strong>}
        {badgeLabel && badgeLabel.split('\n').map((line, lineIndex) => <span key={`${line}-${lineIndex}`}>{line}{lineIndex < badgeLabel.split('\n').length - 1 && <br />}</span>)}
      </span>}
    </div>
    const copy = <div>
      {storyTitle && <SectionHeading eyebrow={text(block.eyebrow) || undefined} title={storyTitle} />}
      {paragraphs(block.description).map((paragraph, paragraphIndex) => <p key={`story-paragraph-${paragraphIndex}`}>{paragraph}</p>)}
      {points.length > 0 && <ul className={styles.checkList}>{points.map((point, pointIndex) => <li key={point.id || `story-point-${pointIndex}`}>{point.text}</li>)}</ul>}
      {storyCTA && <ActionLink {...storyCTA} />}
    </div>
    return <section className={blockClassName(block)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      <div className={`${blockContainerClassName(block)} ${styles.storyGrid}`}>
        {!imageRight && collage}
        {copy}
        {imageRight && collage}
      </div>
    </section>
  }

  if (type === 'gheeHomeQualityBlock') {
    const qualityImage = image({ altOverride: block.imageAlt, item: block.image }, tenantID, [], 'card')
    const points = (Array.isArray(block.points) ? block.points : [])
      .map((entry) => record(entry))
      .filter((entry): entry is UnknownRecord => entry !== null && Boolean(text(entry.text)))
    const cta = record(block.cta)
    const qualityCTA = cta?.enabled === false ? undefined : simpleLink(cta?.label, cta?.url)
    return <section className={blockClassName(block, `${styles.section} ${styles.darkSection}`)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      <div className={`${blockContainerClassName(block)} ${styles.twoColumn}`}>
        {qualityImage && <Image alt={qualityImage.alt || 'Ghee Roast quality ingredients'} height={640} src={qualityImage.src} unoptimized width={700} />}
        <div>
          <h2 className={styles.whyHeading}>
            {text(block.heading).split('\n').map((line, lineIndex) => <span key={`${line}-${lineIndex}`}>{line}<br /></span>)}
            {text(block.highlightedHeading) && <span>{text(block.highlightedHeading)}</span>}
          </h2>
          {paragraphs(block.description).map((paragraph, paragraphIndex) => <p key={`quality-paragraph-${paragraphIndex}`}>{paragraph}</p>)}
          {points.length > 0 && <ul className={`${styles.checkList} ${styles.whyList}`}>
            {points.map((point, pointIndex) => <li key={text(point.id) || `quality-point-${pointIndex}`}>
              <Icon name={text(point.icon) || 'check'} weight="fill" />
              <span>{text(point.title) && <strong>{text(point.title)}: </strong>}{text(point.text)}</span>
            </li>)}
          </ul>}
          {qualityCTA && <ActionLink {...qualityCTA} variant="accent" />}
        </div>
      </div>
    </section>
  }

  if (type === 'gheeHomePromosBlock') {
    const promos = (Array.isArray(block.promos) ? block.promos : [])
      .map((entry) => record(entry))
      .filter((entry): entry is UnknownRecord => entry !== null && entry.enabled !== false)
    if (!promos.length) return null
    return <section className={blockClassName(block, styles.splitPromos)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      {promos.map((promo, promoIndex) => {
        const points = (Array.isArray(promo.bulletPoints) ? promo.bulletPoints : [])
          .map((entry) => ({ id: text(record(entry)?.id), text: text(record(entry)?.text) }))
          .filter((entry) => entry.text)
        const cta = record(promo.cta)
        const promoCTA = cta?.enabled === false ? undefined : simpleLink(cta?.label, cta?.url)
        return <article key={text(promo.id) || `promo-${promoIndex}`}>
          {text(promo.eyebrow) && <span>{text(promo.eyebrow)}</span>}
          {text(promo.heading) && <h2>{text(promo.heading)}</h2>}
          {paragraphs(promo.description).map((paragraph, paragraphIndex) => <p key={`promo-${promoIndex}-paragraph-${paragraphIndex}`}>{paragraph}</p>)}
          {points.length > 0 && <ul className={styles.promoList}>{points.map((point, pointIndex) => <li key={point.id || `promo-${promoIndex}-point-${pointIndex}`}><Icon name="check" weight="fill" />{point.text}</li>)}</ul>}
          {promoCTA && <ActionLink {...promoCTA} variant="split" />}
        </article>
      })}
    </section>
  }

  if (type === 'stepsBlock') {
    const steps = (Array.isArray(block.steps) ? block.steps : [])
      .map((entry, itemIndex) => {
        const item = record(entry)
        return {
          description: text(item?.description),
          icon: text(item?.icon) || String(itemIndex + 1),
          id: text(item?.id) || `step-${itemIndex}`,
          label: text(item?.label),
          title: text(item?.title),
        }
      })
      .filter((item) => item.title)
    if (text(block.presentation) === 'ghee-home-process') {
      return steps.length ? <section className={blockClassName(block, styles.processSection)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
        <div className={blockContainerClassName(block)}>
          {section.title && <SectionHeading {...section} center light />}
          <div className={styles.processGrid}>{steps.map((step) => <article className={styles.processStep} key={step.id}>
            <span className={styles.processIcon}>{/^\d+$/.test(step.icon) ? step.icon : <Icon name={step.icon} weight="fill" />}</span>
            {step.label && <small>{step.label}</small>}
            <h3>{step.title}</h3>
            {step.description && <p>{step.description}</p>}
          </article>)}</div>
        </div>
      </section> : null
    }
    const features: FeatureData[] = steps.map((step) => ({
      description: step.description,
      icon: step.icon,
      renderKey: step.id,
      title: step.title,
    }))
    return wrapper(features.length ? <FeatureGrid features={features} /> : <p className={styles.cmsEmpty}>Add at least one step in Payload.</p>)
  }

  if (type === 'featurestripBlock' || type === 'contentgridBlock') {
    const rawItems = type === 'featurestripBlock' && text(block.source) === 'site-settings'
      ? content.site.featureStrip ?? []
      : Array.isArray(block.items) ? block.items : []
    const features: FeatureData[] = rawItems
      .map((entry, itemIndex) => {
        const item = record(entry)
        return {
          customIcon: record(item?.customIcon) as ImageData | undefined,
          description: text(item?.description),
          icon: text(item?.icon) || String(itemIndex + 1),
          iconSource: text(item?.iconSource) === 'custom-svg' ? 'custom-svg' as const : 'built-in' as const,
          renderKey: text(item?.renderKey) || text(item?.id) || undefined,
          title: text(item?.title),
        }
      })
      .filter((item) => item.title)
    if (type === 'featurestripBlock' && (text(block.presentation) === 'ghee-home-brand' || text(block.source) === 'site-settings')) {
      return features.length
        ? <section className={blockClassName(block, styles.featureStrip)} id={htmlID} key={key} style={blockStyle(block, tenantID)}><FeatureGrid features={features} /></section>
        : null
    }
    return wrapper(features.length ? <FeatureGrid features={features} /> : <p className={styles.cmsEmpty}>Add at least one item in Payload.</p>)
  }

  if (type === 'cardgridBlock') {
    const cards = (Array.isArray(block.cards) ? block.cards : [])
      .map((entry) => record(entry))
      .filter((entry): entry is UnknownRecord => entry !== null)
    return wrapper(cards.length ? <div className={styles.cmsCardGrid}>{cards.map((card, cardIndex) => {
      const cardImage = image(card.image, tenantID, [], 'card')
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
    const splitImage = image(block.image, tenantID, [], 'card')
    const points = (Array.isArray(block.points) ? block.points : [])
      .map((entry) => text(record(entry)?.text))
      .filter(Boolean)
    const ctas = record(block.ctaGroup)
    const primary = ctas?.enablePrimary !== false ? link(ctas?.primaryCTA, tenantID) : undefined
    const secondary = ctas?.enableSecondary ? link(ctas?.secondaryCTA, tenantID) : undefined
    const copy = <div>
      {section.title && <SectionHeading {...section} />}
      {paragraphs(block.body).map((paragraph, paragraphIndex) => <p key={`split-paragraph-${paragraphIndex}`}>{paragraph}</p>)}
      {points.length > 0 && <ul className={styles.checkList}>{points.map((point) => <li key={point}>{point}</li>)}</ul>}
      {(primary || secondary) && <div className={styles.actions}>
        {primary && <ActionLink {...primary} />}
        {secondary && <ActionLink {...secondary} variant="outline" />}
      </div>}
    </div>
    return <section className={blockClassName(block)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      <div className={`${blockContainerClassName(block)} ${styles.twoColumn}`}>
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
    if (text(block.presentation) === 'ghee-home-strip') {
      return stats.length
        ? <section className={blockClassName(block, styles.statsSection)} id={htmlID} key={key} style={blockStyle(block, tenantID)}><Stats items={stats} /></section>
        : null
    }
    return wrapper(stats.length ? <Stats items={stats} /> : <p className={styles.cmsEmpty}>Add statistics in Payload.</p>)
  }

  if (type === 'testimonialsBlock') {
    let items: TestimonialData[] = content.collections.testimonials
    if (text(block.source) === 'manual') {
      items = selectGheeRoastRelationships(items, block.testimonials, { empty: 'none' })
    } else if (block.featuredOnly !== false) {
      items = items.filter((item) => item.isFeatured === true)
    }
    const testimonials = items.slice(0, limit)
    if (text(block.presentation) === 'ghee-home-dark') {
      return <section className={blockClassName(block, `${styles.section} ${styles.testimonialsSection}`)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
        <div className={blockContainerClassName(block)}>
          {section.title && <SectionHeading {...section} light />}
          {testimonials.length > 0 && <div className={styles.testimonialGrid}>{testimonials.map((item) => <TestimonialCard key={item.id ?? item.name} testimonial={item} />)}</div>}
        </div>
      </section>
    }
    return wrapper(testimonials.length ? <div className={styles.testimonialGrid}>{testimonials.map((item) => <TestimonialCard key={item.id ?? item.name} testimonial={item} />)}</div> : <p className={styles.cmsEmpty}>No testimonials are published.</p>, { light: true })
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
    const ctas = record(block.ctaGroup)
    const primary = ctas?.enablePrimary !== false ? link(ctas?.primaryCTA, tenantID) : undefined
    const secondary = ctas?.enableSecondary ? link(ctas?.secondaryCTA, tenantID) : undefined
    if (content.page?.pageType === 'menu') {
      const locations = content.collections.locations.map((location) => ({
        description: location.description || location.address,
        id: location.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || String(location.id),
        label: location.city || location.title,
      }))
      return <section className={blockClassName(block)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
        <MenuExplorer
          categories={content.collections.menu.categories}
          heading={section.title}
          items={items}
          locations={locations}
          orderLinks={content.site.orderLinks}
        />
        {(primary || secondary) && <div className={styles.centerAction}>
          {primary && <ActionLink {...primary} />}
          {secondary && <ActionLink {...secondary} variant="outline" />}
        </div>}
      </section>
    }
    return wrapper(<>
      {items.length
        ? <div className={styles.foodGrid}>{items.map((item) => <FoodCard item={item} key={item.id ?? item.name} />)}</div>
        : <p className={styles.cmsEmpty}>No available menu items are published.</p>}
      {(primary || secondary) && <div className={styles.centerAction}>
        {primary && <ActionLink {...primary} />}
        {secondary && <ActionLink {...secondary} variant="outline" />}
      </div>}
    </>)
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
    const locations = sortGheeRoastContactLocations(
      selectGheeRoastRelationships(content.collections.locations, block.locations),
    )
    return wrapper(<LocationCards locations={locations} showMap={block.showMap !== false} />)
  }

  if (type === 'socialLinksBlock') {
    return wrapper(<SocialCards
      items={content.site.socials}
      showDescriptions={block.showDescriptions !== false}
      showHandles={block.showHandles !== false}
    />)
  }

  if (type === 'ctaBlock') {
    const ctas = record(block.ctaGroup)
    const primary = ctas?.enablePrimary !== false ? link(ctas?.primaryCTA, tenantID) : undefined
    const secondary = ctas?.enableSecondary ? link(ctas?.secondaryCTA, tenantID) : undefined
    return <section className={blockClassName(block, styles.cta)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
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
    const useSiteSettings = text(block.source) === 'site-settings'
    return <Newsletter
      className={blockModifierClassName(block)}
      id={htmlID}
      key={key}
      override={useSiteSettings ? content.site.newsletter : {
        buttonLabel: text(block.buttonLabel) || 'Subscribe',
        description: section.text || '',
        enabled: block.enabled !== false,
        errorMessage: text(block.errorMessage) || 'We could not save your signup. Please try again later.',
        highlightedWord: text(block.highlightedWord) || undefined,
        placeholder: text(block.placeholder) || 'Enter your email address',
        privacyText: text(block.privacyText),
        successMessage: text(block.successMessage) || 'Thank you for joining the list.',
        title: section.title,
      }}
      style={blockStyle(block, tenantID)}
    />
  }

  if (type === 'formBlock') {
    const sideImage = image({ altOverride: block.imageAlt, item: block.sideImage }, tenantID, content.collections.media)
    const imagePosition = text(block.imagePosition) === 'left' ? 'left' : 'right'
    const imageFit = text(block.imageFit) === 'contain' ? 'contain' : 'cover'
    const cardStyle = ['bordered', 'flat'].includes(text(block.formCardStyle))
      ? text(block.formCardStyle)
      : 'elevated'
    const subjectOptions = (Array.isArray(block.subjectOptions) ? block.subjectOptions : [])
      .map((optionValue) => record(optionValue))
      .map((option) => ({ label: text(option?.label), value: text(option?.value) }))
      .filter((option) => option.label && option.value)
    if (content.page?.pageType !== 'contact') {
      return wrapper(<ContactForm
        errorMessage={text(block.errorMessage) || 'We could not submit the form. Please try again.'}
        formType={text(block.formType) || 'contact'}
        heading={null}
        subjectOptions={subjectOptions.length ? subjectOptions : undefined}
        submitLabel={text(block.submitLabel) || 'Send message'}
        successMessage={text(block.successMessage) || 'Thank you. We will be in touch shortly.'}
      />)
    }
    return <section className={blockClassName(block)} id={htmlID} key={key} style={blockStyle(block, tenantID)}>
      <div className={blockContainerClassName(block)}>
        <div
          className={`${styles.contactFormLayout} ${sideImage ? styles.contactFormWithImage : styles.contactFormWithoutImage} ${imagePosition === 'left' ? styles.contactImageLeft : styles.contactImageRight}`}
          data-has-image={Boolean(sideImage)}
          data-image-position={imagePosition}
        >
          <div className={styles.contactFormColumn}>
            {section.title && <SectionHeading {...section} />}
            <div className={`${styles.contactFormCard} ${styles[`contactFormCard_${cardStyle}`]}`}>
              <ContactForm
                errorMessage={text(block.errorMessage) || 'We could not submit the form. Please try again.'}
                formType={text(block.formType) || 'contact'}
                heading={null}
                subjectOptions={subjectOptions.length ? subjectOptions : undefined}
                submitLabel={text(block.submitLabel) || 'Send message'}
                successMessage={text(block.successMessage) || 'Thank you. We will be in touch shortly.'}
              />
            </div>
          </div>
          {sideImage && <figure className={styles.contactSideImage}>
            <Image
              alt={sideImage.alt || section.title || 'Contact us'}
              fill
              sizes="(max-width: 800px) 95vw, 42vw"
              src={sideImage.src}
              style={{
                objectFit: imageFit,
                objectPosition: sideImage.focalPoint
                  ? `${sideImage.focalPoint.x}% ${sideImage.focalPoint.y}%`
                  : '50% 50%',
              }}
              unoptimized
            />
          </figure>}
        </div>
      </div>
    </section>
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
  const layout = resolveGheeRoastHomeLayout({
    hasBrandFeatures: Boolean(content.site.featureStrip?.length),
    isHomePage: page.isHomePage,
    layout: page.layout,
  })
  const bodyBlocks = page.isHomePage
    ? layout
    : layout.filter((block) => text(block.blockType) !== 'heroBlock')
  const heroVariant = page.pageType === 'catering'
    ? 'catering'
    : page.pageType === 'contact'
      ? 'contact'
      : 'inner'
  return <>
    {includeHero && !page.isHomePage && <PageHero
      eyebrow={page.hero?.eyebrow}
      image={page.hero?.image}
      overlayOpacity={page.hero?.overlayOpacity}
      subtitle={page.hero?.subtitle || page.metaDescription || ''}
      title={page.hero?.title || page.title}
      variant={heroVariant}
    />}
    {bodyBlocks.map((block, index) => {
      const renderBlock = record(block)
      return renderBlock
        ? <CMSBlock block={renderBlock} content={content} index={index} key={text(renderBlock.id) || `${text(renderBlock.blockType)}-${index}`} />
        : null
    })}
  </>
}
