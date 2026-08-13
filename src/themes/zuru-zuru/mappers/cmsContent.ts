import type {
  BlogPost,
  BlogPreviewBlock,
  CardGridBlock,
  CareersBlock,
  ContentGridBlock,
  CTABlock,
  Event,
  EventsBlock,
  Faq,
  FAQBlock,
  FeatureStripBlock,
  Footer,
  FormBlock,
  Gallery as GalleryItem,
  GalleryBlock,
  HeroBlock,
  Location,
  LocationsBlock,
  Media,
  MenuCategory,
  MenuItem,
  MenuShowcaseBlock,
  Nav,
  Page,
  RichTextBlock,
  Seo,
  SiteSetting,
  StatsBlock,
  StepsBlock,
  StoryBlock,
  TeamBlock,
  Teammember,
  Tenant,
  Testimonial,
  TestimonialsBlock,
  User,
} from '../../../payload-types'
import type {
  ZuruZuruBlogPreviewBlockData,
  ZuruZuruCardGridBlockData,
  ZuruZuruCardGridVariant,
  ZuruZuruCareersBlockData,
  ZuruZuruContentGridBlockData,
  ZuruZuruCTABlockData,
  ZuruZuruDishBadge,
  ZuruZuruDishCategoryData,
  ZuruZuruEventsBlockData,
  ZuruZuruFAQBlockData,
  ZuruZuruFeatureStripBlockData,
  ZuruZuruFooterData,
  ZuruZuruFormBlockData,
  ZuruZuruGalleryBlockData,
  ZuruZuruGalleryItemData,
  ZuruZuruHeroBlockData,
  ZuruZuruLinkData,
  ZuruZuruLocationData,
  ZuruZuruLocationsBlockData,
  ZuruZuruMediaData,
  ZuruZuruMenuShowcaseBlockData,
  ZuruZuruNavigationData,
  ZuruZuruPageBlockData,
  ZuruZuruPageMetaData,
  ZuruZuruRichTextBlockData,
  ZuruZuruSectionHeaderData,
  ZuruZuruSEOData,
  ZuruZuruShellData,
  ZuruZuruSiteData,
  ZuruZuruStatsBlockData,
  ZuruZuruStepsBlockData,
  ZuruZuruStoryBlockData,
  ZuruZuruTeamBlockData,
  ZuruZuruTestimonialsBlockData,
} from './dynamicTypes'
import { resolveMediaVariantUrl, type MediaLikeValue, type MediaSizeContext } from '../../../lib/media/resolveMediaVariant'

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

function mapMedia(
  value: number | Media | null | undefined,
  tenantID: number,
  sizeContext?: MediaSizeContext,
): ZuruZuruMediaData {
  if (!isPopulated<Media>(value)) return null
  if (!belongsToTenant(value.tenantId, tenantID)) return null
  const originalSrc = text(value.url)
  if (!originalSrc) return null
  const src = sizeContext
    ? resolveMediaVariantUrl(value as unknown as MediaLikeValue, sizeContext) || originalSrc
    : originalSrc
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
  favicon: null,
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
    favicon: mapMedia(tenant.branding?.favicon, tenantID),
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

const emptySEO: ZuruZuruSEOData = {
  bingSiteVerification: '',
  canonicalUrl: '',
  description: '',
  googleSiteVerification: '',
  jsonLd: null,
  keywords: [],
  ogDescription: '',
  ogImage: null,
  ogSiteName: '',
  ogTitle: '',
  robots: '',
  titlePattern: '',
  twitterCard: 'summary_large_image',
  twitterCreator: '',
  twitterSite: '',
}

/** Malformed or non-object JSON never crashes metadata generation — it just degrades to null, mirroring the Curious Ladoo mapper's identical parse-with-fallback. */
function parseSEOJsonLd(source: string): ZuruZuruSEOData['jsonLd'] {
  if (!source) return null
  try {
    const parsed: unknown = JSON.parse(source)
    if (Array.isArray(parsed)) {
      return parsed.every((entry) => Boolean(entry && typeof entry === 'object' && !Array.isArray(entry)))
        ? parsed as Array<Record<string, unknown>>
        : null
    }
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

/** Tenant-wide SEO fallback (Milestone Z8) — every field here can be overridden per-page by the Page collection's own SEO tab (see buildZuruZuruMetadata.ts). */
export function mapZuruZuruSEO(seo: Seo | null, tenant: Tenant | null): ZuruZuruSEOData {
  if (!tenant) return emptySEO
  const tenantID = tenant.id
  const scoped = seo && belongsToTenant(seo.tenantId, tenantID) ? seo : null
  if (!scoped) return emptySEO
  return {
    bingSiteVerification: text(scoped.bingSiteVerification),
    canonicalUrl: text(scoped.canonicalUrl),
    description: text(scoped.metaDescription),
    googleSiteVerification: text(scoped.googleSiteVerification),
    jsonLd: parseSEOJsonLd(text(scoped.jsonLd)),
    keywords: text(scoped.keywords).split(',').map((keyword) => keyword.trim()).filter(Boolean),
    ogDescription: text(scoped.ogDescription),
    ogImage: mapMedia(scoped.defaultOGImage, tenantID, 'og'),
    ogSiteName: text(scoped.ogSiteName),
    ogTitle: text(scoped.ogTitle),
    robots: text(scoped.robots),
    titlePattern: text(scoped.metaTitlePattern),
    twitterCard: scoped.twitterCard === 'app' || scoped.twitterCard === 'player' || scoped.twitterCard === 'summary'
      ? scoped.twitterCard
      : 'summary_large_image',
    twitterCreator: text(scoped.twitterCreator),
    twitterSite: text(scoped.twitterSite),
  }
}

/** A page's own SEO tab (Milestone Z8) — kept separate from the block-layout mapper above since metadata generation (`generateMetadata`) never needs the page's `layout` blocks at all. */
export function mapZuruZuruPageMeta(page: Page | null, tenantID: number): ZuruZuruPageMetaData | null {
  if (!page) return null
  return {
    canonicalUrl: text(page.canonicalUrl),
    metaDescription: text(page.metaDescription),
    metaImage: mapMedia(page.metaImage, tenantID, 'og'),
    metaTitle: text(page.metaTitle),
    noIndex: page.noIndex === true,
    title: text(page.title),
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
    // Full-bleed CSS background (.zz-page-hero { background-size: cover }, Shared.tsx /
    // CMSInnerPageShared.tsx) — a pre-cropped 16:9 "hero" variant is a safe fit.
    backgroundImage: mapMedia(block.desktopBackgroundImage, tenantID, 'hero'),
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
      image: mapMedia(card.image?.item, tenantID, 'card'),
      link: card.enableLink ? mapZuruZuruLinkField(card.link, tenantID) : null,
      title: text(card.title),
    })),
    columns: Number(block.columns) || 3,
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    variant: cardGridVariant(block.settings?.customClasses),
  }
}

export function mapZuruZuruStory(block: StoryBlock, tenantID: number): ZuruZuruStoryBlockData {
  return {
    accentPhrase: text(block.accentPhrase),
    attribution: text(block.attribution),
    body: text(block.body),
    cta: block.enableCta ? mapZuruZuruLinkField(block.cta, tenantID) : null,
    eyebrow: text(block.eyebrow),
    image: mapMedia(block.media, tenantID, 'card'),
    imageAlt: text(block.mediaAlt),
    imagePosition: text(block.imagePosition),
    layout: text(block.layout) || 'simple',
    quote: text(block.quote),
    title: text(block.title),
  }
}

type ZuruZuruBlockSettings = { backgroundColor?: string | null } | null | undefined

const isDarkBackground = (settings: ZuruZuruBlockSettings): boolean => settings?.backgroundColor === 'dark'

export function mapZuruZuruContentGrid(block: ContentGridBlock): ZuruZuruContentGridBlockData {
  return {
    dark: isDarkBackground(block.settings),
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    items: (block.items ?? []).map((item) => ({
      description: text(item.description),
      icon: text(item.icon),
      title: text(item.title),
    })),
    presentation: text(block.presentation) || 'grid',
  }
}

export function mapZuruZuruSteps(block: StepsBlock): ZuruZuruStepsBlockData {
  return {
    dark: isDarkBackground(block.settings),
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    layoutVariant: text(block.layoutVariant) || 'numbered-steps',
    steps: (block.steps ?? []).map((step) => ({
      description: text(step.description),
      label: text(step.label),
      title: text(step.title),
    })),
  }
}

export function mapZuruZuruStats(block: StatsBlock): ZuruZuruStatsBlockData {
  return {
    dark: isDarkBackground(block.settings),
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    stats: (block.stats ?? []).map((stat) => ({
      label: text(stat.label),
      value: text(stat.value),
    })),
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
      image: mapMedia(item.image, tenantID, 'card'),
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

function mapLocation(location: Location): ZuruZuruLocationData {
  return {
    address: text(location.address),
    city: text(location.city),
    hours: (location.businessHours ?? []).map((row) => ({
      closeTime: text(row.closeTime),
      day: text(row.day),
      isClosed: row.isClosed === true,
      openTime: text(row.openTime),
    })),
    id: location.id,
    mapsEmbedUrl: text(location.mapsEmbedUrl),
    parking: text(location.description),
    phone: text(location.phone),
    title: text(location.title),
  }
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
  const sorted = [...candidates].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const primary = sorted.find((location) => location.isPrimary) ?? sorted[0] ?? null
  return {
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    location: primary ? mapLocation(primary) : null,
    locations: sorted.map(mapLocation),
    showMap: block.showMap !== false,
  }
}

export function mapZuruZuruForm(block: FormBlock): ZuruZuruFormBlockData {
  return {
    errorMessage: text(block.errorMessage),
    formType: text(block.formType) || 'contact',
    headerDescription: text(block.sectionHeader?.description),
    headerTitle: text(block.sectionHeader?.title),
    submitLabel: text(block.submitLabel),
    subjectOptions: (block.subjectOptions ?? []).map((option) => ({
      label: text(option.label),
      value: text(option.value),
    })),
    successMessage: text(block.successMessage),
  }
}

export function mapZuruZuruFAQ(block: FAQBlock, faqs: Faq[], tenantID: number): ZuruZuruFAQBlockData {
  const explicitIds = new Set(
    (block.items ?? []).map((item) => (typeof item === 'number' ? item : item.id)),
  )
  const pool = faqs.filter((faq) => belongsToTenant(faq.tenantId, tenantID) && faq.isActive !== false)
  const selected = explicitIds.size > 0
    ? pool.filter((faq) => explicitIds.has(faq.id))
    : pool.filter((faq) => (block.featuredOnly ? faq.isFeatured === true : true))
  const items = selected
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, block.limit ?? 10)
    .map((faq) => ({
      answer: text(faq.answer),
      id: faq.id,
      question: text(faq.title),
    }))
  return { header: mapZuruZuruSectionHeader(block.sectionHeader), items }
}

export function mapZuruZuruRichText(block: RichTextBlock): ZuruZuruRichTextBlockData {
  return { content: block.content ?? null }
}

export function mapZuruZuruCareers(block: CareersBlock): ZuruZuruCareersBlockData {
  return {
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    positions: (block.positions ?? []).map((position) => ({
      department: text(position.department),
      description: text(position.description),
      location: text(position.location),
      title: text(position.title),
      type: text(position.type),
    })),
  }
}

export function mapZuruZuruTeam(
  block: TeamBlock,
  members: Teammember[],
  tenantID: number,
): ZuruZuruTeamBlockData {
  const explicitIds = new Set(
    (block.members ?? []).map((member) => (typeof member === 'number' ? member : member.id)),
  )
  const pool = members.filter((member) => belongsToTenant(member.tenantId, tenantID) && member.isActive !== false)
  const selected = explicitIds.size > 0 ? pool.filter((member) => explicitIds.has(member.id)) : pool
  const items = selected
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .slice(0, block.limit ?? 8)
    .map((member) => ({
      bio: text(member.bio),
      id: member.id,
      name: text(member.title),
      photo: mapMedia(member.photo, tenantID, 'card'),
      role: text(member.role),
    }))
  return { header: mapZuruZuruSectionHeader(block.sectionHeader), members: items }
}

export function mapZuruZuruCTA(block: CTABlock, tenantID: number): ZuruZuruCTABlockData {
  return {
    header: mapZuruZuruSectionHeader(block.sectionHeader),
    primaryCTA: block.ctaGroup?.enablePrimary ? mapZuruZuruLinkField(block.ctaGroup.primaryCTA, tenantID) : null,
  }
}

export function mapZuruZuruEvents(
  block: EventsBlock,
  events: Event[],
  tenantID: number,
): ZuruZuruEventsBlockData {
  const explicitIds = new Set(
    (block.events ?? []).map((event) => (typeof event === 'number' ? event : event.id)),
  )
  const pool = events.filter((event) => belongsToTenant(event.tenantId, tenantID) && event.status === 'published')
  const selected = explicitIds.size > 0
    ? pool.filter((event) => explicitIds.has(event.id))
    : pool.filter((event) => (block.featuredOnly ? event.isFeatured === true : true))
  const items = selected
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, block.limit ?? 6)
    .map((event) => ({
      bookingUrl: text(event.bookingUrl),
      description: text(event.description),
      id: event.id,
      image: mapMedia(event.image, tenantID, 'card'),
      location: text(event.locationName),
      startsAt: text(event.startsAt),
      summary: text(event.summary),
      title: text(event.title),
    }))
  return { events: items, header: mapZuruZuruSectionHeader(block.sectionHeader) }
}

export function mapZuruZuruBlogPreview(
  block: BlogPreviewBlock,
  posts: BlogPost[],
  tenantID: number,
): ZuruZuruBlogPreviewBlockData {
  const explicitIds = new Set(
    (block.posts ?? []).map((post) => (typeof post === 'number' ? post : post.id)),
  )
  const pool = posts.filter((post) => belongsToTenant(post.tenantId, tenantID) && post._status === 'published')
  const selected = block.source === 'manual'
    ? pool.filter((post) => explicitIds.has(post.id))
    : pool.filter((post) => (block.featuredOnly ? post.isFeatured === true : true))
  const items = selected
    .sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1
      return new Date(b.publishedDate ?? b.createdAt).getTime() - new Date(a.publishedDate ?? a.createdAt).getTime()
    })
    .slice(0, block.limit ?? 3)
    .map((post) => ({
      author: isPopulated<User>(post.author) ? text(post.author.name) : '',
      categories: (post.categories ?? []).map((category) => text(category)).filter(Boolean),
      excerpt: text(post.excerpt),
      id: post.id,
      image: mapMedia(post.heroImage, tenantID),
      isPinned: post.isPinned === true,
      publishedDate: text(post.publishedDate),
      slug: text(post.slug),
      title: text(post.title),
    }))
  return { header: mapZuruZuruSectionHeader(block.sectionHeader), posts: items }
}

/**
 * Reads `galleryBlock` with `category: 'all'` (the default) so every active item is fetched in one
 * request — filtering by category happens client-side in `CMSGalleryPage.tsx`, exactly matching the
 * original static `GalleryLightbox`'s own client-side filter behavior, rather than needing a
 * separate CMS-configured block instance per category. An item whose `media` is missing, inactive,
 * or cross-tenant maps to `image: null` via `mapMedia` and is filtered out here so it can never
 * leak or crash the page.
 */
export function mapZuruZuruGallery(
  block: GalleryBlock,
  galleryItems: GalleryItem[],
  tenantID: number,
): ZuruZuruGalleryBlockData {
  const explicitIds = new Set(
    (block.items ?? []).map((item) => (typeof item === 'number' ? item : item.id)),
  )
  const pool = galleryItems.filter((item) => belongsToTenant(item.tenantId, tenantID))
  const selected = block.source === 'manual'
    ? pool.filter((item) => explicitIds.has(item.id))
    : pool
      .filter((item) => (block.category && block.category !== 'all' ? item.category === block.category : true))
      .filter((item) => (block.featuredOnly ? item.isFeatured === true : true))
  const items: ZuruZuruGalleryItemData[] = []
  for (const item of selected.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).slice(0, block.limit ?? 8)) {
    const image = mapMedia(item.media, tenantID)
    if (image) items.push({ category: text(item.category) || 'food', id: item.id, image })
  }
  return { header: mapZuruZuruSectionHeader(block.sectionHeader), items }
}

/** Generic Page.layout -> block-data mapper, shared by every CMS-driven Zuru Zuru page. Each page's own renderer decides how to visually interpret the same block-data shapes. */
export function mapZuruZuruPageLayout(
  layout: Page['layout'],
  {
    blogPosts,
    events,
    faqs,
    galleryItems,
    locations,
    menuItems,
    teamMembers,
    testimonials,
    tenantID,
  }: {
    blogPosts?: BlogPost[]
    events?: Event[]
    faqs: Faq[]
    galleryItems?: GalleryItem[]
    locations: Location[]
    menuItems: MenuItem[]
    teamMembers?: Teammember[]
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
      case 'stepsBlock':
        blocks.push({ data: mapZuruZuruSteps(block), type: 'steps' })
        break
      case 'statsBlock':
        blocks.push({ data: mapZuruZuruStats(block), type: 'stats' })
        break
      case 'formBlock':
        if (block.enabled !== false) blocks.push({ data: mapZuruZuruForm(block), type: 'form' })
        break
      case 'faqBlock':
        blocks.push({ data: mapZuruZuruFAQ(block, faqs, tenantID), type: 'faq' })
        break
      case 'richtextBlock':
        blocks.push({ data: mapZuruZuruRichText(block), type: 'richText' })
        break
      case 'careersBlock':
        blocks.push({ data: mapZuruZuruCareers(block), type: 'careers' })
        break
      case 'teamBlock':
        blocks.push({ data: mapZuruZuruTeam(block, teamMembers ?? [], tenantID), type: 'team' })
        break
      case 'ctaBlock':
        blocks.push({ data: mapZuruZuruCTA(block, tenantID), type: 'cta' })
        break
      case 'eventsBlock':
        blocks.push({ data: mapZuruZuruEvents(block, events ?? [], tenantID), type: 'events' })
        break
      case 'blogpreviewBlock':
        blocks.push({ data: mapZuruZuruBlogPreview(block, blogPosts ?? [], tenantID), type: 'blogPreview' })
        break
      case 'galleryBlock':
        blocks.push({ data: mapZuruZuruGallery(block, galleryItems ?? [], tenantID), type: 'gallery' })
        break
      default:
        break
    }
  }
  return blocks
}
