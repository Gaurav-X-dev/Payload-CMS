import type { Metadata } from 'next'
import { getGheeRoastPage } from '../../themes/ghee-roast/utils/getPageComponent'
import { buildGheeRoastMetadata } from '../../themes/ghee-roast/utils/buildGheeRoastMetadata'
import { getGheeRoastContent } from './getGheeRoastContent'
import type { LocalSite } from './types'

export async function getGheeRoastMetadata({
  host,
  pathname,
  site,
}: {
  host: string | null
  pathname: string
  site: LocalSite
}): Promise<Metadata> {
  const content = await getGheeRoastContent({ host, pathname, site })
  return buildGheeRoastMetadata({
    content,
    registeredMetadata: getGheeRoastPage(pathname)?.metadata,
  })
}
