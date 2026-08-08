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
  description: string
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
  header: ZuruZuruSectionHeaderData
  variant: ZuruZuruCardGridVariant
}

export type ZuruZuruStoryBlockData = {
  body: string
  cta: ZuruZuruLinkData
  eyebrow: string
  image: ZuruZuruMediaData
  imageAlt: string
  title: string
}

export type ZuruZuruContentGridBlockData = {
  header: ZuruZuruSectionHeaderData
  items: ZuruZuruIconTextItemData[]
  presentation: string
}

export type ZuruZuruDishBadge = 'chef' | 'new' | 'popular'

export type ZuruZuruDishData = {
  badge: ZuruZuruDishBadge | null
  calories: number | null
  description: string
  heat: number
  id: number
  image: ZuruZuruMediaData
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
  hours: ZuruZuruHoursRowData[]
  id: number
  parking: string
}

export type ZuruZuruLocationsBlockData = {
  header: ZuruZuruSectionHeaderData
  location: ZuruZuruLocationData | null
  showMap: boolean
}

export type ZuruZuruHomeBlockData =
  | { data: ZuruZuruHeroBlockData; type: 'hero' }
  | { data: ZuruZuruFeatureStripBlockData; type: 'featureStrip' }
  | { data: ZuruZuruCardGridBlockData; type: 'cardGrid' }
  | { data: ZuruZuruStoryBlockData; type: 'story' }
  | { data: ZuruZuruMenuShowcaseBlockData; type: 'menuShowcase' }
  | { data: ZuruZuruContentGridBlockData; type: 'contentGrid' }
  | { data: ZuruZuruTestimonialsBlockData; type: 'testimonials' }
  | { data: ZuruZuruLocationsBlockData; type: 'locations' }

export type ZuruZuruHomeContent = {
  blocks: ZuruZuruHomeBlockData[]
  shell: ZuruZuruShellData
}
