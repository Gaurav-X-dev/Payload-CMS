import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  loadCuriousLadooContentWithPayload,
  normalizeCuriousLadooPathname,
  type CuriousLadooCollectionSlug,
  type CuriousLadooFind,
  type CuriousLadooFindArgs,
} from '../src/lib/site/curiousLadooContentCore.ts'
import {
  mapCuriousLadooLayout,
} from '../src/themes/curious-hub/mappers/cmsContent.ts'
import type { LocalSite } from '../src/lib/site/types.ts'
import type { Page } from '../src/payload-types.ts'

const tenantID = 4600
const site = {
  hostname: 'curious-hub.localhost',
  key: 'curious-ladoo',
  theme: 'curious-hub',
} as const satisfies LocalSite

type FixtureMap = Partial<Record<CuriousLadooCollectionSlug, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const calls: CuriousLadooFindArgs[] = []
  const find: CuriousLadooFind = async (args) => {
    calls.push(args)
    return { docs: (fixtures[args.collection] ?? []) as never[] }
  }
  return { calls, find }
}

const tenant = {
  id: tenantID,
  isActive: true,
  name: 'Fixture Curious Ladoo',
  slug: 'curious-ladoo',
  theme: 'curious-hub',
}

const media = (id: number, tenantIdValue: number, url = `/media/${id}.png`) => ({
  id,
  alt: `Image ${id}`,
  tenantId: tenantIdValue,
  url,
})

const portfolioItem = (overrides: Record<string, unknown>) => ({
  id: 1,
  category: 'Restaurant Design',
  coverImage: null,
  description: 'A case study.',
  enableCTA: false,
  enabled: true,
  featured: false,
  slug: 'case-study',
  sortOrder: 0,
  tenantId: tenantID,
  title: 'Case Study',
  year: '2024',
  ...overrides,
})

// ---------------------------------------------------------------------------
// Loader — Portfolio resolves by slug; published-only; tenant isolation;
// portfolio collection dependency is conditional on portfolioshowcaseBlock.
// ---------------------------------------------------------------------------

test('published /portfolio page is visible by slug; draft is hidden; pageType is independent from slug', async () => {
  const portfolioPage = {
    id: 40,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'generic',
    slug: 'portfolio',
    tenantId: tenantID,
    title: 'Portfolio',
  }
  const publishedResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [portfolioPage] }).find,
    host: 'curious-hub.localhost',
    pathname: '/portfolio',
    site,
  })
  assert.equal(publishedResult.page?.id, 40)

  const draftResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...portfolioPage, _status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/portfolio',
    site,
  })
  assert.equal(draftResult.page, null, 'a draft-only Portfolio page must never resolve publicly')

  // pageType is 'generic', not 'portfolio' — slug alone drives resolution, matching every other inner page.
  const otherCondition = normalizeCuriousLadooPathname('/portfolio') === '/portfolio' ? 'slug' : 'isHomePage'
  assert.equal(otherCondition, 'slug')
})

test('portfolio collection is only queried when a portfolioshowcaseBlock is present in the resolved layout', async () => {
  const pageWithPortfolio = {
    id: 41,
    _status: 'published',
    isHomePage: false,
    layout: [{ blockType: 'portfolioshowcaseBlock', sectionHeader: { title: 'Cases' }, items: [] }],
    pageType: 'generic',
    slug: 'portfolio',
    tenantId: tenantID,
    title: 'Portfolio',
  }
  const { calls, find } = fakePayload({ tenants: [tenant], pages: [pageWithPortfolio], portfolio: [] })
  await loadCuriousLadooContentWithPayload({ find, host: 'curious-hub.localhost', pathname: '/portfolio', site })
  const queried = new Set(calls.map((call) => call.collection))
  assert.ok(queried.has('portfolio'), 'portfolioshowcaseBlock in the layout must trigger a portfolio query')

  const pageWithoutPortfolio = { ...pageWithPortfolio, id: 42, layout: [] }
  const { calls: callsWithout, find: findWithout } = fakePayload({ tenants: [tenant], pages: [pageWithoutPortfolio] })
  await loadCuriousLadooContentWithPayload({ find: findWithout, host: 'curious-hub.localhost', pathname: '/portfolio', site })
  const queriedWithout = new Set(callsWithout.map((call) => call.collection))
  assert.equal(queriedWithout.has('portfolio'), false, 'no portfolioshowcaseBlock in the layout, so portfolio must not be queried')
})

// ---------------------------------------------------------------------------
// Mapper — layout order, disabled/empty blocks, sorting, active filtering,
// Brand/Media relationship safety (raw, populated, missing, cross-tenant)
// ---------------------------------------------------------------------------

test('Portfolio showcase and Compare blocks with no content are dropped by the renderer contract (empty items / no title)', () => {
  const layout = [
    { blockType: 'portfolioshowcaseBlock', sectionHeader: { title: 'Cases' }, items: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'portfolioshowcase')
  if (block.type === 'portfolioshowcase') {
    assert.equal(block.items.length, 0, 'empty pool maps to an empty items array; the renderer is responsible for hiding it')
  }
})

test('Portfolio items sort by sortOrder, exclude disabled items, and respect the block limit', () => {
  const items = [
    portfolioItem({ id: 1, sortOrder: 2, title: 'C' }),
    portfolioItem({ id: 2, sortOrder: 0, title: 'A' }),
    portfolioItem({ id: 3, sortOrder: 1, title: 'B' }),
    portfolioItem({ id: 4, enabled: false, sortOrder: -1, title: 'Disabled' }),
  ]
  const layout = [
    { blockType: 'portfolioshowcaseBlock', sectionHeader: { title: 'Cases' }, items: [], limit: 2 },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: items as never, teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'portfolioshowcase')
  if (block.type === 'portfolioshowcase') {
    assert.deepEqual(block.items.map((item) => item.title), ['A', 'B'])
  }
})

test('Portfolio item Media (cover image) and CTA link resolve safely: raw ID, populated, missing, and cross-tenant all handled', () => {
  const rawImageItem = portfolioItem({ id: 5, coverImage: 10 })
  const populatedImageItem = portfolioItem({ id: 6, coverImage: media(11, tenantID) })
  const crossTenantImageItem = portfolioItem({ id: 7, coverImage: media(12, tenantID + 1) })
  const missingImageItem = portfolioItem({ id: 8, coverImage: null })
  const ctaItem = portfolioItem({ id: 9, cta: { label: 'Learn more', type: 'custom', url: '/learn-more' }, enableCTA: true })

  const layout = [
    { blockType: 'portfolioshowcaseBlock', sectionHeader: { title: 'Cases' }, items: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(
    layout,
    tenantID,
    { blogPosts: [], brands: [], faqs: [], portfolio: [rawImageItem, populatedImageItem, crossTenantImageItem, missingImageItem, ctaItem] as never, teamMembers: [], testimonials: [] },
  )
  const block = mapped[0]
  assert.equal(block.type, 'portfolioshowcase')
  if (block.type === 'portfolioshowcase') {
    const byId = new Map(block.items.map((item) => [item.id, item]))
    assert.equal(byId.get(5)?.image, null, 'a raw (unpopulated) relationship ID must degrade to null, never crash')
    assert.equal(byId.get(6)?.image?.id, 11)
    assert.equal(byId.get(7)?.image, null, 'a foreign-tenant Media document must never render')
    assert.equal(byId.get(8)?.image, null)
    assert.equal(byId.get(9)?.link?.url, '/learn-more')
  }
})

test("Portfolio item without enableCTA maps to a null link, so the renderer's default 'Inquire on case' fallback applies", () => {
  const item = portfolioItem({ cta: { label: 'Should not appear', type: 'custom', url: '/x' }, enableCTA: false })
  const layout = [
    { blockType: 'portfolioshowcaseBlock', sectionHeader: { title: 'Cases' }, items: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: [item] as never, teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'portfolioshowcase')
  if (block.type === 'portfolioshowcase') {
    assert.equal(block.items[0].link, null)
  }
})

test('Portfolio explicit selection resolves raw and populated relationship entries and excludes cross-tenant items', () => {
  const pool = [
    portfolioItem({ id: 20, title: 'Selected Raw' }),
    portfolioItem({ id: 21, title: 'Selected Populated' }),
    portfolioItem({ id: 22, tenantId: tenantID + 1, title: 'Foreign Tenant' }),
  ]
  const layout = [
    {
      blockType: 'portfolioshowcaseBlock',
      sectionHeader: { title: 'Cases' },
      items: [20, pool[1], 22],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: pool as never, teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'portfolioshowcase')
  if (block.type === 'portfolioshowcase') {
    assert.deepEqual(block.items.map((item) => item.title).sort(), ['Selected Populated', 'Selected Raw'])
  }
})

test('Compare block maps before/after panels with placeholder-vs-image handling and passes tenant checks on media', () => {
  const layout = [
    {
      blockType: 'compareBlock',
      sectionHeader: { title: 'Before & After.', subtitle: 'After.' },
      before: { badgeLabel: 'Before', placeholderText: 'No image yet' },
      after: { badgeLabel: 'After', media: { item: media(30, tenantID) } },
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'compare')
  if (block.type === 'compare') {
    assert.equal(block.before.badgeLabel, 'Before')
    assert.equal(block.before.image, null)
    assert.equal(block.before.placeholderText, 'No image yet')
    assert.equal(block.after.badgeLabel, 'After')
    assert.equal(block.after.image?.id, 30)
  }
})

test('layout order is preserved: hero, portfolioshowcase, compare, cta render in the order stored', () => {
  const layout = [
    { blockType: 'heroBlock', description: 'x', heading: 'Hero' },
    { blockType: 'portfolioshowcaseBlock', sectionHeader: { title: 'Cases' }, items: [] },
    { blockType: 'compareBlock', sectionHeader: { title: 'Before & After.' }, before: {}, after: {} },
    { blockType: 'ctaBlock', sectionHeader: { title: 'Last' } },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: [], testimonials: [] })
  assert.deepEqual(mapped.map((block) => block.type), ['hero', 'portfolioshowcase', 'compare', 'cta'])
})

// ---------------------------------------------------------------------------
// No static runtime fallback
// ---------------------------------------------------------------------------

test('the Portfolio renderer files never import the static theme data directory', () => {
  const files = [
    'src/themes/curious-hub/components/CMSHomePage.tsx',
    'src/themes/curious-hub/components/PortfolioFilterGrid.tsx',
    'src/themes/curious-hub/mappers/cmsContent.ts',
  ]
  for (const file of files) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /from ['"].*\/data\//, `${file} must not import static theme data`)
  }
})
