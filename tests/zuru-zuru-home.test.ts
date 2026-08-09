import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadZuruZuruPageWithPayload,
  type ZuruZuruCollectionSlug,
  type ZuruZuruFind,
  type ZuruZuruFindArgs,
} from '../src/lib/site/zuruZuruContentCore.ts'
import {
  mapZuruZuruCardGrid,
  mapZuruZuruHero,
  mapZuruZuruLocationsBlock,
  mapZuruZuruMenuShowcase,
  mapZuruZuruPageLayout,
  mapZuruZuruStory,
  mapZuruZuruTestimonialsBlock,
} from '../src/themes/zuru-zuru/mappers/cmsContent.ts'
import { groupBusinessHours } from '../src/themes/zuru-zuru/utils/formatHours.ts'
import type { LocalSite } from '../src/lib/site/types.ts'

const tenantID = 7100

const site = {
  hostname: 'zuru-zuru.localhost',
  key: 'zuru-zuru',
  theme: 'zuru-zuru',
} as const satisfies LocalSite

type FixtureMap = Partial<Record<ZuruZuruCollectionSlug, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const calls: ZuruZuruFindArgs[] = []
  const find: ZuruZuruFind = async (args) => {
    calls.push(args)
    return { docs: (fixtures[args.collection] ?? []) as never[] }
  }
  return { calls, find }
}

const tenant = {
  id: tenantID,
  isActive: true,
  name: 'Fixture Zuru Zuru',
  slug: 'zuru-zuru',
  theme: 'zuru-zuru',
}

// ---------------------------------------------------------------------------
// Mapper — Hero
// ---------------------------------------------------------------------------

test('mapZuruZuruHero maps heading/CTAs/image and treats a disabled hero as unrendered upstream', () => {
  const block = {
    blockType: 'heroBlock',
    description: 'A Japanese Izakaya experience.',
    enabled: true,
    foregroundImage: { alt: '', id: 5, tenantId: tenantID, url: '/media/chef.png' },
    heading: 'Good Food.\nGood Times.',
    highlightedHeading: 'Always.',
    imageAlt: 'Premium Ramen Bowl',
    primaryCTALabel: 'Explore Menu',
    primaryCTAURL: '/menu',
    secondaryCTALabel: 'Reserve a Table',
    secondaryCTAURL: '/reservation',
    stampText: '印',
  }
  const mapped = mapZuruZuruHero(block as never, tenantID)
  assert.equal(mapped.heading, 'Good Food.\nGood Times.')
  assert.equal(mapped.highlightedHeading, 'Always.')
  assert.deepEqual(mapped.primaryCTA, { label: 'Explore Menu', url: '/menu' })
  assert.deepEqual(mapped.secondaryCTA, { label: 'Reserve a Table', url: '/reservation' })
  assert.equal(mapped.image?.src, '/media/chef.png')
  assert.equal(mapped.stampText, '印')
})

test('mapZuruZuruHero maps eyebrow and desktopBackgroundImage (used by the Menu page\'s inner-hero treatment)', () => {
  const block = {
    blockType: 'heroBlock',
    description: 'Authentic Japanese dishes prepared with premium ingredients.',
    desktopBackgroundImage: { alt: '', id: 9, tenantId: tenantID, url: '/media/chef-bg.png' },
    enabled: true,
    eyebrow: 'Home / Menu',
    heading: 'Our Menu',
  }
  const mapped = mapZuruZuruHero(block as never, tenantID)
  assert.equal(mapped.eyebrow, 'Home / Menu')
  assert.equal(mapped.backgroundImage?.src, '/media/chef-bg.png')
})

// ---------------------------------------------------------------------------
// Mapper — CardGrid variant selection (customClasses discriminator)
// ---------------------------------------------------------------------------

test('mapZuruZuruCardGrid reads the variant from settings.customClasses, defaulting to "cuisine"', () => {
  const baseHeader = { subtitle: '', title: 'Section', eyebrow: '' }
  const cuisine = mapZuruZuruCardGrid({ cards: [], sectionHeader: baseHeader } as never, tenantID)
  const dining = mapZuruZuruCardGrid({ cards: [], sectionHeader: baseHeader, settings: { customClasses: 'dining' } } as never, tenantID)
  const seasons = mapZuruZuruCardGrid({ cards: [], sectionHeader: baseHeader, settings: { customClasses: 'seasons' } } as never, tenantID)
  const unknown = mapZuruZuruCardGrid({ cards: [], sectionHeader: baseHeader, settings: { customClasses: 'not-a-real-variant' } } as never, tenantID)
  assert.equal(cuisine.variant, 'cuisine')
  assert.equal(dining.variant, 'dining')
  assert.equal(seasons.variant, 'seasons')
  assert.equal(unknown.variant, 'cuisine')
})

test('mapZuruZuruCardGrid maps card image/title/description and only resolves a link when enableLink is true', () => {
  const block = {
    cards: [
      {
        description: 'Pristine cuts, exquisite presentation',
        enableLink: false,
        image: { item: { alt: '', id: 1, tenantId: tenantID, url: '/media/sushi.png' } },
        link: { label: 'Ignored', type: 'custom', url: '/ignored' },
        title: 'Sushi & Sashimi',
      },
      {
        description: 'View the collection',
        enableLink: true,
        image: { item: { alt: '', id: 2, tenantId: tenantID, url: '/media/season.png' } },
        link: { label: 'View Collection', type: 'custom', url: '/menu' },
        title: 'Spring · 春 · Sakura',
      },
    ],
    sectionHeader: { eyebrow: 'What We Serve', subtitle: '料理を探る', title: 'Explore Our Cuisine' },
  }
  const mapped = mapZuruZuruCardGrid(block as never, tenantID)
  assert.equal(mapped.header.japanese, '料理を探る')
  assert.equal(mapped.cards[0].image?.src, '/media/sushi.png')
  assert.equal(mapped.cards[0].link, null)
  assert.deepEqual(mapped.cards[1].link, { label: 'View Collection', url: '/menu' })
})

// ---------------------------------------------------------------------------
// Mapper — Story (multi-paragraph body, gated CTA)
// ---------------------------------------------------------------------------

test('mapZuruZuruStory only resolves the CTA when enableCta is true', () => {
  const withCta = mapZuruZuruStory({
    body: 'Paragraph one.\n\nParagraph two.',
    cta: { label: 'Read Our Full Story', type: 'custom', url: '/about' },
    enableCta: true,
    eyebrow: 'Our Story',
    title: 'A Journey Through Japanese Culinary Heritage',
  } as never, tenantID)
  assert.deepEqual(withCta.cta, { label: 'Read Our Full Story', url: '/about' })

  const withoutCta = mapZuruZuruStory({
    body: 'Paragraph one.',
    cta: { label: 'Read Our Full Story', type: 'custom', url: '/about' },
    enableCta: false,
    title: 'A Journey Through Japanese Culinary Heritage',
  } as never, tenantID)
  assert.equal(withoutCta.cta, null)
})

// ---------------------------------------------------------------------------
// Mapper — Menu Showcase (featuredOnly / category / limit filtering, spiceLevel -> heat)
// ---------------------------------------------------------------------------

test('mapZuruZuruMenuShowcase filters by isAvailable/isFeatured/category, sorts by displayOrder, and respects limit', () => {
  const category = { id: 40, isActive: true, sortOrder: 0, tenantId: tenantID, title: 'Signature Dishes' }
  const otherCategory = { id: 41, isActive: true, sortOrder: 1, tenantId: tenantID, title: 'Other' }
  const menuItems = [
    { id: 1, badge: 'chef', calories: 320, category, description: 'a', displayOrder: 1, isAvailable: true, isFeatured: true, price: 24, spiceLevel: 'mild', tenantId: tenantID, title: 'Toro Tartare' },
    { id: 2, badge: 'popular', calories: 680, category, description: 'b', displayOrder: 0, isAvailable: true, isFeatured: true, price: 18, spiceLevel: 'medium', tenantId: tenantID, title: 'Tonkotsu Black' },
    { id: 3, calories: 100, category, description: 'not featured', displayOrder: 2, isAvailable: true, isFeatured: false, price: 10, spiceLevel: 'none', tenantId: tenantID, title: 'Skipped (not featured)' },
    { id: 4, calories: 100, category, description: 'unavailable', displayOrder: 3, isAvailable: false, isFeatured: true, price: 10, spiceLevel: 'none', tenantId: tenantID, title: 'Skipped (unavailable)' },
    { id: 5, calories: 100, category: otherCategory, description: 'other category', displayOrder: 4, isAvailable: true, isFeatured: true, price: 10, spiceLevel: 'none', tenantId: 9999, title: 'Skipped (cross-tenant)' },
  ]
  const block = { categories: [category.id], ctaGroup: { enablePrimary: true, primaryCTA: { label: 'View Full Menu', type: 'custom', url: '/menu' } }, featuredOnly: true, limit: 6, sectionHeader: { title: 'Signature Dishes' } }
  const mapped = mapZuruZuruMenuShowcase(block as never, menuItems as never, tenantID)
  assert.deepEqual(mapped.items.map((item) => item.name), ['Tonkotsu Black', 'Toro Tartare'])
  assert.equal(mapped.items[0].heat, 2)
  assert.equal(mapped.items[1].heat, 1)
  assert.equal(mapped.items[0].badge, 'popular')
  assert.equal(mapped.items[1].badge, 'chef')
  assert.deepEqual(mapped.cta, { label: 'View Full Menu', url: '/menu' })
})

test('mapZuruZuruMenuShowcase maps badge "none", null, undefined, missing, and an unrecognized value all to null', () => {
  const category = { id: 40, isActive: true, sortOrder: 0, tenantId: tenantID, title: 'Signature Dishes' }
  const baseItem = { calories: 100, category, description: 'd', displayOrder: 0, isAvailable: true, isFeatured: true, price: 10, spiceLevel: 'none', tenantId: tenantID }
  const menuItems = [
    { ...baseItem, id: 1, badge: 'none', title: 'Explicit none' },
    { ...baseItem, id: 2, badge: null, title: 'Null badge' },
    { ...baseItem, id: 3, title: 'Missing badge field' },
    { ...baseItem, id: 4, badge: 'not-a-real-badge', title: 'Unrecognized value' },
    { ...baseItem, id: 5, badge: 'new', title: 'Real badge' },
  ]
  const block = { featuredOnly: true, limit: 10, sectionHeader: { title: 'Signature Dishes' } }
  const mapped = mapZuruZuruMenuShowcase(block as never, menuItems as never, tenantID)
  assert.deepEqual(mapped.items.map((item) => item.badge), [null, null, null, null, 'new'])
})

test('mapZuruZuruMenuShowcase resolves each dish\'s category (slug/title) when populated, and null when only an ID is present (used by the Menu page\'s category filter buttons)', () => {
  const sushiCategory = { id: 14, isActive: true, slug: 'sushi', sortOrder: 0, tenantId: tenantID, title: 'Sushi & Sashimi' }
  const menuItems = [
    { calories: 100, category: sushiCategory, description: 'd', displayOrder: 0, id: 1, isAvailable: true, isFeatured: false, price: 850, spiceLevel: 'none', tenantId: tenantID, title: 'Spicy Tuna Roll' },
    { calories: 100, category: 14, description: 'd', displayOrder: 1, id: 2, isAvailable: true, isFeatured: false, price: 750, spiceLevel: 'none', tenantId: tenantID, title: 'California Roll' },
  ]
  const block = { featuredOnly: false, limit: 10, sectionHeader: { title: 'Our Menu' } }
  const mapped = mapZuruZuruMenuShowcase(block as never, menuItems as never, tenantID)
  assert.deepEqual(mapped.items[0].category, { slug: 'sushi', title: 'Sushi & Sashimi' })
  assert.equal(mapped.items[1].category, null)
})

// ---------------------------------------------------------------------------
// Mapper — Testimonials (single featured testimonial)
// ---------------------------------------------------------------------------

test('mapZuruZuruTestimonialsBlock selects only featured testimonials for the current tenant, honoring limit', () => {
  const testimonials = [
    { customerName: 'Rahul Sharma', customerRole: 'Food Critic', id: 1, isFeatured: true, rating: 5, review: 'Amazing.', sortOrder: 0, tenantId: tenantID },
    { customerName: 'Cross Tenant', customerRole: '', id: 2, isFeatured: true, rating: 5, review: 'Nope.', sortOrder: 1, tenantId: 9999 },
    { customerName: 'Not Featured', customerRole: '', id: 3, isFeatured: false, rating: 5, review: 'Nope.', sortOrder: -1, tenantId: tenantID },
  ]
  const block = { featuredOnly: true, limit: 1, sectionHeader: { title: 'What Our Guests Say' }, source: 'collection' }
  const mapped = mapZuruZuruTestimonialsBlock(block as never, testimonials as never, tenantID)
  assert.equal(mapped.items.length, 1)
  assert.equal(mapped.items[0].name, 'Rahul Sharma')
})

// ---------------------------------------------------------------------------
// Mapper — Locations (primary selection, hours/parking mapping)
// ---------------------------------------------------------------------------

test('mapZuruZuruLocationsBlock picks the explicitly-related primary location and maps hours/parking', () => {
  const location = {
    address: '23, Shahpur Jat\nSiri Fort, New Delhi 110049\nIndia',
    businessHours: [{ closeTime: '10:30 PM', day: 'Monday', isClosed: false, openTime: '12:00 PM' }],
    description: 'Complimentary valet parking available.',
    id: 9,
    isActive: true,
    isPrimary: true,
    tenantId: tenantID,
  }
  const block = { locations: [9], sectionHeader: { title: 'Visit Zuru Zuru' }, showMap: true }
  const mapped = mapZuruZuruLocationsBlock(block as never, [location] as never, tenantID)
  assert.equal(mapped.location?.parking, 'Complimentary valet parking available.')
  assert.deepEqual(mapped.location?.hours[0], { closeTime: '10:30 PM', day: 'Monday', isClosed: false, openTime: '12:00 PM' })
  assert.equal(mapped.showMap, true)
})

// ---------------------------------------------------------------------------
// Mapper — full Home layout dispatch (disabled hero omitted, unknown block types ignored)
// ---------------------------------------------------------------------------

test('mapZuruZuruPageLayout dispatches each block type and omits a disabled hero', () => {
  const layout = [
    { blockType: 'heroBlock', description: 'd', enabled: false, heading: 'Hidden Hero' },
    { blockType: 'featurestripBlock', items: [{ description: 'd', icon: 'bowl', title: 'Izakaya Culture' }] },
    { blockType: 'someFutureBlockType' },
  ]
  const blocks = mapZuruZuruPageLayout(layout as never, { faqs: [], locations: [], menuItems: [], testimonials: [], tenantID })
  assert.deepEqual(blocks.map((b) => b.type), ['featureStrip'])
})

// ---------------------------------------------------------------------------
// Hours grouping (Visit Us section — distinct from the header/footer's single-line summary)
// ---------------------------------------------------------------------------

test('groupBusinessHours collapses consecutive identical days into a single range line', () => {
  const hours = [
    { closeTime: '10:30 PM', day: 'Monday', isClosed: false, openTime: '12:00 PM' },
    { closeTime: '10:30 PM', day: 'Tuesday', isClosed: false, openTime: '12:00 PM' },
    { closeTime: '10:30 PM', day: 'Wednesday', isClosed: false, openTime: '12:00 PM' },
    { closeTime: '10:30 PM', day: 'Thursday', isClosed: false, openTime: '12:00 PM' },
    { closeTime: '11:30 PM', day: 'Friday', isClosed: false, openTime: '12:00 PM' },
    { closeTime: '11:30 PM', day: 'Saturday', isClosed: false, openTime: '12:00 PM' },
    { closeTime: '10:00 PM', day: 'Sunday', isClosed: false, openTime: '12:00 PM' },
  ]
  assert.deepEqual(groupBusinessHours(hours), [
    'Monday – Thursday: 12:00 PM – 10:30 PM',
    'Friday – Saturday: 12:00 PM – 11:30 PM',
    'Sunday: 12:00 PM – 10:00 PM',
  ])
})

// ---------------------------------------------------------------------------
// Loader — any CMS-driven page (Home via isHomePage, Menu via slug) + dependent collections
// ---------------------------------------------------------------------------

test('loadZuruZuruPageWithPayload resolves the published Home page and only fetches collections the layout actually uses', () => {
  return (async () => {
    const page = {
      _status: 'published',
      id: 1,
      isHomePage: true,
      layout: [{ blockType: 'testimonialsBlock' }],
      tenantId: tenantID,
    }
    const testimonial = { customerName: 'Rahul Sharma', id: 1, isFeatured: true, rating: 5, review: 'Great.', tenantId: tenantID }
    const { calls, find } = fakePayload({ pages: [page], tenants: [tenant], testimonials: [testimonial] })
    const result = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/', site })
    assert.equal(result.tenantState, 'active')
    assert.equal(result.page?.id, 1)
    assert.deepEqual(result.testimonials, [testimonial])
    assert.equal(result.menuItems.length, 0)
    assert.equal(result.locations.length, 0)
    assert.equal(calls.some((c) => c.collection === 'menu-items'), false)
    assert.equal(calls.some((c) => c.collection === 'testimonials'), true)
  })()
})

test('loadZuruZuruPageWithPayload resolves a non-Home page by slug (e.g. Menu) and rejects a Home page from matching a slug lookup', () => {
  return (async () => {
    const menuPage = {
      _status: 'published',
      id: 2,
      isHomePage: false,
      layout: [{ blockType: 'menushowcaseBlock' }],
      slug: 'menu',
      tenantId: tenantID,
    }
    const homePage = { _status: 'published', id: 1, isHomePage: true, layout: [], slug: '', tenantId: tenantID }
    const menuItem = { badge: 'none', calories: 100, category: { id: 1, slug: 'sushi', tenantId: tenantID, title: 'Sushi' }, description: 'd', displayOrder: 0, id: 1, isAvailable: true, isFeatured: false, price: 500, spiceLevel: 'none', tenantId: tenantID, title: 'Spicy Tuna Roll' }
    const { find } = fakePayload({ 'menu-items': [menuItem], pages: [menuPage, homePage], tenants: [tenant] })
    const result = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/menu', site })
    assert.equal(result.tenantState, 'active')
    assert.equal(result.page?.id, 2)
    assert.equal(result.menuItems.length, 1)
  })()
})

test('loadZuruZuruPageWithPayload returns empty for a missing tenant, an unpublished page, or a mismatched host/theme', () => {
  return (async () => {
    const missingTenant = await loadZuruZuruPageWithPayload({ find: fakePayload({}).find, host: 'zuru-zuru.localhost', pathname: '/', site })
    assert.equal(missingTenant.tenantState, 'missing')
    assert.equal(missingTenant.page, null)

    const unpublished = await loadZuruZuruPageWithPayload({
      find: fakePayload({ pages: [], tenants: [tenant] }).find,
      host: 'zuru-zuru.localhost',
      pathname: '/',
      site,
    })
    assert.equal(unpublished.tenantState, 'empty')
    assert.equal(unpublished.page, null)

    const mismatched = await loadZuruZuruPageWithPayload({
      find: fakePayload({ tenants: [tenant] }).find,
      host: 'curious-hub.localhost',
      pathname: '/',
      site,
    })
    assert.equal(mismatched.tenantState, 'missing')
  })()
})
