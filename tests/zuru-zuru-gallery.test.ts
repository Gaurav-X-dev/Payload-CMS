import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadZuruZuruPageWithPayload,
  type ZuruZuruFind,
} from '../src/lib/site/zuruZuruContentCore.ts'
import {
  mapZuruZuruGallery,
  mapZuruZuruPageLayout,
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

const media = (id: number) => ({ alt: `photo ${id}`, id, tenantId: tenantID, url: `/media/${id}.png` })

// ---------------------------------------------------------------------------
// Mapper — Gallery: category='all' fetches everything, cross-tenant/missing media can't leak
// ---------------------------------------------------------------------------

test('mapZuruZuruGallery returns every tenant item when category is "all", dropping items with no resolvable image', () => {
  const items = [
    { category: 'food', id: 1, isFeatured: false, media: media(1), sortOrder: 0, tenantId: tenantID, title: 'Food shot' },
    { category: 'chefs', id: 2, isFeatured: false, media: media(2), sortOrder: 1, tenantId: tenantID, title: 'Chef shot' },
    // Cross-tenant media: mapMedia rejects it, so this item must be dropped entirely, not crash.
    { category: 'events', id: 3, isFeatured: false, media: { ...media(3), tenantId: otherTenantID }, sortOrder: 2, tenantId: tenantID, title: 'Bad media' },
    // Cross-tenant Gallery record itself: excluded before mapMedia even runs.
    { category: 'food', id: 4, isFeatured: false, media: media(4), sortOrder: 3, tenantId: otherTenantID, title: 'Other tenant item' },
  ]
  const mapped = mapZuruZuruGallery({ category: 'all', limit: 20, sectionHeader: { title: 'Our Gallery' }, source: 'collection' } as never, items as never, tenantID)
  assert.deepEqual(mapped.items.map((item) => item.id), [1, 2])
})

test('mapZuruZuruGallery filters by category when the block requests one specific category', () => {
  const items = [
    { category: 'food', id: 1, isFeatured: false, media: media(1), sortOrder: 0, tenantId: tenantID, title: 'Food shot' },
    { category: 'chefs', id: 2, isFeatured: false, media: media(2), sortOrder: 1, tenantId: tenantID, title: 'Chef shot' },
  ]
  const mapped = mapZuruZuruGallery({ category: 'chefs', limit: 20, sectionHeader: { title: 'Our Gallery' }, source: 'collection' } as never, items as never, tenantID)
  assert.deepEqual(mapped.items.map((item) => item.id), [2])
})

// ---------------------------------------------------------------------------
// Layout dispatch
// ---------------------------------------------------------------------------

test('mapZuruZuruPageLayout dispatches galleryBlock', () => {
  const layout = [
    { blockType: 'heroBlock', enabled: true, heading: 'Our Gallery' },
    { blockType: 'galleryBlock', category: 'all', sectionHeader: { title: 'Our Gallery' }, source: 'collection' },
  ]
  const blocks = mapZuruZuruPageLayout(layout as never, { faqs: [], locations: [], menuItems: [], testimonials: [], tenantID })
  assert.deepEqual(blocks.map((block) => block.type), ['hero', 'gallery'])
})

// ---------------------------------------------------------------------------
// Loader — resolving the Gallery page by slug
// ---------------------------------------------------------------------------

type FixtureMap = Partial<Record<string, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const find: ZuruZuruFind = async (args) => ({ docs: (fixtures[args.collection] ?? []) as never[] })
  return { find }
}

test('loadZuruZuruPageWithPayload resolves the published Gallery page by slug', () => {
  return (async () => {
    const galleryPage = {
      _status: 'published',
      id: 31,
      isHomePage: false,
      layout: [{ blockType: 'galleryBlock' }],
      slug: 'gallery',
      tenantId: tenantID,
    }
    const { find } = fakePayload({ pages: [galleryPage], tenants: [tenant] })
    const result = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/gallery', site })
    assert.equal(result.page?.id, 31)
  })()
})
