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

const tenantID = 4900
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

// ---------------------------------------------------------------------------
// Loader — Careers resolves by slug like every other inner page
// ---------------------------------------------------------------------------

test('published /careers page is visible by slug; draft is hidden', async () => {
  const page = {
    id: 70,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'generic',
    slug: 'careers',
    tenantId: tenantID,
    title: 'Careers',
  }
  const publishedResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [page] }).find,
    host: 'curious-hub.localhost',
    pathname: '/careers',
    site,
  })
  assert.equal(publishedResult.page?.id, 70)

  const draftResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...page, _status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/careers',
    site,
  })
  assert.equal(draftResult.page, null)
})

// ---------------------------------------------------------------------------
// Mapper — careersBlock positions, and ContentGrid 'pillars' bgText override
// ---------------------------------------------------------------------------

test('Careers block maps repeatable positions in order with all fields', () => {
  const layout = [
    {
      blockType: 'careersBlock',
      sectionHeader: { title: 'Open Positions.', subtitle: 'Positions.' },
      positions: [
        { title: 'Executive Chef', department: 'Culinary', type: 'Full-time', location: 'New Delhi, India', description: 'Lead culinary development.' },
        { title: 'Graphic Designer', department: 'Design', type: 'Contract', location: 'Remote', description: 'Create visual assets.' },
      ],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  const block = mapped[0]
  assert.equal(block.type, 'careers')
  if (block.type === 'careers') {
    assert.equal(block.positions.length, 2)
    assert.deepEqual(block.positions[0], {
      title: 'Executive Chef',
      department: 'Culinary',
      type: 'Full-time',
      location: 'New Delhi, India',
      description: 'Lead culinary development.',
    })
    assert.equal(block.positions[1].title, 'Graphic Designer')
  }
})

test('Careers block with no positions maps to an empty array (renderer hides the section)', () => {
  const layout = [
    { blockType: 'careersBlock', sectionHeader: { title: 'Open Positions.' }, positions: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  const block = mapped[0]
  assert.equal(block.type, 'careers')
  if (block.type === 'careers') assert.deepEqual(block.positions, [])
})

test("ContentGrid 'pillars' maps an explicit bgText override; defaults to empty string when unset (renderer falls back to PHILOSOPHY)", () => {
  const layoutWithOverride = [
    {
      blockType: 'contentgridBlock',
      presentation: 'pillars',
      bgText: 'VALUES',
      sectionHeader: { eyebrow: 'Why Work Here', title: 'Our Values.', subtitle: 'Values.' },
      items: [{ title: 'Passion for Food' }, { title: 'Collaborative Spirit' }],
    },
  ] as unknown as Page['layout']
  const mappedWithOverride = mapCuriousLadooLayout(layoutWithOverride, tenantID, emptyCollections)
  const overrideBlock = mappedWithOverride[0]
  assert.equal(overrideBlock.type, 'contentgrid')
  if (overrideBlock.type === 'contentgrid') {
    assert.equal(overrideBlock.bgText, 'VALUES')
    // Title-only pillar items (no icon/description set) degrade to empty strings, not
    // undefined — the renderer's conditional icon/description guards depend on this.
    assert.deepEqual(overrideBlock.items.map((item) => [item.icon, item.description]), [['', ''], ['', '']])
  }

  const layoutWithoutOverride = [
    {
      blockType: 'contentgridBlock',
      presentation: 'pillars',
      sectionHeader: { title: 'How We Think.' },
      items: [{ title: 'Question', icon: 'question', description: 'Curiosity drives better ideas.' }],
    },
  ] as unknown as Page['layout']
  const mappedWithoutOverride = mapCuriousLadooLayout(layoutWithoutOverride, tenantID, emptyCollections)
  const defaultBlock = mappedWithoutOverride[0]
  assert.equal(defaultBlock.type, 'contentgrid')
  if (defaultBlock.type === 'contentgrid') {
    assert.equal(defaultBlock.bgText, '', 'unset bgText must degrade to empty string, letting the renderer fall back to PHILOSOPHY')
    assert.deepEqual(defaultBlock.items[0], { icon: 'question', title: 'Question', description: 'Curiosity drives better ideas.', link: null })
  }
})

test('layout order is preserved: hero, careers, contentgrid(pillars), cta render in the order stored', () => {
  const layout = [
    { blockType: 'heroBlock', description: 'x', heading: 'Careers' },
    { blockType: 'careersBlock', sectionHeader: { title: 'Open Positions.' }, positions: [] },
    { blockType: 'contentgridBlock', presentation: 'pillars', bgText: 'VALUES', sectionHeader: { title: 'Our Values.' }, items: [{ title: 'Passion' }] },
    { blockType: 'ctaBlock', bgText: 'CAREERS', sectionHeader: { title: 'Last' } },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  assert.deepEqual(mapped.map((block) => block.type), ['hero', 'careers', 'contentgrid', 'cta'])
})
