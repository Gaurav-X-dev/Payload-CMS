export const assetRoot = '/themes/zuru-zuru/images'

export const navigation = [
  ['/', 'Home'],
  ['/menu', 'Menu'],
  ['/about', 'Our Story'],
  ['/chefs', 'Chefs'],
  ['/gallery', 'Gallery'],
  ['/reservation', 'Reservations'],
  ['/contact', 'Contact'],
] as const

export const mobileNavigation = [
  ...navigation.slice(0, 6),
  ['/private-dining', 'Private Dining'],
  ['/events', 'Events'],
  ['/blog', 'Blog'],
  ['/contact', 'Contact'],
] as const

export const footerColumns = [
  ['Explore', [['/menu', 'Our Menu'], ['/about', 'Our Story'], ['/chefs', 'Our Chefs'], ['/gallery', 'Gallery'], ['/blog', 'Blog']]],
  ['Services', [['/reservation', 'Reservations'], ['/private-dining', 'Private Dining'], ['/events', 'Events'], ['/catering', 'Catering'], ['/careers', 'Careers']]],
  ['Information', [['/locations', 'Locations'], ['/franchise', 'Franchise'], ['/faq', 'FAQ'], ['/privacy-policy', 'Privacy Policy'], ['/terms', 'Terms']]],
] as const

export const image = (name: string) => `${assetRoot}/${name}`
