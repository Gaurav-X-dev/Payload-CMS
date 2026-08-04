import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  emptyGheeRoastContent,
  gheeRoastContentCacheArguments,
  loadGheeRoastContentWithPayload,
  type GheeRoastContentResult,
  type GheeRoastFindArgs,
} from './gheeRoastContentCore'
import { gheeRoastLegacyFallbacksEnabled } from './themeFallbacks'
import type { LocalSite, LocalThemeKey } from './types'

export type { GheeRoastContentResult } from './gheeRoastContentCore'

const loadGheeRoastContent = cache(async (
  host: string | null,
  pathname: string,
  siteHostname: string,
  siteKey: string,
  siteTheme: LocalThemeKey,
): Promise<GheeRoastContentResult> => {
  if (!process.env.DATABASE_URI) {
    return emptyGheeRoastContent({
      fallbacksEnabled: false,
      tenantState: 'missing',
    })
  }

  const payload = await getPayload({ config: configPromise })
  const site: LocalSite = {
    hostname: siteHostname,
    key: siteKey,
    theme: siteTheme,
  }
  return loadGheeRoastContentWithPayload({
    fallbacksEnabled: gheeRoastLegacyFallbacksEnabled(),
    find: async (args: GheeRoastFindArgs) => {
      const result = await payload.find(args)
      return { docs: result.docs }
    },
    host,
    pathname,
    site,
  })
})

export async function getGheeRoastContent({
  host,
  pathname = '/',
  site,
}: {
  host: string | null
  pathname?: string
  site: LocalSite
}): Promise<GheeRoastContentResult> {
  return loadGheeRoastContent(...gheeRoastContentCacheArguments(host, pathname, site))
}
