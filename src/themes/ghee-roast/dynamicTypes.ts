import type {
  FeatureData,
  FoodItemData,
  ImageData,
  LinkData,
  PageHeroData,
  TestimonialData,
} from './types'

export type GheeRoastNavigationItem = LinkData & {
  children?: GheeRoastNavigationItem[]
  newTab?: boolean
}

export type GheeRoastNavigationData = {
  brandName?: string
  cta: {
    enabled: boolean
    href: string
    label: string
  }
  items: GheeRoastNavigationItem[]
  logo?: ImageData
  tagline?: string
}

export type GheeRoastHeroData = {
  description: string
  enabled: boolean
  eyebrow?: string
  heading: string
  highlightedHeading: string
  image?: ImageData
  mobileImage?: ImageData
  orderPlatformsLabel?: string
  primaryCTA?: LinkData
  secondaryCTA?: LinkData
  stampText?: string
}

export type GheeRoastSiteData = {
  announcement: {
    enabled: boolean
    text: string
  }
  contact: {
    address: string
    email?: string
    hours: string[]
    phone?: string
  }
  description: string
  logo?: ImageData
  newsletter: {
    buttonLabel: string
    description: string
    enabled: boolean
    highlightedWord?: string
    placeholder: string
    privacyText: string
    title: string
  }
  orderLinks: LinkData[]
  siteName: string
  socials: Array<LinkData & { platform: string }>
  tagline: string
  tenantID?: number | string
  theme: {
    accentColor?: string
    backgroundColor?: string
    bodyFont?: string
    cardRadius?: string
    headingFont?: string
    headingTransform?: string
    primaryColor?: string
  }
}

export type GheeRoastFooterData = {
  bottomLinks: GheeRoastNavigationItem[]
  columns: Array<{
    links: GheeRoastNavigationItem[]
    title: string
  }>
  contactHeading: string
  copyright: string
}

export type GheeRoastSEOData = {
  canonicalUrl?: string
  description?: string
  ogDescription?: string
  ogImage?: ImageData
  ogSiteName?: string
  ogTitle?: string
  robots?: string
  titlePattern?: string
  twitterCard?: 'app' | 'player' | 'summary' | 'summary_large_image'
  twitterCreator?: string
  twitterSite?: string
}

export type GheeRoastCMSPage = {
  canonicalUrl?: string
  hero?: PageHeroData & { image?: ImageData }
  id: number | string
  isHomePage: boolean
  layout: Array<Record<string, unknown>>
  metaDescription?: string
  metaImage?: ImageData
  metaTitle?: string
  noIndex: boolean
  slug: string
  title: string
}

export type GheeRoastLocationData = {
  address: string
  city: string
  description?: string
  email?: string
  id: number | string
  mapsEmbedUrl?: string
  mapsUrl?: string
  orderLinks: LinkData[]
  phone?: string
  title: string
}

export type GheeRoastTeamMemberData = {
  bio?: string
  id: number | string
  name: string
  photo?: ImageData
  quote?: string
  role: string
}

export type GheeRoastEventData = {
  bookingUrl?: string
  description?: string
  endsAt?: string
  id: number | string
  image?: ImageData
  isFeatured?: boolean
  locationName?: string
  startsAt: string
  summary: string
  title: string
}

export type GheeRoastFAQData = {
  answer: string
  category?: string
  id: number | string
  question: string
}

export type GheeRoastCollectionContent = {
  events: GheeRoastEventData[]
  faqs: GheeRoastFAQData[]
  gallery: ImageData[]
  locations: GheeRoastLocationData[]
  menu: {
    categories: Array<[string, string]>
    items: FoodItemData[]
  }
  team: GheeRoastTeamMemberData[]
  testimonials: TestimonialData[]
}

export type GheeRoastDynamicContent = {
  collections: GheeRoastCollectionContent
  footer: GheeRoastFooterData
  hero: GheeRoastHeroData
  navigation: GheeRoastNavigationData
  page: GheeRoastCMSPage | null
  seo: GheeRoastSEOData
  site: GheeRoastSiteData
}

export type GheeRoastPageProps = {
  content: GheeRoastDynamicContent
  hero?: GheeRoastHeroData
}

export type GheeRoastFeatureBlockData = {
  features: FeatureData[]
}
