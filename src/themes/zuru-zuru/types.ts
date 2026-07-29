export type ZuruPageKey =
  | 'about' | 'blog' | 'careers' | 'catering' | 'chefs' | 'contact' | 'events'
  | 'faq' | 'franchise' | 'gallery' | 'home' | 'locations' | 'menu'
  | 'privacy-policy' | 'private-dining' | 'reservation' | 'terms'

export type CardData = {
  description: string
  icon?: string
  image?: string
  meta?: string
  title: string
}
