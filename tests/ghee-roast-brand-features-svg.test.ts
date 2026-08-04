import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { sameTenantSVGRelationship } from '../src/hooks/sameTenantSVGRelationship.ts'
import { mapGheeRoastSite } from '../src/themes/ghee-roast/mappers/cmsContent.ts'
import { validateBrandFeatureRows } from '../src/validation/orderedRows.ts'
import {
  MAX_SVG_FILE_SIZE,
  SVG_MIME_TYPE,
  isSanitizedSVGMedia,
  sanitizeSVGContent,
  validateAndSanitizeSVGUpload,
} from '../src/validation/svgSafety.ts'

const TENANT_ID = 3167
const tenant = { id: TENANT_ID, name: 'Ghee Roast' }

const feature = (index: number, overrides: Record<string, unknown> = {}) => ({
  enabled: true,
  icon: 'leaf',
  iconSource: 'built-in',
  title: `Feature ${index + 1}`,
  description: `Feature description ${index + 1}`,
  sortOrder: index,
  ...overrides,
})

const rows = (count: number) => Array.from({ length: count }, (_, index) => feature(index))

const mapRows = (featureStrip: unknown[], tenantId = TENANT_ID) => mapGheeRoastSite(
  tenant,
  { tenantId, featureStrip },
  TENANT_ID,
)

const safeSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#365238" d="M8 8h48v48H8z"/></svg>'

const relationshipRequest = (
  secondDocument: Record<string, unknown>,
  sameTenant = true,
) => {
  let call = 0
  return {
    context: {},
    payload: {
      find: async () => {
        call += 1
        if (call === 1) return { docs: sameTenant ? [{ id: 91 }] : [] }
        return { docs: [secondDocument] }
      },
    },
  }
}

test('validation accepts 1 Brand Feature', () => {
  assert.equal(validateBrandFeatureRows(rows(1)), true)
})

test('validation accepts 2 Brand Features', () => {
  assert.equal(validateBrandFeatureRows(rows(2)), true)
})

test('validation accepts 5 Brand Features', () => {
  assert.equal(validateBrandFeatureRows(rows(5)), true)
})

test('validation rejects 6 total Brand Features, including disabled rows', () => {
  const value = rows(6)
  value[5].enabled = false
  assert.equal(validateBrandFeatureRows(value), 'A maximum of 5 Brand Features is allowed.')
})

test('validation rejects duplicate Sort Order values', () => {
  assert.equal(
    validateBrandFeatureRows([
      feature(0, { title: 'Authentic Recipes', sortOrder: 1 }),
      feature(1, { title: 'Cooked in Ghee', sortOrder: 1 }),
    ]),
    'Sort Order 1 is already used by "Authentic Recipes". Choose a unique Sort Order for "Cooked in Ghee".',
  )
})

test('validation rejects negative Sort Order', () => {
  assert.match(String(validateBrandFeatureRows([feature(0, { sortOrder: -1 })])), /between 0/)
})

test('validation rejects decimal Sort Order', () => {
  assert.match(String(validateBrandFeatureRows([feature(0, { sortOrder: 1.5 })])), /whole number/)
})

test('validation rejects blank Title after trimming', () => {
  assert.match(String(validateBrandFeatureRows([feature(0, { title: '   ' })])), /Title must contain 2 to 60/)
})

test('validation rejects blank Description after trimming', () => {
  assert.match(String(validateBrandFeatureRows([feature(0, { description: '   ' })])), /Description must contain 5 to 180/)
})

test('validation requires a Built-in Icon for built-in source', () => {
  assert.match(String(validateBrandFeatureRows([feature(0, { icon: '' })])), /choose a supported Built-in Icon/)
})

test('validation requires Custom SVG for custom-svg source', () => {
  assert.match(String(validateBrandFeatureRows([feature(0, { customSVG: null, iconSource: 'custom-svg' })])), /select a Custom SVG Icon/)
})

test('Custom SVG relationship rejects non-SVG Media', async () => {
  await assert.rejects(() => sameTenantSVGRelationship({
    data: { tenantId: TENANT_ID },
    path: ['featureStrip', '0', 'customSVG'],
    req: relationshipRequest({ filename: 'photo.png', id: 91, mimeType: 'image/png', svgSanitized: false }),
    value: 91,
  } as never), (error: unknown) => {
    const messages = (error as { cause?: { errors?: Array<{ message?: string }> } }).cause?.errors
    assert.match(messages?.[0]?.message ?? '', /validated SVG Media file/)
    return true
  })
})

test('Custom SVG relationship rejects cross-tenant Media', async () => {
  await assert.rejects(() => sameTenantSVGRelationship({
    data: { tenantId: TENANT_ID },
    path: ['featureStrip', '0', 'customSVG'],
    req: relationshipRequest({}, false),
    value: 91,
  } as never), (error: unknown) => {
    const messages = (error as { cause?: { errors?: Array<{ message?: string }> } }).cause?.errors
    assert.match(messages?.[0]?.message ?? '', /active tenant/)
    return true
  })
})

test('Custom SVG relationship accepts sanitized same-tenant SVG Media', async () => {
  const value = await sameTenantSVGRelationship({
    data: { tenantId: TENANT_ID },
    path: ['featureStrip', '0', 'customSVG'],
    req: relationshipRequest({ filename: 'safe.svg', id: 91, mimeType: SVG_MIME_TYPE, svgSanitized: true }),
    value: 91,
  } as never)
  assert.equal(value, 91)
})

test('validation rejects an unsupported Icon Source', () => {
  assert.match(String(validateBrandFeatureRows([feature(0, { iconSource: 'raw-html' })])), /choose Built-in Icon or Custom SVG/)
})

for (const count of [1, 2, 3, 4, 5]) {
  test(`mapper preserves ${count} enabled feature${count === 1 ? '' : 's'}`, () => {
    assert.equal(mapRows(rows(count)).featureStrip?.length, count)
  })
}

test('mapper hides disabled items and keeps the visible count accurate', () => {
  const result = mapRows([
    feature(0),
    feature(1, { enabled: false }),
    feature(2),
  ])
  assert.deepEqual(result.featureStrip?.map((item) => item.title), ['Feature 1', 'Feature 3'])
})

test('mapper sorts enabled features by Sort Order', () => {
  const result = mapRows([
    feature(0, { title: 'Third', sortOrder: 3 }),
    feature(1, { title: 'First', sortOrder: 1 }),
    feature(2, { title: 'Second', sortOrder: 2 }),
  ])
  assert.deepEqual(result.featureStrip?.map((item) => item.title), ['First', 'Second', 'Third'])
})

test('legacy duplicate Sort Orders render every row in original order', () => {
  const result = mapRows([
    feature(0, { id: 'first', title: 'First', sortOrder: 1 }),
    feature(1, { id: 'second', title: 'Second', sortOrder: 1 }),
  ])
  assert.deepEqual(result.featureStrip?.map((item) => item.title), ['First', 'Second'])
})

test('stable feature keys come from row IDs rather than Sort Order', () => {
  const result = mapRows([
    feature(0, { id: 'first', sortOrder: 1 }),
    feature(1, { id: 'second', sortOrder: 1 }),
  ])
  assert.deepEqual(result.featureStrip?.map((item) => item.renderKey), [
    'brand-feature-first',
    'brand-feature-second',
  ])
})

test('mapper resolves a populated, sanitized Custom SVG relationship', () => {
  const result = mapRows([feature(0, {
    customSVG: {
      alt: 'Leaf icon',
      filename: 'leaf.svg',
      id: 91,
      mimeType: SVG_MIME_TYPE,
      svgSanitized: true,
      tenantId: TENANT_ID,
      url: '/media/leaf.svg',
    },
    iconSource: 'custom-svg',
  })])
  assert.deepEqual(result.featureStrip?.[0]?.customIcon, {
    alt: 'Leaf icon',
    src: '/media/leaf.svg',
  })
})

test('raw Custom SVG relationship IDs safely use the built-in fallback', () => {
  const result = mapRows([feature(0, { customSVG: 91, icon: '', iconSource: 'custom-svg' })])
  assert.equal(result.featureStrip?.[0]?.customIcon, undefined)
  assert.equal(result.featureStrip?.[0]?.icon, 'spice')
})

test('missing or invalid Custom SVG safely uses the built-in fallback', () => {
  const result = mapRows([feature(0, {
    customSVG: { filename: 'unsafe.svg', mimeType: SVG_MIME_TYPE, svgSanitized: false, tenantId: TENANT_ID, url: '/media/unsafe.svg' },
    icon: 'pepper',
    iconSource: 'custom-svg',
  })])
  assert.equal(result.featureStrip?.[0]?.customIcon, undefined)
  assert.equal(result.featureStrip?.[0]?.icon, 'pepper')
})

test('missing Site Settings does not inject Brand Features', () => {
  const result = mapGheeRoastSite(tenant, null, TENANT_ID)
  assert.equal(result.featureStrip, undefined)
})

test('an existing empty Brand Features array intentionally hides the section', () => {
  assert.deepEqual(mapRows([]).featureStrip, [])
})

test('an all-disabled Brand Features list intentionally hides the section', () => {
  assert.deepEqual(mapRows([feature(0, { enabled: false })]).featureStrip, [])
})

test('foreign-tenant Site Settings cannot supply Brand Features', () => {
  assert.equal(mapRows(rows(2), 999).featureStrip, undefined)
})

test('renderer uses the custom SVG Media URL as a theme-colored CSS mask', () => {
  const component = readFileSync('src/themes/ghee-roast/components/Shared.tsx', 'utf8')
  const styles = readFileSync('src/themes/ghee-roast/components/Theme.module.css', 'utf8')
  assert.match(component, /data-feature-count=\{features\.length\}/)
  assert.match(component, /JSON\.stringify\(feature\.customIcon\.src\)/)
  assert.match(component, /maskImage: customSVGMask/)
  assert.match(component, /WebkitMaskImage: customSVGMask/)
  assert.doesNotMatch(component, /<Image[^>]+feature\.customIcon\.src/)
  assert.match(styles, /--ghee-icon-color: var\(--gr-primary\)/)
  assert.match(styles, /\.featureSvgMask\s*\{/)
  assert.match(styles, /background-color: var\(--ghee-icon-color, var\(--gr-primary\)\)/)
  assert.match(styles, /mask-repeat: no-repeat/)
  assert.match(styles, /-webkit-mask-repeat: no-repeat/)
  for (const count of [1, 2, 3, 4, 5]) {
    assert.match(styles, new RegExp(`data-feature-count='${count}'`))
  }
})

test('safe SVG is accepted and comments are removed from stored content', async () => {
  const sanitized = await validateAndSanitizeSVGUpload({
    data: Buffer.from(`<!-- editor comment -->${safeSVG}`),
    mimetype: SVG_MIME_TYPE,
    name: 'feature.svg',
    size: Buffer.byteLength(safeSVG),
  })
  assert.ok(sanitized)
  assert.doesNotMatch(sanitized.toString('utf8'), /editor comment/)
})

test('SVG uploads reject MIME and extension mismatches', async () => {
  await assert.rejects(() => validateAndSanitizeSVGUpload({
    data: Buffer.from(safeSVG),
    mimetype: 'image/png',
    name: 'feature.svg',
    size: Buffer.byteLength(safeSVG),
  }), /both the \.svg extension and the image\/svg\+xml MIME type/)
})

test('SVG uploads enforce the 256 KB file-size limit', async () => {
  await assert.rejects(() => validateAndSanitizeSVGUpload({
    data: Buffer.from(safeSVG),
    mimetype: SVG_MIME_TYPE,
    name: 'feature.svg',
    size: MAX_SVG_FILE_SIZE + 1,
  }), /256 KB or smaller/)
})

test('unsafe SVG executable elements are rejected', async () => {
  await assert.rejects(() => sanitizeSVGContent('<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>unsafe</div></foreignObject></svg>'), /unsafe or executable element/)
})

test('script-containing SVG is rejected', async () => {
  await assert.rejects(() => sanitizeSVGContent('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), /unsafe or executable element/)
})

test('SVG event-handler attributes are rejected', async () => {
  await assert.rejects(() => sanitizeSVGContent('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><path d="M0 0"/></svg>'), /event-handler/)
})

test('SVG external references are rejected', async () => {
  await assert.rejects(() => sanitizeSVGContent('<svg xmlns="http://www.w3.org/2000/svg"><use href="https://evil.example/icon.svg#x"/></svg>'), /External, executable, and data URLs/)
})

test('sanitized SVG Media marker requires MIME, extension, and sanitizer flag', () => {
  assert.equal(isSanitizedSVGMedia({ filename: 'safe.svg', mimeType: SVG_MIME_TYPE, svgSanitized: true }), true)
  assert.equal(isSanitizedSVGMedia({ filename: 'safe.png', mimeType: SVG_MIME_TYPE, svgSanitized: true }), false)
})
