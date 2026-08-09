import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getGheeRoastMetadata } from '@/lib/site/getGheeRoastMetadata'
import { getZuruZuruMetadata } from '@/lib/site/getZuruZuruMetadata'
import { renderLocalThemePage } from '@/lib/site/renderLocalThemePage'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const site = resolveLocalSite(host)
  if (site?.theme === 'ghee-roast') {
    return getGheeRoastMetadata({ host, pathname: '/menu', site })
  }
  if (site?.theme === 'zuru-zuru') {
    return getZuruZuruMetadata({ host, pathname: '/menu', site })
  }
  const { menuData } = await import('@/themes/ghee-roast/data/menu')
  return menuData.metadata
}

export default function MenuPage() {
  return renderLocalThemePage('/menu')
}
