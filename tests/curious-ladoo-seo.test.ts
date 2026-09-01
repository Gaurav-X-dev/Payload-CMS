import assert from 'node:assert/strict'
import test from 'node:test'
import { mapCuriousLadooSEO } from '../src/themes/curious-hub/mappers/cmsContent.ts'
import {
  buildCuriousLadooBreadcrumbJsonLd,
  combineCuriousLadooJsonLd,
  serializeCuriousLadooJsonLd,
} from '../src/themes/curious-hub/utils/buildCuriousLadooJsonLd.ts'
import {
  buildCuriousLadooMetadata,
  parseRobotsDirective,
} from '../src/themes/curious-hub/utils/buildCuriousLadooMetadata.ts'
import type { CuriousLadooHomeContent, CuriousLadooSEOData } from '../src/themes/curious-hub/mappers/dynamicTypes.ts'

const tenantID = 6100

const tenant = {
  id: tenantID,
  isActive: true,
  name: 'Fixture Curious Ladoo',
  slug: 'curious-ladoo',
  theme: 'curious-hub',
}

const seoDoc = (overrides: Record<string, unknown>) => ({
  id: 1,
  bingSiteVerification: '',
  canonicalUrl: '',
  defaultOGImage: null,
  googleSiteVerification: '',
  jsonLd: '',
  keywords: '',
  metaDescription: '',
  metaTitlePattern: '',
  ogDescription: '',
  ogSiteName: '',
  ogTitle: '',
  robots: '',
  tenantId: tenantID,
  twitterCard: 'summary_large_image',
  twitterCreator: '',
  twitterSite: '',
  ...overrides,
})

const site: CuriousLadooHomeContent['site'] = {
  address: '',
  description: 'Fallback site description.',
  email: '',
  favicon: { alt: 'favicon', id: 9, src: '/media/favicon.png' },
  logo: null,
  name: 'Curious Ladoo',
  newsletter: { buttonLabel: '', description: '', enabled: false, errorMessage: '', placeholder: '', successMessage: '', title: '' },
  social: [],
  tagline: '',
}

const emptySEO: CuriousLadooSEOData = {
  bingSiteVerification: '',
  canonicalUrl: '',
  description: '',
  googleSiteVerification: '',
  jsonLd: null,
  keywords: [],
  ogDescription: '',
  ogImage: null,
  ogSiteName: '',
  ogTitle: '',
  robots: '',
  title: '',
  twitterCard: 'summary_large_image',
  twitterCreator: '',
  twitterSite: '',
}

const contentFor = ({
  page,
  seo = emptySEO,
}: {
  page: CuriousLadooHomeContent['page']
  seo?: CuriousLadooSEOData
}): CuriousLadooHomeContent => ({
  footer: { columns: [], copyright: '' },
  layout: [],
  navigation: { brandName: '', cta: null, links: [] },
  page,
  seo,
  site,
})

// ---------------------------------------------------------------------------
// mapCuriousLadooSEO — tenant scoping + JSON-LD parsing
// ---------------------------------------------------------------------------

test('mapCuriousLadooSEO maps every field from a tenant-scoped SEO doc', () => {
  const doc = seoDoc({
    bingSiteVerification: 'bing-123',
    canonicalUrl: 'https://curious-hub.localhost',
    googleSiteVerification: 'google-123',
    keywords: 'hospitality, restaurants,  branding ',
    metaDescription: 'A meta description.',
    metaTitlePattern: '%s — Curious Ladoo',
    ogDescription: 'An OG description.',
    ogSiteName: 'Curious Ladoo',
    ogTitle: 'An OG title.',
    robots: 'index, follow',
    twitterCreator: '@curiousladoo',
    twitterSite: '@curiousladoo',
  })
  const mapped = mapCuriousLadooSEO(doc as never, tenant as never)
  assert.equal(mapped.title, '%s — Curious Ladoo')
  assert.equal(mapped.description, 'A meta description.')
  assert.deepEqual(mapped.keywords, ['hospitality', 'restaurants', 'branding'])
  assert.equal(mapped.googleSiteVerification, 'google-123')
  assert.equal(mapped.bingSiteVerification, 'bing-123')
  assert.equal(mapped.twitterCreator, '@curiousladoo')
})

test('mapCuriousLadooSEO falls back to an empty shape when the SEO doc belongs to a different tenant, or the tenant is missing', () => {
  const otherTenantDoc = seoDoc({ metaDescription: 'Should never surface.', tenantId: 9999 })
  assert.equal(mapCuriousLadooSEO(otherTenantDoc as never, tenant as never).description, '')
  assert.equal(mapCuriousLadooSEO(seoDoc({}) as never, null).description, '')
})

test('mapCuriousLadooSEO parses valid JSON-LD (object or array) and degrades malformed JSON-LD to null rather than throwing', () => {
  const objectDoc = seoDoc({ jsonLd: JSON.stringify({ '@type': 'Organization', name: 'Curious Ladoo' }) })
  assert.deepEqual(mapCuriousLadooSEO(objectDoc as never, tenant as never).jsonLd, { '@type': 'Organization', name: 'Curious Ladoo' })

  const arrayDoc = seoDoc({ jsonLd: JSON.stringify([{ '@type': 'Organization' }, { '@type': 'WebSite' }]) })
  assert.deepEqual(mapCuriousLadooSEO(arrayDoc as never, tenant as never).jsonLd, [{ '@type': 'Organization' }, { '@type': 'WebSite' }])

  const malformedDoc = seoDoc({ jsonLd: '{ not valid json' })
  assert.equal(mapCuriousLadooSEO(malformedDoc as never, tenant as never).jsonLd, null)

  const emptyDoc = seoDoc({ jsonLd: '' })
  assert.equal(mapCuriousLadooSEO(emptyDoc as never, tenant as never).jsonLd, null)
})

// ---------------------------------------------------------------------------
// buildCuriousLadooMetadata — title, canonical, robots, OpenGraph, Twitter
// ---------------------------------------------------------------------------

test('buildCuriousLadooMetadata returns empty metadata when there is no page (404 case)', () => {
  const metadata = buildCuriousLadooMetadata({ content: contentFor({ page: null }), hostname: 'curious-hub.localhost', pathname: '/nowhere' })
  assert.deepEqual(metadata, {})
})

test('an explicit page.metaTitle is used verbatim, never re-interpolated through the tenant %s pattern (avoids double-branding)', () => {
  const content = contentFor({
    page: { canonicalUrl: '', id: 1, metaDescription: '', metaImage: null, metaTitle: 'About Us — Curious Ladoo', noIndex: false, pageType: 'about', title: 'About Us' },
    seo: { ...emptySEO, title: '%s | Curious Ladoo' },
  })
  const metadata = buildCuriousLadooMetadata({ content, hostname: 'curious-hub.localhost', pathname: '/about' })
  assert.equal(metadata.title, 'About Us — Curious Ladoo')
})

test('when no page.metaTitle is set, the raw page title is interpolated through the tenant\'s %s pattern', () => {
  const content = contentFor({
    page: { canonicalUrl: '', id: 1, metaDescription: '', metaImage: null, metaTitle: '', noIndex: false, pageType: 'generic', title: 'Careers' },
    seo: { ...emptySEO, title: '%s | Curious Ladoo' },
  })
  const metadata = buildCuriousLadooMetadata({ content, hostname: 'curious-hub.localhost', pathname: '/careers' })
  assert.equal(metadata.title, 'Careers | Curious Ladoo')
})

test('page.canonicalUrl overrides the derived hostname+pathname canonical when set', () => {
  const overridden = contentFor({
    page: { canonicalUrl: 'https://curious-hub.localhost/canonical-override', id: 1, metaDescription: '', metaImage: null, metaTitle: '', noIndex: false, pageType: 'generic', title: 'Page' },
  })
  assert.equal(
    buildCuriousLadooMetadata({ content: overridden, hostname: 'curious-hub.localhost', pathname: '/page' }).alternates?.canonical,
    'https://curious-hub.localhost/canonical-override',
  )

  const derived = contentFor({
    page: { canonicalUrl: '', id: 1, metaDescription: '', metaImage: null, metaTitle: '', noIndex: false, pageType: 'generic', title: 'Page' },
  })
  assert.equal(
    buildCuriousLadooMetadata({ content: derived, hostname: 'curious-hub.localhost', pathname: '/page' }).alternates?.canonical,
    'https://curious-hub.localhost/page',
  )
})

test('page.noIndex forces robots to noindex regardless of the tenant SEO robots directive', () => {
  const content = contentFor({
    page: { canonicalUrl: '', id: 1, metaDescription: '', metaImage: null, metaTitle: '', noIndex: true, pageType: 'generic', title: 'Draft-ish Page' },
    seo: { ...emptySEO, robots: 'index, follow' },
  })
  const metadata = buildCuriousLadooMetadata({ content, hostname: 'curious-hub.localhost', pathname: '/page' })
  assert.deepEqual(metadata.robots, { follow: true, index: false })
})

test('OpenGraph and Twitter fall back to page/site description and image when tenant-level OG overrides are unset', () => {
  const content = contentFor({
    page: { canonicalUrl: '', id: 1, metaDescription: 'Page-level description.', metaImage: { alt: 'Page image', id: 5, src: '/media/5.png' }, metaTitle: 'Page Title', noIndex: false, pageType: 'generic', title: 'Page' },
  })
  const metadata = buildCuriousLadooMetadata({ content, hostname: 'curious-hub.localhost', pathname: '/page' })
  assert.equal(metadata.description, 'Page-level description.')
  assert.equal((metadata.openGraph as { description?: string } | undefined)?.description, 'Page-level description.')
  assert.deepEqual((metadata.openGraph as { images?: { url: string }[] } | undefined)?.images, [{ alt: 'Page image', url: '/media/5.png' }])
  assert.deepEqual(metadata.twitter?.images, ['/media/5.png'])
})

test('site favicon is wired into metadata.icons when set', () => {
  const content = contentFor({
    page: { canonicalUrl: '', id: 1, metaDescription: '', metaImage: null, metaTitle: '', noIndex: false, pageType: 'generic', title: 'Page' },
  })
  const metadata = buildCuriousLadooMetadata({ content, hostname: 'curious-hub.localhost', pathname: '/page' })
  assert.deepEqual(metadata.icons, { icon: '/media/favicon.png' })
})

// ---------------------------------------------------------------------------
// parseRobotsDirective — shared by page + blog-post metadata builders
// ---------------------------------------------------------------------------

test('parseRobotsDirective defaults to index+follow for an empty directive, and respects noindex/nofollow tokens', () => {
  assert.deepEqual(parseRobotsDirective(''), { follow: true, index: true })
  assert.deepEqual(parseRobotsDirective('noindex, nofollow'), { follow: false, index: false })
  assert.deepEqual(parseRobotsDirective('index, follow', { noIndex: true }), { follow: true, index: false })
})

// ---------------------------------------------------------------------------
// JSON-LD — breadcrumb, combine, serialize
// ---------------------------------------------------------------------------

test('buildCuriousLadooBreadcrumbJsonLd returns null for fewer than 2 items, and a valid BreadcrumbList otherwise', () => {
  assert.equal(buildCuriousLadooBreadcrumbJsonLd([]), null)
  assert.equal(buildCuriousLadooBreadcrumbJsonLd([{ name: 'Home', url: 'https://curious-hub.localhost' }]), null)

  const breadcrumb = buildCuriousLadooBreadcrumbJsonLd([
    { name: 'Home', url: 'https://curious-hub.localhost' },
    { name: 'About', url: 'https://curious-hub.localhost/about' },
  ])
  assert.equal(breadcrumb?.['@type'], 'BreadcrumbList')
  assert.equal((breadcrumb?.itemListElement as unknown[]).length, 2)
})

test('combineCuriousLadooJsonLd flattens singles and arrays and drops null/undefined entries', () => {
  const organization = { '@type': 'Organization' }
  const breadcrumb = { '@type': 'BreadcrumbList' }
  const combined = combineCuriousLadooJsonLd(organization, null, [breadcrumb], undefined)
  assert.deepEqual(combined, [organization, breadcrumb])
})

test('serializeCuriousLadooJsonLd returns null for an empty array, unwraps a single entry, arrays multiple entries, and escapes "<" for script-tag safety', () => {
  assert.equal(serializeCuriousLadooJsonLd([]), null)

  const single = serializeCuriousLadooJsonLd([{ '@type': 'Organization', name: 'Curious Ladoo' }])
  assert.deepEqual(JSON.parse(single as string), { '@type': 'Organization', name: 'Curious Ladoo' })

  const multiple = serializeCuriousLadooJsonLd([{ '@type': 'Organization' }, { '@type': 'BreadcrumbList' }])
  assert.equal((JSON.parse(multiple as string) as unknown[]).length, 2)

  const unsafe = serializeCuriousLadooJsonLd([{ description: '</script><script>alert(1)</script>' }])
  assert.ok(!unsafe?.includes('</script>'))
  assert.ok(unsafe?.includes('\\u003c/script>\\u003cscript>alert(1)\\u003c/script>'))
})
