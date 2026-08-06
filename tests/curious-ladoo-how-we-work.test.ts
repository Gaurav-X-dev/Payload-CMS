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

const tenantID = 4700
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

const media = (id: number, tenantIdValue: number, url = `/media/${id}.png`) => ({
  id,
  alt: `Image ${id}`,
  tenantId: tenantIdValue,
  url,
})

const emptyCollections = { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: [], testimonials: [] }

// ---------------------------------------------------------------------------
// Loader — How We Work resolves by slug like every other inner page
// ---------------------------------------------------------------------------

test('published /how-we-work page is visible by slug; draft is hidden', async () => {
  const page = {
    id: 50,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'generic',
    slug: 'how-we-work',
    tenantId: tenantID,
    title: 'How We Work',
  }
  const publishedResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [page] }).find,
    host: 'curious-hub.localhost',
    pathname: '/how-we-work',
    site,
  })
  assert.equal(publishedResult.page?.id, 50)

  const draftResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...page, _status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/how-we-work',
    site,
  })
  assert.equal(draftResult.page, null)
})

// ---------------------------------------------------------------------------
// Mapper — Steps 'visual-timeline' variant + per-step media safety
// ---------------------------------------------------------------------------

test("Steps block 'visual-timeline' layout maps per-step media safely: raw ID, populated, missing, cross-tenant", () => {
  const layout = [
    {
      blockType: 'stepsBlock',
      layoutVariant: 'visual-timeline',
      sectionHeader: { title: 'Roadmap' },
      steps: [
        { label: '01', title: 'Discover', description: 'x', media: { item: 10 } },
        { label: '02', title: 'Build', description: 'y', media: { item: media(11, tenantID) } },
        { label: '03', title: 'Foreign', description: 'z', media: { item: media(12, tenantID + 1) } },
        { label: '04', title: 'No Media', description: 'w' },
      ],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  const block = mapped[0]
  assert.equal(block.type, 'steps')
  if (block.type === 'steps') {
    assert.equal(block.layoutVariant, 'visual-timeline')
    assert.equal(block.steps[0].image, null, 'a raw (unpopulated) relationship ID must degrade to null, never crash')
    assert.equal(block.steps[1].image?.id, 11)
    assert.equal(block.steps[2].image, null, 'a foreign-tenant Media document must never render')
    assert.equal(block.steps[3].image, null)
  }
})

test("existing 'timeline' and 'numbered-steps' layout variants are unaffected by the new visual-timeline addition", () => {
  const layout = [
    { blockType: 'stepsBlock', layoutVariant: 'timeline', sectionHeader: { title: 'Journey' }, steps: [{ label: '2020', title: 'Founded', description: 'x' }] },
    { blockType: 'stepsBlock', layoutVariant: 'numbered-steps', sectionHeader: { title: 'Process' }, steps: [{ label: '01', title: 'Discover', description: 'x' }] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  assert.equal(mapped[0].type, 'steps')
  assert.equal(mapped[1].type, 'steps')
  if (mapped[0].type === 'steps') assert.equal(mapped[0].layoutVariant, 'timeline')
  if (mapped[1].type === 'steps') assert.equal(mapped[1].layoutVariant, 'numbered-steps')
})

// ---------------------------------------------------------------------------
// Mapper — Pipeline block: new 'value' + optional items, and a direct
// regression check against Brands' existing usage shape (icon + populated list).
// ---------------------------------------------------------------------------

test("Pipeline block supports an items-less narrative usage with a spotlight 'value' stat", () => {
  const layout = [
    {
      blockType: 'pipelineBlock',
      sectionHeader: { title: 'Speed to Market.', subtitle: 'Market.', description: 'Paragraph one.\n\nParagraph two.' },
      items: [],
      spotlight: { enabled: true, value: '16 Wks', title: 'Average Concept Launch', description: 'From feasibility to first dish.' },
      spotlightPosition: 'right',
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  const block = mapped[0]
  assert.equal(block.type, 'pipeline')
  if (block.type === 'pipeline') {
    assert.equal(block.items.length, 0)
    assert.equal(block.header.description, 'Paragraph one.\n\nParagraph two.')
    assert.equal(block.spotlight?.value, '16 Wks')
    assert.equal(block.spotlight?.icon, '')
  }
})

test("Pipeline block's original Brands-page shape (populated items, icon spotlight, no value) still maps identically", () => {
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
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  const block = mapped[0]
  assert.equal(block.type, 'pipeline')
  if (block.type === 'pipeline') {
    assert.equal(block.items.length, 2)
    assert.equal(block.link?.url, '/contact?interest=brand')
    assert.equal(block.spotlight?.icon, '☕')
    assert.equal(block.spotlight?.value, '', 'no value field set — must degrade to empty string, not undefined/crash')
  }
})

test('layout order is preserved: hero, steps, pipeline, cta render in the order stored', () => {
  const layout = [
    { blockType: 'heroBlock', description: 'x', heading: 'Hero' },
    { blockType: 'stepsBlock', layoutVariant: 'visual-timeline', sectionHeader: { title: 'Roadmap' }, steps: [{ label: '01', title: 'A', description: 'a' }] },
    { blockType: 'pipelineBlock', sectionHeader: { title: 'Speed to Market.' }, items: [] },
    { blockType: 'ctaBlock', sectionHeader: { title: 'Last' } },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  assert.deepEqual(mapped.map((block) => block.type), ['hero', 'steps', 'pipeline', 'cta'])
})
