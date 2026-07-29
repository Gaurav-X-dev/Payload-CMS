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
  subtitle: string
  title: string
}

export type FeatureData = {
  description: string
  icon: string
  title: string
}

export type FoodItemData = {
  badge?: string
  category: string
  description: string
  image: ImageData
  meta?: string[]
  name: string
  price: string
  textDescription?: string
}

export type TestimonialData = {
  attribution: string
  name: string
  quote: string
}

export type TimelineData = {
  description: string
  image: ImageData
  title: string
  year: string
}

export type FormFieldData = {
  label: string
  name: string
  options?: string[]
  placeholder?: string
  required?: boolean
  type: 'email' | 'select' | 'tel' | 'text' | 'textarea'
}

export type ContentPageData = {
  hero: PageHeroData
  metadata: PageMetadataData
}
