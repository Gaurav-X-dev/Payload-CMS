import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { getZuruZuruShell } from '@/lib/site/getZuruZuruShell'
import { ZuruZuruLayout } from './layouts/ZuruZuruLayout'
import { mapZuruZuruShell } from './mappers/cmsContent'
import { getZuruZuruPage } from './utils/getPageComponent'

export async function ZuruZuruPageRenderer({ hostname, pathname, site }: ThemePageRendererProps) {
  const page = getZuruZuruPage(pathname)
  if (!page) notFound()

  // Milestone Z2 scope: only the global shell (Header/Footer/announcement bar/newsletter) is
  // CMS-driven. The page body above still comes from the existing static React components —
  // pages are converted starting Milestone Z3.
  const shell = await getZuruZuruShell({ host: hostname ?? null, site })
  const content = mapZuruZuruShell(shell)

  return (
    <ZuruZuruLayout footer={content.footer} nav={content.navigation} pathname={pathname} site={content.site}>
      {page}
    </ZuruZuruLayout>
  )
}
