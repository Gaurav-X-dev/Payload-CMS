import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeGheeRoastIconName } from '../src/themes/ghee-roast/iconRegistry.ts'
import {
  mapGheeRoastNavigation,
  mapGheeRoastSite,
} from '../src/themes/ghee-roast/mappers/cmsContent.ts'
import {
  validateBrandFeatureRows,
  validateNavChildSortOrders,
  validateNavTopLevelSortOrders,
} from '../src/validation/orderedRows.ts'

const TENANT_ID = 3167
const tenant = { id: TENANT_ID, name: 'Ghee Roast' }

test('Brand Features map tenant-scoped enabled CMS rows in deterministic sort order', () => {
  const settings = {
    tenantId: TENANT_ID,
    featureStrip: [
      { id: 'feature-b', enabled: true, icon: 'ghee', title: ' Cooked in Ghee ', description: ' Slow roasted. ', sortOrder: 2 },
      { id: 'feature-disabled', enabled: false, icon: 'leaf', title: 'Hidden', description: 'Hidden copy', sortOrder: 3 },
      { id: 'feature-a', enabled: true, icon: 'leaf', title: ' Authentic Recipes ', description: ' Rooted in tradition. ', sortOrder: 1 },
    ],
  }

  const result = mapGheeRoastSite(tenant, settings, TENANT_ID)
  assert.deepEqual(result.featureStrip?.map((feature) => feature.title), [
    'Authentic Recipes',
    'Cooked in Ghee',
  ])
  assert.deepEqual(result.featureStrip?.map((feature) => feature.description), [
    'Rooted in tradition.',
    'Slow roasted.',
  ])
  assert.deepEqual(result.featureStrip?.map((feature) => feature.renderKey), [
    'brand-feature-feature-a',
    'brand-feature-feature-b',
  ])
})

test('Brand Features ignore foreign tenant settings', () => {
  const result = mapGheeRoastSite(tenant, {
    tenantId: 999,
    featureStrip: [{ enabled: true, title: 'Foreign', description: 'Foreign', sortOrder: 1 }],
  }, TENANT_ID)

  assert.equal(result.featureStrip, undefined)
})

test('missing, empty, or all-disabled Brand Features never inject static rows', () => {
  const missing = mapGheeRoastSite(tenant, null, TENANT_ID)
  const empty = mapGheeRoastSite(tenant, { tenantId: TENANT_ID, featureStrip: [] }, TENANT_ID)
  const disabled = mapGheeRoastSite(tenant, {
    tenantId: TENANT_ID,
    featureStrip: [{ enabled: false, title: 'Hidden', description: 'Hidden', sortOrder: 1 }],
  }, TENANT_ID)

  assert.equal(missing.featureStrip, undefined)
  assert.deepEqual(empty.featureStrip, [])
  assert.deepEqual(disabled.featureStrip, [])
})

test('legacy duplicate Brand Feature sort orders retain every row in source order', () => {
  const result = mapGheeRoastSite(tenant, {
    tenantId: TENANT_ID,
    featureStrip: [
      { enabled: true, title: 'First', description: 'First description', sortOrder: 1 },
      { enabled: true, title: 'Second', description: 'Second description', sortOrder: 1 },
    ],
  }, TENANT_ID)

  assert.deepEqual(result.featureStrip?.map((feature) => feature.title), ['First', 'Second'])
  assert.equal(new Set(result.featureStrip?.map((feature) => feature.renderKey)).size, 2)
})

test('Brand Feature validation rejects duplicates and more than five enabled rows', () => {
  assert.match(String(validateBrandFeatureRows([
    { enabled: true, icon: 'leaf', iconSource: 'built-in', title: 'First', description: 'First description', sortOrder: 1 },
    { enabled: false, icon: 'ghee', iconSource: 'built-in', title: 'Second', description: 'Second description', sortOrder: 1 },
  ])), /already used by "First"/)

  assert.match(String(validateBrandFeatureRows(Array.from({ length: 6 }, (_, index) => ({
    enabled: true,
    title: `Feature ${index + 1}`,
    sortOrder: index,
  })))), /maximum of 5 Brand Features/)
})

test('missing and unsupported feature icons resolve to the safe registry fallback', () => {
  assert.equal(normalizeGheeRoastIconName(undefined), 'spice')
  assert.equal(normalizeGheeRoastIconName('<script>'), 'spice')
  assert.equal(normalizeGheeRoastIconName('moped'), 'moped')
})

test('unique top-level Home and About links both map in order', () => {
  const result = mapGheeRoastNavigation({
    tenantId: TENANT_ID,
    links: [
      { id: 'about', blockType: 'link', enabled: true, label: 'About', type: 'internal', url: '/about', sortOrder: 2 },
      { id: 'home', blockType: 'link', enabled: true, label: 'Home', type: 'internal', url: '/', sortOrder: 1 },
    ],
  }, TENANT_ID)

  assert.deepEqual(result.items.map((item) => item.label), ['Home', 'About'])
  assert.deepEqual(result.items.map((item) => item.renderKey), ['nav-home', 'nav-about'])
})

test('duplicate top-level Nav sort orders are rejected even when one row is disabled', () => {
  const result = validateNavTopLevelSortOrders([
    { blockType: 'link', enabled: true, label: 'Home', sortOrder: 1 },
    { blockType: 'link', enabled: false, label: 'About', sortOrder: 1 },
  ])

  assert.equal(result, 'Sort Order 1 is already used by "Home". Choose a unique Sort Order for "About".')
})

test('child Nav duplicates conflict only within their parent', () => {
  const duplicateChildren = [
    { label: 'Delhi', sortOrder: 1 },
    { label: 'Gurugram', sortOrder: 1 },
  ]
  assert.match(String(validateNavChildSortOrders(duplicateChildren)), /already used by "Delhi"/)

  assert.equal(validateNavChildSortOrders([{ label: 'First parent child', sortOrder: 1 }]), true)
  assert.equal(validateNavChildSortOrders([{ label: 'Second parent child', sortOrder: 1 }]), true)
})

test('Nav validation rejects decimals and negative sort orders', () => {
  assert.match(String(validateNavTopLevelSortOrders([
    { blockType: 'link', label: 'Decimal', sortOrder: 1.5 },
  ])), /whole number/)
  assert.match(String(validateNavTopLevelSortOrders([
    { blockType: 'link', label: 'Negative', sortOrder: -1 },
  ])), /between 0/)
})

test('legacy duplicate Nav values render all top-level and child links deterministically', () => {
  const result = mapGheeRoastNavigation({
    tenantId: TENANT_ID,
    links: [
      {
        id: 'parent-a',
        blockType: 'link',
        enabled: true,
        label: 'Home',
        type: 'internal',
        url: '/',
        sortOrder: 1,
        children: [
          { id: 'child-a', enabled: true, label: 'Child A', url: '/same', sortOrder: 1 },
          { id: 'child-b', enabled: true, label: 'Child B', url: '/same', sortOrder: 1 },
        ],
      },
      { id: 'parent-b', blockType: 'link', enabled: true, label: 'About', type: 'internal', url: '/', sortOrder: 1 },
    ],
  }, TENANT_ID)

  assert.deepEqual(result.items.map((item) => item.label), ['Home', 'About'])
  assert.deepEqual(result.items[0]?.children?.map((item) => item.label), ['Child A', 'Child B'])
  assert.equal(new Set(result.items.map((item) => item.renderKey)).size, 2)
  assert.equal(new Set(result.items[0]?.children?.map((item) => item.renderKey)).size, 2)
})

test('Nav mapping remains tenant isolated', () => {
  const result = mapGheeRoastNavigation({
    tenantId: 999,
    links: [{ id: 'foreign', blockType: 'link', label: 'Foreign', type: 'internal', url: '/', sortOrder: 1 }],
  }, TENANT_ID, { fallbacksEnabled: false })

  assert.deepEqual(result.items, [])
})
