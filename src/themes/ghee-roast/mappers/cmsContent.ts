import { normalizeGheeRoastIconName } from '../iconRegistry'
import { isSanitizedSVGMedia } from '../../../validation/svgSafety'
import { normalizeCMSPageType } from '../../../validation/pageLayout'
import { resolveMediaVariantUrl, type MediaLikeValue, type MediaSizeContext } from '../../../lib/media/resolveMediaVariant'
import type { HeroBlock, Page } from '../../../payload-types'
import {
  validateConfiguredLink,
  validateSafeURL,
} from '../../../validation/shared'
import type {
  GheeRoastCMSPage,
  GheeRoastCollectionContent,
  GheeRoastFooterData,
  GheeRoastHeroData,
  GheeRoastNavigationData,
  GheeRoastNavigationItem,
  GheeRoastSEOData,
  GheeRoastSiteData,
} from '../dynamicTypes'

type RelationshipDocument = {
  alt?: unknown
  filename?: unknown
  id?: unknown
  isHomePage?: unknown
  mimeType?: unknown
  slug?: unknown
  svgSanitized?: unknown
  tenantId?: unknown
  url?: unknown
}

type Relationship = number | string | RelationshipDocument | null | undefined

type CMSLink = {
  blockType?: string
  enabled?: boolean | null
  id?: string | null
  label?: string | null
  newTab?: boolean | null
  nofollow?: boolean | null
  page?: Relationship
  sortOrder?: number | null
  type?: string | null
  url?: string | null
  visibility?: string | null
  children?: Array<{
    enabled?: boolean | null
    id?: string | null
    label?: string | null
    newTab?: boolean | null
    sortOrder?: number | null
    url?: string | null
  }> | null
}

type CMSNavigation = {
  brandName?: string | null
  cta?: {
    enabled?: boolean | null
    label?: string | null
    url?: string | null
  } | null
  links?: Array<CMSLink | { blockType?: string }> | null
  logo?: Relationship
  tenantId?: Relationship
}

type CMSHeroBlock = Partial<Omit<HeroBlock, 'blockType'>> & {
  blockType?: string
}

type CMSHomepage = {
  _status?: Page['_status']
  isHomePage?: Page['isHomePage']
  layout?: Array<CMSHeroBlock | { blockType?: string }> | null
  tenantId?: Relationship
}

export type GheeRoastPageDocument = Pick<Page, 'id' | 'tenantId' | 'title'>
  & Partial<Omit<Page, 'id' | 'tenantId' | 'title'>>

type MapperOptions = {
  fallbacksEnabled?: boolean
  tenantName?: string | null
}

const relationshipID = (value: Relationship): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    return typeof id === 'number' || typeof id === 'string' ? String(id) : null
  }
  return null
}

export const gheeRoastRelationshipIDs = (value: unknown): Set<string> =>
  new Set((Array.isArray(value) ? value : [])
    .map((entry) => relationshipID(entry as Relationship) ?? '')
    .filter(Boolean))

export const selectGheeRoastRelationships = <
  T extends { id?: number | string },
>(
  items: T[],
  relationships: unknown,
  { empty = 'all' }: { empty?: 'all' | 'none' } = {},
): T[] => {
  const ids = gheeRoastRelationshipIDs(relationships)
  if (!ids.size) return empty === 'all' ? items : []
  return items.filter(
    (item) => item.id !== undefined && ids.has(String(item.id)),
  )
}

export const safeGheeRoastHref = (
  value: unknown,
  type?: unknown,
): string | null => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) return null

  if (type === 'anchor' || type === 'email' || type === 'phone') {
    if (validateConfiguredLink(normalized, type) !== true) return null
    if (type === 'email') {
      return normalized.toLowerCase().startsWith('mailto:')
        ? normalized
        : `mailto:${normalized}`
    }
    if (type === 'phone') {
      return normalized.toLowerCase().startsWith('tel:')
        ? normalized
        : `tel:${normalized}`
    }
    return normalized
  }

  return validateSafeURL(normalized, { required: true }) === true
    ? normalized
    : null
}

export const safeGheeRoastExternalHref = (value: unknown): string | null => {
  const href = safeGheeRoastHref(value)
  if (!href) return null
  try {
    const parsed = new URL(href)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? href : null
  } catch {
    return null
  }
}

const belongsToTenant = (value: Relationship, tenantID: number | string): boolean =>
  relationshipID(value) === String(tenantID)

const sortableOrder = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0
    ? value
    : 0

const optionalFiniteNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

const normalizedOverlayOpacity = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const percentage = value > 0 && value <= 1 ? value * 100 : value
  return Math.min(100, Math.max(0, percentage))
}

const stableRenderKey = (prefix: string, id: unknown, sourceIndex: number): string =>
  typeof id === 'string' && id ? `${prefix}-${id}` : `${prefix}-source-${sourceIndex}`

const mediaData = (
  value: Relationship,
  tenantID: number | string,
  fallback?: { alt: string, src: string },
  altOverride?: string | null,
  sizeContext?: MediaSizeContext,
) => {
  if (!value || typeof value !== 'object' || !belongsToTenant(value.tenantId as Relationship, tenantID)) {
    return fallback
  }

  const originalUrl = typeof value.url === 'string' ? value.url : ''
  if (!originalUrl) return fallback
  const url = sizeContext
    ? resolveMediaVariantUrl(value as unknown as MediaLikeValue, sizeContext) || originalUrl
    : originalUrl
  const mediaRecord = value as unknown as Record<string, unknown>
  const focalPoint = mediaRecord.focalPoint && typeof mediaRecord.focalPoint === 'object'
    ? mediaRecord.focalPoint as Record<string, unknown>
    : null

  return {
    alt: altOverride || (typeof value.alt === 'string' ? value.alt : fallback?.alt || ''),
    focalPoint: focalPoint
      ? {
          x: optionalFiniteNumber(focalPoint.x) ?? 50,
          y: optionalFiniteNumber(focalPoint.y) ?? 50,
        }
      : undefined,
    id: typeof value.id === 'number' || typeof value.id === 'string' ? value.id : undefined,
    src: url,
    tenantID: relationshipID(value.tenantId as Relationship) ?? undefined,
  }
}

const svgMediaData = (
  value: Relationship,
  tenantID: number | string,
): { alt: string; src: string } | undefined => {
  if (
    !value
    || typeof value !== 'object'
    || !belongsToTenant(value.tenantId as Relationship, tenantID)
    || !isSanitizedSVGMedia(value, { requireURL: true })
  ) return undefined

  const src = safeGheeRoastHref(value.url)
  if (!src) return undefined
  return {
    alt: typeof value.alt === 'string' ? value.alt.trim() : '',
    src,
  }
}

export const emptyGheeRoastNavigation = (
  tenantName?: string | null,
): GheeRoastNavigationData => ({
  brandName: tenantName?.trim() || undefined,
  cta: {
    enabled: false,
    href: '',
    label: '',
  },
  items: [],
})

export const emptyGheeRoastHero = (): GheeRoastHeroData => ({
  description: '',
  enabled: false,
  heading: '',
  highlightedHeading: '',
})

const pageHref = (
  page: Relationship,
  tenantID: number | string,
): string | null => {
  if (!page || typeof page !== 'object' || !belongsToTenant(page.tenantId as Relationship, tenantID)) {
    return null
  }
  if (page.isHomePage === true) return '/'
  return typeof page.slug === 'string' && page.slug ? `/${page.slug.replace(/^\/+/, '')}` : null
}

export function mapGheeRoastNavigation(
  document: CMSNavigation | null | undefined,
  tenantID: number | string,
  options: MapperOptions = {},
): GheeRoastNavigationData {
  const missingContent = emptyGheeRoastNavigation(options.tenantName)
  if (!document || !belongsToTenant(document.tenantId, tenantID)) return missingContent

  const items = (document.links ?? [])
    .map((link, sourceIndex) => ({ link, sourceIndex }))
    .filter((entry): entry is { link: CMSLink; sourceIndex: number } => entry.link.blockType === 'link')
    .filter(({ link }) => link.enabled !== false && link.visibility !== 'logged_in' && Boolean(link.label))
    .sort((left, right) =>
      sortableOrder(left.link.sortOrder) - sortableOrder(right.link.sortOrder)
      || left.sourceIndex - right.sourceIndex)
    .map(({ link, sourceIndex }): GheeRoastNavigationItem | null => {
      const href = link.type === 'page'
        ? pageHref(link.page, tenantID)
        : safeGheeRoastHref(link.url, link.type === 'anchor' ? 'anchor' : undefined)
      if (!href) return null
      return {
        children: (link.children ?? [])
          .map((child, childSourceIndex) => ({ child, childSourceIndex }))
          .filter(({ child }) => child.enabled !== false)
          .sort((left, right) =>
            sortableOrder(left.child.sortOrder) - sortableOrder(right.child.sortOrder)
            || left.childSourceIndex - right.childSourceIndex)
          .map(({ child, childSourceIndex }) => {
            const childHref = safeGheeRoastHref(child.url)
            const childLabel = child.label?.trim() || ''
            return childHref && childLabel
              ? {
                  href: childHref,
                  label: childLabel,
                  newTab: child.newTab === true,
                  renderKey: stableRenderKey(`nav-${sourceIndex}-child`, child.id, childSourceIndex),
                  sortOrder: sortableOrder(child.sortOrder),
                }
              : null
          })
          .filter((child): child is {
            href: string
            label: string
            newTab: boolean
            renderKey: string
            sortOrder: number
          } => child !== null),
        href,
        label: link.label?.trim() || '',
        newTab: link.newTab === true,
        nofollow: link.nofollow === true,
        renderKey: stableRenderKey('nav', link.id, sourceIndex),
        sortOrder: sortableOrder(link.sortOrder),
      }
    })
    .filter((link): link is GheeRoastNavigationItem => link !== null)

  const ctaLabel = document.cta?.label?.trim() || ''
  const ctaHref = safeGheeRoastHref(document.cta?.url) || ''
  return {
    brandName: document.brandName?.trim() || options.tenantName?.trim() || undefined,
    cta: {
      enabled: document.cta?.enabled !== false && Boolean(ctaLabel && ctaHref),
      href: ctaHref,
      label: ctaLabel,
    },
    items,
    logo: mediaData(document.logo, tenantID),
  }
}

type AnyDocument = Record<string, unknown>

const asRecord = (value: unknown): AnyDocument | null =>
  value && typeof value === 'object' ? value as AnyDocument : null

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const boolean = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback

const idOf = (value: AnyDocument): number | string | null =>
  typeof value.id === 'number' || typeof value.id === 'string' ? value.id : null

const documentBelongsToTenant = (
  value: unknown,
  tenantID: number | string,
): value is AnyDocument => {
  const document = asRecord(value)
  return Boolean(document && belongsToTenant(document.tenantId as Relationship, tenantID))
}

const tenantDocuments = (
  values: unknown[] | undefined,
  tenantID: number | string,
): AnyDocument[] =>
  (values ?? []).filter((item): item is AnyDocument => documentBelongsToTenant(item, tenantID))

const mapMedia = (
  value: unknown,
  tenantID: number | string,
  fallback?: { alt: string; src: string },
  sizeContext?: MediaSizeContext,
) => mediaData(value as Relationship, tenantID, fallback, undefined, sizeContext)

export function mapGheeRoastSite(
  tenantValue: unknown,
  settingsValue: unknown,
  tenantID: number | string,
  _options: MapperOptions = {},
): GheeRoastSiteData {
  void _options
  const candidateTenant = asRecord(tenantValue)
  const candidateTenantID = candidateTenant ? idOf(candidateTenant) : null
  const tenant = candidateTenant && (
    tenantID === 0 ||
    (candidateTenantID !== null && String(candidateTenantID) === String(tenantID))
  )
    ? candidateTenant
    : {}
  const settings = documentBelongsToTenant(settingsValue, tenantID)
    ? settingsValue
    : {}
  const branding = asRecord(tenant.branding) ?? {}
  const typography = asRecord(tenant.typography) ?? {}
  const contact = asRecord(tenant.contact) ?? {}
  const deliverySettings = asRecord(settings.deliverySettings) ?? {}
  const newsletter = asRecord(settings.newsletter) ?? {}
  const socials = Array.isArray(settings.socials) ? settings.socials : []
  const hasFeatureStrip = Object.prototype.hasOwnProperty.call(settings, 'featureStrip')
  const deliveryURLs = Array.isArray(deliverySettings.deliveryUrls)
    ? deliverySettings.deliveryUrls
    : []
  const hours = Array.isArray(settings.hours)
    ? settings.hours
      .map((entry) => asRecord(entry))
      .filter((entry): entry is AnyDocument => entry !== null)
      .map((entry) => boolean(entry.isClosed)
        ? `${text(entry.day)}: Closed`
        : `${text(entry.day)}: ${text(entry.openTime)}${text(entry.closeTime) ? ` – ${text(entry.closeTime)}` : ''}`)
      .filter(Boolean)
    : []
  const fallback = {
    announcement: '',
    contact: { address: '', hours: [], phone: '' },
    description: '',
    favicon: undefined,
    logo: undefined,
    newsletter: { description: '', title: '' },
    siteName: text(tenant.name),
    tagline: '',
  }

  return {
    announcement: {
      enabled: boolean(settings.showAnnouncementBar) && Boolean(text(settings.announcementText)),
      text: text(settings.announcementText) || fallback.announcement,
    },
    contact: {
      address: text(settings.contactAddress) || fallback.contact.address,
      email: text(contact.contactEmail) || undefined,
      hours: hours.length ? hours : fallback.contact.hours,
      phone: text(contact.contactPhone) || fallback.contact.phone || undefined,
    },
    description: text(settings.siteDescription) || fallback.description,
    favicon: mapMedia(branding.favicon, tenantID, fallback.favicon, 'thumbnail'),
    logo: mapMedia(branding.logo, tenantID, fallback.logo, 'thumbnail'),
    newsletter: {
      buttonLabel: text(newsletter.buttonLabel) || 'Subscribe',
      description: text(newsletter.description) || fallback.newsletter.description,
      enabled: boolean(newsletter.enabled),
      errorMessage: text(newsletter.errorMessage) || 'We could not save your signup. Please try again later.',
      highlightedWord: text(newsletter.highlightedWord) || undefined,
      placeholder: text(newsletter.placeholder) || 'Enter your email address',
      privacyText: text(newsletter.privacyText) || 'We respect your privacy. Unsubscribe anytime.',
      successMessage: text(newsletter.successMessage) || 'Thank you for joining the list.',
      title: text(newsletter.title) || fallback.newsletter.title,
    },
    orderLinks: deliveryURLs
      .map((entry) => asRecord(entry))
      .map((entry) => {
        const href = safeGheeRoastHref(entry?.url)
        const platform = text(entry?.platform)
        return href && platform
          ? { href, label: `Order on ${platform}` }
          : null
      })
      .filter((entry): entry is { href: string; label: string } => entry !== null),
    featureStrip: hasFeatureStrip
      ? (Array.isArray(settings.featureStrip) ? settings.featureStrip : [])
      .map((entry, sourceIndex) => ({ entry: asRecord(entry), sourceIndex }))
      .filter(({ entry }) => entry?.enabled !== false)
      .sort((left, right) =>
        sortableOrder(left.entry?.sortOrder) - sortableOrder(right.entry?.sortOrder)
        || left.sourceIndex - right.sourceIndex)
      .map(({ entry, sourceIndex }) => {
        const title = text(entry?.title)
        const description = text(entry?.description)
        const iconSource = text(entry?.iconSource) === 'custom-svg'
          ? 'custom-svg' as const
          : 'built-in' as const
        const customIcon = iconSource === 'custom-svg'
          ? svgMediaData(entry?.customSVG as Relationship, tenantID)
          : undefined
        return title && description
          ? {
              customIcon,
              description,
              icon: normalizeGheeRoastIconName(entry?.icon),
              iconSource,
              renderKey: stableRenderKey('brand-feature', entry?.id, sourceIndex),
              sortOrder: sortableOrder(entry?.sortOrder),
              title,
            }
          : null
      })
      .filter((entry): entry is {
        customIcon: { alt: string; src: string } | undefined
        description: string
        icon: string
        iconSource: 'built-in' | 'custom-svg'
        renderKey: string
        sortOrder: number
        title: string
      } => entry !== null)
      : undefined,
    siteName: text(settings.businessName) || text(tenant.name) || fallback.siteName,
    socials: socials
      .map((entry, sourceIndex) => ({ entry: asRecord(entry), sourceIndex }))
      .filter(({ entry }) => entry?.enabled !== false)
      .sort((left, right) =>
        sortableOrder(left.entry?.sortOrder) - sortableOrder(right.entry?.sortOrder)
        || left.sourceIndex - right.sourceIndex)
      .map(({ entry, sourceIndex }) => {
        const href = safeGheeRoastExternalHref(entry?.url)
        const platform = text(entry?.platform)
        const displayLabel = text(entry?.displayLabel)
          || `${platform.charAt(0).toUpperCase()}${platform.slice(1)}`
        const defaultCTA = platform === 'youtube'
          ? 'Watch on YouTube'
          : platform === 'facebook'
            ? 'Visit Facebook'
            : platform === 'whatsapp'
              ? 'Chat on WhatsApp'
              : `Follow on ${displayLabel}`
        return href && platform
          ? {
              ctaLabel: text(entry?.ctaLabel) || defaultCTA,
              description: text(entry?.description) || undefined,
              displayLabel,
              handle: text(entry?.handle) || undefined,
              href,
              icon: text(entry?.icon) && text(entry?.icon) !== 'platform' ? text(entry?.icon) : platform,
              label: text(entry?.ctaLabel) || defaultCTA,
              newTab: entry?.openInNewTab !== false,
              platform,
              renderKey: stableRenderKey('social', entry?.id, sourceIndex),
              sortOrder: sortableOrder(entry?.sortOrder),
            }
          : null
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    tagline: text(settings.tagline) || fallback.tagline,
    tenantID: tenantID === 0 ? undefined : tenantID,
    theme: {
      accentColor: !['', '#d4af37'].includes(text(branding.accentColor).toLowerCase()) ? text(branding.accentColor) : undefined,
      backgroundColor: !['', '#ffffff'].includes(text(branding.backgroundColor).toLowerCase()) ? text(branding.backgroundColor) : undefined,
      bodyFont: !['', 'inter'].includes(text(typography.bodyFont).toLowerCase()) ? text(typography.bodyFont) : undefined,
      cardRadius: !['', '8px'].includes(text(typography.cardRadius).toLowerCase()) ? text(typography.cardRadius) : undefined,
      headingFont: !['', 'inter'].includes(text(typography.headingFont).toLowerCase()) ? text(typography.headingFont) : undefined,
      headingTransform: text(typography.headingTransform) || undefined,
      primaryColor: !['', '#000000'].includes(text(branding.primaryColor).toLowerCase()) ? text(branding.primaryColor) : undefined,
    },
  }
}

export function mapGheeRoastFooter(
  value: unknown,
  tenantID: number | string,
  _options: MapperOptions = {},
): GheeRoastFooterData {
  void _options
  const fallback: GheeRoastFooterData = {
    bottomLinks: [],
    columns: [],
    configured: false,
    contactHeading: '',
    copyright: '',
  }
  if (!documentBelongsToTenant(value, tenantID)) return fallback
  const document = value
  const columns = (Array.isArray(document.columns) ? document.columns : [])
    .map((entry) => asRecord(entry))
    .filter((entry): entry is AnyDocument => Boolean(entry && text(entry.title)))
    .map((entry) => ({
      title: text(entry.title),
      links: (Array.isArray(entry.links) ? entry.links : [])
        .map((link) => asRecord(link))
        .map((link) => {
          const href = safeGheeRoastHref(link?.url)
          const label = text(link?.label)
          return href && label
            ? { href, label, newTab: boolean(link?.newTab) }
            : null
        })
        .filter((link): link is {
          href: string
          label: string
          newTab: boolean
        } => link !== null),
    }))
  const bottomLinks = (Array.isArray(document.bottomLinks) ? document.bottomLinks : [])
    .map((entry) => asRecord(entry))
    .map((entry) => {
      const href = safeGheeRoastHref(entry?.url)
      const label = text(entry?.label)
      return href && label
        ? { href, label, newTab: boolean(entry?.newTab) }
        : null
    })
    .filter((entry): entry is {
      href: string
      label: string
      newTab: boolean
    } => entry !== null)
  return {
    bottomLinks,
    columns,
    configured: true,
    contactHeading: text(document.contactHeading),
    copyright: text(document.copyright),
  }
}

export function mapGheeRoastSEO(
  value: unknown,
  tenantID: number | string,
): GheeRoastSEOData {
  if (!documentBelongsToTenant(value, tenantID)) return {}
  const jsonLd = (() => {
    const source = text(value.jsonLd)
    if (!source) return undefined
    try {
      const parsed: unknown = JSON.parse(source)
      if (Array.isArray(parsed)) {
        return parsed.every((entry) => Boolean(entry && typeof entry === 'object' && !Array.isArray(entry)))
          ? parsed as Array<Record<string, unknown>>
          : undefined
      }
      return parsed && typeof parsed === 'object'
        ? parsed as Record<string, unknown>
        : undefined
    } catch {
      return undefined
    }
  })()
  return {
    bingSiteVerification: text(value.bingSiteVerification) || undefined,
    canonicalUrl: safeGheeRoastHref(value.canonicalUrl) || undefined,
    description: text(value.metaDescription) || undefined,
    googleSiteVerification: text(value.googleSiteVerification) || undefined,
    jsonLd,
    keywords: text(value.keywords).split(',').map((keyword) => keyword.trim()).filter(Boolean),
    ogDescription: text(value.ogDescription) || undefined,
    ogImage: mapMedia(value.defaultOGImage, tenantID, undefined, 'og'),
    ogSiteName: text(value.ogSiteName) || undefined,
    ogTitle: text(value.ogTitle) || undefined,
    robots: text(value.robots) || undefined,
    titlePattern: text(value.metaTitlePattern) || undefined,
    twitterCard: ['app', 'player', 'summary', 'summary_large_image'].includes(text(value.twitterCard))
      ? text(value.twitterCard) as GheeRoastSEOData['twitterCard']
      : undefined,
    twitterCreator: text(value.twitterCreator) || undefined,
    twitterSite: text(value.twitterSite) || undefined,
  }
}

export function mapGheeRoastPage(
  value: GheeRoastPageDocument | null | undefined,
  tenantID: number | string,
): GheeRoastCMSPage | null {
  if (!value || !belongsToTenant(value.tenantId, tenantID) || value._status !== 'published') return null
  const blocks = value.layout ?? []
  const hero = blocks.find((block): block is HeroBlock => block.blockType === 'heroBlock')
  const redirectHref = value.redirect?.enableRedirect === true
    ? safeGheeRoastHref(value.redirect.redirectUrl)
    : null
  const template = value.template ?? ''
  return {
    canonicalUrl: safeGheeRoastHref(value.canonicalUrl) || undefined,
    hero: hero ? {
      eyebrow: text(hero.eyebrow) || undefined,
      image: mapMedia(hero.foregroundImage || hero.desktopBackgroundImage, tenantID, undefined, 'hero'),
      overlayOpacity: normalizedOverlayOpacity(hero.overlayOpacity),
      subtitle: text(hero.description),
      title: [text(hero.heading), text(hero.highlightedHeading)].filter(Boolean).join(' '),
    } : undefined,
    id: value.id,
    isHomePage: value.isHomePage === true,
    layout: blocks,
    metaDescription: text(value.metaDescription) || undefined,
    metaImage: mapMedia(value.metaImage, tenantID, undefined, 'og'),
    metaTitle: text(value.metaTitle) || undefined,
    noIndex: value.noIndex === true,
    pageType: normalizeCMSPageType(value.pageType, value.isHomePage === true),
    redirect: redirectHref
      ? { href: redirectHref, permanent: value.redirect?.permanent !== false }
      : undefined,
    slug: text(value.slug),
    template: ['blank', 'landing'].includes(template)
      ? template as 'blank' | 'landing'
      : 'default',
    title: text(value.title),
  }
}

export function mapGheeRoastCollections(
  documents: {
    events?: unknown[]
    faqs?: unknown[]
    gallery?: unknown[]
    locations?: unknown[]
    media?: unknown[]
    menuCategories?: unknown[]
    menuItems?: unknown[]
    team?: unknown[]
    testimonials?: unknown[]
  },
  tenantID: number | string,
  _options: MapperOptions = {},
): GheeRoastCollectionContent {
  void _options
  const activeCategoryDocuments = tenantDocuments(documents.menuCategories, tenantID)
    .filter((item) => item.isActive !== false)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
  const activeCategoriesByID = new Map(
    activeCategoryDocuments
      .map((item) => {
        const id = idOf(item)
        return id === null ? null : [String(id), item] as const
      })
      .filter((entry): entry is readonly [string, AnyDocument] => entry !== null),
  )
  const categories: Array<[string, string]> = activeCategoryDocuments
    .map((item): [string, string] => [text(item.slug) || String(item.id), text(item.title)])
  const menuItems = tenantDocuments(documents.menuItems, tenantID)
    .filter((item) => item.isAvailable !== false && text(item.stockStatus) !== 'out_of_stock')
    .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0))
    .map((item) => {
      const populatedCategory = asRecord(item.category)
      if (
        populatedCategory?.tenantId !== undefined &&
        !belongsToTenant(populatedCategory.tenantId as Relationship, tenantID)
      ) {
        return null
      }
      const categoryID = relationshipID(item.category as Relationship)
      const category = categoryID ? activeCategoriesByID.get(categoryID) : undefined
      if (!category) return null
      const priceValue = typeof item.price === 'number' ? item.price : undefined
      const price = priceValue !== undefined ? `₹${priceValue.toLocaleString('en-IN')}` : text(item.price)
      const mappedImage = mapMedia(
        item.image,
        tenantID,
        undefined,
        'card',
      )
      const locationIDs = Array.from(gheeRoastRelationshipIDs(item.locations))
      const locationPricing = (Array.isArray(item.locationPricing) ? item.locationPricing : [])
        .map((row) => {
          const rec = asRecord(row)
          const locationID = rec ? relationshipID(rec.location as Relationship) : null
          const rowPrice = rec?.price
          return locationID && typeof rowPrice === 'number' ? { locationID, price: rowPrice } : null
        })
        .filter((row): row is { locationID: string; price: number } => row !== null)
      return {
        badge: boolean(item.isFeatured) ? "Chef's Pick" : undefined,
        category: text(category.slug) || String(category.id),
        categoryID: idOf(category) ?? undefined,
        description: text(item.description),
        id: idOf(item) ?? undefined,
        image: mappedImage,
        isFeatured: boolean(item.isFeatured),
        locationIDs: locationIDs.length ? locationIDs : undefined,
        locationPricing: locationPricing.length ? locationPricing : undefined,
        meta: Array.isArray(item.dietary) ? item.dietary.map(text).filter(Boolean) : undefined,
        name: text(item.title),
        price,
        priceValue,
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.name))
  const testimonials = tenantDocuments(documents.testimonials, tenantID)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map((item) => ({
      attribution: text(item.customerRole),
      id: idOf(item) ?? undefined,
      isFeatured: boolean(item.isFeatured),
      name: text(item.customerName),
      quote: text(item.review),
      rating: typeof item.rating === 'number' && Number.isFinite(item.rating)
        ? Math.min(5, Math.max(1, Math.round(item.rating)))
        : 5,
    }))
    .filter((item) => item.name && item.quote)
  const gallery = tenantDocuments(documents.gallery, tenantID)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map((item) => {
      const mappedMedia = mapMedia(item.media, tenantID, undefined, 'card')
      return mappedMedia
        ? {
            ...mappedMedia,
            category: text(item.category) || undefined,
            id: idOf(item) ?? undefined,
            isFeatured: boolean(item.isFeatured),
          }
        : null
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
  const locations = tenantDocuments(documents.locations, tenantID)
    .filter((item) => item.isActive !== false)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map((item) => ({
      address: text(item.address),
      businessHours: (Array.isArray(item.businessHours) ? item.businessHours : [])
        .map((entry) => asRecord(entry))
        .filter((entry): entry is AnyDocument => entry !== null)
        .map((entry) => entry.isClosed === true
          ? `${text(entry.day)}: Closed`
          : [text(entry.day), [text(entry.openTime), text(entry.closeTime)].filter(Boolean).join(' – ')].filter(Boolean).join(': '))
        .filter(Boolean),
      city: text(item.city),
      country: text(item.country) || undefined,
      deliveryZones: (Array.isArray(item.deliveryZones) ? item.deliveryZones : [])
        .map((entry) => text(asRecord(entry)?.zone))
        .filter(Boolean),
      description: text(item.description) || undefined,
      email: text(item.email) || undefined,
      id: item.id as number | string,
      isPrimary: boolean(item.isPrimary),
      latitude: optionalFiniteNumber(item.latitude),
      longitude: optionalFiniteNumber(item.longitude),
      mapButtonLabel: text(item.mapButtonLabel) || 'Find on Map',
      mapsEmbedUrl: safeGheeRoastExternalHref(item.mapsEmbedUrl) || undefined,
      mapsUrl: safeGheeRoastExternalHref(item.mapsUrl) || undefined,
      orderLinks: (Array.isArray(item.orderLinks) ? item.orderLinks : [])
        .map((entry) => asRecord(entry))
        .map((entry) => {
          const href = safeGheeRoastHref(entry?.url)
          const platform = text(entry?.platform)
          return href && platform
            ? { href, label: `Order on ${platform}` }
            : null
        })
        .filter((entry): entry is { href: string; label: string } => entry !== null),
      phone: text(item.phone) || undefined,
      postalCode: text(item.postalCode) || undefined,
      showOnContact: item.showOnContact !== false,
      sortOrder: sortableOrder(item.sortOrder),
      state: text(item.state) || undefined,
      title: text(item.title),
    }))
  // Used today only for formBlock's large near-full-width side image
  // (sizes="(max-width: 800px) 95vw, 42vw" in CMSPage.tsx) — none of the 4 semantic size
  // contexts cleanly fit that usage (card/thumbnail are too small, hero/og are the wrong aspect
  // ratio for a portrait side image), so this intentionally keeps serving the original file.
  const media = tenantDocuments(documents.media, tenantID)
    .map((item) => mapMedia(item, tenantID))
    .filter((item): item is NonNullable<typeof item> => item !== undefined)
  const team = tenantDocuments(documents.team, tenantID)
    .filter((item) => item.isActive !== false)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map((item) => ({
      bio: text(item.bio) || undefined,
      id: item.id as number | string,
      name: text(item.title),
      photo: mapMedia(item.photo, tenantID, undefined, 'card'),
      quote: text(item.quote) || undefined,
      role: text(item.role),
    }))
  const events = tenantDocuments(documents.events, tenantID)
    .filter((item) => text(item.status) === 'published')
    .map((item) => ({
      bookingUrl: safeGheeRoastHref(item.bookingUrl) || undefined,
      description: text(item.description) || undefined,
      endsAt: text(item.endsAt) || undefined,
      id: item.id as number | string,
      image: mapMedia(item.image, tenantID, undefined, 'card'),
      isFeatured: boolean(item.isFeatured),
      locationName: text(item.locationName) || undefined,
      startsAt: text(item.startsAt),
      summary: text(item.summary),
      title: text(item.title),
    }))
  const faqs = tenantDocuments(documents.faqs, tenantID)
    .filter((item) => item.isActive !== false)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map((item) => ({
      answer: text(item.answer),
      category: text(item.category) || undefined,
      id: item.id as number | string,
      question: text(item.title),
    }))
  const hasCompleteCMSMenu = categories.length > 0 && menuItems.length > 0

  return {
    events,
    faqs,
    gallery,
    locations,
    media,
    menu: {
      categories: hasCompleteCMSMenu
        ? [['all', 'All Items'], ...categories]
        : [],
      items: hasCompleteCMSMenu
        ? menuItems
        : [],
    },
    team,
    testimonials,
  }
}

export function mapGheeRoastHero(
  page: CMSHomepage | null | undefined,
  tenantID: number | string,
  _options: MapperOptions = {},
): GheeRoastHeroData {
  void _options
  const missingContent = emptyGheeRoastHero()
  if (
    !page ||
    !belongsToTenant(page.tenantId, tenantID) ||
    page.isHomePage !== true ||
    page._status !== 'published'
  ) {
    return missingContent
  }

  const hero = page.layout?.find(
    (block): block is CMSHeroBlock => block.blockType === 'heroBlock',
  )
  if (!hero) return missingContent

  // foreground is a contained product/"dish" cutout shot, not a full-bleed background — the
  // hero variant's fixed 16:9 crop risks clipping it, so it intentionally keeps the original.
  // desktopBackground/mobile genuinely render full-bleed via CSS background-size: cover
  // (HomeHero.tsx), where a pre-cropped 16:9 "hero" variant is a safe, equivalent fit.
  const foreground = mediaData(hero.foregroundImage, tenantID, undefined, hero.imageAlt)
  const desktopBackground = mediaData(hero.desktopBackgroundImage, tenantID, undefined, hero.imageAlt, 'hero')
  const mobile = mediaData(hero.mobileBackgroundImage, tenantID, undefined, hero.imageAlt, 'hero')
  // Older Ghee Roast records used Desktop Background Image for the foreground
  // dish. Preserve those records while allowing a separate background and
  // foreground without rendering the same asset twice.
  const image = foreground ?? desktopBackground
  const hasSeparateBackground = Boolean(
    foreground
    && desktopBackground
    && foreground.src !== desktopBackground.src,
  )
  const primaryLabel = hero.primaryCTALabel?.trim() || ''
  const primaryHref = safeGheeRoastHref(hero.primaryCTAURL) || ''
  const secondaryLabel = hero.secondaryCTALabel?.trim() || ''
  const secondaryHref = safeGheeRoastHref(hero.secondaryCTAURL) || ''

  return {
    backgroundImage: hasSeparateBackground ? desktopBackground : undefined,
    description: hero.description?.trim() || '',
    enabled: hero.enabled !== false,
    eyebrow: hero.eyebrow?.trim() || undefined,
    heading: hero.heading?.trim() || '',
    highlightedHeading: hero.highlightedHeading?.trim() || '',
    image,
    mobileBackgroundImage: hasSeparateBackground ? mobile : undefined,
    mobileImage: !hasSeparateBackground ? mobile : undefined,
    orderPlatformsLabel: hero.orderPlatformsLabel?.trim() || undefined,
    overlayOpacity: normalizedOverlayOpacity(hero.overlayOpacity),
    primaryCTA: primaryLabel && primaryHref
      ? { href: primaryHref, label: primaryLabel }
      : undefined,
    secondaryCTA: secondaryLabel && secondaryHref
      ? { href: secondaryHref, label: secondaryLabel }
      : undefined,
    stampText: hero.stampText?.trim() || undefined,
  }
}
