import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadZuruZuruPageWithPayload,
  type ZuruZuruFind,
} from '../src/lib/site/zuruZuruContentCore.ts'
import {
  mapZuruZuruFAQ,
  mapZuruZuruForm,
  mapZuruZuruLocationsBlock,
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
// Mapper — Form (subject options, formType, messages)
// ---------------------------------------------------------------------------

test('mapZuruZuruForm maps subjectOptions/formType/messages verbatim', () => {
  const block = {
    errorMessage: 'We could not submit the form.',
    formType: 'contact',
    sectionHeader: { description: "Have a question or feedback? We'd love to hear from you.", title: 'Send a Message' },
    submitLabel: 'Send Message',
    subjectOptions: [
      { label: 'General Inquiry', value: 'General Inquiry' },
      { label: 'Careers', value: 'Careers' },
    ],
    successMessage: 'Thank you. We will be in touch shortly.',
  }
  const mapped = mapZuruZuruForm(block as never)
  assert.equal(mapped.formType, 'contact')
  assert.equal(mapped.headerTitle, 'Send a Message')
  assert.deepEqual(mapped.subjectOptions, [
    { label: 'General Inquiry', value: 'General Inquiry' },
    { label: 'Careers', value: 'Careers' },
  ])
  assert.equal(mapped.successMessage, 'Thank you. We will be in touch shortly.')
})

test('mapZuruZuruForm defaults formType to "contact" when unset', () => {
  const mapped = mapZuruZuruForm({ sectionHeader: { title: 'Send a Message' }, subjectOptions: [] } as never)
  assert.equal(mapped.formType, 'contact')
})

// ---------------------------------------------------------------------------
// Mapper — FAQ (explicit selection vs auto-pulled pool, tenant/active filtering)
// ---------------------------------------------------------------------------

test('mapZuruZuruFAQ uses exactly the explicitly-selected items, in sortOrder, ignoring inactive/cross-tenant items outside that selection', () => {
  const faqs = [
    { answer: 'a1', id: 1, isActive: true, sortOrder: 2, tenantId: tenantID, title: 'Q1' },
    { answer: 'a2', id: 2, isActive: true, sortOrder: 0, tenantId: tenantID, title: 'Q2' },
    { answer: 'a3', id: 3, isActive: true, sortOrder: 1, tenantId: 9999, title: 'Cross-tenant (never selected)' },
  ]
  const block = { items: [1, 2], sectionHeader: { title: 'FAQs' } }
  const mapped = mapZuruZuruFAQ(block as never, faqs as never, tenantID)
  assert.deepEqual(mapped.items.map((item) => item.question), ['Q2', 'Q1'])
})

test('mapZuruZuruFAQ falls back to the active tenant pool (respecting featuredOnly and limit) when items is empty', () => {
  const faqs = [
    { answer: 'a1', id: 1, isActive: true, isFeatured: true, sortOrder: 0, tenantId: tenantID, title: 'Featured' },
    { answer: 'a2', id: 2, isActive: true, isFeatured: false, sortOrder: 1, tenantId: tenantID, title: 'Not featured' },
    { answer: 'a3', id: 3, isActive: false, isFeatured: true, sortOrder: 2, tenantId: tenantID, title: 'Inactive (excluded)' },
  ]
  const block = { featuredOnly: true, limit: 10, sectionHeader: { title: 'FAQs' } }
  const mapped = mapZuruZuruFAQ(block as never, faqs as never, tenantID)
  assert.deepEqual(mapped.items.map((item) => item.question), ['Featured'])
})

// ---------------------------------------------------------------------------
// Mapper — Locations (mapsEmbedUrl / city, used by the Contact page's real map iframe)
// ---------------------------------------------------------------------------

test('mapZuruZuruLocationsBlock maps mapsEmbedUrl and city (used by the Contact page\'s live Google Maps embed)', () => {
  const location = {
    address: '23, Shahpur Jat',
    city: 'New Delhi',
    id: 6,
    isActive: true,
    isPrimary: true,
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=example',
    tenantId: tenantID,
  }
  const block = { locations: [6], sectionHeader: { title: 'Map' }, showMap: true }
  const mapped = mapZuruZuruLocationsBlock(block as never, [location] as never, tenantID)
  assert.equal(mapped.location?.mapsEmbedUrl, 'https://www.google.com/maps/embed?pb=example')
  assert.equal(mapped.location?.city, 'New Delhi')
})

// ---------------------------------------------------------------------------
// Mapper — full layout dispatch for the Contact page's block set
// ---------------------------------------------------------------------------

test('mapZuruZuruPageLayout dispatches formBlock and faqBlock, and omits a disabled form', () => {
  const layout = [
    { blockType: 'heroBlock', enabled: true, heading: 'Get in Touch' },
    { blockType: 'formBlock', enabled: true, formType: 'contact', sectionHeader: { title: 'Send a Message' }, subjectOptions: [] },
    { blockType: 'formBlock', enabled: false, formType: 'contact', sectionHeader: { title: 'Hidden' }, subjectOptions: [] },
    { blockType: 'locationsBlock', sectionHeader: { title: 'Map' }, showMap: true },
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' } },
  ]
  const blocks = mapZuruZuruPageLayout(layout as never, { faqs: [], locations: [], menuItems: [], testimonials: [], tenantID })
  assert.deepEqual(blocks.map((b) => b.type), ['hero', 'form', 'locations', 'faq'])
})

// ---------------------------------------------------------------------------
// Loader — resolving the Contact page by slug, and only fetching FAQs when a faqBlock is present
// ---------------------------------------------------------------------------

type FixtureMap = Partial<Record<string, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const calls: { collection: string }[] = []
  const find: ZuruZuruFind = async (args) => {
    calls.push({ collection: args.collection })
    return { docs: (fixtures[args.collection] ?? []) as never[] }
  }
  return { calls, find }
}

test('loadZuruZuruPageWithPayload resolves the published Contact page by slug and fetches FAQs only because a faqBlock is present', () => {
  return (async () => {
    const contactPage = {
      _status: 'published',
      id: 4,
      isHomePage: false,
      layout: [{ blockType: 'heroBlock' }, { blockType: 'formBlock' }, { blockType: 'faqBlock' }],
      slug: 'contact',
      tenantId: tenantID,
    }
    const faq = { answer: 'a', id: 1, isActive: true, sortOrder: 0, tenantId: tenantID, title: 'Do you have parking?' }
    const { calls, find } = fakePayload({ faqs: [faq], pages: [contactPage], tenants: [tenant] })
    const result = await loadZuruZuruPageWithPayload({ find, host: 'zuru-zuru.localhost', pathname: '/contact', site })
    assert.equal(result.tenantState, 'active')
    assert.equal(result.page?.id, 4)
    assert.deepEqual(result.faqs, [faq])
    assert.equal(calls.some((c) => c.collection === 'faqs'), true)
    assert.equal(calls.some((c) => c.collection === 'menu-items'), false)
  })()
})
