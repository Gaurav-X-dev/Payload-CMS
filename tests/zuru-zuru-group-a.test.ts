import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadZuruZuruPageWithPayload,
  type ZuruZuruFind,
} from '../src/lib/site/zuruZuruContentCore.ts'
import {
  mapZuruZuruCareers,
  mapZuruZuruPageLayout,
  mapZuruZuruRichText,
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
// Mapper — RichText (Privacy/Terms/Catering menu content)
// ---------------------------------------------------------------------------

test('mapZuruZuruRichText passes the Lexical document through verbatim, and null when unset', () => {
  const doc = { root: { children: [], type: 'root', version: 1 } }
  assert.deepEqual(mapZuruZuruRichText({ content: doc } as never).content, doc)
  assert.equal(mapZuruZuruRichText({ content: null } as never).content, null)
})

// ---------------------------------------------------------------------------
// Mapper — Careers (positions with real department/type/location fields)
// ---------------------------------------------------------------------------

test('mapZuruZuruCareers maps each position\'s department/type/location/description separately (not folded into title)', () => {
  const block = {
    positions: [
      { department: 'Culinary Team', description: 'd', location: 'Delhi, India', title: 'Sushi Chef (Itamae)', type: 'Full-time' },
    ],
    sectionHeader: { title: 'Current Openings' },
  }
  const mapped = mapZuruZuruCareers(block as never)
  assert.deepEqual(mapped.positions[0], {
    department: 'Culinary Team',
    description: 'd',
    location: 'Delhi, India',
    title: 'Sushi Chef (Itamae)',
    type: 'Full-time',
  })
})

// ---------------------------------------------------------------------------
// Mapper — full layout dispatch for Group A's block set
// ---------------------------------------------------------------------------

test('mapZuruZuruPageLayout dispatches richtextBlock and careersBlock', () => {
  const layout = [
    { blockType: 'heroBlock', enabled: true, heading: 'Catering Services' },
    { blockType: 'richtextBlock', content: { root: { children: [], type: 'root', version: 1 } } },
    { blockType: 'careersBlock', positions: [{ department: 'd', description: 'd', location: 'l', title: 't', type: 'Full-time' }], sectionHeader: { title: 'Openings' } },
  ]
  const blocks = mapZuruZuruPageLayout(layout as never, { faqs: [], locations: [], menuItems: [], testimonials: [], tenantID })
  assert.deepEqual(blocks.map((block) => block.type), ['hero', 'richText', 'careers'])
})

// ---------------------------------------------------------------------------
// Loader — resolving each Group A page by slug (spot-checking one representative page)
// ---------------------------------------------------------------------------

type FixtureMap = Partial<Record<string, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const find: ZuruZuruFind = async (args) => ({ docs: (fixtures[args.collection] ?? []) as never[] })
  return { find }
}

test('loadZuruZuruPageWithPayload resolves the published Catering page by slug', () => {
  return (async () => {
    const cateringPage = {
      _status: 'published',
      id: 9,
      isHomePage: false,
      layout: [{ blockType: 'heroBlock' }],
      slug: 'catering',
      tenantId: tenantID,
    }
    const { find } = fakePayload({ pages: [cateringPage], tenants: [tenant] })
    const result = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/catering', site })
    assert.equal(result.tenantState, 'active')
    assert.equal(result.page?.id, 9)
  })()
})
