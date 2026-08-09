import type { Where } from 'payload'
import type {
  BlogPost,
  Event,
  Faq,
  Footer,
  Gallery as GalleryItem,
  Location,
  MenuItem,
  Nav,
  Page,
  SiteSetting,
  Teammember,
  Tenant,
  Testimonial,
} from '../../payload-types'
import { normalizePathname } from '../../themes/zuru-zuru/utils/normalizePathname'
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
  | 'blog-posts'
  | 'events'
  | 'faqs'
  | 'footer'
  | 'gallery'
  | 'locations'
  | 'menu-items'
  | 'nav'
  | 'pages'
  | 'site-settings'
  | 'teammembers'
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
// Any CMS-driven Page — Page document, layout blocks, and blocks' dependent
// collections. Loaded separately from the shell above: every route needs the
// shell, but only CMS-driven routes (Home, Menu, ...) need a Page document and
// its layout-driven collection dependencies. Mirrors the Curious Ladoo loader's
// isHomePage-vs-slug resolution so adding another CMS-driven page later is a
// matter of adding it to `CMS_DRIVEN_PATHS` in the renderer, not writing a new loader.
// ---------------------------------------------------------------------------

export type ZuruZuruPageResult = {
  blogPosts: BlogPost[]
  events: Event[]
  faqs: Faq[]
  galleryItems: GalleryItem[]
  locations: Location[]
  menuItems: MenuItem[]
  page: Page | null
  teamMembers: Teammember[]
  tenant: Tenant | null
  tenantState: ZuruZuruTenantState
  testimonials: Testimonial[]
}

export function emptyZuruZuruPage(tenantState: ZuruZuruTenantState = 'missing'): ZuruZuruPageResult {
  return {
    blogPosts: [],
    events: [],
    faqs: [],
    galleryItems: [],
    locations: [],
    menuItems: [],
    page: null,
    teamMembers: [],
    tenant: null,
    tenantState,
    testimonials: [],
  }
}

export function zuruZuruPageCacheArguments(
  host: string | null,
  pathname: string,
  site: LocalSite,
): readonly [string | null, string, string, string] {
  return [host, normalizePathname(pathname), site.hostname, site.key] as const
}

const collectionDependenciesForZuruZuruLayout = (layout: Page['layout']) => {
  const blockTypes = new Set((layout ?? []).map((block) => block.blockType))
  return {
    blogPosts: blockTypes.has('blogpreviewBlock'),
    events: blockTypes.has('eventsBlock'),
    faqs: blockTypes.has('faqBlock'),
    galleryItems: blockTypes.has('galleryBlock'),
    locations: blockTypes.has('locationsBlock'),
    menuItems: blockTypes.has('menushowcaseBlock'),
    teamMembers: blockTypes.has('teamBlock'),
    testimonials: blockTypes.has('testimonialsBlock'),
  }
}

export async function loadZuruZuruPageWithPayload({
  find,
  host,
  pathname,
  site,
}: {
  find: ZuruZuruFind
  host: string | null
  pathname: string
  site: LocalSite
}): Promise<ZuruZuruPageResult> {
  const resolvedSite = resolveLocalSite(host)
  if (
    !resolvedSite
    || resolvedSite.key !== site.key
    || resolvedSite.theme !== site.theme
    || site.theme !== 'zuru-zuru'
  ) {
    return emptyZuruZuruPage('missing')
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
  if (!tenant) return emptyZuruZuruPage('missing')
  if (!tenantCanRenderZuruZuru(tenant)) return emptyZuruZuruPage('inactive')

  const tenantID = tenant.id

  const normalizedPathname = normalizePathname(pathname)
  const isHome = normalizedPathname === '/'
  const pageCondition: Where = isHome
    ? { isHomePage: { equals: true } }
    : { slug: { equals: normalizedPathname.slice(1) } }

  const pageResult = await find<Page>({
    collection: 'pages',
    depth: 2,
    draft: false,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    sort: 'id',
    where: tenantWhere(tenantID, [pageCondition, { _status: { equals: 'published' } }]),
  })

  // Defense in depth: re-verify tenant, publish status, and the slug/isHomePage condition in
  // application code too, mirroring the Curious Ladoo and shell loaders above rather than
  // trusting the query's `where` clause alone.
  const publishedTenantPages = pageResult.docs.filter((document) => {
    const documentTenantID = typeof document.tenantId === 'number' ? document.tenantId : document.tenantId?.id
    if (documentTenantID !== tenantID || document._status !== 'published') return false
    return isHome
      ? document.isHomePage === true
      : document.isHomePage !== true && document.slug === normalizedPathname.slice(1)
  })
  const page = requireAtMostOne('published page resolution', publishedTenantPages) ?? null

  const dependencies = collectionDependenciesForZuruZuruLayout(page?.layout ?? [])

  const [menuItems, testimonials, locations, faqs, teamMembers, events, blogPosts, galleryItems] = await Promise.all([
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
          // Not filtered to a specific page's "showOn..." flag: each page's locationsBlock
          // selects its own location(s) via an explicit relationship (or falls back to the
          // primary one), so the same active-locations pool safely serves every page.
          where: tenantWhere(tenantID, [{ isActive: { equals: true } }]),
        }).then((result) => result.docs)
      : Promise.resolve([]),
    dependencies.faqs
      ? find<Faq>({
          collection: 'faqs',
          depth: 0,
          draft: false,
          limit: 50,
          overrideAccess: true,
          pagination: false,
          sort: 'sortOrder',
          where: tenantWhere(tenantID, [{ isActive: { equals: true } }]),
        }).then((result) => result.docs)
      : Promise.resolve([]),
    dependencies.teamMembers
      ? find<Teammember>({
          collection: 'teammembers',
          depth: 1,
          draft: false,
          limit: 50,
          overrideAccess: true,
          pagination: false,
          sort: 'sortOrder',
          where: tenantWhere(tenantID, [{ isActive: { equals: true } }]),
        }).then((result) => result.docs)
      : Promise.resolve([]),
    dependencies.events
      ? find<Event>({
          collection: 'events',
          depth: 1,
          draft: false,
          limit: 50,
          overrideAccess: true,
          pagination: false,
          sort: 'startsAt',
          where: tenantWhere(tenantID, [{ status: { equals: 'published' } }]),
        }).then((result) => result.docs)
      : Promise.resolve([]),
    dependencies.blogPosts
      ? find<BlogPost>({
          collection: 'blog-posts',
          depth: 1,
          draft: false,
          limit: 50,
          overrideAccess: true,
          pagination: false,
          sort: '-publishedDate',
          where: tenantWhere(tenantID, [{ _status: { equals: 'published' } }]),
        }).then((result) => result.docs)
      : Promise.resolve([]),
    dependencies.galleryItems
      ? find<GalleryItem>({
          collection: 'gallery',
          depth: 1,
          draft: false,
          limit: 50,
          overrideAccess: true,
          pagination: false,
          sort: 'sortOrder',
          where: tenantWhere(tenantID),
        }).then((result) => result.docs)
      : Promise.resolve([]),
  ])

  return {
    blogPosts,
    events,
    faqs,
    galleryItems,
    locations,
    menuItems,
    page,
    teamMembers,
    tenant,
    tenantState: page ? 'active' : 'empty',
    testimonials,
  }
}
