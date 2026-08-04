import assert from 'node:assert/strict'
import test from 'node:test'
import {
  gheeRoastContentCacheArguments,
  loadGheeRoastContentWithPayload,
  normalizeGheeRoastPathname,
  type GheeRoastCollectionSlug,
  type GheeRoastFind,
  type GheeRoastFindArgs,
} from '../src/lib/site/gheeRoastContentCore.ts'
import type { LocalSite } from '../src/lib/site/types.ts'

const tenantID = 42
const site = {
  hostname: 'ghee-roast.localhost',
  key: 'ghee-roast',
  theme: 'ghee-roast',
} as const satisfies LocalSite

type FixtureMap = Partial<Record<GheeRoastCollectionSlug, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const calls: GheeRoastFindArgs[] = []
  const find: GheeRoastFind = async (args) => {
    calls.push(args)
    const documents = fixtures[args.collection] ?? []
    if (!args.select) return { docs: documents }
    return {
      docs: documents.map((value) => {
        const document = value && typeof value === 'object'
          ? value as Record<string, unknown>
          : {}
        return { id: document.id, tenantId: document.tenantId }
      }),
    }
  }
  return { calls, find }
}

const tenant = {
  id: tenantID,
  isActive: true,
  name: 'Fixture Ghee Roast',
  slug: 'ghee-roast',
  theme: 'ghee-roast',
}

const whereContainsTenant = (
  call: GheeRoastFindArgs,
  expectedTenantID: number | string,
): boolean => JSON.stringify(call.where).includes(
  `"tenantId":{"equals":${JSON.stringify(expectedTenantID)}}`,
)

test('empty real-world CMS shape stays empty after resolving the valid tenant', async () => {
  const payload = fakePayload({ tenants: [tenant] })
  const content = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: false,
    find: payload.find,
    host: 'ghee-roast.localhost:3000',
    pathname: '/',
    site,
  })

  assert.equal(content.tenantState, 'empty')
  assert.equal(content.site.siteName, 'Fixture Ghee Roast')
  assert.equal(content.navigation.items.length, 0)
  assert.equal(content.collections.menu.items.length, 0)
  assert.equal(content.page, null)

  const queried = new Set(payload.calls.map((call) => call.collection))
  assert.deepEqual([...queried].sort(), [
    'footer',
    'nav',
    'pages',
    'seo',
    'site-settings',
    'tenants',
  ])
  assert.equal(
    payload.calls.filter((call) => call.collection !== 'tenants' && !call.select).length,
    0,
    'empty collections must stop after the compatibility-safe ID probe',
  )
  assert.ok(
    payload.calls
      .filter((call) => call.collection !== 'tenants')
      .every((call) => whereContainsTenant(call, tenantID)),
  )
  assert.equal(payload.calls.some((call) => call.collection === 'menu-categories'), false)
})

test('unknown, missing, mismatched, and inactive tenants fail closed without fallback leakage', async () => {
  const unknownHostPayload = fakePayload({ tenants: [tenant] })
  const unknownHost = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: true,
    find: unknownHostPayload.find,
    host: 'unknown.example',
    pathname: '/',
    site,
  })
  assert.equal(unknownHost.tenantState, 'missing')
  assert.equal(unknownHost.navigation.items.length, 0)
  assert.equal(unknownHostPayload.calls.length, 0)

  const missingPayload = fakePayload({ tenants: [] })
  const missing = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: true,
    find: missingPayload.find,
    host: 'ghee-roast.localhost',
    pathname: '/',
    site,
  })
  assert.equal(missing.tenantState, 'missing')
  assert.equal(missing.navigation.items.length, 0)

  const mismatchedSitePayload = fakePayload({ tenants: [tenant] })
  const mismatch = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: true,
    find: mismatchedSitePayload.find,
    host: 'ghee-roast.localhost',
    pathname: '/',
    site: { ...site, key: 'another-tenant' },
  })
  assert.equal(mismatch.tenantState, 'missing')
  assert.equal(mismatchedSitePayload.calls.length, 0)

  const inactivePayload = fakePayload({
    tenants: [{ ...tenant, isActive: false }],
  })
  const inactive = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: true,
    find: inactivePayload.find,
    host: 'ghee-roast.localhost',
    pathname: '/',
    site,
  })
  assert.equal(inactive.tenantState, 'inactive')
  assert.equal(inactive.navigation.items.length, 0)
})

test('populated fixtures map only CMS content, reject cross-tenant rows, and load every block dependency', async () => {
  const otherTenantID = 99
  const page = {
    _status: 'published',
    id: 3,
    isHomePage: false,
    layout: [
      {
        blockType: 'heroBlock',
        description: 'Fixture hero description',
        enabled: true,
        heading: 'Fixture',
        highlightedHeading: 'Hero',
      },
      { blockType: 'ctaBlock' },
      { blockType: 'menushowcaseBlock' },
      { blockType: 'testimonialsBlock' },
      { blockType: 'galleryBlock' },
      { blockType: 'teamBlock' },
      { blockType: 'eventsBlock' },
      { blockType: 'faqBlock' },
      { blockType: 'locationsBlock' },
    ],
    metaDescription: 'Fixture page description',
    metaTitle: 'Fixture metadata',
    slug: 'fixture',
    tenantId: tenantID,
    title: 'Fixture Page',
  }
  const payload = fakePayload({
    events: [
      {
        id: 15,
        startsAt: '2030-01-02T18:30:00.000Z',
        status: 'published',
        summary: 'Fixture event summary',
        tenantId: tenantID,
        title: 'Fixture Event',
      },
      { id: 115, status: 'published', tenantId: otherTenantID, title: 'Foreign Event' },
    ],
    faqs: [
      { answer: 'Fixture answer', id: 16, isActive: true, tenantId: tenantID, title: 'Fixture question?' },
    ],
    footer: [{
      bottomLinks: [{ label: 'Fixture Legal', url: '/fixture-legal' }],
      columns: [{ links: [{ label: 'Fixture About', url: '/fixture' }], title: 'Fixture Links' }],
      copyright: 'Fixture copyright',
      id: 5,
      tenantId: tenantID,
    }],
    gallery: [{
      category: 'food',
      id: 12,
      isFeatured: true,
      media: { alt: 'Fixture gallery', id: 112, tenantId: tenantID, url: '/fixture-gallery.jpg' },
      tenantId: tenantID,
      title: 'Fixture Gallery',
    }],
    locations: [{
      address: 'Fixture address',
      city: 'Delhi',
      id: 14,
      isActive: true,
      tenantId: tenantID,
      title: 'Fixture Location',
    }],
    'menu-categories': [
      { id: 8, isActive: true, slug: 'fixture-category', sortOrder: 2, tenantId: tenantID, title: 'Fixture Category' },
      { id: 108, isActive: true, slug: 'foreign', tenantId: otherTenantID, title: 'Foreign Category' },
    ],
    'menu-items': [{
      category: { id: 8, isActive: true, slug: 'fixture-category', tenantId: tenantID },
      description: 'Fixture dish description',
      displayOrder: 1,
      id: 9,
      isAvailable: true,
      isFeatured: true,
      price: 0,
      stockStatus: 'in_stock',
      tenantId: tenantID,
      title: 'Fixture Dish',
    }],
    nav: [{
      brandName: 'CMS Fixture Brand',
      cta: { enabled: true, label: 'Fixture CTA', url: '/fixture' },
      id: 2,
      links: [{
        blockType: 'link',
        enabled: true,
        label: 'Fixture Link',
        sortOrder: 1,
        type: 'custom',
        url: '/fixture',
      }],
      location: 'header',
      tenantId: tenantID,
    }],
    pages: [
      page,
      { ...page, id: 103, tenantId: otherTenantID, title: 'Foreign Page' },
    ],
    seo: [{
      id: 6,
      metaDescription: 'Fixture SEO description',
      metaTitlePattern: '%s | Fixture Site',
      tenantId: tenantID,
    }],
    'site-settings': [{
      businessName: 'CMS Fixture Site',
      id: 4,
      siteDescription: 'CMS fixture site description',
      tagline: 'CMS fixture tagline',
      tenantId: tenantID,
    }],
    teammembers: [{
      id: 13,
      isActive: true,
      role: 'Chef',
      tenantId: tenantID,
      title: 'Fixture Chef',
    }],
    tenants: [
      tenant,
      { ...tenant, id: otherTenantID, slug: 'foreign' },
    ],
    testimonials: [{
      customerName: 'Fixture Guest',
      id: 11,
      isFeatured: true,
      rating: 4,
      review: 'Fixture review',
      tenantId: tenantID,
    }],
  })

  const content = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: false,
    find: payload.find,
    host: 'WWW.GHEE-ROAST.LOCALHOST:3000',
    pathname: '/fixture/',
    site,
  })

  assert.equal(content.tenantState, 'active')
  assert.equal(content.page?.title, 'Fixture Page')
  assert.equal(content.page?.hero?.title, 'Fixture Hero')
  assert.equal(content.navigation.brandName, 'CMS Fixture Brand')
  assert.deepEqual(content.navigation.items.map((item) => item.label), ['Fixture Link'])
  assert.equal(content.site.siteName, 'CMS Fixture Site')
  assert.equal(content.footer.columns[0]?.title, 'Fixture Links')
  assert.equal(content.seo.titlePattern, '%s | Fixture Site')
  assert.deepEqual(content.collections.menu.categories, [
    ['all', 'All Items'],
    ['fixture-category', 'Fixture Category'],
  ])
  assert.equal(content.collections.menu.items[0]?.name, 'Fixture Dish')
  assert.equal(content.collections.menu.items[0]?.price, '₹0')
  assert.equal(content.collections.testimonials[0]?.name, 'Fixture Guest')
  assert.equal(content.collections.gallery.length, 1)
  assert.equal(content.collections.team[0]?.name, 'Fixture Chef')
  assert.equal(content.collections.events[0]?.title, 'Fixture Event')
  assert.equal(content.collections.faqs[0]?.question, 'Fixture question?')
  assert.equal(content.collections.locations[0]?.title, 'Fixture Location')
  assert.ok(
    payload.calls
      .filter((call) => call.collection !== 'tenants')
      .every((call) => whereContainsTenant(call, tenantID)),
  )
  assert.ok(payload.calls.every((call) => call.limit > 0 && call.limit <= 100))
})

test('unpublished pages are excluded, duplicate public pages fail deterministically, and loader errors propagate', async () => {
  const draftPayload = fakePayload({
    pages: [{
      _status: 'draft',
      id: 20,
      layout: [],
      slug: 'draft',
      tenantId: tenantID,
      title: 'Draft',
    }],
    tenants: [tenant],
  })
  const draft = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: false,
    find: draftPayload.find,
    host: 'ghee-roast.localhost',
    pathname: '/draft',
    site,
  })
  assert.equal(draft.page, null)

  const duplicate = {
    _status: 'published',
    layout: [],
    slug: 'duplicate',
    tenantId: tenantID,
    title: 'Duplicate',
  }
  const duplicatePayload = fakePayload({
    pages: [
      { ...duplicate, id: 21 },
      { ...duplicate, id: 22 },
    ],
    tenants: [tenant],
  })
  await assert.rejects(
    loadGheeRoastContentWithPayload({
      fallbacksEnabled: false,
      find: duplicatePayload.find,
      host: 'ghee-roast.localhost',
      pathname: '/duplicate',
      site,
    }),
    /Ambiguous Ghee Roast published page resolution/,
  )

  const expected = new Error('fixture Payload failure')
  const find: GheeRoastFind = async (args) => {
    if (args.collection === 'tenants') return { docs: [tenant] }
    throw expected
  }
  await assert.rejects(
    loadGheeRoastContentWithPayload({
      fallbacksEnabled: true,
      find,
      host: 'ghee-roast.localhost',
      pathname: '/',
      site,
    }),
    expected,
  )
})

test('partial content never merges legacy fields and route dependencies remain conditional', async () => {
  const fixtures = {
    'site-settings': [{
      businessName: 'Only CMS Site Settings',
      id: 30,
      tenantId: tenantID,
    }],
    tenants: [tenant],
  } satisfies FixtureMap
  const strictPayload = fakePayload(fixtures)
  const strict = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: false,
    find: strictPayload.find,
    host: 'ghee-roast.localhost',
    pathname: '/quality',
    site,
  })
  assert.equal(strict.site.siteName, 'Only CMS Site Settings')
  assert.equal(strict.navigation.items.length, 0)
  assert.equal(strict.footer.columns.length, 0)

  const legacyFlagPayload = fakePayload(fixtures)
  const legacyFlagResult = await loadGheeRoastContentWithPayload({
    fallbacksEnabled: true,
    find: legacyFlagPayload.find,
    host: 'ghee-roast.localhost',
    pathname: '/quality',
    site,
  })
  assert.equal(legacyFlagResult.site.siteName, 'Only CMS Site Settings')
  assert.equal(legacyFlagResult.navigation.items.length, 0)
  assert.equal(legacyFlagResult.footer.columns.length, 0)

  const queried = new Set(strictPayload.calls.map((call) => call.collection))
  assert.ok(!queried.has('events'))
  assert.ok(!queried.has('faqs'))
  assert.ok(!queried.has('gallery'))
  assert.ok(!queried.has('locations'))
  assert.ok(!queried.has('menu-categories'))
  assert.ok(!queried.has('menu-items'))
  assert.ok(!queried.has('teammembers'))
  assert.ok(!queried.has('testimonials'))
})

test('path normalization and cache arguments are stable and tenant/host isolated', () => {
  assert.equal(normalizeGheeRoastPathname(''), '/')
  assert.equal(normalizeGheeRoastPathname('/about/'), '/about')
  assert.equal(normalizeGheeRoastPathname('//menu//'), '/menu')
  assert.equal(normalizeGheeRoastPathname('/nested/page'), null)
  assert.equal(normalizeGheeRoastPathname('/bad value'), null)
  assert.equal(normalizeGheeRoastPathname('/%2fadmin'), null)

  const first = gheeRoastContentCacheArguments(
    'ghee-roast.localhost:3000',
    '/about/',
    site,
  )
  const same = gheeRoastContentCacheArguments(
    'ghee-roast.localhost:3000',
    '/about',
    site,
  )
  const otherHost = gheeRoastContentCacheArguments(
    'unknown.localhost:3000',
    '/about',
    site,
  )
  const otherPage = gheeRoastContentCacheArguments(
    'ghee-roast.localhost:3000',
    '/menu',
    site,
  )
  assert.deepEqual(first, same)
  assert.notDeepEqual(first, otherHost)
  assert.notDeepEqual(first, otherPage)
})
