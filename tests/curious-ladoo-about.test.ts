import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadCuriousLadooContentWithPayload,
  type CuriousLadooCollectionSlug,
  type CuriousLadooFind,
  type CuriousLadooFindArgs,
} from '../src/lib/site/curiousLadooContentCore.ts'
import {
  mapCuriousLadooHomeContent,
  mapCuriousLadooLayout,
} from '../src/themes/curious-hub/mappers/cmsContent.ts'
import type { LocalSite } from '../src/lib/site/types.ts'
import type { Page } from '../src/payload-types.ts'

const tenantID = 4300
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
// Loader — About resolves by slug, not isHomePage
// ---------------------------------------------------------------------------

test('published /about page is visible by slug; draft is hidden; other slugs never match', async () => {
  const aboutPage = {
    id: 10,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'about',
    slug: 'about',
    tenantId: tenantID,
    title: 'About',
  }
  const publishedResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [aboutPage] }).find,
    host: 'curious-hub.localhost',
    pathname: '/about',
    site,
  })
  assert.equal(publishedResult.page?.id, 10)

  const draftResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...aboutPage, _status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/about',
    site,
  })
  assert.equal(draftResult.page, null, 'a draft-only About page must never resolve publicly')

  const wrongSlugResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...aboutPage, slug: 'services' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/about',
    site,
  })
  assert.equal(wrongSlugResult.page, null, 'a page with a different slug must not resolve for /about')
})

test('a page with isHomePage true never resolves for a non-root pathname, even with a matching slug', async () => {
  const homeFlaggedPage = {
    id: 11,
    _status: 'published',
    isHomePage: true,
    layout: [],
    pageType: 'home',
    slug: 'about',
    tenantId: tenantID,
    title: 'Mislabeled',
  }
  const result = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [homeFlaggedPage] }).find,
    host: 'curious-hub.localhost',
    pathname: '/about',
    site,
  })
  assert.equal(result.page, null, '/about must resolve strictly by slug, never by a stray isHomePage flag')
})

// ---------------------------------------------------------------------------
// Mapper — About-specific block shapes
// ---------------------------------------------------------------------------

test("Story block 'simple' layout maps title/accentPhrase/body/image for the inner-page treatment", () => {
  const layout = [
    {
      blockType: 'storyBlock',
      layout: 'simple',
      title: 'Hospitality Built on',
      accentPhrase: 'Conviction.',
      body: 'Paragraph one.\n\nParagraph two.',
      media: media(20, tenantID),
      imagePosition: 'left',
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: [], testimonials: [] })
  const story = mapped[0]
  assert.equal(story.type, 'story')
  if (story.type === 'story') {
    assert.equal(story.layout, 'simple')
    assert.equal(story.title, 'Hospitality Built on')
    assert.equal(story.accentPhrase, 'Conviction.')
    assert.equal(story.body, 'Paragraph one.\n\nParagraph two.')
    assert.equal(story.imagePosition, 'left')
    assert.equal(story.image?.id, 20)
  }
})

test("ContentGrid 'mission-vision' and 'values' presentations pass through with their media/mediaPosition", () => {
  const layout = [
    {
      blockType: 'contentgridBlock',
      presentation: 'mission-vision',
      sectionHeader: { title: 'Mission & Vision.', subtitle: 'Vision.' },
      media: { item: media(30, tenantID) },
      mediaPosition: 'right',
      items: [
        { title: 'Our Mission', description: 'Mission text.' },
        { title: 'Our Vision', description: 'Vision text.' },
      ],
    },
    {
      blockType: 'contentgridBlock',
      presentation: 'values',
      sectionHeader: { title: 'Our Core Values.', subtitle: 'Values.' },
      items: [
        { title: 'Question assumptions', description: 'Desc one.' },
        { title: 'Design experiences', description: 'Desc two.' },
        { title: 'Build systems', description: 'Desc three.' },
      ],
    },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: [], testimonials: [] })

  const [missionVision, values] = mapped
  assert.equal(missionVision.type, 'contentgrid')
  if (missionVision.type === 'contentgrid') {
    assert.equal(missionVision.presentation, 'mission-vision')
    assert.equal(missionVision.mediaPosition, 'right')
    assert.equal(missionVision.media?.id, 30)
    assert.deepEqual(missionVision.items.map((item) => item.title), ['Our Mission', 'Our Vision'])
  }

  assert.equal(values.type, 'contentgrid')
  if (values.type === 'contentgrid') {
    assert.equal(values.presentation, 'values')
    assert.equal(values.items.length, 3)
  }
})

test('Team block with no explicit members and a limit pulls from the tenant pool, sorted and capped', () => {
  const members = [
    { id: 1, title: 'Arjun Rao', role: 'Founder & CEO', bio: 'Bio A', isActive: true, sortOrder: 0, tenantId: tenantID },
    { id: 2, title: 'Priya Malhotra', role: 'CBO', bio: 'Bio B', isActive: true, sortOrder: 1, tenantId: tenantID },
    { id: 3, title: 'Inactive Person', role: 'X', bio: 'Bio C', isActive: false, sortOrder: 2, tenantId: tenantID },
  ]
  const layout = [
    { blockType: 'teamBlock', members: [], limit: 2, sectionHeader: { title: 'Our Leadership.' } },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { blogPosts: [], brands: [], faqs: [], portfolio: [], teamMembers: members as never, testimonials: [] })
  const team = mapped[0]
  assert.equal(team.type, 'team')
  if (team.type === 'team') {
    assert.deepEqual(team.members.map((m) => m.name), ['Arjun Rao', 'Priya Malhotra'])
  }
})

test("page-level mapper carries pageType through as 'about', not the 'generic' default", () => {
  const page = {
    id: 12,
    layout: [],
    pageType: 'about',
    title: 'About',
  } as unknown as Page
  const content = mapCuriousLadooHomeContent({
    blogPosts: [],
    brands: [],
    faqs: [],
    footer: null,
    locations: [],
    nav: null,
    page,
    portfolio: [],
    seo: null,
    siteSettings: null,
    teamMembers: [],
    tenant: { id: tenantID, name: 'Curious Ladoo' } as never,
    testimonials: [],
  })
  assert.equal(content.page?.pageType, 'about')
})
