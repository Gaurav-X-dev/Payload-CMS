import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getGheeRoastMetadata } from '@/lib/site/getGheeRoastMetadata'
import { renderLocalThemePage } from '@/lib/site/renderLocalThemePage'
import { resolveLocalSite } from '@/lib/site/resolveLocalSite'
import { menuData } from '@/themes/ghee-roast/data/menu'

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const site = resolveLocalSite(host)
  return site?.theme === 'ghee-roast'
    ? getGheeRoastMetadata({ host, pathname: '/menu', site })
    : menuData.metadata
}

export default function MenuPage() {
  return renderLocalThemePage('/menu')
}
