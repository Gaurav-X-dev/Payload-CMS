import {
  AboutPage, ChefsPage, GalleryPage, MenuPage,
} from '../pages/CorePages'
import { HomePage } from '../pages/HomePage'
import {
  CateringPage, ContactPage, EventsPage, PrivateDiningPage, ReservationPage,
} from '../pages/ServicePages'
import {
  BlogPage, CareersPage, FAQPage, FranchisePage, LocationsPage, PrivacyPage, TermsPage,
} from '../pages/InformationPages'
import { normalizePathname } from './normalizePathname'

const pages = {
  '/': HomePage,
  '/about': AboutPage,
  '/blog': BlogPage,
  '/careers': CareersPage,
  '/catering': CateringPage,
  '/chefs': ChefsPage,
  '/contact': ContactPage,
  '/events': EventsPage,
  '/faq': FAQPage,
  '/franchise': FranchisePage,
  '/gallery': GalleryPage,
  '/locations': LocationsPage,
  '/menu': MenuPage,
  '/privacy-policy': PrivacyPage,
  '/private-dining': PrivateDiningPage,
  '/reservation': ReservationPage,
  '/terms': TermsPage,
} as const

export function getZuruZuruPage(pathname: string) {
  const Page = pages[normalizePathname(pathname) as keyof typeof pages]
  return Page ? createElement(Page) : null
}
import { createElement } from 'react'
