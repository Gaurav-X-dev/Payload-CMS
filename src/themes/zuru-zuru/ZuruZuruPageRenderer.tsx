import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { getZuruZuruHome } from '@/lib/site/getZuruZuruHome'
import { getZuruZuruShell } from '@/lib/site/getZuruZuruShell'
import { CMSHomePage } from './components/CMSHomePage'
import { ZuruZuruLayout } from './layouts/ZuruZuruLayout'
import { mapZuruZuruHomeLayout, mapZuruZuruShell } from './mappers/cmsContent'
import { getZuruZuruPage } from './utils/getPageComponent'
import { normalizePathname } from './utils/normalizePathname'

// Milestone Z3: only Home ("/") is CMS-driven so far. Every other route still renders from the
// existing static React page components — they're converted in later milestones.
const CMS_DRIVEN_PATHS = new Set(['/'])

export async function ZuruZuruPageRenderer({ hostname, pathname, site }: ThemePageRendererProps) {
  const normalizedPathname = normalizePathname(pathname)
  const isCMSDriven = CMS_DRIVEN_PATHS.has(normalizedPathname)
  const staticPage = isCMSDriven ? null : getZuruZuruPage(pathname)
  if (!isCMSDriven && !staticPage) notFound()

  const shell = await getZuruZuruShell({ host: hostname ?? null, site })
  const content = mapZuruZuruShell(shell)

  if (isCMSDriven) {
    const home = await getZuruZuruHome({ host: hostname ?? null, site })
    if (!home.page) notFound()

    const blocks = mapZuruZuruHomeLayout(home.page.layout, {
      locations: home.locations,
      menuItems: home.menuItems,
      testimonials: home.testimonials,
      tenantID: home.tenant?.id ?? 0,
    })

    return (
      <ZuruZuruLayout footer={content.footer} nav={content.navigation} pathname={pathname} site={content.site}>
        <CMSHomePage blocks={blocks} site={content.site} />
      </ZuruZuruLayout>
    )
  }

  return (
    <ZuruZuruLayout footer={content.footer} nav={content.navigation} pathname={pathname} site={content.site}>
      {staticPage}
    </ZuruZuruLayout>
  )
}
