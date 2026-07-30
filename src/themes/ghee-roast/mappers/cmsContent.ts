import { homeData } from '../data/home'
import { menuData } from '../data/menu'
import { gheeRoastNavigation } from '../data/navigation'
import { gheeRoastSiteData } from '../data/site'
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
  id?: unknown
  isHomePage?: unknown
  slug?: unknown
  tenantId?: unknown
  url?: unknown
}

type Relationship = number | string | RelationshipDocument | null | undefined

type CMSLink = {
  blockType?: string
  enabled?: boolean | null
  label?: string | null
  newTab?: boolean | null
  page?: Relationship
  sortOrder?: number | null
  type?: string | null
  url?: string | null
  children?: Array<{
    label?: string | null
    newTab?: boolean | null
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

type CMSHeroBlock = {
  blockType?: string
  description?: string | null
  desktopBackgroundImage?: Relationship
  enabled?: boolean | null
  eyebrow?: string | null
  foregroundImage?: Relationship
  heading?: string | null
  highlightedHeading?: string | null
  imageAlt?: string | null
  mobileBackgroundImage?: Relationship
  orderPlatformsLabel?: string | null
  primaryCTALabel?: string | null
  primaryCTAURL?: string | null
  secondaryCTALabel?: string | null
  secondaryCTAURL?: string | null
  stampText?: string | null
}

type CMSHomepage = {
  _status?: string | null
  isHomePage?: boolean | null
  layout?: Array<CMSHeroBlock | { blockType?: string }> | null
  status?: string | null
  tenantId?: Relationship
}

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

const belongsToTenant = (value: Relationship, tenantID: number | string): boolean =>
  relationshipID(value) === String(tenantID)

const mediaData = (
  value: Relationship,
  tenantID: number | string,
  fallback?: { alt: string, src: string },
  altOverride?: string | null,
) => {
  if (!value || typeof value !== 'object' || !belongsToTenant(value.tenantId as Relationship, tenantID)) {
    return fallback
  }

  const url = typeof value.url === 'string' ? value.url : ''
  if (!url) return fallback

  return {
    alt: altOverride || (typeof value.alt === 'string' ? value.alt : fallback?.alt || ''),
    src: url,
  }
}

export const fallbackGheeRoastNavigation = (): GheeRoastNavigationData => ({
  brandName: 'Very Good',
  cta: {
    enabled: true,
    href: '/menu',
    label: 'Order online',
  },
  items: gheeRoastNavigation.map((item) => item.href === '/menu'
    ? {
        ...item,
        children: [
          { href: '/menu?location=delhi', label: 'Delhi Menu' },
          { href: '/menu?location=gurugram', label: 'Gurugram Menu' },
        ],
      }
    : item),
  logo: gheeRoastSiteData.logo,
  tagline: 'Flavours that stay',
})

export const fallbackGheeRoastHero = (): GheeRoastHeroData => ({
  description: 'We slow roast every dish in ghee to bring out bold flavours and aromas that stay with you.',
  enabled: true,
  heading: 'Real Ingredients.\nRich Flavours.',
  highlightedHeading: 'Pure Ghee.',
  image: homeData.hero.image,
  orderPlatformsLabel: 'Also available on',
  primaryCTA: { href: '/menu', label: 'Explore Menu' },
  secondaryCTA: { href: '/delivery', label: 'Order Now' },
  stampText: 'Slow\nRoasted\nIn Ghee\nWith Love',
})

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
  const missingContent = options.fallbacksEnabled === false
    ? emptyGheeRoastNavigation(options.tenantName)
    : fallbackGheeRoastNavigation()
  if (!document || !belongsToTenant(document.tenantId, tenantID)) return missingContent

  const items = (document.links ?? [])
    .filter((link): link is CMSLink => link.blockType === 'link')
    .filter((link) => link.enabled !== false && Boolean(link.label))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map((link): GheeRoastNavigationItem | null => {
      const href = link.type === 'page'
        ? pageHref(link.page, tenantID)
        : safeGheeRoastHref(link.url, link.type === 'anchor' ? 'anchor' : undefined)
      if (!href) return null
      return {
        children: (link.children ?? [])
          .map((child) => {
            const childHref = safeGheeRoastHref(child.url)
            const childLabel = child.label?.trim() || ''
            return childHref && childLabel
              ? {
                  href: childHref,
                  label: childLabel,
                  newTab: child.newTab === true,
                }
              : null
          })
          .filter((child): child is {
            href: string
            label: string
            newTab: boolean
          } => child !== null),
        href,
        label: link.label?.trim() || '',
        newTab: link.newTab === true,
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
) => mediaData(value as Relationship, tenantID, fallback)

const fallbackFooter = (): GheeRoastFooterData => ({
  bottomLinks: [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms & Conditions' },
    { href: '#', label: 'Refund Policy' },
    { href: '#', label: 'Sitemap' },
  ],
  columns: [
    {
      title: 'Explore',
      links: [
        { href: '/', label: 'Home' },
        { href: '/menu', label: 'The Menu' },
        { href: '/about', label: 'Our Story' },
        { href: '/quality', label: 'Quality Promise' },
      ],
    },
    {
      title: 'Services',
      links: [
        { href: '/delivery', label: 'Order Delivery' },
        { href: '/catering', label: 'Luxury Catering' },
        { href: '/menu?location=delhi', label: 'Delhi Menu' },
        { href: '/menu?location=gurugram', label: 'Gurugram Menu' },
        { href: '/contact', label: 'Contact Us' },
      ],
    },
  ],
  contactHeading: 'Get In Touch',
  copyright: '© {year} VERY GOOD GHEE ROAST. All Rights Reserved.',
})

export function mapGheeRoastSite(
  tenantValue: unknown,
  settingsValue: unknown,
  tenantID: number | string,
  options: MapperOptions = {},
): GheeRoastSiteData {
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
  const fallbacksEnabled = options.fallbacksEnabled !== false
  const fallback = fallbacksEnabled ? gheeRoastSiteData : {
    announcement: '',
    contact: { address: '', hours: [], phone: '' },
    description: '',
    logo: undefined,
    newsletter: { description: '', title: '' },
    orderLinks: [],
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
    logo: mapMedia(branding.logo, tenantID, fallback.logo),
    newsletter: {
      buttonLabel: text(newsletter.buttonLabel) || 'Subscribe',
      description: text(newsletter.description) || fallback.newsletter.description,
      enabled: boolean(newsletter.enabled, fallbacksEnabled),
      highlightedWord: text(newsletter.highlightedWord) || undefined,
      placeholder: text(newsletter.placeholder) || 'Enter your email address',
      privacyText: text(newsletter.privacyText) || 'We respect your privacy. Unsubscribe anytime.',
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
      .filter((entry): entry is { href: string; label: string } => entry !== null)
      .concat(deliveryURLs.length ? [] : fallback.orderLinks),
    siteName: text(settings.businessName) || text(tenant.name) || fallback.siteName,
    socials: socials
      .map((entry) => asRecord(entry))
      .map((entry) => {
        const href = safeGheeRoastHref(entry?.url)
        const platform = text(entry?.platform)
        return href && platform
          ? { href, label: platform, platform }
          : null
      })
      .filter((entry): entry is { href: string; label: string; platform: string } => entry !== null),
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
  options: MapperOptions = {},
): GheeRoastFooterData {
  const fallback = options.fallbacksEnabled === false
    ? { bottomLinks: [], columns: [], contactHeading: '', copyright: '' }
    : fallbackFooter()
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
    bottomLinks: bottomLinks.length ? bottomLinks : fallback.bottomLinks,
    columns: columns.length ? columns : fallback.columns,
    contactHeading: text(document.contactHeading) || fallback.contactHeading,
    copyright: text(document.copyright) || fallback.copyright,
  }
}

export function mapGheeRoastSEO(
  value: unknown,
  tenantID: number | string,
): GheeRoastSEOData {
  if (!documentBelongsToTenant(value, tenantID)) return {}
  return {
    canonicalUrl: safeGheeRoastHref(value.canonicalUrl) || undefined,
    description: text(value.metaDescription) || undefined,
    ogDescription: text(value.ogDescription) || undefined,
    ogImage: mapMedia(value.defaultOGImage, tenantID),
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
  value: unknown,
  tenantID: number | string,
): GheeRoastCMSPage | null {
  if (!documentBelongsToTenant(value, tenantID)) return null
  const id = idOf(value)
  if (
    id === null ||
    text(value.status) !== 'published' ||
    (text(value._status) && text(value._status) !== 'published')
  ) return null
  const blocks = Array.isArray(value.layout)
    ? value.layout.filter((block): block is AnyDocument => asRecord(block) !== null)
    : []
  const hero = blocks.find((block) => text(block.blockType) === 'heroBlock')
  return {
    canonicalUrl: safeGheeRoastHref(value.canonicalUrl) || undefined,
    hero: hero ? {
      eyebrow: text(hero.eyebrow) || undefined,
      image: mapMedia(hero.foregroundImage || hero.desktopBackgroundImage, tenantID),
      subtitle: text(hero.description),
      title: [text(hero.heading), text(hero.highlightedHeading)].filter(Boolean).join(' '),
    } : undefined,
    id,
    isHomePage: boolean(value.isHomePage),
    layout: blocks,
    metaDescription: text(value.metaDescription) || undefined,
    metaImage: mapMedia(value.metaImage, tenantID),
    metaTitle: text(value.metaTitle) || undefined,
    noIndex: boolean(value.noIndex),
    slug: text(value.slug),
    title: text(value.title),
  }
}

export function mapGheeRoastCollections(
  documents: {
    events?: unknown[]
    faqs?: unknown[]
    gallery?: unknown[]
    locations?: unknown[]
    menuCategories?: unknown[]
    menuItems?: unknown[]
    team?: unknown[]
    testimonials?: unknown[]
  },
  tenantID: number | string,
  options: MapperOptions = {},
): GheeRoastCollectionContent {
  const fallbacksEnabled = options.fallbacksEnabled !== false
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
      const price = typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : text(item.price)
      const mappedImage = mapMedia(
        item.image,
        tenantID,
        fallbacksEnabled ? homeData.hero.image : undefined,
      )
      return {
        badge: boolean(item.isFeatured) ? "Chef's Pick" : undefined,
        category: text(category.slug) || String(category.id),
        categoryID: idOf(category) ?? undefined,
        description: text(item.description),
        id: idOf(item) ?? undefined,
        image: mappedImage,
        isFeatured: boolean(item.isFeatured),
        meta: Array.isArray(item.dietary) ? item.dietary.map(text).filter(Boolean) : undefined,
        name: text(item.title),
        price,
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
      const mappedMedia = mapMedia(item.media, tenantID)
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
      city: text(item.city),
      description: text(item.description) || undefined,
      email: text(item.email) || undefined,
      id: item.id as number | string,
      mapsEmbedUrl: safeGheeRoastHref(item.mapsEmbedUrl) || undefined,
      mapsUrl: safeGheeRoastHref(item.mapsUrl) || undefined,
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
      title: text(item.title),
    }))
  const team = tenantDocuments(documents.team, tenantID)
    .filter((item) => item.isActive !== false)
    .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
    .map((item) => ({
      bio: text(item.bio) || undefined,
      id: item.id as number | string,
      name: text(item.title),
      photo: mapMedia(item.photo, tenantID),
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
      image: mapMedia(item.image, tenantID),
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
    gallery: gallery.length ? gallery : fallbacksEnabled ? homeData.gallery : [],
    locations,
    menu: {
      categories: hasCompleteCMSMenu
        ? [['all', 'All Items'], ...categories]
        : fallbacksEnabled
          ? menuData.categories as Array<[string, string]>
          : [],
      items: hasCompleteCMSMenu
        ? menuItems
        : fallbacksEnabled
          ? menuData.items as import('../types').FoodItemData[]
          : [],
    },
    team,
    testimonials: testimonials.length ? testimonials : fallbacksEnabled ? homeData.testimonials : [],
  }
}

export function mapGheeRoastHero(
  page: CMSHomepage | null | undefined,
  tenantID: number | string,
  options: MapperOptions = {},
): GheeRoastHeroData {
  const missingContent = options.fallbacksEnabled === false
    ? emptyGheeRoastHero()
    : fallbackGheeRoastHero()
  if (
    !page ||
    !belongsToTenant(page.tenantId, tenantID) ||
    page.isHomePage !== true ||
    page.status !== 'published' ||
    (page._status && page._status !== 'published')
  ) {
    return missingContent
  }

  const hero = page.layout?.find(
    (block): block is CMSHeroBlock => block.blockType === 'heroBlock',
  )
  if (!hero) return missingContent

  const foreground = hero.foregroundImage || hero.desktopBackgroundImage
  const image = mediaData(foreground, tenantID, undefined, hero.imageAlt)
  const mobileImage = hero.mobileBackgroundImage
    ? mediaData(hero.mobileBackgroundImage, tenantID, image, hero.imageAlt)
    : undefined
  const primaryLabel = hero.primaryCTALabel?.trim() || ''
  const primaryHref = safeGheeRoastHref(hero.primaryCTAURL) || ''
  const secondaryLabel = hero.secondaryCTALabel?.trim() || ''
  const secondaryHref = safeGheeRoastHref(hero.secondaryCTAURL) || ''

  return {
    description: hero.description?.trim() || '',
    enabled: hero.enabled !== false,
    eyebrow: hero.eyebrow?.trim() || undefined,
    heading: hero.heading?.trim() || '',
    highlightedHeading: hero.highlightedHeading?.trim() || '',
    image,
    mobileImage,
    orderPlatformsLabel: hero.orderPlatformsLabel?.trim() || undefined,
    primaryCTA: primaryLabel && primaryHref
      ? { href: primaryHref, label: primaryLabel }
      : undefined,
    secondaryCTA: secondaryLabel && secondaryHref
      ? { href: secondaryHref, label: secondaryLabel }
      : undefined,
    stampText: hero.stampText?.trim() || undefined,
  }
}
