export type ImageData = {
  alt: string
  category?: string
  id?: number | string
  isFeatured?: boolean
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
  categoryID?: number | string
  description: string
  id?: number | string
  image?: ImageData
  isFeatured?: boolean
  meta?: string[]
  name: string
  price: string
  textDescription?: string
}

export type TestimonialData = {
  attribution: string
  id?: number | string
  isFeatured?: boolean
  name: string
  quote: string
  rating?: number
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
  type: 'date' | 'email' | 'number' | 'select' | 'tel' | 'text' | 'textarea' | 'time'
}

export type ContentPageData = {
  hero: PageHeroData
  metadata: PageMetadataData
}
