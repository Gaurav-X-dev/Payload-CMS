import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'
import type { ThemePageRendererProps } from '../types'
import { getGheeRoastContent } from '@/lib/site/getGheeRoastContent'
import type { GheeRoastPageProps } from './dynamicTypes'
import { CMSPage } from './components/CMSPage'
import { GheeRoastLayout } from './layouts/GheeRoastLayout'
import { getGheeRoastPage } from './utils/getPageComponent'
import { getGheeRoastPageRenderMode } from './utils/getPageRenderMode'
import { normalizePathname } from './utils/normalizePathname'

export async function GheeRoastPageRenderer({ hostname, pathname, site }: ThemePageRendererProps) {
  const normalizedPathname = normalizePathname(pathname)
  const page = getGheeRoastPage(normalizedPathname)
  const content = await getGheeRoastContent({
    host: hostname ?? null,
    pathname: normalizedPathname,
    site,
  })
  const mode = getGheeRoastPageRenderMode({
    content,
    hasRegisteredPage: Boolean(page),
    pathname: normalizedPathname,
  })
  if (mode === 'not-found') notFound()

  const PageComponent = page?.Component as ComponentType<GheeRoastPageProps> | undefined
  const renderedPage = mode === 'legacy' && PageComponent
    ? <PageComponent content={content} hero={normalizedPathname === '/' ? content.hero : undefined} />
    : <CMSPage content={content} />
  return (
    <GheeRoastLayout content={content} pathname={normalizedPathname}>
      {renderedPage}
    </GheeRoastLayout>
  )
}
