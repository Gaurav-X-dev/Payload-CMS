import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadCuriousLadooContentWithPayload,
  type CuriousLadooCollectionSlug,
  type CuriousLadooFind,
  type CuriousLadooFindArgs,
} from '../src/lib/site/curiousLadooContentCore.ts'
import {
  mapCuriousLadooLayout,
} from '../src/themes/curious-hub/mappers/cmsContent.ts'
import { configuredContactSubjects } from '../src/hooks/validateContactSubmissionSubject.ts'
import type { LocalSite } from '../src/lib/site/types.ts'
import type { Page } from '../src/payload-types.ts'

const tenantID = 5100
const otherTenantID = 5101
const site = {
  hostname: 'curious-hub.localhost',
  key: 'curious-ladoo',
  theme: 'curious-hub',
} as const satisfies LocalSite

type FixtureMap = Partial<Record<CuriousLadooCollectionSlug, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const calls: CuriousLadooFindArgs[] = []
  const find: CuriousLadooFind = async (args) => {
    calls.push(args)
    return { docs: (fixtures[args.collection] ?? []) as never[] }
  }
  return { calls, find }
}

const tenant = {
  id: tenantID,
  contact: { contactEmail: 'hello@curiousladoo.com', contactPhone: '9876543210' },
  isActive: true,
  name: 'Fixture Curious Ladoo',
  slug: 'curious-ladoo',
  theme: 'curious-hub',
}

const emptyCollections = { blogPosts: [], brands: [], faqs: [], locations: [], portfolio: [], teamMembers: [], testimonials: [] }

const siteSettings = {
  id: 900,
  tenantId: tenantID,
  hours: [
    { day: 'Monday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
    { day: 'Sunday', openTime: '', closeTime: '', isClosed: true },
  ],
}

const location = (overrides: Record<string, unknown>) => ({
  id: 1,
  address: '221B Baker Street',
  city: 'New Delhi',
  isActive: true,
  isPrimary: true,
  showOnContact: true,
  sortOrder: 0,
  tenantId: tenantID,
  title: 'New Delhi (HQ)',
  ...overrides,
})

// ---------------------------------------------------------------------------
// Loader — Contact resolves by slug; locations is a conditional dependency,
// only fetched when a formBlock is present.
// ---------------------------------------------------------------------------

test('published /contact page is visible by slug; draft is hidden', async () => {
  const page = {
    id: 90,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'contact',
    slug: 'contact',
    tenantId: tenantID,
    title: 'Contact',
  }
  const publishedResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [page] }).find,
    host: 'curious-hub.localhost',
    pathname: '/contact',
    site,
  })
  assert.equal(publishedResult.page?.id, 90)

  const draftResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...page, _status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/contact',
    site,
  })
  assert.equal(draftResult.page, null)
})

test('locations collection is only queried when a formBlock is present in the resolved layout', async () => {
  const pageWithForm = {
    id: 91,
    _status: 'published',
    isHomePage: false,
    layout: [{ blockType: 'formBlock', formType: 'contact', sectionHeader: { title: 'Talk to us' }, subjectOptions: [] }],
    pageType: 'contact',
    slug: 'contact',
    tenantId: tenantID,
    title: 'Contact',
  }
  const { calls, find } = fakePayload({ tenants: [tenant], pages: [pageWithForm] })
  await loadCuriousLadooContentWithPayload({ find, host: 'curious-hub.localhost', pathname: '/contact', site })
  const queried = new Set(calls.map((call) => call.collection))
  assert.ok(queried.has('locations'), 'formBlock in the layout must trigger a locations query')

  const pageWithoutForm = { ...pageWithForm, id: 92, layout: [] }
  const { calls: callsWithout, find: findWithout } = fakePayload({ tenants: [tenant], pages: [pageWithoutForm] })
  await loadCuriousLadooContentWithPayload({ find: findWithout, host: 'curious-hub.localhost', pathname: '/contact', site })
  const queriedWithout = new Set(callsWithout.map((call) => call.collection))
  assert.equal(queriedWithout.has('locations'), false, 'no formBlock in the layout, so locations must not be queried')
})

// ---------------------------------------------------------------------------
// Mapper — formBlock: showContactInfoCards branching, tenant-derived general
// contact info, Site Settings hours, tenant-isolated Locations list
// ---------------------------------------------------------------------------

test('formBlock with showContactInfoCards unset (or false) maps contactInfo to null; subjectOptions still pass through', () => {
  const layout = [
    {
      blockType: 'formBlock',
      formType: 'contact',
      sectionHeader: { title: 'Talk to us' },
      subjectOptions: [{ label: 'General Inquiry', value: 'other' }],
      submitLabel: 'Send',
      successMessage: 'Thanks',
      errorMessage: 'Failed',
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections, tenant as never, null)
  const block = mapped[0]
  assert.equal(block.type, 'form')
  if (block.type === 'form') {
    assert.equal(block.contactInfo, null)
    assert.deepEqual(block.subjectOptions, [{ label: 'General Inquiry', value: 'other' }])
    assert.equal(block.submitLabel, 'Send')
  }
})

test('formBlock with showContactInfoCards true composes contactInfo from tenant.contact, Site Settings hours, and tenant-scoped Locations', () => {
  const layout = [
    {
      blockType: 'formBlock',
      formType: 'contact',
      showContactInfoCards: true,
      sectionHeader: { title: 'Talk to us' },
      subjectOptions: [{ label: 'General Inquiry', value: 'other' }],
    },
  ] as unknown as Page['layout']
  const locations = [
    location({ id: 1, city: 'New Delhi', title: 'New Delhi (HQ)' }),
    location({ id: 2, city: 'Mumbai', isPrimary: false, title: 'Mumbai', tenantId: tenantID }),
    location({ id: 3, city: 'Other Tenant City', isPrimary: false, title: 'Cross-tenant location', tenantId: otherTenantID }),
  ]
  const mapped = mapCuriousLadooLayout(
    layout,
    tenantID,
    { ...emptyCollections, locations: locations as never },
    tenant as never,
    siteSettings as never,
  )
  const block = mapped[0]
  assert.equal(block.type, 'form')
  if (block.type === 'form') {
    assert.ok(block.contactInfo)
    assert.equal(block.contactInfo?.generalEmail, 'hello@curiousladoo.com')
    assert.equal(block.contactInfo?.generalPhone, '+91 98765 43210', 'normalized 10-digit phone must reformat to +91 XXXXX XXXXX for display')
    assert.deepEqual(
      block.contactInfo?.hours.map((row) => [row.day, row.isClosed]),
      [['Monday', false], ['Sunday', true]],
    )
    assert.deepEqual(
      block.contactInfo?.locations.map((loc) => loc.name),
      ['New Delhi (HQ)', 'Mumbai'],
      'the cross-tenant location must never appear',
    )
  }
})

test('formBlock respects enabled: false, matching heroBlock\'s existing enabled contract', () => {
  const layout = [
    { blockType: 'formBlock', enabled: false, formType: 'contact', sectionHeader: { title: 'Talk to us' }, subjectOptions: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections, tenant as never, null)
  assert.deepEqual(mapped, [])
})

// ---------------------------------------------------------------------------
// Mapper — officeMapBlock
// ---------------------------------------------------------------------------

test('officeMapBlock maps header and markers in order', () => {
  const layout = [
    {
      blockType: 'officeMapBlock',
      sectionHeader: { eyebrow: 'Interactive Directory', title: 'Where We', subtitle: 'Operate.' },
      markers: [
        { label: 'HQ — New Delhi Office', left: '65%', top: '52%' },
        { label: 'Mumbai Office', left: '62%', top: '58%' },
      ],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections)
  const block = mapped[0]
  assert.equal(block.type, 'officemap')
  if (block.type === 'officemap') {
    assert.equal(block.header.title, 'Where We')
    assert.deepEqual(block.markers, [
      { label: 'HQ — New Delhi Office', left: '65%', top: '52%' },
      { label: 'Mumbai Office', left: '62%', top: '58%' },
    ])
  }
})

test('layout order is preserved: hero, form, officemap, faq render in the order stored', () => {
  const layout = [
    { blockType: 'heroBlock', description: 'x', heading: 'Contact' },
    { blockType: 'formBlock', formType: 'contact', sectionHeader: { title: 'Talk to us' }, subjectOptions: [] },
    { blockType: 'officeMapBlock', sectionHeader: { title: 'Where We' }, markers: [{ label: 'HQ', left: '1%', top: '1%' }] },
    { blockType: 'faqBlock', presentation: 'tabs', sectionHeader: { title: 'Common' }, items: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, emptyCollections, tenant as never, null)
  assert.deepEqual(mapped.map((block) => block.type), ['hero', 'form', 'officemap', 'faq'])
})

// ---------------------------------------------------------------------------
// Server-side subject validation — confirms this milestone's specific design
// choice (pageType: 'contact') actually engages the shared, already-tested
// validateContactSubmissionSubject mechanism. The mechanism itself (tenant
// derivation, spoofing rejection, normalization) is covered by the existing
// tests/ghee-roast-forms.test.ts suite, reused here unmodified.
// ---------------------------------------------------------------------------

test("a Curious Ladoo page with pageType 'contact' correctly exposes its formBlock.subjectOptions to configuredContactSubjects", () => {
  const contactPage = {
    _status: 'published',
    pageType: 'contact',
    layout: [
      {
        blockType: 'formBlock',
        enabled: true,
        subjectOptions: [
          { label: 'New Brand Creation', value: 'brand' },
          { label: 'Restaurant Consulting', value: 'consulting' },
          { label: 'B2B Solutions', value: 'b2b' },
          { label: 'General Inquiry', value: 'other' },
        ],
      },
    ],
  }
  const allowed = configuredContactSubjects([contactPage])
  assert.deepEqual(allowed, ['brand', 'consulting', 'b2b', 'other'], 'the submitted subject field carries the option VALUE, not its label')
})
