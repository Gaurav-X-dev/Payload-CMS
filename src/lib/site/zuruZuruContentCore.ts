import type { Where } from 'payload'
import type {
  Footer,
  Location,
  MenuItem,
  Nav,
  Page,
  SiteSetting,
  Tenant,
  Testimonial,
} from '../../payload-types'
import { resolveLocalSite } from './resolveLocalSite'
import type { LocalSite } from './types'

export type ZuruZuruTenantState = 'active' | 'empty' | 'inactive' | 'missing'

export type ZuruZuruShellResult = {
  footer: Footer | null
  nav: Nav | null
  siteSettings: SiteSetting | null
  tenant: Tenant | null
  tenantState: ZuruZuruTenantState
}

export type ZuruZuruCollectionSlug =
  | 'footer'
  | 'locations'
  | 'menu-items'
  | 'nav'
  | 'pages'
  | 'site-settings'
  | 'tenants'
  | 'testimonials'

export type ZuruZuruFindArgs = {
  collection: ZuruZuruCollectionSlug
  depth: number
  draft: false
  limit: number
  overrideAccess: true
  pagination: false
  sort?: string
  where: Where
}

/** Injectable so tests can supply a fake without touching the database. */
export type ZuruZuruFind = <TDoc>(args: ZuruZuruFindArgs) => Promise<{ docs: TDoc[] }>

export function emptyZuruZuruShell(tenantState: ZuruZuruTenantState = 'missing'): ZuruZuruShellResult {
  return {
    footer: null,
    nav: null,
    siteSettings: null,
    tenant: null,
    tenantState,
  }
}

const tenantCanRenderZuruZuru = (tenant: Tenant): boolean =>
  tenant.isActive !== false && tenant.theme === 'zuru-zuru'

const tenantWhere = (tenantID: number, conditions: Where[] = []): Where => ({
  and: [{ tenantId: { equals: tenantID } }, ...conditions],
})

const requireAtMostOne = <T>(label: string, documents: T[]): T | undefined => {
  if (documents.length > 1) {
    throw new Error(`Ambiguous Zuru Zuru ${label}: expected at most one document, received ${documents.length}.`)
  }
  return documents[0]
}

export function zuruZuruShellCacheArguments(
  host: string | null,
  site: LocalSite,
): readonly [string | null, string, string] {
  return [host, site.hostname, site.key] as const
}

/**
 * Fetches only the tenant/Nav/Footer/SiteSettings global shell — no Pages, blocks, or any
 * page-body collection. Zuru Zuru's pages are not yet CMS-driven (Milestone Z2 scope is the
 * global shell only), so the page body keeps rendering from the existing static React
 * components; only Header/Footer/the announcement bar read from this result.
 */
export async function loadZuruZuruShellWithPayload({
  find,
  host,
  site,
}: {
  find: ZuruZuruFind
  host: string | null
  site: LocalSite
}): Promise<ZuruZuruShellResult> {
  const resolvedSite = resolveLocalSite(host)
  if (
    !resolvedSite
    || resolvedSite.key !== site.key
    || resolvedSite.theme !== site.theme
    || site.theme !== 'zuru-zuru'
  ) {
    return emptyZuruZuruShell('missing')
  }

  const tenantResult = await find<Tenant>({
    collection: 'tenants',
    depth: 1,
    draft: false,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    sort: 'id',
    where: { slug: { equals: site.key } },
  })
  const tenant = requireAtMostOne('tenant resolution', tenantResult.docs)
  if (!tenant) return emptyZuruZuruShell('missing')
  if (!tenantCanRenderZuruZuru(tenant)) return emptyZuruZuruShell('inactive')

  const tenantID = tenant.id

  const [navResult, settingsResult, footerResult] = await Promise.all([
    find<Nav>({
      collection: 'nav',
      depth: 2,
      draft: false,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: tenantWhere(tenantID, [{ location: { equals: 'header' } }, { _status: { equals: 'published' } }]),
    }),
    find<SiteSetting>({
      collection: 'site-settings',
      depth: 1,
      draft: false,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: tenantWhere(tenantID, [{ _status: { equals: 'published' } }]),
    }),
    find<Footer>({
      collection: 'footer',
      depth: 1,
      draft: false,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: tenantWhere(tenantID, [{ _status: { equals: 'published' } }]),
    }),
  ])

  const nav = requireAtMostOne('header navigation', navResult.docs) ?? null
  const siteSettings = requireAtMostOne('site settings', settingsResult.docs) ?? null
  const footer = requireAtMostOne('footer', footerResult.docs) ?? null

  const hasCMSContent = Boolean(nav || siteSettings || footer)

  return {
    footer,
    nav,
    siteSettings,
    tenant,
    tenantState: hasCMSContent ? 'active' : 'empty',
  }
}

// ---------------------------------------------------------------------------
// Home page — Page document, layout blocks, and blocks' dependent collections.
// Loaded separately from the shell above: every route needs the shell, but only
// `/` needs the Home Page and its layout-driven collection dependencies.
// ---------------------------------------------------------------------------

export type ZuruZuruHomeResult = {
  locations: Location[]
  menuItems: MenuItem[]
  page: Page | null
  tenant: Tenant | null
  tenantState: ZuruZuruTenantState
  testimonials: Testimonial[]
}

export function emptyZuruZuruHome(tenantState: ZuruZuruTenantState = 'missing'): ZuruZuruHomeResult {
  return {
    locations: [],
    menuItems: [],
    page: null,
    tenant: null,
    tenantState,
    testimonials: [],
  }
}

export function zuruZuruHomeCacheArguments(
  host: string | null,
  site: LocalSite,
): readonly [string | null, string, string] {
  return [host, site.hostname, site.key] as const
}

const collectionDependenciesForZuruZuruLayout = (layout: Page['layout']) => {
  const blockTypes = new Set((layout ?? []).map((block) => block.blockType))
  return {
    locations: blockTypes.has('locationsBlock'),
    menuItems: blockTypes.has('menushowcaseBlock'),
    testimonials: blockTypes.has('testimonialsBlock'),
  }
}

export async function loadZuruZuruHomeWithPayload({
  find,
  host,
  site,
}: {
  find: ZuruZuruFind
  host: string | null
  site: LocalSite
}): Promise<ZuruZuruHomeResult> {
  const resolvedSite = resolveLocalSite(host)
  if (
    !resolvedSite
    || resolvedSite.key !== site.key
    || resolvedSite.theme !== site.theme
    || site.theme !== 'zuru-zuru'
  ) {
    return emptyZuruZuruHome('missing')
  }

  const tenantResult = await find<Tenant>({
    collection: 'tenants',
    depth: 0,
    draft: false,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    sort: 'id',
    where: { slug: { equals: site.key } },
  })
  const tenant = requireAtMostOne('tenant resolution', tenantResult.docs)
  if (!tenant) return emptyZuruZuruHome('missing')
  if (!tenantCanRenderZuruZuru(tenant)) return emptyZuruZuruHome('inactive')

  const tenantID = tenant.id

  const pageResult = await find<Page>({
    collection: 'pages',
    depth: 2,
    draft: false,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    sort: 'id',
    where: tenantWhere(tenantID, [{ isHomePage: { equals: true } }, { _status: { equals: 'published' } }]),
  })

  // Defense in depth: re-verify tenant, publish status, and isHomePage in application code too,
  // mirroring the Curious Ladoo and shell loaders above rather than trusting the query alone.
  const publishedHomePages = pageResult.docs.filter((document) => {
    const documentTenantID = typeof document.tenantId === 'number' ? document.tenantId : document.tenantId?.id
    return documentTenantID === tenantID && document._status === 'published' && document.isHomePage === true
  })
  const page = requireAtMostOne('published Home page resolution', publishedHomePages) ?? null

  const dependencies = collectionDependenciesForZuruZuruLayout(page?.layout ?? [])

  const [menuItems, testimonials, locations] = await Promise.all([
    dependencies.menuItems
      ? find<MenuItem>({
          collection: 'menu-items',
          depth: 1,
          draft: false,
          limit: 100,
          overrideAccess: true,
          pagination: false,
          sort: 'displayOrder',
          where: tenantWhere(tenantID, [{ isAvailable: { equals: true } }]),
        }).then((result) => result.docs)
      : Promise.resolve([]),
    dependencies.testimonials
      ? find<Testimonial>({
          collection: 'testimonials',
          depth: 1,
          draft: false,
          limit: 50,
          overrideAccess: true,
          pagination: false,
          sort: 'sortOrder',
          where: tenantWhere(tenantID),
        }).then((result) => result.docs)
      : Promise.resolve([]),
    dependencies.locations
      ? find<Location>({
          collection: 'locations',
          depth: 0,
          draft: false,
          limit: 50,
          overrideAccess: true,
          pagination: false,
          sort: 'sortOrder',
          where: tenantWhere(tenantID, [{ isActive: { equals: true } }, { showOnHome: { equals: true } }]),
        }).then((result) => result.docs)
      : Promise.resolve([]),
  ])

  return {
    locations,
    menuItems,
    page,
    tenant,
    tenantState: page ? 'active' : 'empty',
    testimonials,
  }
}
