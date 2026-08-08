import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveLocalSite } from '../src/lib/site/resolveLocalSite.ts'
import {
  loadZuruZuruShellWithPayload,
  type ZuruZuruCollectionSlug,
  type ZuruZuruFind,
  type ZuruZuruFindArgs,
} from '../src/lib/site/zuruZuruContentCore.ts'
import {
  mapZuruZuruFooter,
  mapZuruZuruNavigation,
  mapZuruZuruSite,
} from '../src/themes/zuru-zuru/mappers/cmsContent.ts'
import { formatHoursSummary } from '../src/themes/zuru-zuru/utils/formatHours.ts'
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
// Hostname resolution
// ---------------------------------------------------------------------------

test('zuru-zuru.localhost resolves to the Zuru Zuru theme; localhost still defaults to Curious Ladoo', () => {
  assert.deepEqual(resolveLocalSite('zuru-zuru.localhost'), { hostname: 'zuru-zuru.localhost', key: 'zuru-zuru', theme: 'zuru-zuru' })
  assert.equal(resolveLocalSite('localhost')?.theme, 'curious-hub')
  assert.equal(resolveLocalSite('ghee-roast.localhost')?.theme, 'ghee-roast')
  assert.equal(resolveLocalSite('unknown.example'), null)
})

// ---------------------------------------------------------------------------
// Loader — tenant resolution and shell fetch
// ---------------------------------------------------------------------------

test('loadZuruZuruShellWithPayload resolves nav/footer/siteSettings for the active tenant', async () => {
  const nav = { id: 1, brandName: 'Zuru Zuru', links: [], location: 'header', tenantId: tenantID }
  const footer = { id: 1, columns: [], copyright: '© Zuru Zuru', tenantId: tenantID }
  const siteSettings = { id: 1, businessName: 'Zuru Zuru', tenantId: tenantID }
  const result = await loadZuruZuruShellWithPayload({
    find: fakePayload({ tenants: [tenant], nav: [nav], footer: [footer], 'site-settings': [siteSettings] }).find,
    host: 'zuru-zuru.localhost',
    site,
  })
  assert.equal(result.tenantState, 'active')
  assert.equal(result.nav?.id, 1)
  assert.equal(result.footer?.id, 1)
  assert.equal(result.siteSettings?.id, 1)
})

test('loadZuruZuruShellWithPayload fails closed for a missing or inactive tenant', async () => {
  const missing = await loadZuruZuruShellWithPayload({
    find: fakePayload({}).find,
    host: 'zuru-zuru.localhost',
    site,
  })
  assert.equal(missing.tenantState, 'missing')

  const inactive = await loadZuruZuruShellWithPayload({
    find: fakePayload({ tenants: [{ ...tenant, isActive: false }] }).find,
    host: 'zuru-zuru.localhost',
    site,
  })
  assert.equal(inactive.tenantState, 'inactive')
})

test('loadZuruZuruShellWithPayload returns empty for a mismatched host/theme', async () => {
  const result = await loadZuruZuruShellWithPayload({
    find: fakePayload({ tenants: [tenant] }).find,
    host: 'curious-hub.localhost',
    site,
  })
  assert.equal(result.tenantState, 'missing')
})

// ---------------------------------------------------------------------------
// Mapper — Navigation
// ---------------------------------------------------------------------------

test('mapZuruZuruNavigation sorts links by sortOrder, maps dropdown children, and resolves the CTA', () => {
  const nav = {
    brandName: 'Zuru Zuru',
    cta: { enabled: true, label: 'Reserve', url: '/reservation' },
    links: [
      { blockType: 'link', enabled: true, label: 'Contact', sortOrder: 60, type: 'internal', url: '/contact', children: [] },
      {
        blockType: 'link',
        enabled: true,
        label: 'Menu',
        sortOrder: 10,
        type: 'internal',
        url: '/menu',
        children: [
          { enabled: true, label: 'Gurugram Menu', sortOrder: 10, url: '/menu?location=gurugram' },
          { enabled: true, label: 'Delhi Menu', sortOrder: 0, url: '/menu?location=delhi' },
        ],
      },
      { blockType: 'link', enabled: false, label: 'Hidden', sortOrder: 5, type: 'internal', url: '/hidden', children: [] },
      { blockType: 'link', enabled: true, label: 'Home', sortOrder: 0, type: 'internal', url: '/', children: [] },
    ],
    tenantId: tenantID,
  }
  const mapped = mapZuruZuruNavigation(nav as never, tenantID)
  assert.deepEqual(mapped.links.map((l) => l.label), ['Home', 'Menu', 'Contact'])
  assert.deepEqual(mapped.links[1].children.map((c) => c.label), ['Delhi Menu', 'Gurugram Menu'])
  assert.deepEqual(mapped.cta, { label: 'Reserve', url: '/reservation' })
})

test('mapZuruZuruNavigation returns the empty shape for a cross-tenant or missing Nav document', () => {
  const nav = { brandName: 'Someone Else', cta: null, links: [], tenantId: 9999 }
  assert.deepEqual(mapZuruZuruNavigation(nav as never, tenantID), { brandName: '', cta: null, links: [], logo: null })
  assert.deepEqual(mapZuruZuruNavigation(null, tenantID), { brandName: '', cta: null, links: [], logo: null })
})

// ---------------------------------------------------------------------------
// Mapper — Footer
// ---------------------------------------------------------------------------

test('mapZuruZuruFooter maps columns/bottomLinks and interpolates {year} in the copyright', () => {
  const footer = {
    bottomLinks: [{ label: 'Privacy Policy', url: '/privacy-policy' }],
    columns: [{ title: 'Explore', links: [{ label: 'Our Menu', url: '/menu' }] }],
    copyright: '© {year} Zuru Zuru Izakaya. All Rights Reserved.',
    tenantId: tenantID,
  }
  const mapped = mapZuruZuruFooter(footer as never, tenantID)
  assert.equal(mapped.columns[0].title, 'Explore')
  assert.equal(mapped.bottomLinks[0].label, 'Privacy Policy')
  assert.equal(mapped.copyright, `© ${new Date().getFullYear()} Zuru Zuru Izakaya. All Rights Reserved.`)
})

// ---------------------------------------------------------------------------
// Mapper — Site (announcement bar, hours, social, contact)
// ---------------------------------------------------------------------------

test('mapZuruZuruSite composes the announcement bar from SiteSettings and reads phone/email from Tenant.contact', () => {
  const siteSettings = {
    announcementText: 'Grand Summer Festival — 20% Off This Weekend',
    businessName: 'Zuru Zuru',
    contactAddress: 'Zuru Zuru, Delhi, India 110049',
    hours: [{ day: 'Monday', openTime: '12:00 PM', closeTime: '11:00 PM', isClosed: false }],
    showAnnouncementBar: true,
    siteDescription: 'A premium Japanese Izakaya experience.',
    socials: [{ enabled: true, icon: 'platform', platform: 'instagram', sortOrder: 0, url: 'https://instagram.com/zuruzuru' }],
    tenantId: tenantID,
  }
  const fullTenant = { ...tenant, branding: { logo: null }, contact: { contactEmail: 'hello@zuruzuru.in', contactPhone: '+91 11 4052 7373' } }
  const mapped = mapZuruZuruSite(fullTenant as never, siteSettings as never)
  assert.deepEqual(mapped.announcement, { enabled: true, text: 'Grand Summer Festival — 20% Off This Weekend' })
  assert.equal(mapped.phone, '+91 11 4052 7373')
  assert.equal(mapped.email, 'hello@zuruzuru.in')
  assert.equal(mapped.social[0].icon, 'instagram')
})

test('mapZuruZuruSite marks the announcement disabled when showAnnouncementBar is false, even if text is present', () => {
  const siteSettings = { announcementText: 'Some promo', showAnnouncementBar: false, tenantId: tenantID }
  const mapped = mapZuruZuruSite(tenant as never, siteSettings as never)
  assert.equal(mapped.announcement.enabled, false)
})

test('mapZuruZuruSite returns the empty shape when the tenant is missing, never resurrecting stale content', () => {
  const mapped = mapZuruZuruSite(null, null)
  assert.equal(mapped.name, '')
  assert.equal(mapped.announcement.enabled, false)
  assert.deepEqual(mapped.social, [])
})

// ---------------------------------------------------------------------------
// Hours formatting
// ---------------------------------------------------------------------------

test('formatHoursSummary collapses a uniform 7-day week into "Mon – Sun: X – Y"', () => {
  const week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({
    day,
    openTime: '12:00 PM',
    closeTime: '11:00 PM',
    isClosed: false,
  }))
  assert.equal(formatHoursSummary(week), 'Mon – Sun: 12:00 PM – 11:00 PM')
})

test('formatHoursSummary returns an empty string when every day is closed or the list is empty', () => {
  assert.equal(formatHoursSummary([]), '')
  assert.equal(formatHoursSummary([{ day: 'Monday', openTime: '', closeTime: '', isClosed: true }]), '')
})
