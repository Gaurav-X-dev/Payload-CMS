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
  if (content.page) return 'cms'
  if (hasRegisteredPage) return 'legacy'
  return pathname === '/' ? 'cms' : 'not-found'
}
