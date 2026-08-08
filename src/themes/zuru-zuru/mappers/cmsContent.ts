import type {
  CardGridBlock,
  ContentGridBlock,
  FeatureStripBlock,
  Footer,
  HeroBlock,
  Location,
  LocationsBlock,
  Media,
  MenuCategory,
  MenuItem,
  MenuShowcaseBlock,
  Nav,
  Page,
  SiteSetting,
  StoryBlock,
  Tenant,
  Testimonial,
  TestimonialsBlock,
} from '../../../payload-types'
import type {
  ZuruZuruCardGridBlockData,
  ZuruZuruCardGridVariant,
  ZuruZuruContentGridBlockData,
  ZuruZuruDishBadge,
  ZuruZuruDishCategoryData,
  ZuruZuruFeatureStripBlockData,
  ZuruZuruFooterData,
  ZuruZuruHeroBlockData,
  ZuruZuruLinkData,
  ZuruZuruLocationsBlockData,
  ZuruZuruMediaData,
  ZuruZuruMenuShowcaseBlockData,
  ZuruZuruNavigationData,
  ZuruZuruPageBlockData,
  ZuruZuruSectionHeaderData,
  ZuruZuruShellData,
  ZuruZuruSiteData,
  ZuruZuruStoryBlockData,
  ZuruZuruTestimonialsBlockData,
} from './dynamicTypes'

const text = (value: string | null | undefined): string => (typeof value === 'string' ? value.trim() : '')

const isPopulated = <T extends { id: number }>(value: number | T | null | undefined): value is T =>
  Boolean(value && typeof value === 'object')

const belongsToTenant = (
  tenantField: number | Tenant | null | undefined,
  tenantID: number,
): boolean => {
  if (typeof tenantField === 'number') return tenantField === tenantID
  if (tenantField && typeof tenantField === 'object') return tenantField.id === tenantID
  return false
}

function mapMedia(value: number | Media | null | undefined, tenantID: number): ZuruZuruMediaData {
  if (!isPopulated<Media>(value)) return null
  if (!belongsToTenant(value.tenantId, tenantID)) return null
  const src = text(value.url)
  if (!src) return null
  return {
    alt: text(value.alt) || 'Zuru Zuru',
    id: value.id,
    src,
  }
}

const emptyNavigation: ZuruZuruNavigationData = { brandName: '', cta: null, links: [], logo: null }

export function mapZuruZuruNavigation(nav: Nav | null, tenantID: number): ZuruZuruNavigationData {
  if (!nav || !belongsToTenant(nav.tenantId, tenantID)) return emptyNavigation
  return {
    brandName: text(nav.brandName),
    cta: nav.cta?.enabled && nav.cta.label && nav.cta.url
      ? { label: text(nav.cta.label), url: text(nav.cta.url) }
      : null,
    links: (nav.links ?? [])
      .filter((entry): entry is Extract<NonNullable<Nav['links']>[number], { blockType: 'link' }> =>
        entry.blockType === 'link' && entry.enabled !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((entry) => ({
        children: (entry.children ?? [])
          .filter((child) => child.enabled !== false)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((child) => ({ label: text(child.label), url: text(child.url) }))
          .filter((child) => child.label && child.url),
        label: text(entry.label),
        url: entry.type === 'page'
          ? (isPopulated<Page>(entry.page) ? `/${text(entry.page.slug)}` : '/')
          : text(entry.url),
      }))
      .filter((link) => link.label && link.url),
    logo: mapMedia(nav.logo, tenantID),
  }
}

const emptyFooter: ZuruZuruFooterData = { bottomLinks: [], columns: [], copyright: '' }

export function mapZuruZuruFooter(footer: Footer | null, tenantID: number): ZuruZuruFooterData {
  if (!footer || !belongsToTenant(footer.tenantId, tenantID)) return emptyFooter
  return {
    bottomLinks: (footer.bottomLinks ?? []).map((link) => ({ label: text(link.label), url: text(link.url) })),
    columns: (footer.columns ?? []).map((column) => ({
      links: (column.links ?? []).map((link) => ({ label: text(link.label), url: text(link.url) })),
      title: text(column.title),
    })),
    copyright: text(footer.copyright).replace('{year}', String(new Date().getFullYear())),
  }
}

const emptyNewsletter = {
  buttonLabel: '',
  description: '',
  enabled: false,
  errorMessage: '',
  placeholder: '',
  successMessage: '',
  title: '',
}

const emptySite: ZuruZuruSiteData = {
  address: '',
  announcement: { enabled: false, text: '' },
  description: '',
  email: '',
  hours: [],
  logo: null,
  name: '',
  newsletter: emptyNewsletter,
  phone: '',
  social: [],
  tagline: '',
}

export function mapZuruZuruSite(
  tenant: Tenant | null,
  siteSettings: SiteSetting | null,
): ZuruZuruSiteData {
  if (!tenant) return emptySite
  const tenantID = tenant.id
  const settings = siteSettings && belongsToTenant(siteSettings.tenantId, tenantID) ? siteSettings : null
  return {
    address: text(settings?.contactAddress),
    announcement: {
      enabled: settings?.showAnnouncementBar === true && Boolean(text(settings?.announcementText)),
      text: text(settings?.announcementText),
    },
    description: text(settings?.siteDescription),
    email: text(tenant.contact?.contactEmail),
    hours: (settings?.hours ?? []).map((row) => ({
      closeTime: text(row.closeTime),
      day: text(row.day),
      isClosed: row.isClosed === true,
      openTime: text(row.openTime),
    })),
    logo: mapMedia(tenant.branding?.logo, tenantID),
    name: text(settings?.businessName) || text(tenant.name),
    newsletter: settings?.newsletter
      ? {
          buttonLabel: text(settings.newsletter.buttonLabel),
          description: text(settings.newsletter.description),
          enabled: settings.newsletter.enabled !== false,
          errorMessage: text(settings.newsletter.errorMessage),
          placeholder: text(settings.newsletter.placeholder),
          successMessage: text(settings.newsletter.successMessage),
          title: text(settings.newsletter.title),
        }
      : emptyNewsletter,
    phone: text(tenant.contact?.contactPhone),
    social: (settings?.socials ?? [])
      .filter((social) => social.enabled !== false && social.url)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((social) => ({
        href: text(social.url),
        icon: !social.icon || social.icon === 'platform' ? social.platform : social.icon,
        label: social.platform,
      })),
    tagline: text(settings?.tagline),
  }
}

export function mapZuruZuruShell({
  footer,
  nav,
  siteSettings,
  tenant,
}: {
  footer: Footer | null
  nav: Nav | null
  siteSettings: SiteSetting | null
  tenant: Tenant | null
}): ZuruZuruShellData {
  const tenantID = tenant?.id ?? 0
  return {
    footer: mapZuruZuruFooter(footer, tenantID),
    navigation: mapZuruZuruNavigation(nav, tenantID),
    site: mapZuruZuruSite(tenant, siteSettings),
  }
}

// ---------------------------------------------------------------------------
// Home page — layout blocks
// ---------------------------------------------------------------------------

type ZuruZuruLinkFieldValue = {
  disabled?: boolean | null
  label: string
  reference?: (number | Page) | null
  type?: string | null
  url?: string | null
} | null | undefined

function mapZuruZuruLinkField(link: ZuruZuruLinkFieldValue, tenantID: number): ZuruZuruLinkData {
  if (!link || link.disabled) return null
  const label = text(link.label)
  if (!label) return null
  if (link.type === 'reference') {
    if (!isPopulated<Page>(link.reference) || !belongsToTenant(link.reference.tenantId, tenantID)) return null
    const url = link.reference.isHomePage ? '/' : `/${text(link.reference.slug)}`
    return { label, url }
  }
  const url = text(link.url)
  return url ? { label, url } : null
}

function mapZuruZuruSectionHeader(
  header: { description?: string | null; eyebrow?: string | null; subtitle?: string | null; title: string },
): ZuruZuruSectionHeaderData {
  return {
    description: text(header.description),
    eyebrow: text(header.eyebrow),
    japanese: text(header.subtitle),
    title: text(header.title),
  }
}

function heatFromSpiceLevel(spiceLevel: MenuItem['spiceLevel']): number {
  switch (spiceLevel) {
    case 'mild': return 1
    case 'medium': return 2
    case 'hot':
    case 'extra_hot': return 3
    default: return 0
  }
}

function badgeFromMenuItem(badge: MenuItem['badge']): ZuruZuruDishBadge | null {
  return badge === 'chef' || badge === 'popular' || badge === 'new' ? badge : null
}

function mapDishCategory(category: MenuItem['category']): ZuruZuruDishCategoryData {
  if (!isPopulated<MenuCategory>(category)) return null
  return { slug: text(category.slug), title: text(category.title) }
}

export function mapZuruZuruHero(block: HeroBlock, tenantID: number): ZuruZuruHeroBlockData {
  return {
    backgroundImage: mapMedia(block.desktopBackgroundImage, tenantID),
    description: text(block.description),
    eyebrow: text(block.eyebrow),
    heading: text(block.heading),
    highlightedHeading: text(block.highlightedHeading),
    image: mapMedia(block.foregroundImage, tenantID),
    imageAlt: text(block.imageAlt),
    primaryCTA: block.primaryCTALabel && block.primaryCTAURL
      ? { label: text(block.primaryCTALabel), url: text(block.primaryCTAURL) }
      : null,
    secondaryCTA: block.secondaryCTALabel && block.secondaryCTAURL
      ? { label: text(block.secondaryCTALabel), url: text(block.secondaryCTAURL) }
      : null,
    stampText: text(block.stampText),
  }
}

export function mapZuruZuruFeatureStrip(block: FeatureStripBlock): ZuruZuruFeatureStripBlockData {
  return {
    items: (block.items ?? []).map((item) => ({
      description: text(item.description),
      icon: text(item.icon),
      title: text(item.title),
    })),
  }
}

/** Zuru Zuru's Home page needs 3 distinct visual treatments for cardgridBlock (Cuisine Explorer, Dining Experience, Seasonal Collections), but the block has no presentation field. `settings.customClasses` — an existing free-text "developer override" field — is repurposed as the discriminator instead of adding a new field. */
function cardGridVariant(customClasses: string | null | undefined): ZuruZuruCardGridVariant {
  const value = text(customClasses)
  return value === 'dining' || value === 'seasons' ? value : 'cuisine'
}

export function mapZuruZuruCardGrid(block: CardGridBlock, tenantID: number): ZuruZuruCardGridBlockData {
  return {
    cards: (block.cards ?? []).map((card) => ({
      description: text(card.description),
      enableLink: card.enableLink === true,
      image: mapMedia(card.image?.item, tenantID),
      link: card.enableLink ? mapZuruZuruLinkField(card.link, tenantID) : null,
      title: text(card.title),
    })),
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    variant: cardGridVariant(block.settings?.customClasses),
  }
}

export function mapZuruZuruStory(block: StoryBlock, tenantID: number): ZuruZuruStoryBlockData {
  return {
    body: text(block.body),
    cta: block.enableCta ? mapZuruZuruLinkField(block.cta, tenantID) : null,
    eyebrow: text(block.eyebrow),
    image: mapMedia(block.media, tenantID),
    imageAlt: text(block.mediaAlt),
    title: text(block.title),
  }
}

export function mapZuruZuruContentGrid(block: ContentGridBlock): ZuruZuruContentGridBlockData {
  return {
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    items: (block.items ?? []).map((item) => ({
      description: text(item.description),
      icon: text(item.icon),
      title: text(item.title),
    })),
    presentation: text(block.presentation) || 'grid',
  }
}

export function mapZuruZuruMenuShowcase(
  block: MenuShowcaseBlock,
  menuItems: MenuItem[],
  tenantID: number,
): ZuruZuruMenuShowcaseBlockData {
  const categoryIds = new Set(
    (block.categories ?? []).map((category) => (typeof category === 'number' ? category : category.id)),
  )
  const items = menuItems
    .filter((item) => belongsToTenant(item.tenantId, tenantID))
    .filter((item) => item.isAvailable !== false)
    .filter((item) => (block.featuredOnly === false ? true : item.isFeatured === true))
    .filter((item) => {
      if (categoryIds.size === 0) return true
      const categoryID = typeof item.category === 'number' ? item.category : item.category.id
      return categoryIds.has(categoryID)
    })
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .slice(0, block.limit ?? 6)
    .map((item) => ({
      badge: badgeFromMenuItem(item.badge),
      calories: item.calories ?? null,
      category: mapDishCategory(item.category),
      description: text(item.description),
      heat: heatFromSpiceLevel(item.spiceLevel),
      id: item.id,
      image: mapMedia(item.image, tenantID),
      name: text(item.title),
      price: item.price,
    }))
  return {
    cta: block.ctaGroup?.enablePrimary ? mapZuruZuruLinkField(block.ctaGroup.primaryCTA, tenantID) : null,
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    items,
  }
}

export function mapZuruZuruTestimonialsBlock(
  block: TestimonialsBlock,
  testimonials: Testimonial[],
  tenantID: number,
): ZuruZuruTestimonialsBlockData {
  const manualIds = new Set(
    (block.testimonials ?? []).map((testimonial) => (typeof testimonial === 'number' ? testimonial : testimonial.id)),
  )
  const pool = testimonials.filter((testimonial) => belongsToTenant(testimonial.tenantId, tenantID))
  const selected = block.source === 'manual'
    ? pool.filter((testimonial) => manualIds.has(testimonial.id))
    : pool.filter((testimonial) => (block.featuredOnly === false ? true : testimonial.isFeatured === true))
  const items = selected
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, block.limit ?? 3)
    .map((testimonial) => ({
      id: testimonial.id,
      name: text(testimonial.customerName),
      photo: mapMedia(testimonial.photo, tenantID),
      rating: testimonial.rating,
      review: text(testimonial.review),
      role: text(testimonial.customerRole),
    }))
  return { header: mapZuruZuruSectionHeader(block.sectionHeader), items }
}

export function mapZuruZuruLocationsBlock(
  block: LocationsBlock,
  locations: Location[],
  tenantID: number,
): ZuruZuruLocationsBlockData {
  const explicitIds = new Set(
    (block.locations ?? []).map((location) => (typeof location === 'number' ? location : location.id)),
  )
  const pool = locations.filter((location) => belongsToTenant(location.tenantId, tenantID) && location.isActive !== false)
  const candidates = explicitIds.size > 0 ? pool.filter((location) => explicitIds.has(location.id)) : pool
  const primary = candidates.find((location) => location.isPrimary) ?? candidates[0] ?? null
  return {
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    location: primary
      ? {
          address: text(primary.address),
          hours: (primary.businessHours ?? []).map((row) => ({
            closeTime: text(row.closeTime),
            day: text(row.day),
            isClosed: row.isClosed === true,
            openTime: text(row.openTime),
          })),
          id: primary.id,
          parking: text(primary.description),
        }
      : null,
    showMap: block.showMap !== false,
  }
}

/** Generic Page.layout -> block-data mapper, shared by every CMS-driven Zuru Zuru page. Each page's own renderer decides how to visually interpret the same block-data shapes. */
export function mapZuruZuruPageLayout(
  layout: Page['layout'],
  {
    locations,
    menuItems,
    testimonials,
    tenantID,
  }: {
    locations: Location[]
    menuItems: MenuItem[]
    testimonials: Testimonial[]
    tenantID: number
  },
): ZuruZuruPageBlockData[] {
  const blocks: ZuruZuruPageBlockData[] = []
  for (const block of layout ?? []) {
    switch (block.blockType) {
      case 'heroBlock':
        if (block.enabled !== false) blocks.push({ data: mapZuruZuruHero(block, tenantID), type: 'hero' })
        break
      case 'featurestripBlock':
        blocks.push({ data: mapZuruZuruFeatureStrip(block), type: 'featureStrip' })
        break
      case 'cardgridBlock':
        blocks.push({ data: mapZuruZuruCardGrid(block, tenantID), type: 'cardGrid' })
        break
      case 'storyBlock':
        blocks.push({ data: mapZuruZuruStory(block, tenantID), type: 'story' })
        break
      case 'menushowcaseBlock':
        blocks.push({ data: mapZuruZuruMenuShowcase(block, menuItems, tenantID), type: 'menuShowcase' })
        break
      case 'contentgridBlock':
        blocks.push({ data: mapZuruZuruContentGrid(block), type: 'contentGrid' })
        break
      case 'testimonialsBlock':
        blocks.push({ data: mapZuruZuruTestimonialsBlock(block, testimonials, tenantID), type: 'testimonials' })
        break
      case 'locationsBlock':
        blocks.push({ data: mapZuruZuruLocationsBlock(block, locations, tenantID), type: 'locations' })
        break
      default:
        break
    }
  }
  return blocks
}
