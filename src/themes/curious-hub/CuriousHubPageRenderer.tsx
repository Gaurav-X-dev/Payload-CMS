import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { getCuriousLadooContent } from '@/lib/site/getCuriousLadooContent'
import { CMSHomePage } from './components/CMSHomePage'
import { CuriousHubLayout } from './layouts/CuriousHubLayout'
import { mapCuriousLadooHomeContent } from './mappers/cmsContent'
import { buildCuriousLadooBreadcrumbJsonLd, combineCuriousLadooJsonLd } from './utils/buildCuriousLadooJsonLd'
import { normalizePathname } from './utils/normalizePathname'
import { getCuriousHubPage } from './utils/getPageComponent'

// Routes migrated to the CMS pipeline so far. Every other path remains fully static.
export const CMS_DRIVEN_PATHS = new Set(['/', '/about', '/services', '/brands', '/portfolio', '/how-we-work', '/testimonials', '/careers', '/faqs', '/contact', '/blog'])

export async function CuriousHubPageRenderer({ hostname, pathname, site }: ThemePageRendererProps) {
  const normalizedPathname = normalizePathname(pathname)

  if (CMS_DRIVEN_PATHS.has(normalizedPathname)) {
    const rawContent = await getCuriousLadooContent({
      host: hostname ?? null,
      pathname: normalizedPathname,
      site,
    })
    // No published page exists yet for this path, or the tenant is inactive/missing: fail
    // closed rather than restore the old static content.
    if (!rawContent.page) notFound()

    const content = mapCuriousLadooHomeContent(rawContent)
    const breadcrumbItems = normalizedPathname === '/' || !content.page
      ? []
      : [
          { name: 'Home', url: `https://${site.hostname}/` },
          { name: content.page.title, url: `https://${site.hostname}${normalizedPathname}` },
        ]
    const jsonLd = combineCuriousLadooJsonLd(
      content.seo.jsonLd,
      buildCuriousLadooBreadcrumbJsonLd(breadcrumbItems),
    )
    return (
      <CuriousHubLayout
        footer={content.footer}
        jsonLd={jsonLd}
        nav={content.navigation}
        pathname={normalizedPathname}
        site={content.site}
        tagline={content.site.tagline}
      >
        <CMSHomePage content={content} />
      </CuriousHubLayout>
    )
  }

  // All other Curious Hub routes remain fully static, unchanged from before Milestone 4.
  const page = getCuriousHubPage(normalizedPathname)
  if (!page) notFound()

  const { Component } = page
  return (
    <CuriousHubLayout pathname={normalizedPathname}>
      <Component />
    </CuriousHubLayout>
  )
}
