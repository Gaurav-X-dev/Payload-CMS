import assert from 'node:assert/strict'
import test from 'node:test'
import { loadZuruZuruShellWithPayload, type ZuruZuruFind } from '../src/lib/site/zuruZuruContentCore.ts'
import { mapZuruZuruPageMeta, mapZuruZuruSEO } from '../src/themes/zuru-zuru/mappers/cmsContent.ts'
import {
  buildZuruZuruBreadcrumbJsonLd,
  combineZuruZuruJsonLd,
  serializeZuruZuruJsonLd,
} from '../src/themes/zuru-zuru/utils/buildZuruZuruJsonLd.ts'
import { buildZuruZuruMetadata, parseRobotsDirective } from '../src/themes/zuru-zuru/utils/buildZuruZuruMetadata.ts'
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

// ---------------------------------------------------------------------------
// Mapper — SEO (tenant-wide fallback)
// ---------------------------------------------------------------------------

test('mapZuruZuruSEO maps every field and parses valid jsonLd', () => {
  const seo = {
    bingSiteVerification: 'bing-123',
    canonicalUrl: 'https://zuru-zuru.localhost',
    defaultOGImage: null,
    googleSiteVerification: 'google-123',
    jsonLd: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Restaurant', name: 'Zuru Zuru' }),
    keywords: 'izakaya, sushi, ramen',
    metaDescription: 'Tenant-wide description',
    metaTitlePattern: '%s | Zuru Zuru',
    ogDescription: '',
    ogSiteName: 'Zuru Zuru',
    ogTitle: '',
    robots: 'index, follow',
    tenantId: tenantID,
    twitterCard: 'summary_large_image',
    twitterCreator: '',
    twitterSite: '',
  }
  const mapped = mapZuruZuruSEO(seo as never, tenant as never)
  assert.equal(mapped.description, 'Tenant-wide description')
  assert.deepEqual(mapped.keywords, ['izakaya', 'sushi', 'ramen'])
  assert.deepEqual(mapped.jsonLd, { '@context': 'https://schema.org', '@type': 'Restaurant', name: 'Zuru Zuru' })
  assert.equal(mapped.titlePattern, '%s | Zuru Zuru')
})

test('mapZuruZuruSEO rejects a cross-tenant SEO document and degrades malformed jsonLd to null', () => {
  const crossTenant = mapZuruZuruSEO({ jsonLd: '{}', metaDescription: 'x', tenantId: otherTenantID } as never, tenant as never)
  assert.equal(crossTenant.description, '')

  const malformed = mapZuruZuruSEO({ jsonLd: 'not valid json{{', metaDescription: 'x', tenantId: tenantID } as never, tenant as never)
  assert.equal(malformed.jsonLd, null)
  assert.equal(malformed.description, 'x')
})

// ---------------------------------------------------------------------------
// Mapper — a single page's own SEO overrides
// ---------------------------------------------------------------------------

test('mapZuruZuruPageMeta maps a page\'s own SEO tab, and returns null for no page', () => {
  const page = {
    canonicalUrl: '',
    metaDescription: 'Page description',
    metaImage: null,
    metaTitle: 'Our Gallery — Zuru Zuru',
    noIndex: false,
    title: 'Zuru Zuru Gallery',
  }
  const mapped = mapZuruZuruPageMeta(page as never, tenantID)
  assert.equal(mapped?.metaTitle, 'Our Gallery — Zuru Zuru')
  assert.equal(mapped?.title, 'Zuru Zuru Gallery')
  assert.equal(mapZuruZuruPageMeta(null, tenantID), null)
})

// ---------------------------------------------------------------------------
// robots directive parsing
// ---------------------------------------------------------------------------

test('parseRobotsDirective honors an explicit page-level noIndex override regardless of the tenant-wide directive', () => {
  assert.deepEqual(parseRobotsDirective('index, follow', { noIndex: true }), { follow: true, index: false })
})

test('parseRobotsDirective parses each directive combination and defaults to index/follow when blank', () => {
  assert.deepEqual(parseRobotsDirective('noindex, nofollow'), { follow: false, index: false })
  assert.deepEqual(parseRobotsDirective('index, nofollow'), { follow: false, index: true })
  assert.deepEqual(parseRobotsDirective(''), { follow: true, index: true })
})

// ---------------------------------------------------------------------------
// buildZuruZuruMetadata
// ---------------------------------------------------------------------------

const emptySEO = {
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
  titlePattern: '',
  twitterCard: 'summary_large_image' as const,
  twitterCreator: '',
  twitterSite: '',
}

const emptySite = {
  address: '',
  announcement: { enabled: false, text: '' },
  description: '',
  email: '',
  favicon: null,
  hours: [],
  logo: null,
  name: 'Zuru Zuru',
  newsletter: { buttonLabel: '', description: '', enabled: false, errorMessage: '', placeholder: '', successMessage: '', title: '' },
  phone: '',
  social: [],
  tagline: '',
}

test('buildZuruZuruMetadata returns {} for a missing page', () => {
  assert.deepEqual(buildZuruZuruMetadata({ hostname: 'zuru-zuru.localhost', page: null, pathname: '/gallery', seo: emptySEO, site: emptySite }), {})
})

test('buildZuruZuruMetadata uses a complete metaTitle verbatim, never re-wrapping it in the tenant pattern', () => {
  const page = { canonicalUrl: '', metaDescription: 'd', metaImage: null, metaTitle: 'Our Gallery — Zuru Zuru', noIndex: false, title: 'Zuru Zuru Gallery' }
  const seo = { ...emptySEO, titlePattern: '%s | Zuru Zuru' }
  const result = buildZuruZuruMetadata({ hostname: 'zuru-zuru.localhost', page, pathname: '/gallery', seo, site: emptySite })
  assert.equal(result.title, 'Our Gallery — Zuru Zuru')
})

test('buildZuruZuruMetadata applies the %s pattern only to the bare title fallback when metaTitle is unset', () => {
  const page = { canonicalUrl: '', metaDescription: '', metaImage: null, metaTitle: '', noIndex: false, title: 'Gallery' }
  const seo = { ...emptySEO, titlePattern: '%s | Zuru Zuru' }
  const result = buildZuruZuruMetadata({ hostname: 'zuru-zuru.localhost', page, pathname: '/gallery', seo, site: emptySite })
  assert.equal(result.title, 'Gallery | Zuru Zuru')
})

test('buildZuruZuruMetadata falls back to hostname+pathname for canonical when the page has no override', () => {
  const page = { canonicalUrl: '', metaDescription: '', metaImage: null, metaTitle: 'T', noIndex: false, title: 'T' }
  const result = buildZuruZuruMetadata({ hostname: 'zuru-zuru.localhost', page, pathname: '/chefs', seo: emptySEO, site: emptySite })
  assert.deepEqual(result.alternates, { canonical: 'https://zuru-zuru.localhost/chefs' })
})

test('buildZuruZuruMetadata marks a noIndex page as unindexed even when the tenant-wide directive allows indexing', () => {
  const page = { canonicalUrl: '', metaDescription: '', metaImage: null, metaTitle: 'T', noIndex: true, title: 'T' }
  const seo = { ...emptySEO, robots: 'index, follow' }
  const result = buildZuruZuruMetadata({ hostname: 'zuru-zuru.localhost', page, pathname: '/reservation', seo, site: emptySite })
  assert.deepEqual(result.robots, { follow: true, index: false })
})

// ---------------------------------------------------------------------------
// JSON-LD helpers
// ---------------------------------------------------------------------------

test('buildZuruZuruBreadcrumbJsonLd drops a single "Home" crumb but builds a real trail for 2+', () => {
  assert.equal(buildZuruZuruBreadcrumbJsonLd([{ name: 'Home', url: 'https://zuru-zuru.localhost/' }]), null)
  const trail = buildZuruZuruBreadcrumbJsonLd([
    { name: 'Home', url: 'https://zuru-zuru.localhost/' },
    { name: 'Chefs', url: 'https://zuru-zuru.localhost/chefs' },
  ])
  assert.equal(trail?.['@type'], 'BreadcrumbList')
})

test('combineZuruZuruJsonLd drops null/undefined entries and serializeZuruZuruJsonLd escapes </script>', () => {
  const combined = combineZuruZuruJsonLd({ '@type': 'Restaurant' }, null, undefined)
  assert.equal(combined.length, 1)
  const serialized = serializeZuruZuruJsonLd([{ evil: '</script><script>alert(1)</script>' }])
  assert.ok(serialized && !serialized.includes('</script>'))
})

// ---------------------------------------------------------------------------
// Loader — the shell now also resolves the tenant-wide SEO document
// ---------------------------------------------------------------------------

type FixtureMap = Partial<Record<string, unknown[]>>

const fakePayload = (fixtures: FixtureMap) => {
  const find: ZuruZuruFind = async (args) => ({ docs: (fixtures[args.collection] ?? []) as never[] })
  return { find }
}

test('loadZuruZuruShellWithPayload resolves the tenant-wide seo document alongside nav/footer/siteSettings', async () => {
  const seo = { id: 1, metaDescription: 'Tenant description', tenantId: tenantID }
  const { find } = fakePayload({ seo: [seo], tenants: [tenant] })
  const result = await loadZuruZuruShellWithPayload({ find, host: 'zuru-zuru.localhost', site })
  assert.equal(result.seo?.id, 1)
})
