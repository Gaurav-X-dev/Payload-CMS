import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadZuruZuruPageWithPayload,
  type ZuruZuruFind,
} from '../src/lib/site/zuruZuruContentCore.ts'
import {
  mapZuruZuruBlogPreview,
  mapZuruZuruCTA,
  mapZuruZuruEvents,
  mapZuruZuruLocationsBlock,
  mapZuruZuruPageLayout,
  mapZuruZuruStory,
  mapZuruZuruTeam,
} from '../src/themes/zuru-zuru/mappers/cmsContent.ts'
import type { LocalSite } from '../src/lib/site/types.ts'

const tenantID = 7100
const otherTenantID = 9999

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
// Mapper — Story (Chefs page's two extra fields: accentPhrase/quote/attribution/layout)
// ---------------------------------------------------------------------------

test('mapZuruZuruStory maps accentPhrase/quote/attribution/layout in addition to the existing fields', () => {
  const spotlight = mapZuruZuruStory({
    accentPhrase: 'Executive Chef & Founder',
    body: 'Para one.\n\nPara two.',
    eyebrow: 'The Visionary',
    layout: 'simple',
    title: 'Kenji Tanaka',
  } as never, tenantID)
  assert.equal(spotlight.accentPhrase, 'Executive Chef & Founder')
  assert.equal(spotlight.layout, 'simple')

  const quote = mapZuruZuruStory({
    attribution: 'Chef Kenji Tanaka',
    layout: 'overlay',
    quote: 'Great food is not born from complex recipes.',
  } as never, tenantID)
  assert.equal(quote.quote, 'Great food is not born from complex recipes.')
  assert.equal(quote.attribution, 'Chef Kenji Tanaka')
  assert.equal(quote.layout, 'overlay')
})

// ---------------------------------------------------------------------------
// Mapper — Team (Chefs page's Culinary Masters grid)
// ---------------------------------------------------------------------------

test('mapZuruZuruTeam selects only active, tenant-owned members and respects an explicit selection', () => {
  const members = [
    { bio: 'b1', id: 1, isActive: true, photo: null, role: 'Chef de Cuisine', sortOrder: 0, tenantId: tenantID, title: 'Akira Mori' },
    { bio: 'b2', id: 2, isActive: false, photo: null, role: 'Inactive', sortOrder: 1, tenantId: tenantID, title: 'Hidden Person' },
    { bio: 'b3', id: 3, isActive: true, photo: null, role: 'Other Tenant', sortOrder: 0, tenantId: otherTenantID, title: 'Someone Else' },
  ]
  const mapped = mapZuruZuruTeam({ limit: 8, members: [], sectionHeader: { title: 'The Culinary Masters' } } as never, members as never, tenantID)
  assert.deepEqual(mapped.members.map((member) => member.name), ['Akira Mori'])
})

// ---------------------------------------------------------------------------
// Mapper — CTA (Chefs page's closing "Taste the Dedication" section)
// ---------------------------------------------------------------------------

test('mapZuruZuruCTA returns null primaryCTA when the block disables it', () => {
  const enabled = mapZuruZuruCTA({
    ctaGroup: { enablePrimary: true, primaryCTA: { label: 'Dine with Our Chefs', type: 'custom', url: '/reservation' } },
    sectionHeader: { title: 'Taste the Dedication' },
  } as never, tenantID)
  assert.deepEqual(enabled.primaryCTA, { label: 'Dine with Our Chefs', url: '/reservation' })

  const disabled = mapZuruZuruCTA({
    ctaGroup: { enablePrimary: false },
    sectionHeader: { title: 'Taste the Dedication' },
  } as never, tenantID)
  assert.equal(disabled.primaryCTA, null)
})

// ---------------------------------------------------------------------------
// Mapper — Events (only published, sorted by startsAt, respects an explicit selection)
// ---------------------------------------------------------------------------

test('mapZuruZuruEvents excludes non-published events and sorts by startsAt ascending', () => {
  const events = [
    { bookingUrl: '', description: '', id: 1, image: null, locationName: '', startsAt: '2026-09-05T00:00:00.000Z', status: 'published', summary: 's', tenantId: tenantID, title: 'Later Event' },
    { bookingUrl: '', description: '', id: 2, image: null, locationName: '', startsAt: '2026-08-15T00:00:00.000Z', status: 'published', summary: 's', tenantId: tenantID, title: 'Earlier Event' },
    { bookingUrl: '', description: '', id: 3, image: null, locationName: '', startsAt: '2026-08-01T00:00:00.000Z', status: 'draft', summary: 's', tenantId: tenantID, title: 'Draft Event' },
  ]
  const mapped = mapZuruZuruEvents({ events: [], limit: 6, sectionHeader: { title: 'Upcoming Events' } } as never, events as never, tenantID)
  assert.deepEqual(mapped.events.map((event) => event.title), ['Earlier Event', 'Later Event'])
})

// ---------------------------------------------------------------------------
// Mapper — Blog preview (pinned post sorts first, then by publishedDate descending)
// ---------------------------------------------------------------------------

test('mapZuruZuruBlogPreview sorts the pinned post first, then by publishedDate descending', () => {
  const posts = [
    { _status: 'published', author: null, categories: ['Recipes'], excerpt: 'Read More', heroImage: null, id: 1, isFeatured: false, isPinned: false, publishedDate: '2026-09-01T00:00:00.000Z', slug: 'a', tenantId: tenantID, title: 'Older Post' },
    { _status: 'published', author: null, categories: ['Culture'], excerpt: 'Read More', heroImage: null, id: 2, isFeatured: false, isPinned: false, publishedDate: '2026-09-15T00:00:00.000Z', slug: 'b', tenantId: tenantID, title: 'Newer Post' },
    { _status: 'published', author: null, categories: ['Behind the Scenes'], excerpt: 'Featured excerpt', heroImage: null, id: 3, isFeatured: false, isPinned: true, publishedDate: '2026-06-01T00:00:00.000Z', slug: 'c', tenantId: tenantID, title: 'Pinned Post' },
    { _status: 'draft', author: null, categories: [], excerpt: '', heroImage: null, id: 4, isFeatured: false, isPinned: false, publishedDate: '2026-09-20T00:00:00.000Z', slug: 'd', tenantId: tenantID, title: 'Draft Post' },
  ]
  const mapped = mapZuruZuruBlogPreview({ limit: 10, posts: [], presentation: 'index', sectionHeader: { title: 'Stories & Recipes' } } as never, posts as never, tenantID)
  assert.deepEqual(mapped.posts.map((post) => post.title), ['Pinned Post', 'Newer Post', 'Older Post'])
})

// ---------------------------------------------------------------------------
// Mapper — Locations block now also exposes the full active-locations list
// ---------------------------------------------------------------------------

test('mapZuruZuruLocationsBlock exposes both the single primary location and the full active list', () => {
  const locations = [
    { address: 'Addr A', businessHours: [], city: 'Delhi', description: '', id: 1, isActive: true, isPrimary: true, mapsEmbedUrl: '', phone: '', sortOrder: 0, tenantId: tenantID, title: 'Flagship' },
    { address: 'Addr B', businessHours: [], city: 'Delhi', description: '', id: 2, isActive: true, isPrimary: false, mapsEmbedUrl: '', phone: '', sortOrder: 1, tenantId: tenantID, title: 'Branch' },
    { address: 'Addr C', businessHours: [], city: 'Delhi', description: '', id: 3, isActive: false, isPrimary: false, mapsEmbedUrl: '', phone: '', sortOrder: 2, tenantId: tenantID, title: 'Inactive Branch' },
  ]
  const mapped = mapZuruZuruLocationsBlock({ locations: [], sectionHeader: { title: 'Our Locations' }, showMap: false } as never, locations as never, tenantID)
  assert.equal(mapped.location?.title, 'Flagship')
  assert.deepEqual(mapped.locations.map((location) => location.title), ['Flagship', 'Branch'])
})

// ---------------------------------------------------------------------------
// Layout dispatch — Group B's 4 new block types
// ---------------------------------------------------------------------------

test('mapZuruZuruPageLayout dispatches teamBlock, ctaBlock, eventsBlock, and blogpreviewBlock', () => {
  const layout = [
    { blockType: 'heroBlock', enabled: true, heading: 'Meet Our Chefs' },
    { blockType: 'teamBlock', members: [], sectionHeader: { title: 'The Culinary Masters' } },
    { blockType: 'ctaBlock', ctaGroup: { enablePrimary: false }, sectionHeader: { title: 'Taste the Dedication' } },
    { blockType: 'eventsBlock', events: [], sectionHeader: { title: 'Upcoming Events' } },
    { blockType: 'blogpreviewBlock', posts: [], sectionHeader: { title: 'Stories & Recipes' } },
  ]
  const blocks = mapZuruZuruPageLayout(layout as never, { faqs: [], locations: [], menuItems: [], testimonials: [], tenantID })
  assert.deepEqual(blocks.map((block) => block.type), ['hero', 'team', 'cta', 'events', 'blogPreview'])
})

// ---------------------------------------------------------------------------
// Loader — resolving a Group B page by slug (spot-checking one representative page)
// ---------------------------------------------------------------------------

type FixtureMap = Partial<Record<string, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const find: ZuruZuruFind = async (args) => ({ docs: (fixtures[args.collection] ?? []) as never[] })
  return { find }
}

test('loadZuruZuruPageWithPayload resolves the published Chefs page by slug', () => {
  return (async () => {
    const chefsPage = {
      _status: 'published',
      id: 11,
      isHomePage: false,
      layout: [{ blockType: 'heroBlock' }, { blockType: 'teamBlock' }],
      slug: 'chefs',
      tenantId: tenantID,
    }
    const { find } = fakePayload({ pages: [chefsPage], tenants: [tenant] })
    const result = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/chefs', site })
    assert.equal(result.tenantState, 'active')
    assert.equal(result.page?.id, 11)
  })()
})
