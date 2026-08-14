import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { themeRegistry } from '@/themes/registry'
import { resolveLocalSite } from './resolveLocalSite'

export async function renderLocalThemePage(pathname: string) {
  const requestHeaders = await headers()
  const rawHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  const site = resolveLocalSite(rawHost)
  if (!site) notFound()

  const { PageRenderer } = themeRegistry[site.theme]
  return <PageRenderer hostname={rawHost} pathname={pathname} site={site} />
}
