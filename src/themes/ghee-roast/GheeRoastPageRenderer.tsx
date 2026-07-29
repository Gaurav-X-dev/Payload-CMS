import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { GheeRoastLayout } from './layouts/GheeRoastLayout'
import { getGheeRoastPage } from './utils/getPageComponent'

export function GheeRoastPageRenderer({ pathname }: ThemePageRendererProps) {
  const page = getGheeRoastPage(pathname)
  if (!page) notFound()

  const { Component } = page
  return <GheeRoastLayout pathname={pathname}><Component /></GheeRoastLayout>
}
