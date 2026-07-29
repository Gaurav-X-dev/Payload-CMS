import type { ComponentType } from 'react'
import type { LocalSite } from '@/lib/site/types'

export type ThemePageRendererProps = {
  pathname: string
  site: LocalSite
}

export type ThemeRegistration = {
  PageRenderer: ComponentType<ThemePageRendererProps>
  key: LocalSite['theme']
}
