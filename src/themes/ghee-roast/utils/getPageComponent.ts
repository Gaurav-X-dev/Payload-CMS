import type { ComponentType } from 'react'

// Deprecated compatibility registry. Normal Ghee Roast rendering never imports
// this module. It is loaded dynamically only when the explicit development-only
// legacy fallback flag is enabled.
import { aboutData } from '../data/about'
import { cateringData } from '../data/catering'
import { contactData } from '../data/contact'
import { deliveryData } from '../data/delivery'
import { homeData } from '../data/home'
import { menuData } from '../data/menu'
import { qualityData } from '../data/quality'
import { AboutPage } from '../pages/AboutPage'
import { CateringPage } from '../pages/CateringPage'
import { ContactPage } from '../pages/ContactPage'
import { DeliveryPage } from '../pages/DeliveryPage'
import { HomePage } from '../pages/HomePage'
import { MenuPage } from '../pages/MenuPage'
import { QualityPage } from '../pages/QualityPage'
import type { PageMetadataData } from '../types'
import type { GheeRoastPageProps } from '../dynamicTypes'
import { normalizePathname } from './normalizePathname'

type PageRegistration = {
  Component: ComponentType<GheeRoastPageProps>
  metadata: PageMetadataData
}

export const gheeRoastPageRegistry = {
  '/': { Component: HomePage, metadata: homeData.metadata },
  '/about': { Component: AboutPage, metadata: aboutData.metadata },
  '/catering': { Component: CateringPage, metadata: cateringData.metadata },
  '/contact': { Component: ContactPage, metadata: contactData.metadata },
  '/delivery': { Component: DeliveryPage, metadata: deliveryData.metadata },
  '/menu': { Component: MenuPage, metadata: menuData.metadata },
  '/quality': { Component: QualityPage, metadata: qualityData.metadata },
} as const satisfies Record<string, PageRegistration>

export function getGheeRoastPage(pathname: string): PageRegistration | null {
  const normalized = normalizePathname(pathname)
  return normalized in gheeRoastPageRegistry
    ? gheeRoastPageRegistry[normalized as keyof typeof gheeRoastPageRegistry]
    : null
}
