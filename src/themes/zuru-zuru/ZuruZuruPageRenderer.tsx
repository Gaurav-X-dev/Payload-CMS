import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { getZuruZuruPageContent } from '@/lib/site/getZuruZuruPageContent'
import { getZuruZuruShell } from '@/lib/site/getZuruZuruShell'
import { CMSAboutPage } from './components/CMSAboutPage'
import { CMSBlogPage } from './components/CMSBlogPage'
import { CMSCareersPage } from './components/CMSCareersPage'
import { CMSCateringPage } from './components/CMSCateringPage'
import { CMSChefsPage } from './components/CMSChefsPage'
import { CMSContactPage } from './components/CMSContactPage'
import { CMSEventsPage } from './components/CMSEventsPage'
import { CMSFAQPage } from './components/CMSFAQPage'
import { CMSFranchisePage } from './components/CMSFranchisePage'
import { CMSGalleryPage } from './components/CMSGalleryPage'
import { CMSHomePage } from './components/CMSHomePage'
import { CMSLegalPage } from './components/CMSLegalPage'
import { CMSLocationsPage } from './components/CMSLocationsPage'
import { CMSMenuPage } from './components/CMSMenuPage'
import { CMSPrivateDiningPage } from './components/CMSPrivateDiningPage'
import { CMSReservationPage } from './components/CMSReservationPage'
import { ZuruZuruLayout } from './layouts/ZuruZuruLayout'
import { mapZuruZuruPageLayout, mapZuruZuruSEO, mapZuruZuruShell } from './mappers/cmsContent'
import type { ZuruZuruPageBlockData, ZuruZuruSiteData } from './mappers/dynamicTypes'
import { buildZuruZuruBreadcrumbJsonLd, combineZuruZuruJsonLd } from './utils/buildZuruZuruJsonLd'
import { getZuruZuruPage } from './utils/getPageComponent'
import { normalizePathname } from './utils/normalizePathname'

// Milestone Z7 — every genuine public Zuru Zuru route is now CMS-driven: Group A (Catering,
// Careers, Franchise, FAQ, Privacy Policy, Terms), Group B (Chefs, Events, Locations, Blog),
// Group C (Reservation, Private Dining), and Gallery (converted last, after the approved
// Gallery.category migration) join the already-converted Home/Menu/About/Contact.
const CMS_PAGE_RENDERERS: Record<string, (blocks: ZuruZuruPageBlockData[], site: ZuruZuruSiteData) => React.ReactNode> = {
  '/': (blocks, site) => <CMSHomePage blocks={blocks} site={site} />,
  '/menu': (blocks) => <CMSMenuPage blocks={blocks} />,
  '/about': (blocks) => <CMSAboutPage blocks={blocks} />,
  '/contact': (blocks, site) => <CMSContactPage blocks={blocks} site={site} />,
  '/catering': (blocks) => <CMSCateringPage blocks={blocks} />,
  '/careers': (blocks) => <CMSCareersPage blocks={blocks} />,
  '/franchise': (blocks) => <CMSFranchisePage blocks={blocks} />,
  '/faq': (blocks) => <CMSFAQPage blocks={blocks} />,
  '/privacy-policy': (blocks) => <CMSLegalPage blocks={blocks} />,
  '/terms': (blocks) => <CMSLegalPage blocks={blocks} />,
  '/chefs': (blocks) => <CMSChefsPage blocks={blocks} />,
  '/events': (blocks) => <CMSEventsPage blocks={blocks} />,
  '/locations': (blocks) => <CMSLocationsPage blocks={blocks} />,
  '/blog': (blocks) => <CMSBlogPage blocks={blocks} />,
  '/reservation': (blocks) => <CMSReservationPage blocks={blocks} />,
  '/private-dining': (blocks) => <CMSPrivateDiningPage blocks={blocks} />,
  '/gallery': (blocks) => <CMSGalleryPage blocks={blocks} />,
}

export async function ZuruZuruPageRenderer({ hostname, pathname, site }: ThemePageRendererProps) {
  const normalizedPathname = normalizePathname(pathname)
  const cmsRenderer = CMS_PAGE_RENDERERS[normalizedPathname]
  const isCMSDriven = Boolean(cmsRenderer)
  const staticPage = isCMSDriven ? null : getZuruZuruPage(pathname)
  if (!isCMSDriven && !staticPage) notFound()

  const shell = await getZuruZuruShell({ host: hostname ?? null, site })
  const content = mapZuruZuruShell(shell)

  if (cmsRenderer) {
    const page = await getZuruZuruPageContent({ host: hostname ?? null, pathname: normalizedPathname, site })
    if (!page.page) notFound()

    const blocks = mapZuruZuruPageLayout(page.page.layout, {
      blogPosts: page.blogPosts,
      events: page.events,
      faqs: page.faqs,
      galleryItems: page.galleryItems,
      locations: page.locations,
      menuItems: page.menuItems,
      teamMembers: page.teamMembers,
      testimonials: page.testimonials,
      tenantID: page.tenant?.id ?? 0,
    })

    const seo = mapZuruZuruSEO(shell.seo, shell.tenant)
    const breadcrumbItems = page.page.isHomePage
      ? []
      : [
          { name: 'Home', url: `https://${site.hostname}/` },
          { name: page.page.title, url: `https://${site.hostname}${normalizedPathname}` },
        ]
    const jsonLd = combineZuruZuruJsonLd(
      seo.jsonLd,
      buildZuruZuruBreadcrumbJsonLd(breadcrumbItems),
    )

    return (
      <ZuruZuruLayout footer={content.footer} jsonLd={jsonLd} nav={content.navigation} pathname={pathname} site={content.site}>
        {cmsRenderer(blocks, content.site)}
      </ZuruZuruLayout>
    )
  }

  return (
    <ZuruZuruLayout footer={content.footer} nav={content.navigation} pathname={pathname} site={content.site}>
      {staticPage}
    </ZuruZuruLayout>
  )
}
