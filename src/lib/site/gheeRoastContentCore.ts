import type { Where } from 'payload'
import {
  mapGheeRoastCollections,
  mapGheeRoastFooter,
  mapGheeRoastHero,
  mapGheeRoastNavigation,
  mapGheeRoastPage,
  mapGheeRoastSEO,
  mapGheeRoastSite,
} from '../../themes/ghee-roast/mappers/cmsContent'
import type { GheeRoastPageDocument } from '../../themes/ghee-roast/mappers/cmsContent'
import type {
  GheeRoastCMSPage,
  GheeRoastDynamicContent,
} from '../../themes/ghee-roast/dynamicTypes'
import { normalizePathname } from './normalizePathname'
import type { CMSPageType } from '../../validation/pageLayout'
import { resolveLocalSite } from './resolveLocalSite'
import { tenantCanRenderGheeRoast } from './themeFallbacks'
import type { LocalSite, LocalThemeKey } from './types'

export type GheeRoastTenantState =
  | 'active'
  | 'empty'
  | 'fallback'
  | 'inactive'
  | 'missing'

export type GheeRoastContentResult = GheeRoastDynamicContent & {
  tenantState: GheeRoastTenantState
}

export type GheeRoastCollectionSlug =
  | 'events'
  | 'faqs'
  | 'footer'
  | 'gallery'
  | 'locations'
  | 'media'
  | 'menu-categories'
  | 'menu-items'
  | 'nav'
  | 'pages'
  | 'seo'
  | 'site-settings'
  | 'teammembers'
  | 'tenants'
  | 'testimonials'

export type GheeRoastFindArgs = {
  collection: GheeRoastCollectionSlug
  depth: number
  limit: number
  overrideAccess: true
  pagination: false
  select?: Record<string, true>
  sort?: string
  draft?: boolean
  where: Where
}

export type GheeRoastFind = (
  args: GheeRoastFindArgs,
) => Promise<{ docs: unknown[] }>

type Document = Record<string, unknown>

const emptyDocuments = {
  events: [],
  faqs: [],
  gallery: [],
  locations: [],
  media: [],
  menuCategories: [],
  menuItems: [],
  team: [],
  testimonials: [],
}

const asDocument = (value: unknown): Document | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Document
    : null

const relationshipID = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  const document = asDocument(value)
  return typeof document?.id === 'number' || typeof document?.id === 'string'
    ? document.id
    : null
}

const documentTenantID = (value: unknown): number | string | null => {
  const document = asDocument(value)
  return relationshipID(document?.tenantId)
}

const sameID = (
  left: number | string | null,
  right: number | string,
): boolean => left !== null && String(left) === String(right)

export function emptyGheeRoastContent({
  fallbacksEnabled,
  tenantName,
  tenantState,
}: {
  fallbacksEnabled: boolean
  tenantName?: string | null
  tenantState?: Exclude<GheeRoastTenantState, 'active'>
}): GheeRoastContentResult {
  return {
    collections: mapGheeRoastCollections(emptyDocuments, 0, { fallbacksEnabled: false }),
    footer: mapGheeRoastFooter(null, 0, { fallbacksEnabled: false }),
    hero: mapGheeRoastHero(null, 0, { fallbacksEnabled: false }),
    navigation: mapGheeRoastNavigation(null, 0, {
      fallbacksEnabled: false,
      tenantName,
    }),
    page: null,
    seo: {},
    site: mapGheeRoastSite({ name: tenantName }, null, 0, { fallbacksEnabled: false }),
    tenantState: tenantState ?? (fallbacksEnabled ? 'fallback' : 'empty'),
  }
}

export function normalizeGheeRoastPathname(pathname: string): string | null {
  const normalized = normalizePathname(pathname)
  if (normalized === '/') return normalized

  const slug = normalized.slice(1)
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? normalized : null
}

export function gheeRoastContentCacheArguments(
  host: string | null,
  pathname: string,
  site: LocalSite,
): readonly [string | null, string, string, string, LocalThemeKey] {
  return [
    host,
    normalizePathname(pathname),
    site.hostname,
    site.key,
    site.theme,
  ] as const
}

export function getGheeRoastCollectionDependencies(
  pageType: CMSPageType,
  blocks: Array<{ blockType?: string | null }>,
) {
  const blockTypes = new Set(blocks.map((block) => String(block.blockType || '')))
  return {
    events: pageType === 'catering' || blockTypes.has('eventsBlock'),
    faqs: pageType === 'delivery' || pageType === 'faq' || blockTypes.has('faqBlock'),
    gallery: pageType === 'catering' || pageType === 'gallery' || blockTypes.has('galleryBlock'),
    locations: pageType === 'locations' || pageType === 'menu' || blockTypes.has('locationsBlock'),
    menu: pageType === 'menu' || blockTypes.has('menushowcaseBlock'),
    team: pageType === 'about' || blockTypes.has('teamBlock'),
    testimonials: blockTypes.has('testimonialsBlock'),
  }
}

const tenantWhere = (
  tenantID: number | string,
  conditions: Where[] = [],
): Where => ({
  and: [
    { tenantId: { equals: tenantID } },
    ...conditions,
  ],
})

async function findDocuments(
  find: GheeRoastFind,
  {
    collection,
    depth,
    limit,
    sort,
    where,
  }: {
    collection: Exclude<GheeRoastCollectionSlug, 'tenants'>
    depth: number
    limit: number
    sort?: string
    where: Where
  },
): Promise<unknown[]> {
  // Historically this issued an ID-only probe query before the real query, to keep a
  // not-yet-migrated database readable while newer optional CMS fields awaited an approved
  // migration (see M3 performance audit). That migration has long since landed — verified
  // empirically against the live schema that a direct query behaves correctly for both
  // populated and genuinely empty tenant-scoped collections (an empty match just returns no
  // docs, exactly like the probe's "return [] early" path did). A single query is now
  // sufficient; a genuine query failure propagates to the caller like any other query in this
  // loader, rather than being silently treated as "no data."
  const result = await find({
    collection,
    depth,
    draft: false,
    limit,
    overrideAccess: true,
    pagination: false,
    ...(sort ? { sort } : {}),
    where,
  })
  return result.docs
}

const onlyTenantDocuments = (
  documents: unknown[],
  tenantID: number | string,
): unknown[] => documents.filter((document) => sameID(documentTenantID(document), tenantID))

const isPageDocument = (value: unknown): value is GheeRoastPageDocument => {
  const document = asDocument(value)
  return Boolean(
    document
    && typeof document.id === 'number'
    && typeof document.title === 'string'
    && (document._status === 'draft' || document._status === 'published'),
  )
}

const isPublishedPageDocument = (value: unknown): value is GheeRoastPageDocument =>
  isPageDocument(value) && value._status === 'published'

const requireAtMostOne = <T>(
  label: string,
  documents: T[],
): T | undefined => {
  if (documents.length > 1) {
    throw new Error(`Ambiguous Ghee Roast ${label}: expected at most one document, received ${documents.length}.`)
  }
  return documents[0]
}

const pageDocumentFor = (
  documents: GheeRoastPageDocument[],
  page: GheeRoastCMSPage | null,
): GheeRoastPageDocument | undefined => {
  if (!page) return undefined
  return documents.find((document) => sameID(document.id, page.id))
}

export async function loadGheeRoastContentWithPayload({
  fallbacksEnabled,
  find,
  host,
  pathname,
  preResolvedTenant,
  site,
}: {
  fallbacksEnabled: boolean
  find: GheeRoastFind
  host: string | null
  pathname: string
  // Optional tenant already resolved by the caller (e.g. getGheeRoastContent.ts's Phase-1
  // tag lookup) to avoid a second tenants query on a cache miss. Must be depth:2 — see
  // resolveGheeRoastTenant.ts. When omitted, falls back to the original self-contained lookup
  // below, so existing callers/tests are unaffected.
  preResolvedTenant?: Document | null
  site: LocalSite
}): Promise<GheeRoastContentResult> {
  const resolvedSite = resolveLocalSite(host)
  if (
    !resolvedSite
    || resolvedSite.key !== site.key
    || resolvedSite.theme !== site.theme
    || site.theme !== 'ghee-roast'
  ) {
    return emptyGheeRoastContent({
      fallbacksEnabled: false,
      tenantState: 'missing',
    })
  }

  let tenant: Document | undefined
  if (preResolvedTenant !== undefined) {
    tenant = preResolvedTenant && preResolvedTenant.slug === site.key ? preResolvedTenant : undefined
  } else {
    const tenantResult = await find({
      collection: 'tenants',
      depth: 2,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      sort: 'id',
      where: { slug: { equals: site.key } },
    })
    const tenantMatches = tenantResult.docs
      .map(asDocument)
      .filter((tenant): tenant is Document => tenant?.slug === site.key)
    tenant = requireAtMostOne('tenant resolution', tenantMatches)
  }
  if (!tenant) {
    return emptyGheeRoastContent({
      fallbacksEnabled: false,
      tenantState: 'missing',
    })
  }
  if (!tenantCanRenderGheeRoast(tenant)) {
    return emptyGheeRoastContent({
      fallbacksEnabled: false,
      tenantName: typeof tenant.name === 'string' ? tenant.name : null,
      tenantState: 'inactive',
    })
  }

  const tenantID = relationshipID(tenant.id)
  if (tenantID === null) {
    throw new Error('Resolved Ghee Roast tenant is missing a valid ID.')
  }
  const normalizedPathname = normalizeGheeRoastPathname(pathname)
  if (!normalizedPathname) {
    return emptyGheeRoastContent({
      fallbacksEnabled,
      tenantName: typeof tenant.name === 'string' ? tenant.name : null,
    })
  }

  const pageCondition: Where = normalizedPathname === '/'
    ? { isHomePage: { equals: true } }
    : { slug: { equals: normalizedPathname.slice(1) } }
  const publishedPageWhere = tenantWhere(tenantID, [
    pageCondition,
    { _status: { equals: 'published' } },
  ])
  const [
    navigationDocuments,
    pageDocuments,
    settingsDocuments,
    footerDocuments,
    seoDocuments,
  ] = await Promise.all([
    findDocuments(find, {
      collection: 'nav',
      depth: 2,
      limit: 2,
      where: tenantWhere(tenantID, [{ location: { equals: 'header' } }, { _status: { equals: 'published' } }]),
    }),
    findDocuments(find, {
      collection: 'pages',
      depth: 3,
      limit: 2,
      sort: 'id',
      where: publishedPageWhere,
    }),
    findDocuments(find, {
      collection: 'site-settings',
      depth: 1,
      limit: 2,
      where: tenantWhere(tenantID, [{ _status: { equals: 'published' } }]),
    }),
    findDocuments(find, {
      collection: 'footer',
      depth: 1,
      limit: 2,
      where: tenantWhere(tenantID, [{ _status: { equals: 'published' } }]),
    }),
    findDocuments(find, {
      collection: 'seo',
      depth: 2,
      limit: 2,
      where: tenantWhere(tenantID),
    }),
  ])

  const tenantPages = onlyTenantDocuments(pageDocuments, tenantID)
    .filter(isPublishedPageDocument)
  const mappedPages = tenantPages
    .map((document) => mapGheeRoastPage(document, tenantID))
    .filter((page): page is GheeRoastCMSPage => page !== null)
  const page = requireAtMostOne('published page resolution', mappedPages) ?? null
  const rawPage = pageDocumentFor(tenantPages, page)
  const dependencies = getGheeRoastCollectionDependencies(
    page?.pageType ?? 'generic',
    page?.layout ?? [],
  )
  const rawContactMediaIDs = [...new Set((page?.layout ?? [])
    .filter((block) => block.blockType === 'formBlock')
    .flatMap((block) => {
      const candidate = block as unknown as Record<string, unknown>
      return [candidate.sideImage]
    })
    .filter((value): value is number | string => typeof value === 'number' || typeof value === 'string'))]
  const findTenantCollection = (
    collection: Extract<
      GheeRoastCollectionSlug,
      | 'events'
      | 'faqs'
      | 'gallery'
      | 'locations'
      | 'media'
      | 'menu-categories'
      | 'menu-items'
      | 'teammembers'
      | 'testimonials'
    >,
    enabled: boolean,
    sort: string,
    conditions: Where[] = [],
  ): Promise<unknown[]> => enabled
    ? findDocuments(find, {
        collection,
        depth: 2,
        limit: 100,
        sort,
        where: tenantWhere(tenantID, conditions),
      })
    : Promise.resolve([])

  const [
    menuCategories,
    menuItems,
    testimonials,
    gallery,
    locations,
    media,
    team,
    events,
    faqs,
  ] = await Promise.all([
    findTenantCollection('menu-categories', dependencies.menu, 'sortOrder', [
      { isActive: { equals: true } },
    ]),
    findTenantCollection('menu-items', dependencies.menu, 'displayOrder', [
      { isAvailable: { equals: true } },
      { stockStatus: { not_equals: 'out_of_stock' } },
    ]),
    findTenantCollection('testimonials', dependencies.testimonials, 'sortOrder'),
    findTenantCollection('gallery', dependencies.gallery, 'sortOrder'),
    findTenantCollection('locations', dependencies.locations, 'sortOrder', [
      { isActive: { equals: true } },
    ]),
    findTenantCollection('media', rawContactMediaIDs.length > 0, 'id', [
      { id: { in: rawContactMediaIDs } },
    ]),
    findTenantCollection('teammembers', dependencies.team, 'sortOrder', [
      { isActive: { equals: true } },
    ]),
    findTenantCollection('events', dependencies.events, 'startsAt', [
      { status: { equals: 'published' } },
    ]),
    findTenantCollection('faqs', dependencies.faqs, 'sortOrder', [
      { isActive: { equals: true } },
    ]),
  ])

  const navigationDocument = requireAtMostOne(
    'header navigation',
    onlyTenantDocuments(navigationDocuments, tenantID),
  )
  const settingsDocument = requireAtMostOne(
    'site settings',
    onlyTenantDocuments(settingsDocuments, tenantID),
  )
  const footerDocument = requireAtMostOne(
    'footer',
    onlyTenantDocuments(footerDocuments, tenantID),
  )
  const seoDocument = requireAtMostOne(
    'SEO settings',
    onlyTenantDocuments(seoDocuments, tenantID),
  )
  const hasCMSContent = Boolean(
    navigationDocument
    || rawPage
    || settingsDocument
    || footerDocument
    || seoDocument
    || menuCategories.length
    || menuItems.length
    || testimonials.length
    || gallery.length
    || locations.length
    || media.length
    || team.length
    || events.length
    || faqs.length,
  )
  return {
    collections: mapGheeRoastCollections({
      events,
      faqs,
      gallery,
      locations,
      media,
      menuCategories,
      menuItems,
      team,
      testimonials,
    }, tenantID, { fallbacksEnabled: false }),
    footer: mapGheeRoastFooter(footerDocument, tenantID, { fallbacksEnabled: false }),
    hero: mapGheeRoastHero(
      rawPage,
      tenantID,
      { fallbacksEnabled: false },
    ),
    navigation: mapGheeRoastNavigation(
      asDocument(navigationDocument) as Parameters<typeof mapGheeRoastNavigation>[0],
      tenantID,
      {
      fallbacksEnabled: false,
      tenantName: typeof tenant.name === 'string' ? tenant.name : null,
      },
    ),
    page,
    seo: mapGheeRoastSEO(seoDocument, tenantID),
    site: mapGheeRoastSite(tenant, settingsDocument, tenantID, { fallbacksEnabled: false }),
    tenantState: hasCMSContent
      ? 'active'
      : fallbacksEnabled
        ? 'fallback'
        : 'empty',
  }
}
