import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadZuruZuruPageWithPayload,
  type ZuruZuruFind,
} from '../src/lib/site/zuruZuruContentCore.ts'
import {
  mapZuruZuruCardGrid,
  mapZuruZuruPageLayout,
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
// Mapper — CardGrid now exposes the block's real `columns` field (Private Dining needs 3,
// Catering already hardcodes 2 in its own renderer — this is what makes the difference possible
// without a per-page special case in the mapper).
// ---------------------------------------------------------------------------

test('mapZuruZuruCardGrid reads the real columns field, defaulting to 3 when unset', () => {
  const withColumns = mapZuruZuruCardGrid({
    cards: [{ description: 'd', image: { item: null }, title: 't' }],
    columns: '2',
    sectionHeader: { title: 'Dining Experiences' },
  } as never, tenantID)
  assert.equal(withColumns.columns, 2)

  const defaulted = mapZuruZuruCardGrid({
    cards: [{ description: 'd', image: { item: null }, title: 't' }],
    sectionHeader: { title: 'Dining Experiences' },
  } as never, tenantID)
  assert.equal(defaulted.columns, 3)
})

// ---------------------------------------------------------------------------
// Layout dispatch — Reservation's contentgridBlock-as-Details-aside and Private Dining's
// storyBlock + cardgridBlock + contentgridBlock combination
// ---------------------------------------------------------------------------

test('mapZuruZuruPageLayout dispatches Reservation\'s Details contentgridBlock with no heroBlock present', () => {
  const layout = [
    { blockType: 'contentgridBlock', items: [{ description: 'd', title: 'Phone Reservations' }], sectionHeader: { title: 'Details' } },
  ]
  const blocks = mapZuruZuruPageLayout(layout as never, { faqs: [], locations: [], menuItems: [], testimonials: [], tenantID })
  assert.deepEqual(blocks.map((block) => block.type), ['contentGrid'])
})

test('mapZuruZuruPageLayout dispatches Private Dining\'s hero + story + cardGrid + contentGrid in order', () => {
  const layout = [
    { blockType: 'heroBlock', enabled: true, heading: 'Private Dining' },
    { blockType: 'storyBlock', body: 'b', layout: 'panel', title: 'An Intimate Culinary Journey' },
    { blockType: 'cardgridBlock', cards: [{ description: 'd', image: { item: null }, title: 'VIP Room' }], sectionHeader: { title: 'Dining Experiences' } },
    { blockType: 'contentgridBlock', items: [{ description: 'd', title: 'Silver Tier (₹4,500 / guest)' }], sectionHeader: { title: 'Luxury Packages' } },
  ]
  const blocks = mapZuruZuruPageLayout(layout as never, { faqs: [], locations: [], menuItems: [], testimonials: [], tenantID })
  assert.deepEqual(blocks.map((block) => block.type), ['hero', 'story', 'cardGrid', 'contentGrid'])
})

// ---------------------------------------------------------------------------
// Loader — resolving Group C pages by slug
// ---------------------------------------------------------------------------

type FixtureMap = Partial<Record<string, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const find: ZuruZuruFind = async (args) => ({ docs: (fixtures[args.collection] ?? []) as never[] })
  return { find }
}

test('loadZuruZuruPageWithPayload resolves the published Reservation and Private Dining pages by slug', () => {
  return (async () => {
    const reservationPage = {
      _status: 'published',
      id: 21,
      isHomePage: false,
      layout: [{ blockType: 'contentgridBlock' }],
      slug: 'reservation',
      tenantId: tenantID,
    }
    const privateDiningPage = {
      _status: 'published',
      id: 22,
      isHomePage: false,
      layout: [{ blockType: 'heroBlock' }],
      slug: 'private-dining',
      tenantId: tenantID,
    }
    const { find } = fakePayload({ pages: [reservationPage, privateDiningPage], tenants: [tenant] })

    const reservationResult = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/reservation', site })
    assert.equal(reservationResult.page?.id, 21)

    const privateDiningResult = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/private-dining', site })
    assert.equal(privateDiningResult.page?.id, 22)
  })()
})
