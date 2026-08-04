import { notFound } from 'next/navigation'
import type { ThemePageRendererProps } from '../types'
import { CuriousHubLayout } from './layouts/CuriousHubLayout'
import { getCuriousHubPage } from './utils/getPageComponent'

export function CuriousHubPageRenderer({ pathname }: ThemePageRendererProps) {
  const page = getCuriousHubPage(pathname)
  if (!page) notFound()

  const { Component } = page
  return (
    <CuriousHubLayout pathname={pathname}>
      <Component />
    </CuriousHubLayout>
  )
}
