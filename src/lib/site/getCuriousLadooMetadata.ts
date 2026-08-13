import type { Metadata } from 'next'
import { getCuriousLadooContent } from './getCuriousLadooContent'
import type { LocalSite } from './types'
import { mapCuriousLadooHomeContent } from '../../themes/curious-hub/mappers/cmsContent'
import { normalizePathname } from './normalizePathname'
import { buildCuriousLadooMetadata } from '../../themes/curious-hub/utils/buildCuriousLadooMetadata'

export async function getCuriousLadooMetadata({
  host,
  pathname,
  site,
}: {
  host: string | null
  pathname: string
  site: LocalSite
}): Promise<Metadata> {
  const rawContent = await getCuriousLadooContent({ host, pathname, site })
  if (!rawContent.page) return {}

  const content = mapCuriousLadooHomeContent(rawContent)
  return buildCuriousLadooMetadata({ content, hostname: site.hostname, pathname: normalizePathname(pathname) })
}
