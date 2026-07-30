import type { Where } from 'payload'
import {
  fallbackGheeRoastHero,
  fallbackGheeRoastNavigation,
  mapGheeRoastCollections,
  mapGheeRoastFooter,
  mapGheeRoastHero,
  mapGheeRoastNavigation,
  mapGheeRoastPage,
  mapGheeRoastSEO,
  mapGheeRoastSite,
} from '../../themes/ghee-roast/mappers/cmsContent'
import type {
  GheeRoastCMSPage,
  GheeRoastDynamicContent,
} from '../../themes/ghee-roast/dynamicTypes'
import { normalizePathname } from '../../themes/ghee-roast/utils/normalizePathname'
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
    collections: mapGheeRoastCollections(emptyDocuments, 0, { fallbacksEnabled }),
    footer: mapGheeRoastFooter(null, 0, { fallbacksEnabled }),
    hero: fallbacksEnabled
      ? fallbackGheeRoastHero()
      : mapGheeRoastHero(null, 0, { fallbacksEnabled: false }),
    navigation: fallbacksEnabled
      ? fallbackGheeRoastNavigation()
      : mapGheeRoastNavigation(null, 0, { fallbacksEnabled: false, tenantName }),
    page: null,
    seo: {},
    site: mapGheeRoastSite({ name: tenantName }, null, 0, { fallbacksEnabled }),
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
  pathname: string,
  blocks: Array<Record<string, unknown>>,
) {
  const blockTypes = new Set(blocks.map((block) => String(block.blockType || '')))
  const home = pathname === '/'
  return {
    events: pathname === '/catering' || blockTypes.has('eventsBlock'),
    faqs: pathname === '/delivery' || blockTypes.has('faqBlock'),
    gallery: home || pathname === '/catering' || blockTypes.has('galleryBlock'),
    locations: pathname === '/contact' || pathname === '/menu' || blockTypes.has('locationsBlock'),
    menu: home || pathname === '/menu' || blockTypes.has('menushowcaseBlock'),
    team: pathname === '/about' || blockTypes.has('teamBlock'),
    testimonials: home || blockTypes.has('testimonialsBlock'),
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
    probeWhere,
    sort,
    where,
  }: {
    collection: Exclude<GheeRoastCollectionSlug, 'tenants'>
    depth: number
    limit: number
    probeWhere?: Where
    sort?: string
    where: Where
  },
): Promise<unknown[]> {
  // The ID-only probe keeps the legacy zero-content database readable even
  // while newer optional CMS fields await an explicitly approved migration.
  // Populated databases perform the full query immediately afterwards.
  const probe = await find({
    collection,
    depth: 0,
    limit,
    overrideAccess: true,
    pagination: false,
    select: { id: true, tenantId: true },
    where: probeWhere ?? where,
  })
  const ids = probe.docs
    .map((document) => relationshipID(document))
    .filter((id): id is number | string => id !== null)
  if (ids.length === 0) return []

  const result = await find({
    collection,
    depth,
    limit,
    overrideAccess: true,
    pagination: false,
    ...(sort ? { sort } : {}),
    where: {
      and: [
        where,
        { id: { in: ids } },
      ],
    },
  })
  return result.docs
}

const onlyTenantDocuments = (
  documents: unknown[],
  tenantID: number | string,
): unknown[] => documents.filter((document) => sameID(documentTenantID(document), tenantID))

const isPublishedPageDocument = (value: unknown): boolean => {
  const document = asDocument(value)
  if (!document || document.status !== 'published') return false
  return document._status === undefined || document._status === 'published'
}

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
  documents: unknown[],
  page: GheeRoastCMSPage | null,
): unknown | undefined => {
  if (!page) return undefined
  return documents.find((document) => {
    const value = asDocument(document)
    return sameID(relationshipID(value?.id), page.id)
  })
}

export async function loadGheeRoastContentWithPayload({
  fallbacksEnabled,
  find,
  host,
  pathname,
  site,
}: {
  fallbacksEnabled: boolean
  find: GheeRoastFind
  host: string | null
  pathname: string
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
  const tenant = requireAtMostOne('tenant resolution', tenantMatches)
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
    { status: { equals: 'published' } },
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
      where: tenantWhere(tenantID, [{ location: { equals: 'header' } }]),
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
      where: tenantWhere(tenantID),
    }),
    findDocuments(find, {
      collection: 'footer',
      depth: 1,
      limit: 2,
      where: tenantWhere(tenantID),
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
    normalizedPathname,
    page?.layout ?? [],
  )
  const findTenantCollection = (
    collection: Extract<
      GheeRoastCollectionSlug,
      | 'events'
      | 'faqs'
      | 'gallery'
      | 'locations'
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
        probeWhere: tenantWhere(tenantID),
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
    || team.length
    || events.length
    || faqs.length,
  )
  // A valid tenant with no CMS rows must retain the complete legacy site.
  // The environment flag controls partial field/section merging once any CMS
  // content exists; it must never let an unknown tenant enter fallback mode.
  const useFallbacks = fallbacksEnabled || !hasCMSContent

  return {
    collections: mapGheeRoastCollections({
      events,
      faqs,
      gallery,
      locations,
      menuCategories,
      menuItems,
      team,
      testimonials,
    }, tenantID, { fallbacksEnabled: useFallbacks }),
    footer: mapGheeRoastFooter(footerDocument, tenantID, { fallbacksEnabled: useFallbacks }),
    hero: mapGheeRoastHero(
      asDocument(rawPage) as Parameters<typeof mapGheeRoastHero>[0],
      tenantID,
      { fallbacksEnabled: useFallbacks },
    ),
    navigation: mapGheeRoastNavigation(
      asDocument(navigationDocument) as Parameters<typeof mapGheeRoastNavigation>[0],
      tenantID,
      {
      fallbacksEnabled: useFallbacks,
      tenantName: typeof tenant.name === 'string' ? tenant.name : null,
      },
    ),
    page,
    seo: mapGheeRoastSEO(seoDocument, tenantID),
    site: mapGheeRoastSite(tenant, settingsDocument, tenantID, { fallbacksEnabled: useFallbacks }),
    tenantState: hasCMSContent
      ? 'active'
      : 'fallback',
  }
}
