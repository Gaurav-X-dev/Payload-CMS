import type { Metadata } from 'next'
import { getZuruZuruPageContent } from './getZuruZuruPageContent'
import { getZuruZuruShell } from './getZuruZuruShell'
import type { LocalSite } from './types'
import { mapZuruZuruPageMeta, mapZuruZuruSEO, mapZuruZuruSite } from '../../themes/zuru-zuru/mappers/cmsContent'
import { buildZuruZuruMetadata } from '../../themes/zuru-zuru/utils/buildZuruZuruMetadata'
import { normalizePathname } from '../../themes/zuru-zuru/utils/normalizePathname'

export async function getZuruZuruMetadata({
  host,
  pathname,
  site,
}: {
  host: string | null
  pathname: string
  site: LocalSite
}): Promise<Metadata> {
  const [shell, pageContent] = await Promise.all([
    getZuruZuruShell({ host, site }),
    getZuruZuruPageContent({ host, pathname, site }),
  ])
  if (!pageContent.page) return {}

  const tenantID = shell.tenant?.id ?? 0
  return buildZuruZuruMetadata({
    hostname: site.hostname,
    page: mapZuruZuruPageMeta(pageContent.page, tenantID),
    pathname: normalizePathname(pathname),
    seo: mapZuruZuruSEO(shell.seo, shell.tenant),
    site: mapZuruZuruSite(shell.tenant, shell.siteSettings),
  })
}
