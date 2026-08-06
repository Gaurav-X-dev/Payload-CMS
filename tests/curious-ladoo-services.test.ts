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
import type { LocalSite } from '../src/lib/site/types.ts'
import type { Page } from '../src/payload-types.ts'

const tenantID = 4400
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
  isActive: true,
  name: 'Fixture Curious Ladoo',
  slug: 'curious-ladoo',
  theme: 'curious-hub',
}

const media = (id: number, tenantIdValue: number, url = `/media/${id}.png`) => ({
  id,
  alt: `Image ${id}`,
  tenantId: tenantIdValue,
  url,
})

// ---------------------------------------------------------------------------
// Loader — Services resolves by slug like any other inner page; faqs is a
// conditional collection dependency, only fetched when a faqBlock is present.
// ---------------------------------------------------------------------------

test('published /services page is visible by slug', async () => {
  const servicesPage = {
    id: 20,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'generic',
    slug: 'services',
    tenantId: tenantID,
    title: 'Services',
  }
  const result = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [servicesPage] }).find,
    host: 'curious-hub.localhost',
    pathname: '/services',
    site,
  })
  assert.equal(result.page?.id, 20)
})

test('faqs collection is only queried when a faqBlock is present in the resolved layout', async () => {
  const pageWithFAQs = {
    id: 21,
    _status: 'published',
    isHomePage: false,
    layout: [{ blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [] }],
    pageType: 'generic',
    slug: 'services',
    tenantId: tenantID,
    title: 'Services',
  }
  const { calls, find } = fakePayload({ tenants: [tenant], pages: [pageWithFAQs], faqs: [] })
  await loadCuriousLadooContentWithPayload({ find, host: 'curious-hub.localhost', pathname: '/services', site })
  const queried = new Set(calls.map((call) => call.collection))
  assert.ok(queried.has('faqs'), 'faqBlock in the layout must trigger a faqs query')

  const pageWithoutFAQs = { ...pageWithFAQs, id: 22, layout: [] }
  const { calls: callsWithout, find: findWithout } = fakePayload({ tenants: [tenant], pages: [pageWithoutFAQs] })
  await loadCuriousLadooContentWithPayload({ find: findWithout, host: 'curious-hub.localhost', pathname: '/services', site })
  const queriedWithout = new Set(callsWithout.map((call) => call.collection))
  assert.equal(queriedWithout.has('faqs'), false, 'no faqBlock in the layout, so faqs must not be queried')
})

// ---------------------------------------------------------------------------
// Mapper — Services-specific block shapes
// ---------------------------------------------------------------------------

test('Capability block maps repeatable items with features, image, link, and reverse', () => {
  const layout = [
    {
      blockType: 'capabilityBlock',
      sectionHeader: { title: 'End-to-End Sustenance.', subtitle: 'Sustenance.' },
      items: [
        {
          number: '01',
          anchorId: 'brands',
          title: 'Restaurant Brands & Incubation',
          description: 'We conceptualize, launch, and operate premium dining brands.',
          features: [{ text: 'Demographic mapping' }, { text: 'Brand identity design' }],
          enableLink: true,
          link: { type: 'custom', label: 'Explore Brands', url: '/brands' },
          media: { item: media(40, tenantID) },
          reverse: false,
        },
        {
          number: '02',
          anchorId: 'consulting',
          title: 'Hospitality Consulting & Advisory',
          description: 'Our consulting division audits operational bottlenecks.',
          features: [],
          enableLink: false,
          media: { item: media(41, tenantID) },
          reverse: true,
        },
      ],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'capability')
  if (block.type === 'capability') {
    assert.equal(block.items.length, 2)
    const [first, second] = block.items
    assert.equal(first.number, '01')
    assert.equal(first.anchorId, 'brands')
    assert.deepEqual(first.features, ['Demographic mapping', 'Brand identity design'])
    assert.equal(first.link?.url, '/brands')
    assert.equal(first.image?.id, 40)
    assert.equal(first.reverse, false)

    assert.equal(second.link, null, 'enableLink=false must suppress the link even if link data exists')
    assert.deepEqual(second.features, [])
    assert.equal(second.reverse, true)
  }
})

test("ContentGrid 'benefits' presentation passes through with plain (non-numbered) items", () => {
  const layout = [
    {
      blockType: 'contentgridBlock',
      presentation: 'benefits',
      sectionHeader: { title: 'Our Systems Advantage.', subtitle: 'Advantage.' },
      items: [
        { title: 'PORTION CONTROL SYSTEMS', description: 'Digital SOP binders.' },
        { title: 'COMMERCIAL COMPLIANCE', description: 'Full regulatory audits.' },
      ],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'contentgrid')
  if (block.type === 'contentgrid') {
    assert.equal(block.presentation, 'benefits')
    assert.equal(block.items.length, 2)
  }
})

test('FAQ block resolves explicitly-selected items, filters inactive/cross-tenant, sorts, and caps at limit', () => {
  const faqs = [
    { id: 1, title: 'Question A', answer: 'Answer A', category: 'Services', isActive: true, sortOrder: 2, tenantId: tenantID },
    { id: 2, title: 'Question B', answer: 'Answer B', category: 'Services', isActive: true, sortOrder: 0, tenantId: tenantID },
    { id: 3, title: 'Inactive Question', answer: 'Answer C', category: 'Services', isActive: false, sortOrder: 1, tenantId: tenantID },
    { id: 4, title: 'Other tenant question', answer: 'Answer D', category: 'Services', isActive: true, sortOrder: -1, tenantId: tenantID + 1 },
  ]
  const layout = [
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [1, 2, 3, 4], limit: 10 },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: faqs as never, teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'faq')
  if (block.type === 'faq') {
    assert.deepEqual(block.items.map((item) => item.question), ['Question B', 'Question A'])
  }
})

test('FAQ block with no explicit items falls back to the full active tenant pool', () => {
  const faqs = [
    { id: 5, title: 'Pool Question', answer: 'Pool Answer', category: '', isActive: true, sortOrder: 0, tenantId: tenantID },
  ]
  const layout = [
    { blockType: 'faqBlock', sectionHeader: { title: 'FAQs' }, items: [] },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: faqs as never, teamMembers: [], testimonials: [] })
  const block = mapped[0]
  assert.equal(block.type, 'faq')
  if (block.type === 'faq') {
    assert.equal(block.items.length, 1)
    assert.equal(block.items[0].question, 'Pool Question')
  }
})
