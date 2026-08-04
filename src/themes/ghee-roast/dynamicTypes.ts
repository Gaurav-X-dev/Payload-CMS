import type {
  FeatureData,
  FoodItemData,
  ImageData,
  LinkData,
  PageHeroData,
  TestimonialData,
} from './types'
import type { CMSPageType } from '../../validation/pageLayout'
import type { Page } from '../../payload-types'

export type GheeRoastPageBlock = NonNullable<Page['layout']>[number]

export type GheeRoastNavigationItem = LinkData & {
  children?: GheeRoastNavigationItem[]
  newTab?: boolean
  renderKey?: string
  sortOrder?: number
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
  backgroundImage?: ImageData
  description: string
  enabled: boolean
  eyebrow?: string
  heading: string
  highlightedHeading: string
  image?: ImageData
  mobileBackgroundImage?: ImageData
  mobileImage?: ImageData
  overlayOpacity?: number
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
    errorMessage: string
    highlightedWord?: string
    placeholder: string
    privacyText: string
    successMessage: string
    title: string
  }
  orderLinks: LinkData[]
  siteName: string
  featureStrip?: FeatureData[]
  socials: GheeRoastSocialData[]
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

export type GheeRoastSocialData = LinkData & {
  ctaLabel: string
  description?: string
  displayLabel: string
  handle?: string
  icon: string
  platform: string
  renderKey: string
  sortOrder: number
}

export type GheeRoastFooterData = {
  bottomLinks: GheeRoastNavigationItem[]
  columns: Array<{
    links: GheeRoastNavigationItem[]
    title: string
  }>
  configured: boolean
  contactHeading: string
  copyright: string
}

export type GheeRoastSEOData = {
  canonicalUrl?: string
  description?: string
  googleSiteVerification?: string
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
  keywords?: string[]
  ogDescription?: string
  ogImage?: ImageData
  ogSiteName?: string
  ogTitle?: string
  robots?: string
  titlePattern?: string
  bingSiteVerification?: string
  twitterCard?: 'app' | 'player' | 'summary' | 'summary_large_image'
  twitterCreator?: string
  twitterSite?: string
}

export type GheeRoastCMSPage = {
  canonicalUrl?: string
  hero?: PageHeroData & { image?: ImageData }
  id: Page['id']
  isHomePage: boolean
  layout: GheeRoastPageBlock[]
  metaDescription?: string
  metaImage?: ImageData
  metaTitle?: string
  noIndex: boolean
  pageType: CMSPageType
  redirect?: {
    href: string
    permanent: boolean
  }
  slug: string
  template: 'blank' | 'default' | 'landing'
  title: string
}

export type GheeRoastLocationData = {
  address: string
  city: string
  country?: string
  businessHours: string[]
  deliveryZones: string[]
  description?: string
  email?: string
  id: number | string
  mapsEmbedUrl?: string
  mapsUrl?: string
  mapButtonLabel: string
  isPrimary: boolean
  latitude?: number
  longitude?: number
  orderLinks: LinkData[]
  phone?: string
  postalCode?: string
  showOnContact: boolean
  sortOrder: number
  state?: string
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
  media: ImageData[]
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
