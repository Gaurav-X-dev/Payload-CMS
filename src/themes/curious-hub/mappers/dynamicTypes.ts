/** Curious Ladoo CMS view-model types — the shape the Home renderer actually consumes. */

export type CuriousLadooMediaData = {
  alt: string
  focalPoint?: { x: number; y: number }
  id: number
  src: string
} | null

export type CuriousLadooLinkData = {
  label: string
  newTab: boolean
  url: string
} | null

export type CuriousLadooHeroBlockData = {
  description: string
  eyebrow: string
  heading: string
  highlightedHeading: string
  image: CuriousLadooMediaData
  primaryCTA: CuriousLadooLinkData
  secondaryCTA: CuriousLadooLinkData
  type: 'hero'
}

export type CuriousLadooTickerItemData = {
  description: string
  icon: string
  iconStyle?: string
  name: string
}

export type CuriousLadooTickerBlockData = {
  items: CuriousLadooTickerItemData[]
  type: 'ticker'
}

export type CuriousLadooStoryBlockData = {
  accentPhrase: string
  attribution: string
  body: string
  cta: CuriousLadooLinkData
  eyebrow: string
  image: CuriousLadooMediaData
  imagePosition: 'left' | 'right'
  layout: 'overlay' | 'panel' | 'simple'
  quote: string
  secondaryImage: CuriousLadooMediaData
  statBadge: { label: string; value: string } | null
  title: string
  type: 'story'
}

export type CuriousLadooGridItemData = {
  description: string
  icon: string
  link: CuriousLadooLinkData
  title: string
}

export type CuriousLadooSectionHeaderData = {
  description: string
  eyebrow: string
  subtitle: string
  title: string
}

export type CuriousLadooContentGridBlockData = {
  header: CuriousLadooSectionHeaderData
  items: CuriousLadooGridItemData[]
  media: CuriousLadooMediaData
  mediaPosition: 'left' | 'right'
  presentation: 'b2b' | 'benefits' | 'edge' | 'grid' | 'industries' | 'mission-vision' | 'partners' | 'pillars' | 'services' | 'values'
  type: 'contentgrid'
}

export type CuriousLadooBrandItemData = {
  category: string
  comingSoon: boolean
  description: string
  fullDescription: string
  href: string
  id: number
  image: CuriousLadooMediaData
  links: { label: string; url: string }[]
  mark: string
  name: string
  quote: string
  slug: string
  statLabel: string
  statValue: string
}

export type CuriousLadooBrandsShowcaseBlockData = {
  brands: CuriousLadooBrandItemData[]
  header: CuriousLadooSectionHeaderData
  presentation: 'grid' | 'spotlight'
  type: 'brandsshowcase'
}

export type CuriousLadooStepData = {
  description: string
  label: string
  title: string
}

export type CuriousLadooStepsBlockData = {
  header: CuriousLadooSectionHeaderData
  layoutVariant: 'numbered-steps' | 'timeline'
  steps: CuriousLadooStepData[]
  type: 'steps'
}

export type CuriousLadooStatItemData = {
  animatedSuffix: string
  animatedTarget: number | null
  label: string
  value: string
}

export type CuriousLadooStatsBlockData = {
  header: CuriousLadooSectionHeaderData
  stats: CuriousLadooStatItemData[]
  type: 'stats'
}

export type CuriousLadooTestimonialItemData = {
  id: number
  initials: string
  name: string
  photo: CuriousLadooMediaData
  quote: string
  role: string
}

export type CuriousLadooTestimonialsBlockData = {
  header: CuriousLadooSectionHeaderData
  items: CuriousLadooTestimonialItemData[]
  type: 'testimonials'
}

export type CuriousLadooJournalItemData = {
  date: string
  excerpt: string
  id: number
  image: CuriousLadooMediaData
  slug: string
  tag: string
  title: string
}

export type CuriousLadooBlogPreviewBlockData = {
  header: CuriousLadooSectionHeaderData
  items: CuriousLadooJournalItemData[]
  type: 'blogpreview'
}

export type CuriousLadooTeamMemberData = {
  bio: string
  id: number
  name: string
  photo: CuriousLadooMediaData
  role: string
}

export type CuriousLadooTeamBlockData = {
  header: CuriousLadooSectionHeaderData
  members: CuriousLadooTeamMemberData[]
  type: 'team'
}

export type CuriousLadooCTABlockData = {
  header: CuriousLadooSectionHeaderData
  primaryCTA: CuriousLadooLinkData
  secondaryCTA: CuriousLadooLinkData
  type: 'cta'
}

export type CuriousLadooCapabilityItemData = {
  anchorId: string
  description: string
  features: string[]
  image: CuriousLadooMediaData
  link: CuriousLadooLinkData
  number: string
  reverse: boolean
  title: string
}

export type CuriousLadooCapabilityBlockData = {
  header: CuriousLadooSectionHeaderData
  items: CuriousLadooCapabilityItemData[]
  type: 'capability'
}

export type CuriousLadooFAQItemData = {
  answer: string
  category: string
  id: number
  question: string
}

export type CuriousLadooFAQBlockData = {
  header: CuriousLadooSectionHeaderData
  items: CuriousLadooFAQItemData[]
  type: 'faq'
}

export type CuriousLadooPipelineItemData = {
  description: string
  label: string
}

export type CuriousLadooPipelineSpotlightData = {
  description: string
  icon: string
  title: string
} | null

export type CuriousLadooPipelineBlockData = {
  header: CuriousLadooSectionHeaderData
  items: CuriousLadooPipelineItemData[]
  link: CuriousLadooLinkData
  spotlight: CuriousLadooPipelineSpotlightData
  spotlightPosition: 'left' | 'right'
  type: 'pipeline'
}

export type CuriousLadooPortfolioItemData = {
  category: string
  description: string
  id: number
  image: CuriousLadooMediaData
  link: CuriousLadooLinkData
  slug: string
  title: string
  year: string
}

export type CuriousLadooPortfolioShowcaseBlockData = {
  header: CuriousLadooSectionHeaderData
  items: CuriousLadooPortfolioItemData[]
  type: 'portfolioshowcase'
}

export type CuriousLadooComparePanelData = {
  badgeLabel: string
  image: CuriousLadooMediaData
  placeholderText: string
}

export type CuriousLadooCompareBlockData = {
  after: CuriousLadooComparePanelData
  before: CuriousLadooComparePanelData
  header: CuriousLadooSectionHeaderData
  type: 'compare'
}

export type CuriousLadooHomeBlockData =
  | CuriousLadooHeroBlockData
  | CuriousLadooTickerBlockData
  | CuriousLadooStoryBlockData
  | CuriousLadooContentGridBlockData
  | CuriousLadooBrandsShowcaseBlockData
  | CuriousLadooStepsBlockData
  | CuriousLadooStatsBlockData
  | CuriousLadooTestimonialsBlockData
  | CuriousLadooBlogPreviewBlockData
  | CuriousLadooTeamBlockData
  | CuriousLadooCTABlockData
  | CuriousLadooCapabilityBlockData
  | CuriousLadooFAQBlockData
  | CuriousLadooPipelineBlockData
  | CuriousLadooPortfolioShowcaseBlockData
  | CuriousLadooCompareBlockData

export type CuriousLadooNavLinkData = {
  enabled: boolean
  label: string
  url: string
}

export type CuriousLadooNavigationData = {
  brandName: string
  cta: CuriousLadooLinkData
  links: CuriousLadooNavLinkData[]
}

export type CuriousLadooFooterColumnData = {
  links: { label: string; url: string }[]
  title: string
}

export type CuriousLadooFooterData = {
  columns: CuriousLadooFooterColumnData[]
  copyright: string
}

export type CuriousLadooSiteData = {
  address: string
  description: string
  email: string
  name: string
  social: { href: string; label: string }[]
  tagline: string
}

export type CuriousLadooSEOData = {
  description: string
  title: string
}

/**
 * Despite the name (kept from Milestone 4 to avoid unrelated churn), this is the generic
 * page-content shape for every CMS-driven Curious Ladoo page, not just Home — see
 * CMSHomePage.tsx, which renders any page's layout the same way, branching per-block on
 * `page.pageType` only where the visual treatment genuinely differs (the Hero).
 */
export type CuriousLadooHomeContent = {
  footer: CuriousLadooFooterData
  layout: CuriousLadooHomeBlockData[]
  navigation: CuriousLadooNavigationData
  page: { id: number; pageType: string; title: string } | null
  seo: CuriousLadooSEOData
  site: CuriousLadooSiteData
}
