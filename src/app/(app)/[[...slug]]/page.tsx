import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { renderLocalThemePage } from '@/lib/site/renderLocalThemePage'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'
import { getGheeRoastPage } from '@/themes/ghee-roast'

type DynamicRouteProps = {
  params: Promise<{ slug?: string[] }>
}

async function resolvePathname(params: DynamicRouteProps['params']) {
  const { slug = [] } = await params
  return `/${slug.join('/')}`
}

export async function generateMetadata({ params }: DynamicRouteProps): Promise<Metadata> {
  const requestHeaders = await headers()
  const site = resolveLocalSite(requestHeaders.get('host'))
  if (!site) return {}

  const page = getGheeRoastPage(await resolvePathname(params))
  return page?.metadata ?? {}
}

export default async function DynamicRoute({ params }: DynamicRouteProps) {
  return renderLocalThemePage(await resolvePathname(params))
}
