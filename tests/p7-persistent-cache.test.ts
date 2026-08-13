// P7: persistent cross-request caching (unstable_cache) for Ghee Roast, Curious Ladoo, and Zuru
// Zuru content loaders. These tests cover what P2-P6 didn't already: the shared normalizePathname
// module used as the cache-identity key, cache-argument tuples differing per tenant (not just per
// host/pathname), the preResolvedTenant fast path added to avoid a second tenants query on a
// cache miss, and — critically — that this fast path never trusts a tenant whose slug doesn't
// match the requested site (the same tenant-isolation guarantee the original find-based lookup
// already had).
import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePathname } from '../src/lib/site/normalizePathname.ts'
import {
  gheeRoastContentCacheArguments,
  loadGheeRoastContentWithPayload,
  type GheeRoastCollectionSlug,
  type GheeRoastFind,
  type GheeRoastFindArgs,
} from '../src/lib/site/gheeRoastContentCore.ts'
import {
  curiousLadooContentCacheArguments,
  loadCuriousLadooBlogPostWithPayload,
  loadCuriousLadooContentWithPayload,
  type CuriousLadooCollectionSlug,
  type CuriousLadooFind,
  type CuriousLadooFindArgs,
} from '../src/lib/site/curiousLadooContentCore.ts'
import {
  loadZuruZuruPageWithPayload,
  loadZuruZuruShellWithPayload,
  type ZuruZuruCollectionSlug,
  type ZuruZuruFind,
  type ZuruZuruFindArgs,
} from '../src/lib/site/zuruZuruContentCore.ts'
import type { LocalSite } from '../src/lib/site/types.ts'

// ---------------------------------------------------------------------------
// Shared normalizePathname — the cache-identity key used by every loader below
// ---------------------------------------------------------------------------

test('normalizePathname: trailing/leading/duplicate slashes, empty input, and query/hash stripping', () => {
  assert.equal(normalizePathname(''), '/')
  assert.equal(normalizePathname(null), '/')
  assert.equal(normalizePathname(undefined), '/')
  assert.equal(normalizePathname('/'), '/')
  assert.equal(normalizePathname('about'), '/about')
  assert.equal(normalizePathname('/about/'), '/about')
  assert.equal(normalizePathname('//menu//'), '/menu')
  assert.equal(normalizePathname('menu/'), '/menu')
  assert.equal(normalizePathname('/blog/my-post?ref=ad&utm_source=x'), '/blog/my-post')
  assert.equal(normalizePathname('/blog/my-post#section-2'), '/blog/my-post')
  assert.equal(normalizePathname('/blog/my-post/?ref=ad#top'), '/blog/my-post')
  assert.equal(normalizePathname('?ref=ad'), '/')
})

test('normalizePathname: equivalent paths normalize to the identical cache-key string', () => {
  const variants = ['/about', '/about/', '//about', 'about', 'about/', '/about?utm=1', '/about#top']
  const normalized = variants.map((value) => normalizePathname(value))
  assert.ok(normalized.every((value) => value === '/about'))
})

test('all three theme-specific normalizePathname re-exports resolve to the same shared implementation', async () => {
  const gheeRoast = await import('../src/themes/ghee-roast/utils/normalizePathname.ts')
  const curiousHub = await import('../src/themes/curious-hub/utils/normalizePathname.ts')
  const zuruZuru = await import('../src/themes/zuru-zuru/utils/normalizePathname.ts')
  assert.equal(gheeRoast.normalizePathname, normalizePathname)
  assert.equal(curiousHub.normalizePathname, normalizePathname)
  assert.equal(zuruZuru.normalizePathname, normalizePathname)
})

// ---------------------------------------------------------------------------
// Cache identity differs per tenant, not just per host/pathname
// ---------------------------------------------------------------------------

test('gheeRoastContentCacheArguments: same host/pathname but a different site.key produces a different cache key', () => {
  const siteA = { hostname: 'ghee-roast.localhost', key: 'ghee-roast', theme: 'ghee-roast' } as const satisfies LocalSite
  const siteB = { hostname: 'ghee-roast.localhost', key: 'ghee-roast-2', theme: 'ghee-roast' } as const satisfies LocalSite
  const a = gheeRoastContentCacheArguments('ghee-roast.localhost:3000', '/menu', siteA)
  const b = gheeRoastContentCacheArguments('ghee-roast.localhost:3000', '/menu', siteB)
  assert.notDeepEqual(a, b)
  assert.equal(a[2], b[2], 'sanity check: hostnames were intentionally identical')
})

test('curiousLadooContentCacheArguments: same host/pathname but a different site.key produces a different cache key', () => {
  const siteA = { hostname: 'curious-hub.localhost', key: 'curious-ladoo', theme: 'curious-hub' } as const satisfies LocalSite
  const siteB = { hostname: 'curious-hub.localhost', key: 'curious-ladoo-2', theme: 'curious-hub' } as const satisfies LocalSite
  const a = curiousLadooContentCacheArguments('curious-hub.localhost:3000', '/about', siteA)
  const b = curiousLadooContentCacheArguments('curious-hub.localhost:3000', '/about', siteB)
  assert.notDeepEqual(a, b)
})

test('cache-argument tuples never carry raw hostname as the sole differentiator — normalized pathname is stable across equivalent URLs', () => {
  const site = { hostname: 'ghee-roast.localhost', key: 'ghee-roast', theme: 'ghee-roast' } as const satisfies LocalSite
  const a = gheeRoastContentCacheArguments('ghee-roast.localhost:3000', '/menu/', site)
  const b = gheeRoastContentCacheArguments('ghee-roast.localhost:3000', '/menu?ref=qr', site)
  assert.deepEqual(a, b)
})

// ---------------------------------------------------------------------------
// Ghee Roast — preResolvedTenant fast path (avoids a second tenants query on a cache miss)
// ---------------------------------------------------------------------------

const gheeRoastSite = {
  hostname: 'ghee-roast.localhost',
  key: 'ghee-roast',
  theme: 'ghee-roast',
} as const satisfies LocalSite

const gheeRoastTenant = {
  id: 42,
  isActive: true,
  name: 'Fixture Ghee Roast',
  slug: 'ghee-roast',
  theme: 'ghee-roast',
}

type GheeRoastFixtures = Partial<Record<GheeRoastCollectionSlug, unknown[]>>

const fakeGheeRoastPayload = (fixtures: GheeRoastFixtures) => {
  const calls: GheeRoastFindArgs[] = []
  const find: GheeRoastFind = async (args) => {
    calls.push(args)
    return { docs: fixtures[args.collection] ?? [] }
  }
  return { calls, find }
}

test('loadGheeRoastContentWithPayload: a valid preResolvedTenant skips the internal tenants query entirely', async () => {
  const payload = fakeGheeRoastPayload({ tenants: [gheeRoastTenant] })
  const result = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: false,
    find: payload.find,
    host: 'ghee-roast.localhost:3000',
    pathname: '/',
    preResolvedTenant: gheeRoastTenant,
    site: gheeRoastSite,
  })
  assert.equal(result.tenantState, 'empty')
  assert.equal(payload.calls.some((call) => call.collection === 'tenants'), false)
})

test('loadGheeRoastContentWithPayload: preResolvedTenant null is treated as a missing tenant, no queries at all', async () => {
  const payload = fakeGheeRoastPayload({ tenants: [gheeRoastTenant] })
  const result = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: false,
    find: payload.find,
    host: 'ghee-roast.localhost:3000',
    pathname: '/',
    preResolvedTenant: null,
    site: gheeRoastSite,
  })
  assert.equal(result.tenantState, 'missing')
  assert.equal(payload.calls.length, 0)
})

test('loadGheeRoastContentWithPayload: a preResolvedTenant whose slug does not match site.key is never trusted (tenant isolation)', async () => {
  const wrongTenant = { ...gheeRoastTenant, id: 999, slug: 'some-other-tenant' }
  const payload = fakeGheeRoastPayload({ tenants: [gheeRoastTenant] })
  const result = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: false,
    find: payload.find,
    host: 'ghee-roast.localhost:3000',
    pathname: '/',
    preResolvedTenant: wrongTenant,
    site: gheeRoastSite,
  })
  assert.equal(result.tenantState, 'missing')
  assert.equal(payload.calls.length, 0, 'a mismatched pre-resolved tenant must not fall back to querying either')
})

test('loadGheeRoastContentWithPayload: omitting preResolvedTenant preserves the original self-contained lookup (1 tenants query)', async () => {
  const payload = fakeGheeRoastPayload({ tenants: [gheeRoastTenant] })
  const result = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: false,
    find: payload.find,
    host: 'ghee-roast.localhost:3000',
    pathname: '/',
    site: gheeRoastSite,
  })
  assert.equal(result.tenantState, 'empty')
  assert.equal(payload.calls.filter((call) => call.collection === 'tenants').length, 1)
})

// ---------------------------------------------------------------------------
// Curious Ladoo — same preResolvedTenant contract, both content and blog-post loaders
// ---------------------------------------------------------------------------

const curiousLadooSite = {
  hostname: 'curious-hub.localhost',
  key: 'curious-ladoo',
  theme: 'curious-hub',
} as const satisfies LocalSite

const curiousLadooTenant = {
  id: 4200,
  isActive: true,
  name: 'Fixture Curious Ladoo',
  slug: 'curious-ladoo',
  theme: 'curious-hub',
}

type CuriousLadooFixtures = Partial<Record<CuriousLadooCollectionSlug, unknown[]>>

const fakeCuriousLadooPayload = (fixtures: CuriousLadooFixtures) => {
  const calls: CuriousLadooFindArgs[] = []
  const find: CuriousLadooFind = async (args) => {
    calls.push(args)
    return { docs: (fixtures[args.collection] ?? []) as never[] }
  }
  return { calls, find }
}

test('loadCuriousLadooContentWithPayload: a valid preResolvedTenant skips the internal tenants query entirely', async () => {
  const payload = fakeCuriousLadooPayload({ tenants: [curiousLadooTenant] })
  const result = await loadCuriousLadooContentWithPayload({
    find: payload.find,
    host: 'curious-hub.localhost',
    pathname: '/',
    preResolvedTenant: curiousLadooTenant as never,
    site: curiousLadooSite,
  })
  assert.equal(result.tenantState, 'empty')
  assert.equal(payload.calls.some((call) => call.collection === 'tenants'), false)
})

test('loadCuriousLadooContentWithPayload: a preResolvedTenant whose slug does not match site.key is never trusted', async () => {
  const wrongTenant = { ...curiousLadooTenant, id: 9999, slug: 'some-other-tenant' }
  const payload = fakeCuriousLadooPayload({ tenants: [curiousLadooTenant] })
  const result = await loadCuriousLadooContentWithPayload({
    find: payload.find,
    host: 'curious-hub.localhost',
    pathname: '/',
    preResolvedTenant: wrongTenant as never,
    site: curiousLadooSite,
  })
  assert.equal(result.tenantState, 'missing')
  assert.equal(payload.calls.length, 0)
})

test('loadCuriousLadooContentWithPayload: omitting preResolvedTenant preserves the original self-contained lookup', async () => {
  const payload = fakeCuriousLadooPayload({ tenants: [curiousLadooTenant] })
  const result = await loadCuriousLadooContentWithPayload({
    find: payload.find,
    host: 'curious-hub.localhost',
    pathname: '/',
    site: curiousLadooSite,
  })
  assert.equal(result.tenantState, 'empty')
  assert.equal(payload.calls.filter((call) => call.collection === 'tenants').length, 1)
})

test('loadCuriousLadooBlogPostWithPayload: a valid preResolvedTenant skips the internal tenants query entirely', async () => {
  const payload = fakeCuriousLadooPayload({ tenants: [curiousLadooTenant] })
  const result = await loadCuriousLadooBlogPostWithPayload({
    find: payload.find,
    host: 'curious-hub.localhost',
    preResolvedTenant: curiousLadooTenant as never,
    site: curiousLadooSite,
    slug: 'unknown-post',
  })
  assert.equal(result.tenantState, 'empty')
  assert.equal(payload.calls.some((call) => call.collection === 'tenants'), false)
})

test('loadCuriousLadooBlogPostWithPayload: a preResolvedTenant whose slug does not match site.key is never trusted', async () => {
  const wrongTenant = { ...curiousLadooTenant, id: 9999, slug: 'some-other-tenant' }
  const payload = fakeCuriousLadooPayload({ tenants: [curiousLadooTenant] })
  const result = await loadCuriousLadooBlogPostWithPayload({
    find: payload.find,
    host: 'curious-hub.localhost',
    preResolvedTenant: wrongTenant as never,
    site: curiousLadooSite,
    slug: 'unknown-post',
  })
  assert.equal(result.tenantState, 'missing')
  assert.equal(payload.calls.length, 0)
})

// ---------------------------------------------------------------------------
// Zuru Zuru — regression guard: caching must not reintroduce the duplicate tenant lookup fixed
// in P5. loadZuruZuru{Shell,Page}WithPayload already accepted an optional pre-resolved `tenant`
// before P7; these tests just make the "zero tenants queries when provided" contract explicit,
// since P7's getZuruZuruShell.ts/getZuruZuruPageContent.ts now depend on it to avoid duplicating
// resolveZuruZuruTenantDocument's query when unstable_cache misses.
// ---------------------------------------------------------------------------

const zuruZuruSite = {
  hostname: 'zuru-zuru.localhost',
  key: 'zuru-zuru',
  theme: 'zuru-zuru',
} as const satisfies LocalSite

const zuruZuruTenant = {
  id: 7100,
  isActive: true,
  name: 'Fixture Zuru Zuru',
  slug: 'zuru-zuru',
  theme: 'zuru-zuru',
}

type ZuruZuruFixtures = Partial<Record<ZuruZuruCollectionSlug, unknown[]>>

const fakeZuruZuruPayload = (fixtures: ZuruZuruFixtures) => {
  const calls: ZuruZuruFindArgs[] = []
  const find: ZuruZuruFind = async (args) => {
    calls.push(args)
    return { docs: (fixtures[args.collection] ?? []) as never[] }
  }
  return { calls, find }
}

test('loadZuruZuruShellWithPayload: a pre-resolved tenant skips the internal tenants query entirely', async () => {
  const payload = fakeZuruZuruPayload({ tenants: [zuruZuruTenant] })
  const result = await loadZuruZuruShellWithPayload({
    find: payload.find,
    host: 'zuru-zuru.localhost',
    site: zuruZuruSite,
    tenant: zuruZuruTenant as never,
  })
  assert.equal(result.tenantState, 'empty')
  assert.equal(payload.calls.some((call) => call.collection === 'tenants'), false)
})

test('loadZuruZuruPageWithPayload: a pre-resolved tenant skips the internal tenants query entirely', async () => {
  const payload = fakeZuruZuruPayload({ tenants: [zuruZuruTenant], pages: [] })
  const result = await loadZuruZuruPageWithPayload({
    find: payload.find,
    host: 'zuru-zuru.localhost',
    pathname: '/',
    site: zuruZuruSite,
    tenant: zuruZuruTenant as never,
  })
  assert.equal(result.tenantState, 'empty')
  assert.equal(payload.calls.some((call) => call.collection === 'tenants'), false)
  assert.equal(payload.calls.filter((call) => call.collection === 'pages').length, 1)
})

test('loadZuruZuruShellWithPayload and loadZuruZuruPageWithPayload together still cost only 1 physical tenants query per request (via the shared React cache(), unaffected by P7)', async () => {
  // This mirrors what resolveZuruZuruTenantDocument (wrapped in React cache()) already guarantees
  // in production: both getZuruZuruShell and getZuruZuruPageContent call it once per request, and
  // React's request memoization collapses the two calls into one physical query. Here we simulate
  // that outcome directly: resolve the tenant once, thread the SAME object into both loaders, and
  // confirm neither one queries 'tenants' again.
  const payload = fakeZuruZuruPayload({ tenants: [zuruZuruTenant], pages: [] })
  const resolvedTenant = zuruZuruTenant as never
  await loadZuruZuruShellWithPayload({ find: payload.find, host: 'zuru-zuru.localhost', site: zuruZuruSite, tenant: resolvedTenant })
  await loadZuruZuruPageWithPayload({ find: payload.find, host: 'zuru-zuru.localhost', pathname: '/', site: zuruZuruSite, tenant: resolvedTenant })
  assert.equal(payload.calls.filter((call) => call.collection === 'tenants').length, 0)
})
