import type { ComponentType } from 'react'
import { aboutData } from '../data/about'
import { blogData } from '../data/blog'
import { brandsData } from '../data/brands'
import { careersData } from '../data/careers'
import { contactData } from '../data/contact'
import { faqsData } from '../data/faqs'
import { homeData } from '../data/home'
import { howWeWorkData } from '../data/howWeWork'
import { portfolioData } from '../data/portfolio'
import { servicesData } from '../data/services'
import { testimonialsData } from '../data/testimonials'
import { AboutPage } from '../pages/AboutPage'
import { BlogPage } from '../pages/BlogPage'
import { BrandsPage } from '../pages/BrandsPage'
import { CareersPage } from '../pages/CareersPage'
import { ContactPage } from '../pages/ContactPage'
import { FaqsPage } from '../pages/FaqsPage'
import { HomePage } from '../pages/HomePage'
import { HowWeWorkPage } from '../pages/HowWeWorkPage'
import { PortfolioPage } from '../pages/PortfolioPage'
import { ServicesPage } from '../pages/ServicesPage'
import { TestimonialsPage } from '../pages/TestimonialsPage'
import { WorkInProgressPage } from '../pages/WorkInProgressPage'
import type { PageMetadataData } from '../types'
import { normalizePathname } from './normalizePathname'

type PageRegistration = {
  Component: ComponentType
  metadata: PageMetadataData
}

const WIP_METADATA: PageMetadataData = {
  description: 'Coming soon — Curious Ladoo',
  title: 'Coming Soon | Curious Ladoo',
}

export const curiousHubPageRegistry = {
  '/': { Component: HomePage, metadata: homeData.metadata },
  '/about': { Component: AboutPage, metadata: aboutData.metadata },
  '/blog': { Component: BlogPage, metadata: blogData.metadata },
  '/brands': { Component: BrandsPage, metadata: brandsData.metadata },
  '/careers': { Component: CareersPage, metadata: careersData.metadata },
  '/contact': { Component: ContactPage, metadata: contactData.metadata },
  '/faqs': { Component: FaqsPage, metadata: faqsData.metadata },
  '/how-we-work': { Component: HowWeWorkPage, metadata: howWeWorkData.metadata },
  '/portfolio': { Component: PortfolioPage, metadata: portfolioData.metadata },
  '/services': { Component: ServicesPage, metadata: servicesData.metadata },
  '/testimonials': { Component: TestimonialsPage, metadata: testimonialsData.metadata },
  '/work-in-progress': { Component: WorkInProgressPage, metadata: WIP_METADATA },
} as const satisfies Record<string, PageRegistration>

export function getCuriousHubPage(pathname: string): PageRegistration | null {
  const normalized = normalizePathname(pathname)
  return normalized in curiousHubPageRegistry
    ? curiousHubPageRegistry[normalized as keyof typeof curiousHubPageRegistry]
    : null
}
