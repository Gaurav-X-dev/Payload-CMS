import type { GheeRoastContentResult } from '../../../lib/site/gheeRoastContentCore'

export type GheeRoastPageRenderMode = 'cms' | 'legacy' | 'not-found'

export function getGheeRoastPageRenderMode({
  content,
  hasRegisteredPage,
  pathname,
}: {
  content: GheeRoastContentResult
  hasRegisteredPage: boolean
  pathname: string
}): GheeRoastPageRenderMode {
  if (content.tenantState === 'inactive' || content.tenantState === 'missing') {
    return 'not-found'
  }
  if (!hasRegisteredPage && !content.page) return 'not-found'
  if (!hasRegisteredPage) return 'cms'
  if (pathname === '/') return 'legacy'

  return content.page?.layout.some((block) => block.blockType !== 'heroBlock')
    ? 'cms'
    : 'legacy'
}
