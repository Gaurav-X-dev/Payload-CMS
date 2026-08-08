import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { getZuruZuruPageContent } from '@/lib/site/getZuruZuruPageContent'
import { getZuruZuruShell } from '@/lib/site/getZuruZuruShell'
import { CMSAboutPage } from './components/CMSAboutPage'
import { CMSHomePage } from './components/CMSHomePage'
import { CMSMenuPage } from './components/CMSMenuPage'
import { ZuruZuruLayout } from './layouts/ZuruZuruLayout'
import { mapZuruZuruPageLayout, mapZuruZuruShell } from './mappers/cmsContent'
import { getZuruZuruPage } from './utils/getPageComponent'
import { normalizePathname } from './utils/normalizePathname'

// Milestone Z5: Home ("/"), Menu ("/menu"), and About ("/about") are CMS-driven so far. Every
// other route still renders from the existing static React page components — they're converted
// in later milestones.
const CMS_DRIVEN_PATHS = new Set(['/', '/menu', '/about'])

export async function ZuruZuruPageRenderer({ hostname, pathname, site }: ThemePageRendererProps) {
  const normalizedPathname = normalizePathname(pathname)
  const isCMSDriven = CMS_DRIVEN_PATHS.has(normalizedPathname)
  const staticPage = isCMSDriven ? null : getZuruZuruPage(pathname)
  if (!isCMSDriven && !staticPage) notFound()

  const shell = await getZuruZuruShell({ host: hostname ?? null, site })
  const content = mapZuruZuruShell(shell)

  if (isCMSDriven) {
    const page = await getZuruZuruPageContent({ host: hostname ?? null, pathname: normalizedPathname, site })
    if (!page.page) notFound()

    const blocks = mapZuruZuruPageLayout(page.page.layout, {
      locations: page.locations,
      menuItems: page.menuItems,
      testimonials: page.testimonials,
      tenantID: page.tenant?.id ?? 0,
    })

    return (
      <ZuruZuruLayout footer={content.footer} nav={content.navigation} pathname={pathname} site={content.site}>
        {normalizedPathname === '/' && <CMSHomePage blocks={blocks} site={content.site} />}
        {normalizedPathname === '/menu' && <CMSMenuPage blocks={blocks} />}
        {normalizedPathname === '/about' && <CMSAboutPage blocks={blocks} />}
      </ZuruZuruLayout>
    )
  }

  return (
    <ZuruZuruLayout footer={content.footer} nav={content.navigation} pathname={pathname} site={content.site}>
      {staticPage}
    </ZuruZuruLayout>
  )
}
