import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadCuriousLadooContentWithPayload,
  type CuriousLadooCollectionSlug,
  type CuriousLadooFind,
  type CuriousLadooFindArgs,
} from '../src/lib/site/curiousLadooContentCore.ts'
import {
  mapCuriousLadooLayout,
} from '../src/themes/curious-hub/mappers/cmsContent.ts'
import type { LocalSite } from '../src/lib/site/types.ts'
import type { Page } from '../src/payload-types.ts'

const tenantID = 5000
const otherTenantID = 5001
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

const emptyCollections = { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: [], testimonials: [] }

const faq = (overrides: Record<string, unknown>) => ({
  id: 1,
  title: 'Question',
  answer: 'Answer',
  category: '',
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
  tenantId: tenantID,
  ...overrides,
})

// ---------------------------------------------------------------------------
// Loader — FAQs resolves by slug like every other inner page; faqs is a
// conditional collection dependency, only fetched when a faqBlock is present.
// ---------------------------------------------------------------------------

test('published /faqs page is visible by slug; draft is hidden', async () => {
  const page = {
    id: 80,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'faq',
    slug: 'faqs',
    tenantId: tenantID,
    title: 'FAQs',
  }
  const publishedResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [page] }).find,
    host: 'curious-hub.localhost',
    pathname: '/faqs',
    site,
  })
  assert.equal(publishedResult.page?.id, 80)

  const draftResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...page, _status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/faqs',
    site,
  })
  assert.equal(draftResult.page, null)
})

test('faqs collection is only queried when a faqBlock is present in the resolved layout', async () => {
  const pageWithFAQs = {
    id: 81,
    _status: 'published',
    isHomePage: false,
    layout: [{ blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [] }],
    pageType: 'faq',
    slug: 'faqs',
    tenantId: tenantID,
    title: 'FAQs',
  }
  const { calls, find } = fakePayload({ tenants: [tenant], pages: [pageWithFAQs] })
  await loadCuriousLadooContentWithPayload({ find, host: 'curious-hub.localhost', pathname: '/faqs', site })
  const queried = new Set(calls.map((call) => call.collection))
  assert.ok(queried.has('faqs'), 'faqBlock in the layout must trigger a faqs query')

  const pageWithoutFAQs = { ...pageWithFAQs, id: 82, layout: [] }
  const { calls: callsWithout, find: findWithout } = fakePayload({ tenants: [tenant], pages: [pageWithoutFAQs] })
  await loadCuriousLadooContentWithPayload({ find: findWithout, host: 'curious-hub.localhost', pathname: '/faqs', site })
  const queriedWithout = new Set(callsWithout.map((call) => call.collection))
  assert.equal(queriedWithout.has('faqs'), false, 'no faqBlock in the layout, so faqs must not be queried')
})

// ---------------------------------------------------------------------------
// Mapper — tenant isolation, active filtering, sorting, category passthrough,
// presentation, and the featuredOnly / explicit-selection contract
// ---------------------------------------------------------------------------

test('FAQ block filters inactive and cross-tenant items, and sorts by sortOrder', () => {
  const faqs = [
    faq({ id: 1, title: 'B', sortOrder: 2 }),
    faq({ id: 2, title: 'A', sortOrder: 0 }),
    faq({ id: 3, title: 'Inactive', isActive: false, sortOrder: -1 }),
    faq({ id: 4, title: 'Cross-tenant', tenantId: otherTenantID, sortOrder: -2 }),
  ]
  const layout = [
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [1, 2, 3, 4] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, faqs: faqs as never })
  const block = mapped[0]
  assert.equal(block.type, 'faq')
  if (block.type === 'faq') {
    assert.deepEqual(block.items.map((item) => item.question), ['A', 'B'])
  }
})

test('category passes through on each mapped item (no category-based filtering exists — the original design never filters by it)', () => {
  const faqs = [faq({ id: 1, title: 'Q', category: 'Delivery' })]
  const layout = [
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [1] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, faqs: faqs as never })
  const block = mapped[0]
  assert.equal(block.type, 'faq')
  if (block.type === 'faq') assert.equal(block.items[0].category, 'Delivery')
})

test('featuredOnly narrows only the auto-pulled pool; an explicit item selection always renders exactly what was chosen, ignoring isFeatured and featuredOnly', () => {
  const faqs = [
    faq({ id: 1, title: 'Featured', isFeatured: true }),
    faq({ id: 2, title: 'Not featured', isFeatured: false }),
  ]

  // Auto-pool + featuredOnly: true -> only the featured item.
  const autoLayout = [
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [], featuredOnly: true },
  ] as unknown as Page['layout']
  const autoMapped = mapCuriousLadooLayout(autoLayout, tenantID, { ...emptyCollections, faqs: faqs as never })
  const autoBlock = autoMapped[0]
  assert.equal(autoBlock.type, 'faq')
  if (autoBlock.type === 'faq') assert.deepEqual(autoBlock.items.map((item) => item.question), ['Featured'])

  // Explicit selection of the non-featured item, with featuredOnly also true: selection wins.
  const explicitLayout = [
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [2], featuredOnly: true },
  ] as unknown as Page['layout']
  const explicitMapped = mapCuriousLadooLayout(explicitLayout, tenantID, { ...emptyCollections, faqs: faqs as never })
  const explicitBlock = explicitMapped[0]
  assert.equal(explicitBlock.type, 'faq')
  if (explicitBlock.type === 'faq') assert.deepEqual(explicitBlock.items.map((item) => item.question), ['Not featured'])
})

test("presentation defaults to 'tabs' (Services' existing usage) and passes through 'plusminus' explicitly", () => {
  const layoutDefault = [
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [] },
  ] as unknown as Page['layout']
  const mappedDefault = mapCuriousLadooLayout(layoutDefault, tenantID, emptyCollections)
  const defaultBlock = mappedDefault[0]
  assert.equal(defaultBlock.type, 'faq')
  if (defaultBlock.type === 'faq') assert.equal(defaultBlock.presentation, 'tabs')

  const layoutPlusMinus = [
    { blockType: 'faqBlock', presentation: 'plusminus', sectionHeader: { title: 'Got Questions?' }, items: [] },
  ] as unknown as Page['layout']
  const mappedPlusMinus = mapCuriousLadooLayout(layoutPlusMinus, tenantID, emptyCollections)
  const plusMinusBlock = mappedPlusMinus[0]
  assert.equal(plusMinusBlock.type, 'faq')
  if (plusMinusBlock.type === 'faq') assert.equal(plusMinusBlock.presentation, 'plusminus')
})

test('a raw (unpopulated) FAQ id resolves against the fetched pool, and a dangling id that matches nothing is dropped safely', () => {
  const faqs = [faq({ id: 1, title: 'Resolved' })]
  const layout = [
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [1, 999] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, faqs: faqs as never })
  const block = mapped[0]
  assert.equal(block.type, 'faq')
  if (block.type === 'faq') assert.deepEqual(block.items.map((item) => item.question), ['Resolved'])
})

test('layout order is preserved: hero, faq, cta render in the order stored', () => {
  const layout = [
    { blockType: 'heroBlock', description: 'x', heading: 'FAQs' },
    { blockType: 'faqBlock', presentation: 'plusminus', sectionHeader: { title: 'Got Questions?' }, items: [] },
    { blockType: 'ctaBlock', bgText: 'FAQ', sectionHeader: { title: 'Still Have Questions?' } },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  assert.deepEqual(mapped.map((block) => block.type), ['hero', 'faq', 'cta'])
})
