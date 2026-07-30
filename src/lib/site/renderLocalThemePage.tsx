import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { themeRegistry } from '@/themes/registry'
import { resolveLocalSite } from './resolveLocalSite'

export async function renderLocalThemePage(pathname: string) {
  const requestHeaders = await headers()
  const site = resolveLocalSite(requestHeaders.get('host'))
  if (!site) notFound()

  const { PageRenderer } = themeRegistry[site.theme]
  return <PageRenderer hostname={requestHeaders.get('host')} pathname={pathname} site={site} />
}
