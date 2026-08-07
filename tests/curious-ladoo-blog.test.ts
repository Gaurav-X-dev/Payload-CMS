import assert from 'node:assert/strict'
import test from 'node:test'
import {
  loadCuriousLadooBlogPostWithPayload,
  loadCuriousLadooContentWithPayload,
  type CuriousLadooCollectionSlug,
  type CuriousLadooFind,
} from '../src/lib/site/curiousLadooContentCore.ts'
import {
  mapCuriousLadooBlogPost,
  mapCuriousLadooLayout,
} from '../src/themes/curious-hub/mappers/cmsContent.ts'
import {
  buildCuriousLadooBlogPostJsonLd,
  buildCuriousLadooBlogPostMetadata,
} from '../src/themes/curious-hub/utils/buildCuriousLadooBlogPostMetadata.ts'
import type { LocalSite } from '../src/lib/site/types.ts'
import type { Page } from '../src/payload-types.ts'

const tenantID = 5200
const otherTenantID = 5201
const site = {
  hostname: 'curious-hub.localhost',
  key: 'curious-ladoo',
  theme: 'curious-hub',
} as const satisfies LocalSite

type FixtureMap = Partial<Record<CuriousLadooCollectionSlug, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const find: CuriousLadooFind = async (args) => ({ docs: (fixtures[args.collection] ?? []) as never[] })
  return { find }
}

const tenant = {
  id: tenantID,
  isActive: true,
  name: 'Fixture Curious Ladoo',
  slug: 'curious-ladoo',
  theme: 'curious-hub',
}

const emptyCollections = { blogPosts: [], brands: [], faqs: [], locations: [], portfolio: [], teamMembers: [], testimonials: [] }

const post = (overrides: Record<string, unknown>) => ({
  id: 1,
  categories: [],
  excerpt: 'An excerpt.',
  isFeatured: false,
  isPinned: false,
  publishedDate: '2025-06-01T00:00:00.000Z',
  slug: 'a-post',
  status: 'published',
  tags: [],
  tenantId: tenantID,
  title: 'A Post',
  ...overrides,
})

// ---------------------------------------------------------------------------
// Index page — /blog resolves through the standard Page pipeline
// ---------------------------------------------------------------------------

test('published /blog page is visible by slug; draft is hidden', async () => {
  const page = {
    id: 100,
    _status: 'published',
    isHomePage: false,
    layout: [],
    pageType: 'blog-index',
    slug: 'blog',
    tenantId: tenantID,
    title: 'Journal',
  }
  const publishedResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [page] }).find,
    host: 'curious-hub.localhost',
    pathname: '/blog',
    site,
  })
  assert.equal(publishedResult.page?.id, 100)

  const draftResult = await loadCuriousLadooContentWithPayload({
    find: fakePayload({ tenants: [tenant], pages: [{ ...page, _status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    pathname: '/blog',
    site,
  })
  assert.equal(draftResult.page, null)
})

// ---------------------------------------------------------------------------
// Mapper — blogpreviewBlock 'index' presentation: featured/items split
// ---------------------------------------------------------------------------

test("blogpreviewBlock 'index' presentation pulls the pinned post into `featured`, and every other visible post into `items` — no limit applied", () => {
  const posts = [
    post({ id: 1, title: 'Newest, not pinned', publishedDate: '2025-06-01T00:00:00.000Z' }),
    post({ id: 2, title: 'Pinned but older', isPinned: true, publishedDate: '2025-01-01T00:00:00.000Z' }),
    post({ id: 3, title: 'Regular', publishedDate: '2025-03-01T00:00:00.000Z' }),
  ]
  const layout = [
    { blockType: 'blogpreviewBlock', presentation: 'index', source: 'collection', sectionHeader: { title: 'Journal' } },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, blogPosts: posts as never })
  const block = mapped[0]
  assert.equal(block.type, 'blogpreview')
  if (block.type === 'blogpreview') {
    assert.equal(block.presentation, 'index')
    assert.equal(block.featured?.title, 'Pinned but older', 'the pinned post wins the banner regardless of date order')
    assert.deepEqual(block.items.map((item) => item.title).sort(), ['Newest, not pinned', 'Regular'])
  }
})

test("blogpreviewBlock 'index' presentation falls back to the first visible post as featured when none is pinned", () => {
  const posts = [
    post({ id: 1, title: 'First', publishedDate: '2025-06-01T00:00:00.000Z' }),
    post({ id: 2, title: 'Second', publishedDate: '2025-01-01T00:00:00.000Z' }),
  ]
  const layout = [
    { blockType: 'blogpreviewBlock', presentation: 'index', source: 'collection', sectionHeader: { title: 'Journal' } },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, blogPosts: posts as never })
  const block = mapped[0]
  assert.equal(block.type, 'blogpreview')
  if (block.type === 'blogpreview') {
    assert.equal(block.featured?.title, 'First')
    assert.deepEqual(block.items.map((item) => item.title), ['Second'])
  }
})

test("blogpreviewBlock defaults to 'preview' presentation (Home's existing usage), unaffected by the 'index' addition", () => {
  const posts = [post({ id: 1, title: 'Only post' })]
  const layout = [
    { blockType: 'blogpreviewBlock', sectionHeader: { title: 'Latest' }, limit: 3 },
  ] as unknown as Page['layout']
  const mapped = mapCuriousLadooLayout(layout, tenantID, { ...emptyCollections, blogPosts: posts as never })
  const block = mapped[0]
  assert.equal(block.type, 'blogpreview')
  if (block.type === 'blogpreview') {
    assert.equal(block.presentation, 'preview')
    assert.equal(block.featured, null)
    assert.deepEqual(block.items.map((item) => item.title), ['Only post'])
  }
})

// ---------------------------------------------------------------------------
// Detail loader — tenant + slug resolution, draft hidden, no cross-tenant
// slug guessing, ambiguity rejection
// ---------------------------------------------------------------------------

test('published blog post is resolved by tenant + slug; draft is hidden', async () => {
  const doc = post({ id: 5, slug: 'my-post', status: 'published', title: 'My Post' })
  const publishedResult = await loadCuriousLadooBlogPostWithPayload({
    find: fakePayload({ tenants: [tenant], 'blog-posts': [doc] }).find,
    host: 'curious-hub.localhost',
    site,
    slug: 'my-post',
  })
  assert.equal(publishedResult.post?.id, 5)
  assert.equal(publishedResult.tenantState, 'active')

  const draftResult = await loadCuriousLadooBlogPostWithPayload({
    find: fakePayload({ tenants: [tenant], 'blog-posts': [{ ...doc, status: 'draft' }] }).find,
    host: 'curious-hub.localhost',
    site,
    slug: 'my-post',
  })
  assert.equal(draftResult.post, null)
  assert.equal(draftResult.tenantState, 'empty')
})

test('an unknown slug resolves to no post (404), never guessing across tenants', async () => {
  const result = await loadCuriousLadooBlogPostWithPayload({
    find: fakePayload({ tenants: [tenant], 'blog-posts': [] }).find,
    host: 'curious-hub.localhost',
    site,
    slug: 'does-not-exist',
  })
  assert.equal(result.post, null)
})

test('a same-slug post belonging to a different tenant never resolves for this tenant\'s request', async () => {
  const crossTenantDoc = post({ id: 9, slug: 'shared-slug', tenantId: otherTenantID })
  const result = await loadCuriousLadooBlogPostWithPayload({
    find: fakePayload({ tenants: [tenant], 'blog-posts': [crossTenantDoc] }).find,
    host: 'curious-hub.localhost',
    site,
    slug: 'shared-slug',
  })
  assert.equal(result.post, null)
})

// ---------------------------------------------------------------------------
// Mapper — blog post detail: author/media/relatedPosts/tags safety
// ---------------------------------------------------------------------------

test('mapCuriousLadooBlogPost resolves author name only when populated, and maps whatever relatedPosts it is given (tenant-filtering happens earlier, in the loader)', () => {
  const doc = post({
    id: 10,
    author: { id: 1, name: 'Jordan Lee' },
    categories: ['Operations'],
    content: { root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 } },
    tags: ['sops'],
  })
  const relatedPosts = [post({ id: 11, title: 'Same tenant related', tenantId: tenantID })]
  const mapped = mapCuriousLadooBlogPost({
    footer: null,
    nav: null,
    post: doc as never,
    relatedPosts: relatedPosts as never,
    seo: null,
    siteSettings: null,
    tenant: tenant as never,
  })
  assert.ok(mapped.post)
  assert.equal(mapped.post?.authorName, 'Jordan Lee')
  assert.equal(mapped.post?.categories[0], 'Operations')
  assert.deepEqual(mapped.post?.relatedPosts.map((item) => item.title), ['Same tenant related'])
})

test('loadCuriousLadooBlogPostWithPayload excludes a relatedPosts entry that belongs to a different tenant', async () => {
  const doc = post({
    id: 30,
    relatedPosts: [
      post({ id: 31, title: 'Same tenant related', tenantId: tenantID }),
      post({ id: 32, title: 'Cross-tenant related', tenantId: otherTenantID }),
    ],
    slug: 'post-with-related',
  })
  const result = await loadCuriousLadooBlogPostWithPayload({
    find: fakePayload({ tenants: [tenant], 'blog-posts': [doc] }).find,
    host: 'curious-hub.localhost',
    site,
    slug: 'post-with-related',
  })
  assert.deepEqual(result.relatedPosts.map((related) => related.id), [31])
})

test('mapCuriousLadooBlogPost degrades a raw (unpopulated) author id to an empty name, never crashing', () => {
  const doc = post({ id: 13, author: 42 })
  const mapped = mapCuriousLadooBlogPost({
    footer: null,
    nav: null,
    post: doc as never,
    relatedPosts: [],
    seo: null,
    siteSettings: null,
    tenant: tenant as never,
  })
  assert.equal(mapped.post?.authorName, '')
})

test('mapCuriousLadooBlogPost returns post: null when no post was resolved', () => {
  const mapped = mapCuriousLadooBlogPost({
    footer: null,
    nav: null,
    post: null,
    relatedPosts: [],
    seo: null,
    siteSettings: null,
    tenant: tenant as never,
  })
  assert.equal(mapped.post, null)
})

// ---------------------------------------------------------------------------
// SEO metadata — canonical, OpenGraph, JSON-LD
// ---------------------------------------------------------------------------

test('buildCuriousLadooBlogPostMetadata sets a canonical URL and OpenGraph article type from the resolved post', () => {
  const content = {
    footer: null,
    nav: null,
    post: post({ id: 20, metaDescription: 'A description.', slug: 'canonical-post', title: 'Canonical Post' }) as never,
    relatedPosts: [],
    seo: null,
    siteSettings: null,
    tenant: tenant as never,
    tenantState: 'active' as const,
  }
  const metadata = buildCuriousLadooBlogPostMetadata({ content, hostname: 'curious-hub.localhost' })
  assert.equal(metadata.alternates?.canonical, 'https://curious-hub.localhost/blog/canonical-post')
  assert.equal((metadata.openGraph as { type?: string } | undefined)?.type, 'article')
  assert.equal(metadata.title, 'Canonical Post')
})

test('buildCuriousLadooBlogPostMetadata returns empty metadata when no post was resolved (404 case)', () => {
  const content = {
    footer: null, nav: null, post: null, relatedPosts: [], seo: null, siteSettings: null, tenant: null,
    tenantState: 'empty' as const,
  }
  const metadata = buildCuriousLadooBlogPostMetadata({ content, hostname: 'curious-hub.localhost' })
  assert.deepEqual(metadata, {})
})

test('buildCuriousLadooBlogPostJsonLd produces a BlogPosting schema with the post headline', () => {
  const content = {
    footer: null,
    nav: null,
    post: post({ id: 21, slug: 'jsonld-post', title: 'JSON-LD Post' }) as never,
    relatedPosts: [],
    seo: null,
    siteSettings: null,
    tenant: tenant as never,
    tenantState: 'active' as const,
  }
  const entries = buildCuriousLadooBlogPostJsonLd({ content, hostname: 'curious-hub.localhost' })
  const article = entries.find((entry) => entry['@type'] === 'BlogPosting')
  assert.ok(article)
  assert.equal(article?.headline, 'JSON-LD Post')
  assert.equal(article?.mainEntityOfPage, 'https://curious-hub.localhost/blog/jsonld-post')

  const breadcrumb = entries.find((entry) => entry['@type'] === 'BreadcrumbList')
  assert.ok(breadcrumb, 'a breadcrumb entry (Home > Journal > post title) should also be included')
})
