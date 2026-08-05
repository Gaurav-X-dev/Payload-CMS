import type { Metadata } from 'next'
import { getCuriousLadooContent } from './getCuriousLadooContent'
import type { LocalSite } from './types'

export async function getCuriousLadooMetadata({
  host,
  pathname,
  site,
}: {
  host: string | null
  pathname: string
  site: LocalSite
}): Promise<Metadata> {
  const content = await getCuriousLadooContent({ host, pathname, site })
  if (!content.page || !content.seo) return {}

  const titlePattern = content.seo.metaTitlePattern?.trim()
  const pageTitle = content.page.title?.trim() || ''
  const title = titlePattern && titlePattern.includes('%s')
    ? titlePattern.replace('%s', pageTitle)
    : (pageTitle || undefined)

  return {
    description: content.seo.metaDescription?.trim() || undefined,
    title,
  }
}
