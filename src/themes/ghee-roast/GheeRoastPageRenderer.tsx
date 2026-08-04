import { notFound, permanentRedirect, redirect } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { getGheeRoastContent } from '@/lib/site/getGheeRoastContent'
import { emptyGheeRoastContent } from '@/lib/site/gheeRoastContentCore'
import { gheeRoastLegacyFallbacksEnabled } from '@/lib/site/themeFallbacks'
import { CMSPage } from './components/CMSPage'
import { GheeRoastLayout } from './layouts/GheeRoastLayout'
import { getGheeRoastPageRenderMode } from './utils/getPageRenderMode'
import { normalizePathname } from './utils/normalizePathname'

export async function GheeRoastPageRenderer({ hostname, pathname, site }: ThemePageRendererProps) {
  const normalizedPathname = normalizePathname(pathname)
  const content = await getGheeRoastContent({
    host: hostname ?? null,
    pathname: normalizedPathname,
    site,
  })
  if (content.page?.redirect) {
    if (content.page.redirect.permanent) permanentRedirect(content.page.redirect.href)
    redirect(content.page.redirect.href)
  }
  const allowLegacyFallback = gheeRoastLegacyFallbacksEnabled()
  const legacyPage = allowLegacyFallback && !content.page
    ? (await import('./utils/getPageComponent')).getGheeRoastPage(normalizedPathname)
    : null
  const mode = getGheeRoastPageRenderMode({
    content,
    hasRegisteredPage: Boolean(legacyPage),
    pathname: normalizedPathname,
  })
  if (mode === 'not-found') notFound()

  const LegacyPageComponent = legacyPage?.Component
  const legacyContent = mode === 'legacy'
    ? emptyGheeRoastContent({
        fallbacksEnabled: false,
        tenantName: content.site.siteName,
        tenantState: 'empty',
      })
    : null
  const renderedPage = mode === 'legacy' && LegacyPageComponent
    ? <LegacyPageComponent content={legacyContent!} />
    : <CMSPage content={content} />
  const cmsHome = mode === 'cms' && content.page?.isHomePage === true
  const hasContactNewsletterBlock = content.page?.pageType === 'contact'
    && content.page.layout.some((block) => block.blockType === 'newsletterBlock' && block.enabled !== false)
  return (
    <GheeRoastLayout
      content={content}
      pathname={normalizedPathname}
      showChrome={content.page?.template !== 'blank'}
      showNewsletter={normalizedPathname !== '/' && !cmsHome && !hasContactNewsletterBlock}
    >
      {renderedPage}
    </GheeRoastLayout>
  )
}
