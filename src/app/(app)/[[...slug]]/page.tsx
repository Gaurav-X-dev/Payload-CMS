import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { renderLocalThemePage } from '@/lib/site/renderLocalThemePage'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'
import { getGheeRoastPage } from '@/themes/ghee-roast'
import { getGheeRoastMetadata } from '@/lib/site/getGheeRoastMetadata'

type DynamicRouteProps = {
  params: Promise<{ slug?: string[] }>
}

async function resolvePathname(params: DynamicRouteProps['params']) {
  const { slug = [] } = await params
  return `/${slug.join('/')}`
}

export async function generateMetadata({ params }: DynamicRouteProps): Promise<Metadata> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const site = resolveLocalSite(host)
  if (!site) return {}

  const pathname = await resolvePathname(params)
  const registeredPage = getGheeRoastPage(pathname)
  if (site.theme !== 'ghee-roast') return registeredPage?.metadata ?? {}

  return getGheeRoastMetadata({ host, pathname, site })
}

export default async function DynamicRoute({ params }: DynamicRouteProps) {
  return renderLocalThemePage(await resolvePathname(params))
}
