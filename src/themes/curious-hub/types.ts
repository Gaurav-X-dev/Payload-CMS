export type ImageData = {
  alt: string
  src: string
}

export type LinkData = {
  href: string
  label: string
}

export type PageMetadataData = {
  description: string
  title: string
}

export type PageHeroData = {
  eyebrow?: string
  subtitle?: string
  title: string
}

export type MegaMenuItemData = {
  href: string
  label: string
}

export type NavItemData = {
  href: string
  label: string
  megaMenu?: MegaMenuItemData[]
}

export type SocialLinkData = {
  ariaLabel: string
  href: string
  label: string
}

export type PhilosophyPillarData = {
  description: string
  icon: 'cross' | 'grid' | 'chart' | 'person' | 'star'
  number: string
  title: string
}

export type ServiceCardData = {
  description: string
  href: string
  icon: string
  number: string
  title: string
}

export type BrandCardData = {
  description: string
  href: string
  image?: ImageData
  mark: string
  markStyle?: string
  name: string
  type: string
}

export type B2BCardData = {
  description: string
  href: string
  icon: string
  link: string
  title: string
}

export type ProcessStepData = {
  description: string
  number: number
  title: string
}

export type EdgePointData = {
  description: string
  icon: string
  title: string
}

export type MetricData = {
  label: string
  suffix: string
  target: number
}

export type IndustryItemData = {
  description: string
  icon: string
  name: string
}

export type TestimonialData = {
  author: string
  avatar: string
  company: string
  quote: string
  role?: string
}

export type JournalArticleData = {
  date: string
  excerpt: string
  image: ImageData
  readTime: string
  tag: string
  title: string
}

export type LeaderData = {
  bio: string
  image: ImageData
  name: string
  role: string
}

export type JourneyMilestoneData = {
  description: string
  event: string
  year: string
}

export type FaqData = {
  answer: string
  question: string
}

export type CareerData = {
  department: string
  description: string
  location: string
  title: string
  type: string
}

export type PortfolioItemData = {
  description: string
  image: ImageData
  tags: string[]
  title: string
  year: string
}

export type FooterColumnData = {
  links: LinkData[]
  title: string
}

export type ContactInfoData = {
  address: string
  email: string
  phone: string
}

export type FormFieldData = {
  label: string
  name: string
  options?: string[]
  placeholder?: string
  required?: boolean
  type: 'email' | 'select' | 'tel' | 'text' | 'textarea'
}

export type TickerBrandData = {
  description: string
  icon: string
  iconStyle?: string
  name: string
}
