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
