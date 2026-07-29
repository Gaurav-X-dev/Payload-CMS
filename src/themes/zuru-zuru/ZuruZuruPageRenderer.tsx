import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { ZuruZuruLayout } from './layouts/ZuruZuruLayout'
import { getZuruZuruPage } from './utils/getPageComponent'

export function ZuruZuruPageRenderer({ pathname }: ThemePageRendererProps) {
  const page = getZuruZuruPage(pathname)
  if (!page) notFound()
  return <ZuruZuruLayout pathname={pathname}>{page}</ZuruZuruLayout>
}
