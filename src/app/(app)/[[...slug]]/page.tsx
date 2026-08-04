import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { getGheeRoastMetadata } from '@/lib/site/getGheeRoastMetadata'
import { renderLocalThemePage } from '@/lib/site/renderLocalThemePage'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'
import { getCuriousHubPage } from '@/themes/curious-hub/utils/getPageComponent'

type DynamicRouteProps = {
  params: Promise<{ slug?: string[] }>
}

async function resolvePathname(params: DynamicRouteProps['params']) {
  const { slug = [] } = await params
  return `/${slug.join('/')}`
}

export async function generateMetadata({
  params,
}: DynamicRouteProps): Promise<Metadata> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const site = resolveLocalSite(host)

  if (!site) {
    return {}
  }

  const pathname = await resolvePathname(params)

  if (site.theme === 'ghee-roast') {
    return getGheeRoastMetadata({
      host,
      pathname,
      site,
    })
  }

  if (site.theme === 'curious-hub') {
    return getCuriousHubPage(pathname)?.metadata ?? {}
  }

  return {}
}

export default async function DynamicRoute({
  params,
}: DynamicRouteProps) {
  const pathname = await resolvePathname(params)

  return renderLocalThemePage(pathname)
}
