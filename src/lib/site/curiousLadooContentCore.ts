import type { Where } from 'payload'
import type {
  BlogPost,
  Brand,
  Faq,
  Footer,
  Location,
  Nav,
  Page,
  Portfolio,
  Seo,
  SiteSetting,
  Teammember,
  Tenant,
  Testimonial,
} from '../../payload-types'
import { normalizePathname } from './normalizePathname'
import { resolveLocalSite } from './resolveLocalSite'
import type { LocalSite } from './types'

export type CuriousLadooTenantState = 'active' | 'empty' | 'inactive' | 'missing'

export type CuriousLadooContentResult = {
  blogPosts: BlogPost[]
  brands: Brand[]
  faqs: Faq[]
  footer: Footer | null
  locations: Location[]
  nav: Nav | null
  page: Page | null
  portfolio: Portfolio[]
  seo: Seo | null
  siteSettings: SiteSetting | null
  teamMembers: Teammember[]
  tenant: Tenant | null
  tenantState: CuriousLadooTenantState
  testimonials: Testimonial[]
}

export type CuriousLadooCollectionSlug =
  | 'blog-posts'
  | 'brands'
  | 'faqs'
  | 'footer'
  | 'locations'
  | 'nav'
  | 'pages'
  | 'portfolio'
  | 'seo'
  | 'site-settings'
  | 'teammembers'
  | 'tenants'
  | 'testimonials'

export type CuriousLadooFindArgs = {
  collection: CuriousLadooCollectionSlug
  depth: number
  draft: false
  limit: number
  overrideAccess: true
  pagination: false
  sort?: string
  where: Where
}

/** Injectable so tests can supply a fake without touching the database. */
export type CuriousLadooFind = <TDoc>(
  args: CuriousLadooFindArgs,
) => Promise<{ docs: TDoc[] }>

export function emptyCuriousLadooContent(
  tenantState: CuriousLadooTenantState = 'missing',
): CuriousLadooContentResult {
  return {
    blogPosts: [],
    brands: [],
    faqs: [],
    footer: null,
    locations: [],
    nav: null,
    page: null,
    portfolio: [],
    seo: null,
    siteSettings: null,
    teamMembers: [],
    tenant: null,
    tenantState,
    testimonials: [],
  }
}

export function normalizeCuriousLadooPathname(pathname: string): string | null {
  const normalized = normalizePathname(pathname)
  if (normalized === '/') return normalized
  const slug = normalized.slice(1)
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? normalized : null
}

export function curiousLadooContentCacheArguments(
  host: string | null,
  pathname: string,
  site: LocalSite,
): readonly [string | null, string, string, string] {
  return [host, normalizePathname(pathname), site.hostname, site.key] as const
}

const tenantCanRenderCuriousLadoo = (tenant: Tenant): boolean =>
  tenant.isActive !== false && tenant.theme === 'curious-hub'

const tenantWhere = (tenantID: number, conditions: Where[] = []): Where => ({
  and: [{ tenantId: { equals: tenantID } }, ...conditions],
})

const requireAtMostOne = <T>(label: string, documents: T[]): T | undefined => {
  if (documents.length > 1) {
    throw new Error(
      `Ambiguous Curious Ladoo ${label}: expected at most one document, received ${documents.length}.`,
    )
  }
  return documents[0]
}

/**
 * Two-phase fetch: an ID-only probe first, then the real query bounded to those IDs. Mirrors
 * the Ghee Roast loader's approach so an empty/partial database stays readable without crashing,
 * while a populated one still gets a single bounded query for the real documents.
 */
async function findDocuments<TDoc extends { id: number }>(
  find: CuriousLadooFind,
  {
    collection,
    depth,
    limit,
    sort,
    where,
  }: {
    collection: Exclude<CuriousLadooCollectionSlug, 'tenants'>
    depth: number
    limit: number
    sort?: string
    where: Where
  },
): Promise<TDoc[]> {
  // Previously issued an ID-only probe query before the real query (same historical reason as
  // Ghee Roast's identical pattern — see gheeRoastContentCore.ts's findDocuments). Verified
  // empirically against the live schema that a single direct query behaves correctly for both
  // populated and genuinely empty tenant-scoped collections; collapsed to one query as the
  // normal path (M3 performance work).
  const result = await find<TDoc>({
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

const collectionDependenciesForLayout = (layout: Page['layout']) => {
  const blockTypes = new Set((layout ?? []).map((block) => block.blockType))
  return {
    blogPosts: blockTypes.has('blogpreviewBlock'),
    brands: blockTypes.has('brandsshowcaseBlock'),
    faqs: blockTypes.has('faqBlock'),
    locations: blockTypes.has('formBlock'),
    portfolio: blockTypes.has('portfolioshowcaseBlock'),
    teamMembers: blockTypes.has('teamBlock'),
    testimonials: blockTypes.has('testimonialsBlock'),
  }
}

export async function loadCuriousLadooContentWithPayload({
  find,
  host,
  pathname,
  preResolvedTenant,
  site,
}: {
  find: CuriousLadooFind
  host: string | null
  pathname: string
  // Optional tenant already resolved by the caller (e.g. getCuriousLadooContent.ts's Phase-1 tag
  // lookup) to avoid a second tenants query on a cache miss. Must be depth:0, matching this
  // function's own lookup below — see resolveCuriousLadooTenant.ts. When omitted, falls back to
  // the original self-contained lookup, so existing callers/tests are unaffected.
  preResolvedTenant?: null | Tenant
  site: LocalSite
}): Promise<CuriousLadooContentResult> {
  const resolvedSite = resolveLocalSite(host)
  if (
    !resolvedSite
    || resolvedSite.key !== site.key
    || resolvedSite.theme !== site.theme
    || site.theme !== 'curious-hub'
  ) {
    return emptyCuriousLadooContent('missing')
  }

  let tenant: Tenant | undefined
  if (preResolvedTenant !== undefined) {
    tenant = preResolvedTenant && preResolvedTenant.slug === site.key ? preResolvedTenant : undefined
  } else {
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
    tenant = requireAtMostOne('tenant resolution', tenantResult.docs)
  }
  if (!tenant) return emptyCuriousLadooContent('missing')
  if (!tenantCanRenderCuriousLadoo(tenant)) return emptyCuriousLadooContent('inactive')

  const tenantID = tenant.id

  const normalizedPathname = normalizeCuriousLadooPathname(pathname)
  if (!normalizedPathname) {
    return { ...emptyCuriousLadooContent('empty'), tenant, tenantState: 'empty' }
  }

  const pageCondition: Where = normalizedPathname === '/'
    ? { isHomePage: { equals: true } }
    : { slug: { equals: normalizedPathname.slice(1) } }
  const publishedPageWhere = tenantWhere(tenantID, [
    pageCondition,
    { _status: { equals: 'published' } },
  ])

  const [navDocs, pageDocs, settingsDocs, footerDocs, seoDocs] = await Promise.all([
    findDocuments<Nav>(find, {
      collection: 'nav',
      depth: 2,
      limit: 2,
      where: tenantWhere(tenantID, [{ location: { equals: 'header' } }, { _status: { equals: 'published' } }]),
    }),
    findDocuments<Page>(find, {
      collection: 'pages',
      depth: 2,
      limit: 2,
      sort: 'id',
      where: publishedPageWhere,
    }),
    findDocuments<SiteSetting>(find, {
      collection: 'site-settings',
      depth: 1,
      limit: 2,
      where: tenantWhere(tenantID, [{ _status: { equals: 'published' } }]),
    }),
    findDocuments<Footer>(find, {
      collection: 'footer',
      depth: 1,
      limit: 2,
      where: tenantWhere(tenantID, [{ _status: { equals: 'published' } }]),
    }),
    findDocuments<Seo>(find, {
      collection: 'seo',
      depth: 2,
      limit: 2,
      where: tenantWhere(tenantID),
    }),
  ])

  // Defense in depth: don't rely solely on the query's `where` clause. Re-verify tenant, publish
  // status, and the slug/isHomePage condition in application code too, mirroring the Ghee Roast
  // loader's pattern. tenantId may be a raw ID or a populated Tenant depending on query depth, so
  // check both shapes.
  const publishedTenantPages = pageDocs.filter((document) => {
    const documentTenantID = typeof document.tenantId === 'number'
      ? document.tenantId
      : document.tenantId?.id
    if (documentTenantID !== tenantID || document._status !== 'published') return false
    return normalizedPathname === '/'
      ? document.isHomePage === true
      : document.isHomePage !== true && document.slug === normalizedPathname.slice(1)
  })
  const page = requireAtMostOne('published page resolution', publishedTenantPages) ?? null
  const dependencies = collectionDependenciesForLayout(page?.layout ?? [])

  const [brands, testimonials, teamMembers, blogPosts, faqs, portfolio, locations] = await Promise.all([
    dependencies.brands
      ? findDocuments<Brand>(find, {
          collection: 'brands',
          depth: 2,
          limit: 50,
          sort: 'sortOrder',
          where: tenantWhere(tenantID, [{ enabled: { equals: true } }]),
        })
      : Promise.resolve([]),
    dependencies.testimonials
      ? findDocuments<Testimonial>(find, {
          collection: 'testimonials',
          depth: 1,
          limit: 50,
          sort: 'sortOrder',
          where: tenantWhere(tenantID),
        })
      : Promise.resolve([]),
    dependencies.teamMembers
      ? findDocuments<Teammember>(find, {
          collection: 'teammembers',
          depth: 1,
          limit: 50,
          sort: 'sortOrder',
          where: tenantWhere(tenantID, [{ isActive: { equals: true } }]),
        })
      : Promise.resolve([]),
    dependencies.blogPosts
      ? findDocuments<BlogPost>(find, {
          collection: 'blog-posts',
          depth: 1,
          limit: 50,
          sort: '-publishedDate',
          where: tenantWhere(tenantID, [{ _status: { equals: 'published' } }]),
        })
      : Promise.resolve([]),
    dependencies.faqs
      ? findDocuments<Faq>(find, {
          collection: 'faqs',
          depth: 0,
          limit: 50,
          sort: 'sortOrder',
          where: tenantWhere(tenantID, [{ isActive: { equals: true } }]),
        })
      : Promise.resolve([]),
    dependencies.portfolio
      ? findDocuments<Portfolio>(find, {
          collection: 'portfolio',
          depth: 2,
          limit: 50,
          sort: 'sortOrder',
          where: tenantWhere(tenantID, [{ enabled: { equals: true } }]),
        })
      : Promise.resolve([]),
    dependencies.locations
      ? findDocuments<Location>(find, {
          collection: 'locations',
          depth: 0,
          limit: 50,
          sort: 'sortOrder',
          where: tenantWhere(tenantID, [{ isActive: { equals: true } }, { showOnContact: { equals: true } }]),
        })
      : Promise.resolve([]),
  ])

  const nav = requireAtMostOne('header navigation', navDocs) ?? null
  const siteSettings = requireAtMostOne('site settings', settingsDocs) ?? null
  const footer = requireAtMostOne('footer', footerDocs) ?? null
  const seo = requireAtMostOne('SEO settings', seoDocs) ?? null

  const hasCMSContent = Boolean(
    page || nav || siteSettings || footer || seo
    || brands.length || testimonials.length || teamMembers.length || blogPosts.length || faqs.length
    || portfolio.length || locations.length,
  )

  return {
    blogPosts,
    brands,
    faqs,
    footer,
    locations,
    nav,
    page,
    portfolio,
    seo,
    siteSettings,
    teamMembers,
    tenant,
    tenantState: hasCMSContent ? 'active' : 'empty',
    testimonials,
  }
}

// ---------------------------------------------------------------------------
// Blog post detail — blog posts are not Pages, so they're resolved independently
// of the layout/block pipeline above: fetched directly by tenant + slug.
// ---------------------------------------------------------------------------

export type CuriousLadooBlogPostResult = {
  footer: Footer | null
  nav: Nav | null
  post: BlogPost | null
  relatedPosts: BlogPost[]
  seo: Seo | null
  siteSettings: SiteSetting | null
  tenant: Tenant | null
  tenantState: CuriousLadooTenantState
}

export function emptyCuriousLadooBlogPost(
  tenantState: CuriousLadooTenantState = 'missing',
): CuriousLadooBlogPostResult {
  return {
    footer: null,
    nav: null,
    post: null,
    relatedPosts: [],
    seo: null,
    siteSettings: null,
    tenant: null,
    tenantState,
  }
}

export async function loadCuriousLadooBlogPostWithPayload({
  find,
  host,
  preResolvedTenant,
  site,
  slug,
}: {
  find: CuriousLadooFind
  host: string | null
  // See loadCuriousLadooContentWithPayload's preResolvedTenant doc — identical contract.
  preResolvedTenant?: null | Tenant
  site: LocalSite
  slug: string
}): Promise<CuriousLadooBlogPostResult> {
  const resolvedSite = resolveLocalSite(host)
  if (
    !resolvedSite
    || resolvedSite.key !== site.key
    || resolvedSite.theme !== site.theme
    || site.theme !== 'curious-hub'
  ) {
    return emptyCuriousLadooBlogPost('missing')
  }

  const normalizedSlug = slug.trim().toLowerCase()
  if (!normalizedSlug) return emptyCuriousLadooBlogPost('missing')

  let tenant: Tenant | undefined
  if (preResolvedTenant !== undefined) {
    tenant = preResolvedTenant && preResolvedTenant.slug === site.key ? preResolvedTenant : undefined
  } else {
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
    tenant = requireAtMostOne('tenant resolution', tenantResult.docs)
  }
  if (!tenant) return emptyCuriousLadooBlogPost('missing')
  if (!tenantCanRenderCuriousLadoo(tenant)) return emptyCuriousLadooBlogPost('inactive')

  const tenantID = tenant.id

  const [navResult, settingsResult, footerResult, seoResult, postResult] = await Promise.all([
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
    find<Seo>({
      collection: 'seo',
      depth: 2,
      draft: false,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: tenantWhere(tenantID),
    }),
    // Bounded to 2 (not 1) so an accidental duplicate slug is treated as ambiguous and rejected
    // by requireAtMostOne below, rather than silently picking whichever document sorts first.
    find<BlogPost>({
      collection: 'blog-posts',
      depth: 2,
      draft: false,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: tenantWhere(tenantID, [{ slug: { equals: normalizedSlug } }, { status: { equals: 'published' } }]),
    }),
  ])

  const nav = requireAtMostOne('header navigation', navResult.docs) ?? null
  const siteSettings = requireAtMostOne('site settings', settingsResult.docs) ?? null
  const footer = requireAtMostOne('footer', footerResult.docs) ?? null
  const seo = requireAtMostOne('SEO settings', seoResult.docs) ?? null

  // Defense in depth: don't rely solely on the query's `where` clause, mirroring every other
  // Curious Ladoo loader in this file. tenantId may be a raw ID or a populated Tenant depending
  // on query depth, so check both shapes. This is also what makes cross-tenant slug guessing
  // impossible: a slug that exists only under a different tenant never survives this filter.
  const publishedTenantPosts = postResult.docs.filter((document) => {
    const documentTenantID = typeof document.tenantId === 'number' ? document.tenantId : document.tenantId?.id
    return documentTenantID === tenantID && document.status === 'published' && document.slug === normalizedSlug
  })
  const post = requireAtMostOne('blog post resolution', publishedTenantPosts) ?? null

  const relatedPosts = (post?.relatedPosts ?? [])
    .filter((entry): entry is BlogPost => typeof entry === 'object' && entry !== null)
    .filter((related) => {
      const relatedTenantID = typeof related.tenantId === 'number' ? related.tenantId : related.tenantId?.id
      return relatedTenantID === tenantID && related.status === 'published'
    })

  return {
    footer,
    nav,
    post,
    relatedPosts,
    seo,
    siteSettings,
    tenant,
    tenantState: post ? 'active' : 'empty',
  }
}
