import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { getCuriousLadooContent } from '@/lib/site/getCuriousLadooContent'
import { CMSHomePage } from './components/CMSHomePage'
import { CuriousHubLayout } from './layouts/CuriousHubLayout'
import { mapCuriousLadooHomeContent } from './mappers/cmsContent'
import { normalizePathname } from './utils/normalizePathname'
import { getCuriousHubPage } from './utils/getPageComponent'

// Routes migrated to the CMS pipeline so far. Every other path remains fully static.
export const CMS_DRIVEN_PATHS = new Set(['/', '/about', '/services', '/brands'])

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
    return (
      <CuriousHubLayout
        footer={content.footer}
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
