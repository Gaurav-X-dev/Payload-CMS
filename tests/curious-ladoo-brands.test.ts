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

const tenantID = 4500
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

const brand = (overrides: Record<string, unknown>) => ({
  id: 1,
  category: 'Japanese Izakaya',
  comingSoon: false,
  enabled: true,
  fullDescription: '',
  links: [],
  mark: '九小',
  name: 'Zuru Zuru',
  quote: '',
  shortDescription: 'Comfort food.',
  slug: 'zuru',
  sortOrder: 0,
  statLabel: '',
  statValue: '',
  tenantId: tenantID,
  websiteUrl: '/brands#zuru',
  ...overrides,
})

// ---------------------------------------------------------------------------
// Loader — Brands resolves by slug like every other inner page
// ---------------------------------------------------------------------------

test('published /brands page is visible by slug', async () => {
  const brandsPage = {
    id: 30,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'generic',
    slug: 'brands',
    tenantId: tenantID,
    title: 'Brands',
  }
  const result = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [brandsPage] }).find,
    host: 'curious-hub.localhost',
    pathname: '/brands',
    site,
  })
  assert.equal(result.page?.id, 30)
})

// ---------------------------------------------------------------------------
// Mapper — Brand spotlight fields, presentation pass-through, Pipeline block
// ---------------------------------------------------------------------------

test('mapBrand includes the spotlight-only fields (fullDescription, quote, stats, links, slug) alongside the existing grid fields', () => {
  const brands = [
    brand({
      fullDescription: 'Full editorial write-up.',
      image: media(50, tenantID),
      links: [{ label: 'ig', url: '/brands#zuru' }, { label: 'web', url: '/brands#zuru' }],
      quote: 'A great pull-quote.',
      statLabel: 'Active Rollout',
      statValue: '3 Cities',
    }),
  ]
  const layout = [
    { blockType: 'brandsshowcaseBlock', presentation: 'spotlight', sectionHeader: { title: 'Spotlights' }, brands: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: brands as never, faqs: [], teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'brandsshowcase')
  if (block.type === 'brandsshowcase') {
    assert.equal(block.presentation, 'spotlight')
    const [zuru] = block.brands
    assert.equal(zuru.fullDescription, 'Full editorial write-up.')
    assert.equal(zuru.quote, 'A great pull-quote.')
    assert.equal(zuru.statValue, '3 Cities')
    assert.equal(zuru.statLabel, 'Active Rollout')
    assert.equal(zuru.slug, 'zuru')
    assert.deepEqual(zuru.links, [{ label: 'ig', url: '/brands#zuru' }, { label: 'web', url: '/brands#zuru' }])
    assert.equal(zuru.image?.id, 50)
    // Grid-presentation fields (Home's own contract) stay intact and correct too.
    assert.equal(zuru.category, 'Japanese Izakaya')
    assert.equal(zuru.mark, '九小')
    assert.equal(zuru.href, '/brands#zuru')
  }
})

test("BrandsShowcase presentation defaults to 'grid' when unset, preserving Home's existing contract", () => {
  const brands = [brand({})]
  const layout = [
    { blockType: 'brandsshowcaseBlock', sectionHeader: { title: 'Brands' }, brands: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: brands as never, faqs: [], teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'brandsshowcase')
  if (block.type === 'brandsshowcase') {
    assert.equal(block.presentation, 'grid')
  }
})

test('Pipeline block maps items, an enabled link, and an enabled spotlight callout', () => {
  const layout = [
    {
      blockType: 'pipelineBlock',
      sectionHeader: { title: 'What We Are Incubating.', subtitle: 'Incubating.' },
      items: [
        { label: 'Project Roastery (Q1 2026):', description: 'An artisanal coffee roastery concept.' },
        { label: 'Project Botanical (Q3 2026):', description: 'A high-end cocktail lounge.' },
      ],
      enableLink: true,
      link: { type: 'custom', label: 'Partner on Concepts', url: '/contact?interest=brand' },
      spotlight: { enabled: true, icon: '☕', title: 'Project Roastery', description: 'Minimal styling.' },
      spotlightPosition: 'right',
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'pipeline')
  if (block.type === 'pipeline') {
    assert.equal(block.items.length, 2)
    assert.equal(block.items[0].label, 'Project Roastery (Q1 2026):')
    assert.equal(block.link?.url, '/contact?interest=brand')
    assert.deepEqual(block.spotlight, { description: 'Minimal styling.', icon: '☕', title: 'Project Roastery' })
    assert.equal(block.spotlightPosition, 'right')
  }
})

test('Pipeline block omits the link and spotlight when disabled, even if the underlying data is present', () => {
  const layout = [
    {
      blockType: 'pipelineBlock',
      sectionHeader: { title: 'Upcoming.' },
      items: [{ label: 'Something', description: 'Soon.' }],
      enableLink: false,
      link: { type: 'custom', label: 'Should not appear', url: '/x' },
      spotlight: { enabled: false, icon: '⭐', title: 'Should not appear', description: 'Hidden.' },
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'pipeline')
  if (block.type === 'pipeline') {
    assert.equal(block.link, null)
    assert.equal(block.spotlight, null)
  }
})
