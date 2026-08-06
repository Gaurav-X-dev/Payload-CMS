import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadCuriousLadooContentWithPayload,
  type CuriousLadooCollectionSlug,
  type CuriousLadooFind,
} from '../src/lib/site/curiousLadooContentCore.ts'
import {
  mapCuriousLadooLayout,
} from '../src/themes/curious-hub/mappers/cmsContent.ts'
import type { LocalSite } from '../src/lib/site/types.ts'
import type { Page } from '../src/payload-types.ts'

const tenantID = 4800
const site = {
  hostname: 'curious-hub.localhost',
  key: 'curious-ladoo',
  theme: 'curious-hub',
} as const satisfies LocalSite

type FixtureMap = Partial<Record<CuriousLadooCollectionSlug, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const find: CuriousLadooFind = async (args) => ({ docs: (fixtures[args.collection] ?? []) as never[] })
  return { find }
}

const tenant = {
  id: tenantID,
  isActive: true,
  name: 'Fixture Curious Ladoo',
  slug: 'curious-ladoo',
  theme: 'curious-hub',
}

const emptyCollections = { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: [], testimonials: [] }

const testimonial = (overrides: Record<string, unknown>) => ({
  id: 1,
  customerName: 'John Doe',
  customerRole: 'Food Group',
  isFeatured: false,
  photo: null,
  rating: 5,
  review: 'Great work.',
  sortOrder: 0,
  tenantId: tenantID,
  ...overrides,
})

// ---------------------------------------------------------------------------
// Loader — Testimonials resolves by slug like every other inner page
// ---------------------------------------------------------------------------

test('published /testimonials page is visible by slug; draft is hidden', async () => {
  const page = {
    id: 60,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'generic',
    slug: 'testimonials',
    tenantId: tenantID,
    title: 'Testimonials',
  }
  const publishedResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [page] }).find,
    host: 'curious-hub.localhost',
    pathname: '/testimonials',
    site,
  })
  assert.equal(publishedResult.page?.id, 60)

  const draftResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...page, _status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/testimonials',
    site,
  })
  assert.equal(draftResult.page, null)
})

// ---------------------------------------------------------------------------
// Mapper — CTA bgText override, and manual-source Testimonials selection
// (ignoring isFeatured entirely, unlike Home's featuredOnly usage)
// ---------------------------------------------------------------------------

test('CTA block maps an explicit bgText override; defaults to empty string when unset (renderer falls back to the site name)', () => {
  const layoutWithOverride = [
    { blockType: 'ctaBlock', bgText: 'STORIES', sectionHeader: { title: 'Ready to Write Your Story?', subtitle: 'Story?' } },
  ] as unknown as Page['layout']
  const mappedWithOverride = mapCuriousLadooLayout(layoutWithOverride, tenantID, emptyCollections)
  const overrideBlock = mappedWithOverride[0]
  assert.equal(overrideBlock.type, 'cta')
  if (overrideBlock.type === 'cta') assert.equal(overrideBlock.bgText, 'STORIES')

  const layoutWithoutOverride = [
    { blockType: 'ctaBlock', sectionHeader: { title: 'Last' } },
  ] as unknown as Page['layout']
  const mappedWithoutOverride = mapCuriousLadooLayout(layoutWithoutOverride, tenantID, emptyCollections)
  const defaultBlock = mappedWithoutOverride[0]
  assert.equal(defaultBlock.type, 'cta')
  if (defaultBlock.type === 'cta') assert.equal(defaultBlock.bgText, '', 'unset bgText must degrade to empty string, letting the renderer fall back to the site name')
})

test('Testimonials block in manual mode uses exactly the explicitly-selected items, regardless of isFeatured', () => {
  const testimonials = [
    testimonial({ id: 1, customerName: 'John Doe', isFeatured: false }),
    testimonial({ id: 2, customerName: 'Jane Smith', isFeatured: false }),
    testimonial({ id: 3, customerName: 'Home-Only Featured', isFeatured: true }),
  ]
  const layout = [
    {
      blockType: 'testimonialsBlock',
      source: 'manual',
      sectionHeader: { title: 'Real Stories. Real Results.', subtitle: 'Real Results.' },
      testimonials: [1, 2],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, testimonials: testimonials as never })
  const block = mapped[0]
  assert.equal(block.type, 'testimonials')
  if (block.type === 'testimonials') {
    assert.deepEqual(block.items.map((item) => item.name).sort(), ['Jane Smith', 'John Doe'])
  }
})

test('Testimonials block in manual mode ignores the (collection-only) limit field, even when Payload has applied its default value', () => {
  // Regression test: `limit` defaults to 3 in the schema and Payload persists that default onto
  // every block row regardless of `source`. Manual selection must still render all 4 explicitly
  // chosen items, not silently truncate to the collection-mode default.
  const testimonials = [
    testimonial({ id: 1, customerName: 'John Doe' }),
    testimonial({ id: 2, customerName: 'Jane Smith' }),
    testimonial({ id: 3, customerName: 'Mike Johnson' }),
    testimonial({ id: 4, customerName: 'Sarah Williams' }),
  ]
  const layout = [
    {
      blockType: 'testimonialsBlock',
      source: 'manual',
      limit: 3,
      sectionHeader: { title: 'Real Stories. Real Results.' },
      testimonials: [1, 2, 3, 4],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, testimonials: testimonials as never })
  const block = mapped[0]
  assert.equal(block.type, 'testimonials')
  if (block.type === 'testimonials') {
    assert.equal(block.items.length, 4)
    assert.ok(block.items.some((item) => item.name === 'Sarah Williams'))
  }
})

test('Testimonials without a photo fall back to initials (matching Home\'s existing avatar contract)', () => {
  const testimonials = [testimonial({ id: 1, customerName: 'John Doe', photo: null })]
  const layout = [
    { blockType: 'testimonialsBlock', source: 'manual', sectionHeader: { title: 'Cases' }, testimonials: [1] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, testimonials: testimonials as never })
  const block = mapped[0]
  assert.equal(block.type, 'testimonials')
  if (block.type === 'testimonials') {
    assert.equal(block.items[0].photo, null)
    assert.equal(block.items[0].initials, 'JD')
  }
})

test('layout order is preserved: hero, testimonials, cta render in the order stored', () => {
  const layout = [
    { blockType: 'heroBlock', description: 'x', heading: 'Hero' },
    { blockType: 'testimonialsBlock', source: 'manual', sectionHeader: { title: 'Cases' }, testimonials: [] },
    { blockType: 'ctaBlock', bgText: 'STORIES', sectionHeader: { title: 'Last' } },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  assert.deepEqual(mapped.map((block) => block.type), ['hero', 'testimonials', 'cta'])
})
