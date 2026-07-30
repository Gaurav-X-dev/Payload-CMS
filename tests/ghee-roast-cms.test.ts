import assert from 'node:assert/strict'
import test from 'node:test'
import {
  mapGheeRoastCollections,
  mapGheeRoastFooter,
  mapGheeRoastNavigation,
  mapGheeRoastPage,
  mapGheeRoastSite,
  safeGheeRoastHref,
  selectGheeRoastRelationships,
} from '../src/themes/ghee-roast/mappers/cmsContent.ts'

const tenantID = 3167
const tenant = {
  id: tenantID,
  name: 'Ghee Roast',
  branding: {
    accentColor: '#c44d18',
    backgroundColor: '#f4efe6',
    logo: { alt: 'CMS logo', id: 11, tenantId: tenantID, url: '/media/logo.jpg' },
    primaryColor: '#3e5237',
  },
  contact: {
    contactEmail: 'hello@example.com',
    contactPhone: '9910213465',
  },
  typography: {
    bodyFont: 'Source Sans 3',
    headingFont: 'Oswald',
  },
}

test('Ghee Roast site settings control public brand, announcement, integrations, and theme', () => {
  const result = mapGheeRoastSite(tenant, {
    tenantId: tenantID,
    businessName: 'Very Good Ghee Roast',
    tagline: 'CMS tagline',
    siteDescription: 'CMS description',
    contactAddress: 'Delhi & Gurugram',
    showAnnouncementBar: true,
    announcementText: 'Fresh menu now live',
    deliverySettings: {
      deliveryUrls: [{ platform: 'Swiggy', url: 'https://www.swiggy.com/store' }],
    },
    newsletter: {
      enabled: true,
      title: 'Join our list',
      description: 'Monthly updates.',
      buttonLabel: 'Join',
      placeholder: 'you@example.com',
      privacyText: 'No spam.',
    },
    socials: [{ platform: 'instagram', url: 'https://instagram.com/example' }],
  }, tenantID, { fallbacksEnabled: false })

  assert.equal(result.siteName, 'Very Good Ghee Roast')
  assert.deepEqual(result.announcement, { enabled: true, text: 'Fresh menu now live' })
  assert.deepEqual(result.orderLinks, [{ href: 'https://www.swiggy.com/store', label: 'Order on Swiggy' }])
  assert.equal(result.logo?.src, '/media/logo.jpg')
  assert.equal(result.theme.primaryColor, '#3e5237')
  assert.equal(result.newsletter.buttonLabel, 'Join')
})

test('footer and page mappers reject cross-tenant documents and keep published page blocks', () => {
  assert.equal(mapGheeRoastPage({ id: 1, tenantId: 999, status: 'published' }, tenantID), null)

  const page = mapGheeRoastPage({
    id: 7,
    tenantId: tenantID,
    title: 'Events',
    slug: 'events',
    status: 'published',
    _status: 'published',
    layout: [{ blockType: 'eventsBlock', sectionHeader: { title: 'Events' } }],
  }, tenantID)
  assert.equal(page?.slug, 'events')
  assert.equal(page?.layout[0]?.blockType, 'eventsBlock')

  const footer = mapGheeRoastFooter({
    tenantId: tenantID,
    columns: [{ title: 'Explore', links: [{ label: 'Menu', url: '/menu' }] }],
    bottomLinks: [{ label: 'Privacy', url: '/privacy' }],
    copyright: '© {year} VGGR',
  }, tenantID, { fallbacksEnabled: false })
  assert.equal(footer.columns[0]?.links[0]?.href, '/menu')
  assert.equal(footer.bottomLinks[0]?.label, 'Privacy')
})

test('collection mapping is deterministic, tenant scoped, sorted, and null safe', () => {
  const result = mapGheeRoastCollections({
    menuCategories: [
      { id: 2, tenantId: tenantID, title: 'Mains', slug: 'mains', sortOrder: 2, isActive: true },
      { id: 1, tenantId: tenantID, title: 'Starters', slug: 'starters', sortOrder: 1, isActive: true },
      { id: 3, tenantId: 999, title: 'Foreign', slug: 'foreign', sortOrder: 0, isActive: true },
    ],
    menuItems: [{
      id: 10,
      tenantId: tenantID,
      title: 'Chicken Ghee Roast',
      description: 'Slow roasted.',
      price: 450,
      category: { id: 2, slug: 'mains' },
      image: { id: 21, tenantId: tenantID, alt: 'Chicken', url: '/media/chicken.jpg' },
      isAvailable: true,
      isFeatured: true,
    }],
    testimonials: [null],
    gallery: [{ id: 30, tenantId: 999, media: { id: 31, tenantId: 999, url: '/foreign.jpg' } }],
  }, tenantID, { fallbacksEnabled: false })

  assert.deepEqual(result.menu.categories, [
    ['all', 'All Items'],
    ['starters', 'Starters'],
    ['mains', 'Mains'],
  ])
  assert.equal(result.menu.items[0]?.name, 'Chicken Ghee Roast')
  assert.equal(result.menu.items[0]?.price, '₹450')
  assert.equal(result.gallery.length, 0)
  assert.equal(result.testimonials.length, 0)
})

test('URL and relationship helpers reject malformed input and preserve deterministic selections', () => {
  assert.equal(safeGheeRoastHref('/menu'), '/menu')
  assert.equal(safeGheeRoastHref('https://example.test/menu'), 'https://example.test/menu')
  assert.equal(safeGheeRoastHref('javascript:alert(1)'), null)
  assert.equal(safeGheeRoastHref('#menu', 'anchor'), '#menu')
  assert.equal(safeGheeRoastHref('hello@example.test', 'email'), 'mailto:hello@example.test')

  const items = [{ id: 1, title: 'One' }, { id: 2, title: 'Two' }]
  assert.deepEqual(
    selectGheeRoastRelationships(items, [{ id: 2 }, 1]).map((item) => item.id),
    [1, 2],
  )
  assert.deepEqual(selectGheeRoastRelationships(items, [], { empty: 'none' }), [])
  assert.equal(selectGheeRoastRelationships(items, []).length, 2)
})

test('navigation and footer mappers discard unsafe public links', () => {
  const navigation = mapGheeRoastNavigation({
    tenantId: tenantID,
    links: [
      { blockType: 'link', enabled: true, label: 'Menu', type: 'internal', url: '/menu' },
      { blockType: 'link', enabled: true, label: 'Unsafe', type: 'external', url: 'javascript:alert(1)' },
      {
        blockType: 'link',
        enabled: true,
        label: 'Locations',
        type: 'internal',
        url: '/contact',
        children: [
          { label: 'Delhi', url: '/contact#delhi' },
          { label: 'Unsafe child', url: 'data:text/html,bad' },
        ],
      },
    ],
    cta: { enabled: true, label: 'Unsafe CTA', url: 'javascript:alert(1)' },
  }, tenantID, { fallbacksEnabled: false })
  assert.deepEqual(navigation.items.map((item) => item.label), ['Menu', 'Locations'])
  assert.deepEqual(navigation.items[1]?.children?.map((item) => item.label), ['Delhi'])
  assert.equal(navigation.cta.enabled, false)

  const footer = mapGheeRoastFooter({
    tenantId: tenantID,
    columns: [{
      title: 'Explore',
      links: [
        { label: 'Menu', url: '/menu' },
        { label: 'Unsafe', url: 'javascript:alert(1)' },
      ],
    }],
    bottomLinks: [{ label: 'Unsafe', url: 'data:text/html,bad' }],
  }, tenantID, { fallbacksEnabled: false })
  assert.deepEqual(footer.columns[0]?.links.map((item) => item.label), ['Menu'])
  assert.equal(footer.bottomLinks.length, 0)
})

test('menu mapping validates active tenant categories, stock, missing media, and stable IDs', () => {
  const result = mapGheeRoastCollections({
    menuCategories: [
      { id: 1, tenantId: tenantID, title: 'Mains', slug: 'mains', isActive: true },
      { id: 2, tenantId: tenantID, title: 'Hidden', slug: 'hidden', isActive: false },
    ],
    menuItems: [
      {
        id: 10,
        tenantId: tenantID,
        title: 'Zero-price tasting',
        description: 'A valid item without media.',
        price: 0,
        category: 1,
        isAvailable: true,
        isFeatured: true,
      },
      {
        id: 11,
        tenantId: tenantID,
        title: 'Sold out',
        description: 'Unavailable through stock status.',
        price: 100,
        category: 1,
        isAvailable: true,
        stockStatus: 'out_of_stock',
      },
      {
        id: 12,
        tenantId: tenantID,
        title: 'Foreign category',
        description: 'Invalid relationship.',
        price: 200,
        category: { id: 1, tenantId: 999, slug: 'foreign' },
        isAvailable: true,
      },
      {
        id: 13,
        tenantId: tenantID,
        title: 'Inactive category',
        description: 'Invalid relationship.',
        price: 300,
        category: 2,
        isAvailable: true,
      },
    ],
  }, tenantID, { fallbacksEnabled: false })

  assert.equal(result.menu.items.length, 1)
  assert.equal(result.menu.items[0]?.id, 10)
  assert.equal(result.menu.items[0]?.categoryID, 1)
  assert.equal(result.menu.items[0]?.price, '₹0')
  assert.equal(result.menu.items[0]?.image, undefined)
  assert.equal(result.menu.items[0]?.isFeatured, true)
  assert.deepEqual(result.menu.categories, [['all', 'All Items'], ['mains', 'Mains']])
})

test('collection metadata supports manual block selection and defensive event links', () => {
  const result = mapGheeRoastCollections({
    testimonials: [{
      id: 41,
      tenantId: tenantID,
      customerName: 'A Guest',
      customerRole: 'Delhi',
      review: 'Excellent.',
      rating: 3,
      isFeatured: true,
    }],
    gallery: [{
      id: 51,
      tenantId: tenantID,
      category: 'kitchen',
      isFeatured: true,
      media: { id: 52, tenantId: tenantID, alt: 'Kitchen', url: '/media/kitchen.jpg' },
    }],
    events: [{
      id: 61,
      tenantId: tenantID,
      title: 'Malformed date fixture',
      summary: 'Must not expose an unsafe booking link.',
      startsAt: 'not-a-date',
      status: 'published',
      isFeatured: true,
      bookingUrl: 'javascript:alert(1)',
    }],
  }, tenantID, { fallbacksEnabled: false })

  assert.deepEqual(result.testimonials[0], {
    attribution: 'Delhi',
    id: 41,
    isFeatured: true,
    name: 'A Guest',
    quote: 'Excellent.',
    rating: 3,
  })
  assert.equal(result.gallery[0]?.id, 51)
  assert.equal(result.gallery[0]?.category, 'kitchen')
  assert.equal(result.gallery[0]?.isFeatured, true)
  assert.equal(result.events[0]?.isFeatured, true)
  assert.equal(result.events[0]?.bookingUrl, undefined)
  assert.deepEqual(
    selectGheeRoastRelationships(result.testimonials, [41], { empty: 'none' }).map((item) => item.id),
    [41],
  )
})

test('tenant and publication mismatches cannot survive mapper boundaries', () => {
  const foreignSite = mapGheeRoastSite({
    id: 999,
    name: 'Foreign tenant',
    branding: { primaryColor: '#123456' },
  }, null, tenantID, { fallbacksEnabled: false })
  assert.equal(foreignSite.siteName, '')
  assert.equal(foreignSite.theme.primaryColor, undefined)

  assert.equal(mapGheeRoastPage({
    id: 71,
    tenantId: tenantID,
    status: 'published',
    _status: 'draft',
    title: 'Draft',
    slug: 'draft',
  }, tenantID), null)
})
