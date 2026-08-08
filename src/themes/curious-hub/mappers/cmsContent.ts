import type {
  BlogPost,
  Brand,
  CapabilityBlock,
  CareersBlock,
  CompareBlock,
  ContentGridBlock,
  CTABlock,
  Faq,
  FAQBlock,
  FormBlock,
  Footer,
  HeroBlock,
  Location,
  Media,
  Nav,
  OfficeMapBlock,
  Page,
  PipelineBlock,
  Portfolio,
  Seo,
  SiteSetting,
  StatsBlock,
  StepsBlock,
  StoryBlock,
  Teammember,
  Testimonial,
  TestimonialsBlock,
  Tenant,
  TickerBlock,
  BlogPreviewBlock as BlogPreviewBlockType,
  BrandsShowcaseBlock as BrandsShowcaseBlockType,
  PortfolioShowcaseBlock as PortfolioShowcaseBlockType,
  TeamBlock as TeamBlockType,
} from '../../../payload-types'
import type {
  CuriousLadooBlogPostDetailData,
  CuriousLadooBlogPostPageData,
  CuriousLadooBlogPreviewBlockData,
  CuriousLadooBrandItemData,
  CuriousLadooBrandsShowcaseBlockData,
  CuriousLadooCapabilityBlockData,
  CuriousLadooCareersBlockData,
  CuriousLadooCompareBlockData,
  CuriousLadooComparePanelData,
  CuriousLadooContactInfoData,
  CuriousLadooContentGridBlockData,
  CuriousLadooCTABlockData,
  CuriousLadooFAQBlockData,
  CuriousLadooFooterData,
  CuriousLadooFormBlockData,
  CuriousLadooGridItemData,
  CuriousLadooHeroBlockData,
  CuriousLadooHomeBlockData,
  CuriousLadooHomeContent,
  CuriousLadooJournalItemData,
  CuriousLadooLinkData,
  CuriousLadooMediaData,
  CuriousLadooNavigationData,
  CuriousLadooNewsletterData,
  CuriousLadooOfficeMapBlockData,
  CuriousLadooPipelineBlockData,
  CuriousLadooPortfolioItemData,
  CuriousLadooPortfolioShowcaseBlockData,
  CuriousLadooSectionHeaderData,
  CuriousLadooSEOData,
  CuriousLadooSiteData,
  CuriousLadooStatsBlockData,
  CuriousLadooStepsBlockData,
  CuriousLadooStoryBlockData,
  CuriousLadooTeamBlockData,
  CuriousLadooTestimonialsBlockData,
  CuriousLadooTickerBlockData,
} from './dynamicTypes'

type LinkLike = {
  label?: string
  newTab?: boolean | null
  reference?: number | Page | null
  type?: 'anchor' | 'custom' | 'email' | 'phone' | 'reference' | null
  url?: string | null
} | null | undefined

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

/**
 * Populated relationship required, same-tenant required. Raw (unpopulated) IDs and
 * cross-tenant documents both degrade to null rather than ever rendering — mirrors the
 * Ghee Roast mapper's "checked twice" tenant defense even though the loader already scopes
 * every query by tenantId.
 */
function mapMedia(
  value: number | Media | null | undefined,
  tenantID: number,
): CuriousLadooMediaData {
  if (!isPopulated<Media>(value)) return null
  if (!belongsToTenant(value.tenantId, tenantID)) return null
  const src = text(value.url)
  if (!src) return null
  return {
    alt: text(value.alt) || 'Curious Ladoo',
    focalPoint: value.focalPoint?.x != null && value.focalPoint?.y != null
      ? { x: value.focalPoint.x, y: value.focalPoint.y }
      : undefined,
    id: value.id,
    src,
  }
}

function mapLink(link: LinkLike): CuriousLadooLinkData {
  if (!link) return null
  const label = text(link.label)
  if (!label) return null

  if (link.type === 'reference') {
    const reference = link.reference
    const slug = isPopulated<Page>(reference) ? text(reference.slug) : ''
    return { label, newTab: Boolean(link.newTab), url: slug ? `/${slug}` : '/' }
  }

  const rawUrl = text(link.url)
  if (!rawUrl) return null
  const url = link.type === 'email' && !rawUrl.startsWith('mailto:')
    ? `mailto:${rawUrl}`
    : link.type === 'phone' && !rawUrl.startsWith('tel:')
      ? `tel:${rawUrl}`
      : rawUrl
  return { label, newTab: Boolean(link.newTab), url }
}

function mapSectionHeader(header: {
  description?: string | null
  eyebrow?: string | null
  subtitle?: string | null
  title?: string
} | null | undefined): CuriousLadooSectionHeaderData {
  return {
    description: text(header?.description),
    eyebrow: text(header?.eyebrow),
    subtitle: text(header?.subtitle),
    title: text(header?.title),
  }
}

// ---------------------------------------------------------------------------
// Block mappers
// ---------------------------------------------------------------------------

function mapHeroBlock(block: HeroBlock, tenantID: number): CuriousLadooHeroBlockData {
  return {
    description: text(block.description),
    eyebrow: text(block.eyebrow),
    heading: text(block.heading),
    highlightedHeading: text(block.highlightedHeading),
    image: mapMedia(block.foregroundImage, tenantID),
    primaryCTA: block.primaryCTALabel && block.primaryCTAURL
      ? { label: text(block.primaryCTALabel), newTab: false, url: text(block.primaryCTAURL) }
      : null,
    secondaryCTA: block.secondaryCTALabel && block.secondaryCTAURL
      ? { label: text(block.secondaryCTALabel), newTab: false, url: text(block.secondaryCTAURL) }
      : null,
    type: 'hero',
  }
}

function mapTickerBlock(block: TickerBlock): CuriousLadooTickerBlockData {
  return {
    items: (block.items ?? []).map((item) => ({
      description: text(item.description),
      icon: text(item.icon),
      iconStyle: item.iconStyle ? text(item.iconStyle) : undefined,
      name: text(item.name),
    })),
    type: 'ticker',
  }
}

function mapStoryBlock(block: StoryBlock, tenantID: number): CuriousLadooStoryBlockData {
  const layout = block.layout === 'overlay' ? 'overlay' : block.layout === 'simple' ? 'simple' : 'panel'
  return {
    accentPhrase: text(block.accentPhrase),
    attribution: text(block.attribution),
    body: text(block.body),
    cta: block.enableCta ? mapLink(block.cta) : null,
    eyebrow: text(block.eyebrow),
    image: layout === 'overlay' ? mapMedia(block.overlayMedia, tenantID) : mapMedia(block.media, tenantID),
    imagePosition: block.imagePosition === 'left' ? 'left' : 'right',
    layout,
    quote: text(block.quote),
    secondaryImage: mapMedia(block.secondaryMedia, tenantID),
    statBadge: block.statBadge?.enabled && block.statBadge.value
      ? { label: text(block.statBadge.label), value: text(block.statBadge.value) }
      : null,
    title: text(block.title),
    type: 'story',
  }
}

function mapContentGridBlock(
  block: ContentGridBlock,
  tenantID: number,
): CuriousLadooContentGridBlockData {
  const items: CuriousLadooGridItemData[] = (block.items ?? []).map((item) => ({
    description: text(item.description),
    icon: text(item.icon),
    link: item.enableLink ? mapLink(item.link) : null,
    title: text(item.title),
  }))
  return {
    bgText: text(block.bgText),
    header: mapSectionHeader(block.sectionHeader),
    items,
    media: mapMedia(block.media?.item, tenantID),
    mediaPosition: block.mediaPosition === 'right' ? 'right' : 'left',
    presentation: block.presentation ?? 'grid',
    type: 'contentgrid',
  }
}

function mapCareersBlock(block: CareersBlock): CuriousLadooCareersBlockData {
  return {
    header: mapSectionHeader(block.sectionHeader),
    positions: (block.positions ?? []).map((position) => ({
      department: text(position.department),
      description: text(position.description),
      location: text(position.location),
      title: text(position.title),
      type: text(position.type),
    })),
    type: 'careers',
  }
}

/** Reconstructs the "+91 XXXXX XXXXX" display format from a normalized 10-digit stored number. */
function formatIndianMobileDisplay(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '')
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits
  if (!/^[6-9]\d{9}$/.test(local)) return rawPhone
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`
}

function mapFormBlock(
  block: FormBlock,
  tenantID: number,
  tenant: Tenant | null,
  locations: Location[],
  siteSettings: SiteSetting | null,
): CuriousLadooFormBlockData {
  const contactInfo: CuriousLadooContactInfoData = block.showContactInfoCards
    ? {
        generalEmail: text(tenant?.contact?.contactEmail),
        generalPhone: formatIndianMobileDisplay(text(tenant?.contact?.contactPhone)),
        hours: (siteSettings && belongsToTenant(siteSettings.tenantId, tenantID) ? (siteSettings.hours ?? []) : [])
          .map((row) => ({
            closeTime: text(row.closeTime),
            day: text(row.day),
            isClosed: Boolean(row.isClosed),
            openTime: text(row.openTime),
          })),
        locations: locations
          .filter((location) => belongsToTenant(location.tenantId, tenantID))
          .map((location) => ({
            address: text(location.address),
            city: text(location.city),
            id: location.id,
            name: text(location.title),
          })),
      }
    : null
  return {
    contactInfo,
    errorMessage: text(block.errorMessage),
    header: mapSectionHeader(block.sectionHeader),
    subjectOptions: (block.subjectOptions ?? [])
      .map((option) => ({ label: text(option.label), value: text(option.value) }))
      .filter((option) => option.label && option.value),
    submitLabel: text(block.submitLabel),
    successMessage: text(block.successMessage),
    type: 'form',
  }
}

function mapOfficeMapBlock(block: OfficeMapBlock): CuriousLadooOfficeMapBlockData {
  return {
    header: mapSectionHeader(block.sectionHeader),
    markers: (block.markers ?? []).map((marker) => ({
      label: text(marker.label),
      left: text(marker.left),
      top: text(marker.top),
    })),
    type: 'officemap',
  }
}

function mapBrand(brand: Brand, tenantID: number): CuriousLadooBrandItemData {
  return {
    category: text(brand.category),
    comingSoon: Boolean(brand.comingSoon),
    description: text(brand.shortDescription),
    fullDescription: text(brand.fullDescription),
    href: text(brand.websiteUrl) || '/brands',
    id: brand.id,
    image: mapMedia(brand.image, tenantID),
    links: (brand.links ?? []).map((link) => ({ label: text(link.label), url: text(link.url) })).filter((link) => link.label && link.url),
    mark: text(brand.mark),
    name: text(brand.name),
    quote: text(brand.quote),
    slug: text(brand.slug),
    statLabel: text(brand.statLabel),
    statValue: text(brand.statValue),
  }
}

function mapBrandsShowcaseBlock(
  block: BrandsShowcaseBlockType,
  tenantID: number,
  allBrands: Brand[],
): CuriousLadooBrandsShowcaseBlockData {
  const selected = (block.brands ?? [])
    .map((entry) => (isPopulated<Brand>(entry) ? entry : allBrands.find((brand) => brand.id === entry)))
    .filter((brand): brand is Brand => Boolean(brand))
    .filter((brand) => belongsToTenant(brand.tenantId, tenantID))
  const pool = selected.length > 0 ? selected : allBrands
  const limit = block.limit ?? pool.length
  return {
    brands: pool
      .filter((brand) => brand.enabled !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, limit)
      .map((brand) => mapBrand(brand, tenantID)),
    header: mapSectionHeader(block.sectionHeader),
    presentation: block.presentation === 'spotlight' ? 'spotlight' : 'grid',
    type: 'brandsshowcase',
  }
}

function mapPortfolioItem(item: Portfolio, tenantID: number): CuriousLadooPortfolioItemData {
  return {
    category: text(item.category),
    description: text(item.description),
    id: item.id,
    image: mapMedia(item.coverImage, tenantID),
    link: item.enableCTA ? mapLink(item.cta) : null,
    slug: text(item.slug),
    title: text(item.title),
    year: text(item.year),
  }
}

function mapPortfolioShowcaseBlock(
  block: PortfolioShowcaseBlockType,
  tenantID: number,
  allPortfolioItems: Portfolio[],
): CuriousLadooPortfolioShowcaseBlockData {
  const selected = (block.items ?? [])
    .map((entry) => (isPopulated<Portfolio>(entry) ? entry : allPortfolioItems.find((item) => item.id === entry)))
    .filter((item): item is Portfolio => Boolean(item))
    .filter((item) => belongsToTenant(item.tenantId, tenantID))
  const pool = selected.length > 0 ? selected : allPortfolioItems
  const limit = block.limit ?? pool.length
  return {
    header: mapSectionHeader(block.sectionHeader),
    items: pool
      .filter((item) => item.enabled !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, limit)
      .map((item) => mapPortfolioItem(item, tenantID)),
    type: 'portfolioshowcase',
  }
}

function mapStepsBlock(block: StepsBlock, tenantID: number): CuriousLadooStepsBlockData {
  return {
    header: mapSectionHeader(block.sectionHeader),
    layoutVariant: block.layoutVariant === 'timeline'
      ? 'timeline'
      : block.layoutVariant === 'visual-timeline'
        ? 'visual-timeline'
        : 'numbered-steps',
    steps: (block.steps ?? []).map((step) => ({
      description: text(step.description),
      image: mapMedia(step.media?.item, tenantID),
      label: text(step.label),
      title: text(step.title),
    })),
    type: 'steps',
  }
}

function mapStatsBlock(block: StatsBlock): CuriousLadooStatsBlockData {
  return {
    header: mapSectionHeader(block.sectionHeader),
    stats: (block.stats ?? []).map((stat) => ({
      animatedSuffix: text(stat.animatedSuffix),
      animatedTarget: typeof stat.animatedTarget === 'number' ? stat.animatedTarget : null,
      label: text(stat.label),
      value: text(stat.value),
    })),
    type: 'stats',
  }
}

const initialsFromName = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

function mapTestimonialsBlock(
  block: TestimonialsBlock,
  tenantID: number,
  allTestimonials: Testimonial[],
): CuriousLadooTestimonialsBlockData {
  const manual = block.source === 'manual'
  const source = manual
    ? (block.testimonials ?? [])
        .map((entry) => (isPopulated<Testimonial>(entry) ? entry : allTestimonials.find((t) => t.id === entry)))
        .filter((t): t is Testimonial => Boolean(t))
    : allTestimonials
  const filtered = manual
    ? source
    : source.filter((t) => (block.featuredOnly ? t.isFeatured === true : true))
  const limit = manual ? filtered.length : (block.limit ?? filtered.length)
  return {
    header: mapSectionHeader(block.sectionHeader),
    items: filtered
      .filter((t) => belongsToTenant(t.tenantId, tenantID))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, limit)
      .map((t) => ({
        id: t.id,
        initials: initialsFromName(text(t.customerName)),
        name: text(t.customerName),
        photo: mapMedia(t.photo, tenantID),
        quote: text(t.review),
        role: text(t.customerRole),
      })),
    type: 'testimonials',
  }
}

function mapJournalItem(p: BlogPost, tenantID: number): CuriousLadooJournalItemData {
  return {
    date: p.publishedDate
      ? new Date(p.publishedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : '',
    excerpt: text(p.excerpt),
    id: p.id,
    image: mapMedia(p.heroImage, tenantID),
    readMinutes: typeof p.readingTimeMinutes === 'number' ? p.readingTimeMinutes : 0,
    slug: text(p.slug),
    tag: (p.categories ?? [])[0] ?? '',
    title: text(p.title),
  }
}

function mapBlogPreviewBlock(
  block: BlogPreviewBlockType,
  tenantID: number,
  allPosts: BlogPost[],
): CuriousLadooBlogPreviewBlockData {
  const manual = block.source === 'manual'
  const source = manual
    ? (block.posts ?? [])
        .map((entry) => (isPopulated<BlogPost>(entry) ? entry : allPosts.find((p) => p.id === entry)))
        .filter((p): p is BlogPost => Boolean(p))
    : allPosts
  const filtered = manual
    ? source
    : source.filter((p) => (block.featuredOnly ? p.isFeatured === true : true))
  const visible = filtered.filter((p) => belongsToTenant(p.tenantId, tenantID) && p.status === 'published')
  const header = mapSectionHeader(block.sectionHeader)

  if (block.presentation === 'index') {
    // No `limit` applied — the index page shows every visible post; the original design has no
    // pagination to preserve. The pinned post (or the first post, if none is pinned) is pulled out
    // as the featured banner; every other visible post fills the grid.
    const pinned = visible.find((p) => p.isPinned === true)
    const featuredPost = pinned ?? visible[0]
    const rest = featuredPost ? visible.filter((p) => p.id !== featuredPost.id) : []
    return {
      featured: featuredPost ? mapJournalItem(featuredPost, tenantID) : null,
      header,
      items: rest.map((p) => mapJournalItem(p, tenantID)),
      presentation: 'index',
      type: 'blogpreview',
    }
  }

  const limit = manual ? visible.length : (block.limit ?? visible.length)
  return {
    featured: null,
    header,
    items: visible.slice(0, limit).map((p) => mapJournalItem(p, tenantID)),
    presentation: 'preview',
    type: 'blogpreview',
  }
}

function mapTeamBlock(
  block: TeamBlockType,
  tenantID: number,
  allMembers: Teammember[],
): CuriousLadooTeamBlockData {
  const selected = (block.members ?? [])
    .map((entry) => (isPopulated<Teammember>(entry) ? entry : allMembers.find((m) => m.id === entry)))
    .filter((m): m is Teammember => Boolean(m))
  const pool = selected.length > 0 ? selected : allMembers
  const limit = block.limit ?? pool.length
  return {
    header: mapSectionHeader(block.sectionHeader),
    members: pool
      .filter((m) => belongsToTenant(m.tenantId, tenantID) && m.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, limit)
      .map((m) => ({
        bio: text(m.bio),
        id: m.id,
        name: text(m.title),
        photo: mapMedia(m.photo, tenantID),
        role: text(m.role),
      })),
    type: 'team',
  }
}

function mapCapabilityBlock(
  block: CapabilityBlock,
  tenantID: number,
): CuriousLadooCapabilityBlockData {
  return {
    header: mapSectionHeader(block.sectionHeader),
    items: (block.items ?? []).map((item) => ({
      anchorId: text(item.anchorId),
      description: text(item.description),
      features: (item.features ?? []).map((feature) => text(feature.text)).filter(Boolean),
      image: mapMedia(item.media?.item, tenantID),
      link: item.enableLink ? mapLink(item.link) : null,
      number: text(item.number),
      reverse: Boolean(item.reverse),
      title: text(item.title),
    })),
    type: 'capability',
  }
}

function mapFAQBlock(
  block: FAQBlock,
  tenantID: number,
  allFAQs: Faq[],
): CuriousLadooFAQBlockData {
  const selected = (block.items ?? [])
    .map((entry) => (isPopulated<Faq>(entry) ? entry : allFAQs.find((faq) => faq.id === entry)))
    .filter((faq): faq is Faq => Boolean(faq))
  // featuredOnly only narrows the auto-pulled pool — an explicit Items selection always renders
  // exactly what was chosen, matching the manual-selection contract established for every other
  // source-vs-explicit-selection block (Testimonials, BlogPreview).
  const pool = selected.length > 0
    ? selected
    : block.featuredOnly
      ? allFAQs.filter((faq) => faq.isFeatured === true)
      : allFAQs
  const limit = block.limit ?? pool.length
  return {
    header: mapSectionHeader(block.sectionHeader),
    items: pool
      .filter((faq) => belongsToTenant(faq.tenantId, tenantID) && faq.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, limit)
      .map((faq) => ({
        answer: text(faq.answer),
        category: text(faq.category),
        id: faq.id,
        question: text(faq.title),
      })),
    presentation: block.presentation === 'plusminus' ? 'plusminus' : 'tabs',
    type: 'faq',
  }
}

function mapPipelineBlock(block: PipelineBlock): CuriousLadooPipelineBlockData {
  return {
    header: mapSectionHeader(block.sectionHeader),
    items: (block.items ?? []).map((item) => ({
      description: text(item.description),
      label: text(item.label),
    })),
    link: block.enableLink ? mapLink(block.link) : null,
    spotlight: block.spotlight?.enabled
      ? {
          description: text(block.spotlight.description),
          icon: text(block.spotlight.icon),
          title: text(block.spotlight.title),
          value: text(block.spotlight.value),
        }
      : null,
    spotlightPosition: block.spotlightPosition === 'left' ? 'left' : 'right',
    type: 'pipeline',
  }
}

function mapComparePanel(
  panel: CompareBlock['before'] | CompareBlock['after'],
  tenantID: number,
): CuriousLadooComparePanelData {
  return {
    badgeLabel: text(panel?.badgeLabel),
    image: mapMedia(panel?.media?.item, tenantID),
    placeholderText: text(panel?.placeholderText),
  }
}

function mapCompareBlock(block: CompareBlock, tenantID: number): CuriousLadooCompareBlockData {
  return {
    after: mapComparePanel(block.after, tenantID),
    before: mapComparePanel(block.before, tenantID),
    header: mapSectionHeader(block.sectionHeader),
    type: 'compare',
  }
}

function mapCTABlock(block: CTABlock): CuriousLadooCTABlockData {
  return {
    bgText: text(block.bgText),
    header: mapSectionHeader(block.sectionHeader),
    primaryCTA: block.ctaGroup?.enablePrimary ? mapLink(block.ctaGroup.primaryCTA) : null,
    secondaryCTA: block.ctaGroup?.enableSecondary ? mapLink(block.ctaGroup.secondaryCTA) : null,
    type: 'cta',
  }
}

// ---------------------------------------------------------------------------
// Page-level mapper
// ---------------------------------------------------------------------------

export function mapCuriousLadooLayout(
  layout: Page['layout'],
  tenantID: number,
  collections: {
    blogPosts: BlogPost[]
    brands: Brand[]
    faqs: Faq[]
    locations?: Location[]
    portfolio: Portfolio[]
    teamMembers: Teammember[]
    testimonials: Testimonial[]
  },
  tenant?: Tenant | null,
  siteSettings?: SiteSetting | null,
): CuriousLadooHomeBlockData[] {
  const blocks: CuriousLadooHomeBlockData[] = []
  for (const block of layout ?? []) {
    switch (block.blockType) {
      case 'heroBlock':
        if (block.enabled !== false) blocks.push(mapHeroBlock(block, tenantID))
        break
      case 'tickerBlock':
        blocks.push(mapTickerBlock(block))
        break
      case 'storyBlock':
        blocks.push(mapStoryBlock(block, tenantID))
        break
      case 'contentgridBlock':
        blocks.push(mapContentGridBlock(block, tenantID))
        break
      case 'brandsshowcaseBlock':
        blocks.push(mapBrandsShowcaseBlock(block, tenantID, collections.brands))
        break
      case 'stepsBlock':
        blocks.push(mapStepsBlock(block, tenantID))
        break
      case 'statsBlock':
        blocks.push(mapStatsBlock(block))
        break
      case 'testimonialsBlock':
        blocks.push(mapTestimonialsBlock(block, tenantID, collections.testimonials))
        break
      case 'blogpreviewBlock':
        blocks.push(mapBlogPreviewBlock(block, tenantID, collections.blogPosts))
        break
      case 'teamBlock':
        blocks.push(mapTeamBlock(block, tenantID, collections.teamMembers))
        break
      case 'ctaBlock':
        blocks.push(mapCTABlock(block))
        break
      case 'capabilityBlock':
        blocks.push(mapCapabilityBlock(block, tenantID))
        break
      case 'faqBlock':
        blocks.push(mapFAQBlock(block, tenantID, collections.faqs))
        break
      case 'pipelineBlock':
        blocks.push(mapPipelineBlock(block))
        break
      case 'portfolioshowcaseBlock':
        blocks.push(mapPortfolioShowcaseBlock(block, tenantID, collections.portfolio))
        break
      case 'compareBlock':
        blocks.push(mapCompareBlock(block, tenantID))
        break
      case 'careersBlock':
        blocks.push(mapCareersBlock(block))
        break
      case 'formBlock':
        if (block.enabled !== false) {
          blocks.push(mapFormBlock(block, tenantID, tenant ?? null, collections.locations ?? [], siteSettings ?? null))
        }
        break
      case 'officeMapBlock':
        blocks.push(mapOfficeMapBlock(block))
        break
      default:
        // Any other block type in the shared catalog has no Curious Ladoo renderer yet;
        // omit rather than guess at a generic rendering.
        break
    }
  }
  return blocks
}

export function mapCuriousLadooNavigation(nav: Nav | null, tenantID: number): CuriousLadooNavigationData {
  const empty: CuriousLadooNavigationData = { brandName: '', cta: null, links: [] }
  if (!nav || !belongsToTenant(nav.tenantId, tenantID)) return empty
  return {
    brandName: text(nav.brandName),
    cta: nav.cta?.enabled && nav.cta.label && nav.cta.url
      ? { label: text(nav.cta.label), newTab: false, url: text(nav.cta.url) }
      : null,
    links: (nav.links ?? [])
      .filter((entry): entry is Extract<NonNullable<Nav['links']>[number], { blockType: 'link' }> =>
        entry.blockType === 'link' && entry.enabled !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((entry) => ({
        enabled: entry.enabled !== false,
        label: text(entry.label),
        url: entry.type === 'page'
          ? (isPopulated<Page>(entry.page) ? `/${text(entry.page.slug)}` : '/')
          : text(entry.url),
      }))
      .filter((link) => link.label && link.url),
  }
}

export function mapCuriousLadooFooter(footer: Footer | null, tenantID: number): CuriousLadooFooterData {
  const empty: CuriousLadooFooterData = { columns: [], copyright: '' }
  if (!footer || !belongsToTenant(footer.tenantId, tenantID)) return empty
  return {
    columns: (footer.columns ?? []).map((column) => ({
      links: (column.links ?? []).map((link) => ({ label: text(link.label), url: text(link.url) })),
      title: text(column.title),
    })),
    copyright: text(footer.copyright).replace('{year}', String(new Date().getFullYear())),
  }
}

const emptyNewsletter: CuriousLadooNewsletterData = {
  buttonLabel: '',
  description: '',
  enabled: false,
  errorMessage: '',
  placeholder: '',
  successMessage: '',
  title: '',
}

export function mapCuriousLadooSite(
  tenant: Tenant | null,
  siteSettings: SiteSetting | null,
): CuriousLadooSiteData {
  const empty: CuriousLadooSiteData = { address: '', description: '', email: '', favicon: null, name: '', newsletter: emptyNewsletter, social: [], tagline: '' }
  if (!tenant) return empty
  const tenantID = tenant.id
  const settings = siteSettings && belongsToTenant(siteSettings.tenantId, tenantID) ? siteSettings : null
  return {
    address: text(settings?.contactAddress),
    description: text(settings?.siteDescription),
    email: text(tenant.contact?.contactEmail),
    favicon: mapMedia(tenant.branding?.favicon, tenantID),
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

const emptySEO: CuriousLadooSEOData = {
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
  title: '',
  twitterCard: 'summary_large_image',
  twitterCreator: '',
  twitterSite: '',
}

/** Mirrors the Ghee Roast mapper's parse-with-fallback exactly: malformed or non-object JSON never crashes metadata generation, it just degrades to null. */
function parseSEOJsonLd(source: string): CuriousLadooSEOData['jsonLd'] {
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

export function mapCuriousLadooSEO(seo: Seo | null, tenant: Tenant | null): CuriousLadooSEOData {
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
    ogImage: mapMedia(scoped.defaultOGImage, tenantID),
    ogSiteName: text(scoped.ogSiteName),
    ogTitle: text(scoped.ogTitle),
    robots: text(scoped.robots),
    title: text(scoped.metaTitlePattern),
    twitterCard: scoped.twitterCard === 'app' || scoped.twitterCard === 'player' || scoped.twitterCard === 'summary'
      ? scoped.twitterCard
      : 'summary_large_image',
    twitterCreator: text(scoped.twitterCreator),
    twitterSite: text(scoped.twitterSite),
  }
}

export function mapCuriousLadooHomeContent({
  blogPosts,
  brands,
  faqs,
  footer,
  locations,
  nav,
  page,
  portfolio,
  seo,
  siteSettings,
  teamMembers,
  tenant,
  testimonials,
}: {
  blogPosts: BlogPost[]
  brands: Brand[]
  faqs: Faq[]
  footer: Footer | null
  locations: Location[]
  nav: Nav | null
  page: Page | null
  portfolio: Portfolio[]
  seo: Seo | null
  siteSettings: SiteSetting | null
  teamMembers: Teammember[]
  tenant: Tenant | null
  testimonials: Testimonial[]
}): CuriousLadooHomeContent {
  const tenantID = tenant?.id ?? 0
  return {
    footer: mapCuriousLadooFooter(footer, tenantID),
    layout: tenant && page
      ? mapCuriousLadooLayout(page.layout, tenantID, { blogPosts, brands, faqs, locations, portfolio, teamMembers, testimonials }, tenant, siteSettings)
      : [],
    navigation: mapCuriousLadooNavigation(nav, tenantID),
    page: page
      ? {
          canonicalUrl: text(page.canonicalUrl),
          id: page.id,
          metaDescription: text(page.metaDescription),
          metaImage: mapMedia(page.metaImage, tenantID),
          metaTitle: text(page.metaTitle),
          noIndex: page.noIndex === true,
          pageType: text(page.pageType) || 'generic',
          title: text(page.title),
        }
      : null,
    seo: mapCuriousLadooSEO(seo, tenant),
    site: mapCuriousLadooSite(tenant, siteSettings),
  }
}

// ---------------------------------------------------------------------------
// Blog post detail page-level mapper
// ---------------------------------------------------------------------------

export function mapCuriousLadooBlogPost({
  footer,
  nav,
  post,
  relatedPosts,
  seo,
  siteSettings,
  tenant,
}: {
  footer: Footer | null
  nav: Nav | null
  post: BlogPost | null
  relatedPosts: BlogPost[]
  seo: Seo | null
  siteSettings: SiteSetting | null
  tenant: Tenant | null
}): CuriousLadooBlogPostPageData {
  const tenantID = tenant?.id ?? 0
  const mappedPost: CuriousLadooBlogPostDetailData | null = post
    ? {
        authorName: isPopulated<{ id: number; name?: string | null }>(post.author) ? text(post.author.name) : '',
        categories: (post.categories ?? []).filter((category): category is string => Boolean(category)),
        content: post.content,
        coverImage: mapMedia(post.heroImage, tenantID),
        date: post.publishedDate
          ? new Date(post.publishedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
          : '',
        excerpt: text(post.excerpt),
        id: post.id,
        metaDescription: text(post.metaDescription) || text(post.excerpt),
        metaImage: mapMedia(post.metaImage, tenantID) ?? mapMedia(post.heroImage, tenantID),
        metaTitle: text(post.metaTitle) || text(post.title),
        modifiedDate: text(post.updatedAt),
        publishedDateISO: text(post.publishedDate),
        readMinutes: typeof post.readingTimeMinutes === 'number' ? post.readingTimeMinutes : 0,
        relatedPosts: relatedPosts.map((related) => mapJournalItem(related, tenantID)),
        showTableOfContents: post.showTableOfContents === true,
        slug: text(post.slug),
        tags: (post.tags ?? []).filter((tag): tag is string => Boolean(tag)),
        title: text(post.title),
      }
    : null

  return {
    footer: mapCuriousLadooFooter(footer, tenantID),
    navigation: mapCuriousLadooNavigation(nav, tenantID),
    post: mappedPost,
    seo: mapCuriousLadooSEO(seo, tenant),
    site: mapCuriousLadooSite(tenant, siteSettings),
  }
}
