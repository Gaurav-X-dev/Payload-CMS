import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadZuruZuruPageWithPayload,
  type ZuruZuruFind,
} from '../src/lib/site/zuruZuruContentCore.ts'
import {
  mapZuruZuruContentGrid,
  mapZuruZuruPageLayout,
  mapZuruZuruStats,
  mapZuruZuruSteps,
  mapZuruZuruStory,
} from '../src/themes/zuru-zuru/mappers/cmsContent.ts'
import type { LocalSite } from '../src/lib/site/types.ts'

const tenantID = 7100

const site = {
  hostname: 'zuru-zuru.localhost',
  key: 'zuru-zuru',
  theme: 'zuru-zuru',
} as const satisfies LocalSite

const tenant = {
  id: tenantID,
  isActive: true,
  name: 'Fixture Zuru Zuru',
  slug: 'zuru-zuru',
  theme: 'zuru-zuru',
}

// ---------------------------------------------------------------------------
// Mapper — Story (imagePosition, used to decide image-first vs text-first)
// ---------------------------------------------------------------------------

test('mapZuruZuruStory maps imagePosition (used by the About page\'s "Our Roots" image-first layout)', () => {
  const left = mapZuruZuruStory({ body: 'b', imagePosition: 'left', layout: 'simple', title: 'A Journey Begun in Tokyo' } as never, tenantID)
  const right = mapZuruZuruStory({ body: 'b', imagePosition: 'right', layout: 'simple', title: 'A Journey Begun in Tokyo' } as never, tenantID)
  assert.equal(left.imagePosition, 'left')
  assert.equal(right.imagePosition, 'right')
})

// ---------------------------------------------------------------------------
// Mapper — ContentGrid (dark background flag)
// ---------------------------------------------------------------------------

test('mapZuruZuruContentGrid reads dark from settings.backgroundColor', () => {
  const dark = mapZuruZuruContentGrid({ items: [], sectionHeader: { title: 'Mission & Vision' }, settings: { backgroundColor: 'dark' } } as never)
  const light = mapZuruZuruContentGrid({ items: [], sectionHeader: { title: 'Japanese Philosophy' } } as never)
  assert.equal(dark.dark, true)
  assert.equal(light.dark, false)
})

// ---------------------------------------------------------------------------
// Mapper — Steps (timeline)
// ---------------------------------------------------------------------------

test('mapZuruZuruSteps maps label/title/description in order and reads dark from settings', () => {
  const block = {
    layoutVariant: 'timeline',
    sectionHeader: { eyebrow: 'Our Evolution', title: 'The Zuru Zuru Story' },
    settings: { backgroundColor: 'dark' },
    steps: [
      { description: 'd1', label: '2015', title: 'The Founding' },
      { description: 'd2', label: '2018', title: 'The Second Branch' },
    ],
  }
  const mapped = mapZuruZuruSteps(block as never)
  assert.equal(mapped.dark, true)
  assert.equal(mapped.layoutVariant, 'timeline')
  assert.deepEqual(mapped.steps.map((s) => s.label), ['2015', '2018'])
  assert.equal(mapped.steps[0].title, 'The Founding')
})

// ---------------------------------------------------------------------------
// Mapper — Stats
// ---------------------------------------------------------------------------

test('mapZuruZuruStats maps value/label pairs verbatim (no forced numeric parsing)', () => {
  const block = {
    sectionHeader: { eyebrow: 'By The Numbers', title: 'Our Achievements' },
    stats: [
      { label: 'Bowls of Ramen Served', value: '1.2M+' },
      { label: 'Locations Globally', value: '3' },
    ],
  }
  const mapped = mapZuruZuruStats(block as never)
  assert.deepEqual(mapped.stats, [
    { label: 'Bowls of Ramen Served', value: '1.2M+' },
    { label: 'Locations Globally', value: '3' },
  ])
})

// ---------------------------------------------------------------------------
// Mapper — full layout dispatch for the About page's block set
// ---------------------------------------------------------------------------

test('mapZuruZuruPageLayout dispatches storyBlock, contentgridBlock, stepsBlock, and statsBlock in source order', () => {
  const layout = [
    { blockType: 'heroBlock', enabled: true, heading: 'Our Story' },
    { blockType: 'storyBlock', body: 'b', layout: 'simple', title: 'A Journey Begun in Tokyo' },
    { blockType: 'contentgridBlock', items: [{ description: 'd', icon: 'heart', title: 'Our Mission' }], presentation: 'mission-vision', sectionHeader: { title: 'Mission & Vision' } },
    { blockType: 'contentgridBlock', items: [{ description: 'd', title: 'Omotenashi (Hospitality from the Heart)' }], presentation: 'pillars', sectionHeader: { title: 'Japanese Philosophy' } },
    { blockType: 'stepsBlock', layoutVariant: 'timeline', sectionHeader: { title: 'The Zuru Zuru Story' }, steps: [{ description: 'd', label: '2015', title: 'The Founding' }] },
    { blockType: 'statsBlock', sectionHeader: { title: 'Our Achievements' }, stats: [{ label: 'Locations Globally', value: '3' }] },
  ]
  const blocks = mapZuruZuruPageLayout(layout as never, { faqs: [], locations: [], menuItems: [], testimonials: [], tenantID })
  assert.deepEqual(blocks.map((b) => b.type), ['hero', 'story', 'contentGrid', 'contentGrid', 'steps', 'stats'])
})

// ---------------------------------------------------------------------------
// Loader — resolving the About page by slug
// ---------------------------------------------------------------------------

type FixtureMap = Partial<Record<string, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const find: ZuruZuruFind = async (args) => {
    return { docs: (fixtures[args.collection] ?? []) as never[] }
  }
  return { find }
}

test('loadZuruZuruPageWithPayload resolves the published About page by slug', () => {
  return (async () => {
    const aboutPage = {
      _status: 'published',
      id: 3,
      isHomePage: false,
      layout: [{ blockType: 'statsBlock' }],
      slug: 'about',
      tenantId: tenantID,
    }
    const { find } = fakePayload({ pages: [aboutPage], tenants: [tenant] })
    const result = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/about', site })
    assert.equal(result.tenantState, 'active')
    assert.equal(result.page?.id, 3)
  })()
})
