import type { Metadata } from 'next'
import { renderLocalThemePage } from '@/lib/site/renderLocalThemePage'
import { menuData } from '@/themes/ghee-roast/data/menu'

export const metadata: Metadata = menuData.metadata

export default function MenuPage() {
  return renderLocalThemePage('/menu')
}
