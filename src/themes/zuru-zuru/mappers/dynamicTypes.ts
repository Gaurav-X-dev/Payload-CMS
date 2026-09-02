export type ZuruZuruMediaData = {
  alt: string
  id: number
  src: string
} | null

export type ZuruZuruNavChildData = {
  label: string
  url: string
}

export type ZuruZuruNavLinkData = {
  children: ZuruZuruNavChildData[]
  label: string
  url: string
}

export type ZuruZuruCTAData = {
  label: string
  url: string
} | null

export type ZuruZuruNavigationData = {
  brandName: string
  cta: ZuruZuruCTAData
  links: ZuruZuruNavLinkData[]
  logo: ZuruZuruMediaData
}

export type ZuruZuruFooterLinkData = {
  label: string
  url: string
}

export type ZuruZuruFooterColumnData = {
  links: ZuruZuruFooterLinkData[]
  title: string
}

export type ZuruZuruFooterData = {
  bottomLinks: ZuruZuruFooterLinkData[]
  columns: ZuruZuruFooterColumnData[]
  copyright: string
}

export type ZuruZuruSocialLinkData = {
  href: string
  icon: string
  label: string
}

export type ZuruZuruNewsletterData = {
  buttonLabel: string
  description: string
  enabled: boolean
  errorMessage: string
  placeholder: string
  successMessage: string
  title: string
}

export type ZuruZuruHoursRowData = {
  closeTime: string
  day: string
  isClosed: boolean
  openTime: string
}

export type ZuruZuruAnnouncementData = {
  enabled: boolean
  text: string
}

export type ZuruZuruSiteData = {
  address: string
  announcement: ZuruZuruAnnouncementData
  description: string
  email: string
  favicon: ZuruZuruMediaData
  hours: ZuruZuruHoursRowData[]
  logo: ZuruZuruMediaData
  name: string
  newsletter: ZuruZuruNewsletterData
  phone: string
  social: ZuruZuruSocialLinkData[]
  tagline: string
}

export type ZuruZuruShellData = {
  footer: ZuruZuruFooterData
  navigation: ZuruZuruNavigationData
  site: ZuruZuruSiteData
}

/** A single page's own SEO overrides (Milestone Z8) — falls back to the tenant-wide `ZuruZuruSEOData` for whatever isn't set here. */
export type ZuruZuruPageMetaData = {
  canonicalUrl: string
  metaDescription: string
  metaImage: ZuruZuruMediaData
  metaTitle: string
  noIndex: boolean
  title: string
}

/** Tenant-wide SEO fallback, mapped from the shared `seo` collection (Milestone Z8) — the same admin-authored-JSON-LD architecture Curious Ladoo and Ghee Roast already use. */
export type ZuruZuruSEOData = {
  bingSiteVerification: string
  canonicalUrl: string
  description: string
  googleSiteVerification: string
  jsonLd: Array<Record<string, unknown>> | Record<string, unknown> | null
  keywords: string[]
  ogDescription: string
  ogImage: ZuruZuruMediaData
  ogSiteName: string
  ogTitle: string
  robots: string
  titlePattern: string
  twitterCard: 'app' | 'player' | 'summary' | 'summary_large_image'
  twitterCreator: string
  twitterSite: string
}

// ---------------------------------------------------------------------------
// Home page — layout blocks
// ---------------------------------------------------------------------------

export type ZuruZuruLinkData = { label: string; url: string } | null

export type ZuruZuruSectionHeaderData = {
  description: string
  eyebrow: string
  japanese: string
  title: string
}

export type ZuruZuruHeroBlockData = {
  backgroundImage: ZuruZuruMediaData
  description: string
  eyebrow: string
  heading: string
  highlightedHeading: string
  image: ZuruZuruMediaData
  imageAlt: string
  primaryCTA: ZuruZuruLinkData
  secondaryCTA: ZuruZuruLinkData
  stampText: string
}

export type ZuruZuruIconTextItemData = {
  description: string
  icon: string
  title: string
}

export type ZuruZuruFeatureStripBlockData = {
  items: ZuruZuruIconTextItemData[]
}

export type ZuruZuruCardItemData = {
  description: string
  enableLink: boolean
  image: ZuruZuruMediaData
  link: ZuruZuruLinkData
  title: string
}

/** Distinguishes the 3 visual treatments Zuru Zuru's cardgridBlock instances need on Home (sourced from settings.customClasses — see mapper). */
export type ZuruZuruCardGridVariant = 'cuisine' | 'dining' | 'seasons'

export type ZuruZuruCardGridBlockData = {
  cards: ZuruZuruCardItemData[]
  columns: number
  header: ZuruZuruSectionHeaderData
  variant: ZuruZuruCardGridVariant
}

export type ZuruZuruStoryBlockData = {
  accentPhrase: string
  attribution: string
  body: string
  cta: ZuruZuruLinkData
  eyebrow: string
  image: ZuruZuruMediaData
  imageAlt: string
  imagePosition: string
  layout: string
  quote: string
  title: string
}

export type ZuruZuruContentGridBlockData = {
  dark: boolean
  header: ZuruZuruSectionHeaderData
  items: ZuruZuruIconTextItemData[]
  presentation: string
}

export type ZuruZuruStepItemData = {
  description: string
  label: string
  title: string
}

export type ZuruZuruStepsBlockData = {
  dark: boolean
  header: ZuruZuruSectionHeaderData
  layoutVariant: string
  steps: ZuruZuruStepItemData[]
}

export type ZuruZuruStatItemData = {
  label: string
  value: string
}

export type ZuruZuruStatsBlockData = {
  dark: boolean
  header: ZuruZuruSectionHeaderData
  stats: ZuruZuruStatItemData[]
}

export type ZuruZuruDishBadge = 'chef' | 'new' | 'popular'

export type ZuruZuruDishCategoryData = {
  slug: string
  title: string
} | null

export type ZuruZuruDishLocationPriceData = {
  locationID: string
  price: number
}

export type ZuruZuruDishData = {
  badge: ZuruZuruDishBadge | null
  calories: number | null
  category: ZuruZuruDishCategoryData
  description: string
  heat: number
  id: number
  image: ZuruZuruMediaData
  /** Outlets that serve this dish. Empty means every location. */
  locationIDs: string[]
  /** Per-location price overrides. Falls back to `price` when a location has no row here. */
  locationPricing: ZuruZuruDishLocationPriceData[]
  name: string
  price: number
}

export type ZuruZuruMenuShowcaseBlockData = {
  cta: ZuruZuruLinkData
  header: ZuruZuruSectionHeaderData
  items: ZuruZuruDishData[]
}

export type ZuruZuruTestimonialItemData = {
  id: number
  name: string
  photo: ZuruZuruMediaData
  rating: number
  review: string
  role: string
}

export type ZuruZuruTestimonialsBlockData = {
  header: ZuruZuruSectionHeaderData
  items: ZuruZuruTestimonialItemData[]
}

export type ZuruZuruLocationData = {
  address: string
  city: string
  hours: ZuruZuruHoursRowData[]
  id: number
  mapsEmbedUrl: string
  parking: string
  phone: string
  title: string
}

export type ZuruZuruLocationsBlockData = {
  header: ZuruZuruSectionHeaderData
  /** All matched, active locations — used by the Locations page's own grid listing. */
  locations: ZuruZuruLocationData[]
  /** The single primary (or first) location — used by Home's Visit Us and the Contact page's map/info card. */
  location: ZuruZuruLocationData | null
  showMap: boolean
}

export type ZuruZuruFormSubjectOptionData = {
  label: string
  value: string
}

export type ZuruZuruFormBlockData = {
  errorMessage: string
  formType: string
  headerDescription: string
  headerTitle: string
  submitLabel: string
  subjectOptions: ZuruZuruFormSubjectOptionData[]
  successMessage: string
}

export type ZuruZuruFAQItemData = {
  answer: string
  id: number
  question: string
}

export type ZuruZuruFAQBlockData = {
  header: ZuruZuruSectionHeaderData
  items: ZuruZuruFAQItemData[]
}

/** Lexical JSON document, as produced by `@payloadcms/richtext-lexical` and rendered via its own `<RichText>` React component — never hand-parsed. */
export type ZuruZuruRichTextValue = object | null

export type ZuruZuruRichTextBlockData = {
  content: ZuruZuruRichTextValue
}

export type ZuruZuruCareerPositionData = {
  department: string
  description: string
  location: string
  title: string
  type: string
}

export type ZuruZuruCareersBlockData = {
  header: ZuruZuruSectionHeaderData
  positions: ZuruZuruCareerPositionData[]
}

export type ZuruZuruTeamMemberData = {
  bio: string
  id: number
  name: string
  photo: ZuruZuruMediaData
  role: string
}

export type ZuruZuruTeamBlockData = {
  header: ZuruZuruSectionHeaderData
  members: ZuruZuruTeamMemberData[]
}

export type ZuruZuruCTABlockData = {
  header: ZuruZuruSectionHeaderData
  primaryCTA: ZuruZuruLinkData
}

export type ZuruZuruEventItemData = {
  bookingUrl: string
  description: string
  id: number
  image: ZuruZuruMediaData
  location: string
  startsAt: string
  summary: string
  title: string
}

export type ZuruZuruEventsBlockData = {
  events: ZuruZuruEventItemData[]
  header: ZuruZuruSectionHeaderData
}

export type ZuruZuruBlogPostItemData = {
  author: string
  categories: string[]
  excerpt: string
  id: number
  image: ZuruZuruMediaData
  isPinned: boolean
  publishedDate: string
  slug: string
  title: string
}

export type ZuruZuruBlogPreviewBlockData = {
  header: ZuruZuruSectionHeaderData
  posts: ZuruZuruBlogPostItemData[]
}

/** `image` is guaranteed non-null: the mapper filters out any item whose media is missing, inactive, or cross-tenant before this shape is ever produced. */
export type ZuruZuruGalleryItemData = {
  category: string
  id: number
  image: { alt: string; id: number; src: string }
}

export type ZuruZuruGalleryBlockData = {
  header: ZuruZuruSectionHeaderData
  items: ZuruZuruGalleryItemData[]
}

/** Generic per-block-type mapping output, shared by every CMS-driven Zuru Zuru page (Home, Menu, ...). Each page has its own renderer that interprets these the same underlying data differently. */
export type ZuruZuruPageBlockData =
  | { data: ZuruZuruHeroBlockData; type: 'hero' }
  | { data: ZuruZuruFeatureStripBlockData; type: 'featureStrip' }
  | { data: ZuruZuruCardGridBlockData; type: 'cardGrid' }
  | { data: ZuruZuruStoryBlockData; type: 'story' }
  | { data: ZuruZuruMenuShowcaseBlockData; type: 'menuShowcase' }
  | { data: ZuruZuruContentGridBlockData; type: 'contentGrid' }
  | { data: ZuruZuruTestimonialsBlockData; type: 'testimonials' }
  | { data: ZuruZuruLocationsBlockData; type: 'locations' }
  | { data: ZuruZuruStepsBlockData; type: 'steps' }
  | { data: ZuruZuruStatsBlockData; type: 'stats' }
  | { data: ZuruZuruFormBlockData; type: 'form' }
  | { data: ZuruZuruFAQBlockData; type: 'faq' }
  | { data: ZuruZuruRichTextBlockData; type: 'richText' }
  | { data: ZuruZuruCareersBlockData; type: 'careers' }
  | { data: ZuruZuruTeamBlockData; type: 'team' }
  | { data: ZuruZuruCTABlockData; type: 'cta' }
  | { data: ZuruZuruEventsBlockData; type: 'events' }
  | { data: ZuruZuruBlogPreviewBlockData; type: 'blogPreview' }
  | { data: ZuruZuruGalleryBlockData; type: 'gallery' }

export type ZuruZuruPageBlocksContent = {
  blocks: ZuruZuruPageBlockData[]
  shell: ZuruZuruShellData
}
