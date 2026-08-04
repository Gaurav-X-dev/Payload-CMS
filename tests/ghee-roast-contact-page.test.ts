import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { FormBlock } from '../src/blocks/Form.ts'
import { LocationsBlock } from '../src/blocks/Locations.ts'
import { SocialLinksBlock } from '../src/blocks/SocialLinks.ts'
import { Locations } from '../src/collections/Locations.ts'
import { SiteSettings } from '../src/collections/SiteSettings.ts'
import { validatePrimaryLocation } from '../src/hooks/validatePrimaryLocation.ts'
import { getGheeRoastCollectionDependencies } from '../src/lib/site/gheeRoastContentCore.ts'
import type { GheeRoastLocationData } from '../src/themes/ghee-roast/dynamicTypes.ts'
import { mapGheeRoastCollections, mapGheeRoastPage, mapGheeRoastSite } from '../src/themes/ghee-roast/mappers/cmsContent.ts'
import { resolveGheeRoastBlockMedia } from '../src/themes/ghee-roast/utils/cmsBlockMedia.ts'
import { gheeRoastLocationMapHref, sortGheeRoastContactLocations } from '../src/themes/ghee-roast/utils/contactPage.ts'
import { validateContactSubjectRows, validateSocialRows } from '../src/validation/contactPage.ts'
import { validatePageLayout } from '../src/validation/pageLayout.ts'

type UnknownRecord = Record<string, unknown>

const tenantID = 3167

const record = (value: unknown): UnknownRecord | null =>
  value !== null && typeof value === 'object' ? value as UnknownRecord : null

const findField = (fields: unknown[], name: string): UnknownRecord | null => {
  for (const fieldValue of fields) {
    const field = record(fieldValue)
    if (!field) continue
    if (field.name === name) return field
    const nested = Array.isArray(field.fields) ? field.fields : []
    const nestedResult = findField(nested, name)
    if (nestedResult) return nestedResult
    const tabs = Array.isArray(field.tabs) ? field.tabs : []
    for (const tab of tabs) {
      const result = findField(Array.isArray(record(tab)?.fields) ? record(tab)!.fields as unknown[] : [], name)
      if (result) return result
    }
  }
  return null
}

const location = (
  id: number,
  overrides: Partial<GheeRoastLocationData> = {},
): GheeRoastLocationData => ({
  address: `${id} Test Street`,
  businessHours: [],
  city: 'Delhi',
  deliveryZones: [],
  id,
  isPrimary: false,
  mapButtonLabel: 'Find on Map',
  orderLinks: [],
  showOnContact: true,
  sortOrder: id,
  title: `Location ${id}`,
  ...overrides,
})

test('Contact Form schema reuses the existing block and exposes media, subjects, states, variants, and tenant-safe media', () => {
  for (const name of [
    'enabled',
    'formType',
    'subjectOptions',
    'submitLabel',
    'successMessage',
    'errorMessage',
    'sideImage',
    'imageAlt',
    'imagePosition',
    'imageFit',
    'formCardStyle',
    'settings',
  ]) assert.ok(findField(FormBlock.fields, name), `missing Form field ${name}`)

  const sideImage = findField(FormBlock.fields, 'sideImage')
  assert.equal(sideImage?.relationTo, 'media')
  assert.equal(typeof sideImage?.filterOptions, 'function')
  assert.ok(Array.isArray(record(sideImage?.hooks)?.beforeValidate))
  assert.equal(validateContactSubjectRows([{ label: 'General', value: 'general' }]), true)
  assert.match(String(validateContactSubjectRows([
    { label: 'General', value: 'general' },
    { label: 'Duplicate', value: 'GENERAL' },
  ])), /duplicated/)
})

test('Contact Form renders two columns with object media, raw-ID media, alt fallbacks, and a clean missing-image collapse', () => {
  const block = {
    blockType: 'formBlock',
    enabled: true,
    formType: 'contact',
    imageAlt: 'Contact team serving Ghee Roast',
    sectionHeader: { description: 'We would love to hear from you.', title: 'Send us a message' },
    sideImage: { alt: 'Media fallback', id: 84, tenantId: tenantID, url: '/media/contact.jpg' },
    subjectOptions: [{ label: 'General Enquiry', value: 'General Enquiry' }],
  }
  const objectMedia = resolveGheeRoastBlockMedia(
    { altOverride: block.imageAlt, item: block.sideImage },
    tenantID,
  )
  assert.equal(objectMedia?.src, '/media/contact.jpg')
  assert.equal(objectMedia?.alt, 'Contact team serving Ghee Roast')

  const rawMedia = resolveGheeRoastBlockMedia(
    { item: 84 },
    tenantID,
    undefined,
    [{ alt: 'Raw media fallback', id: 84, src: '/media/raw-contact.jpg', tenantID }],
  )
  assert.equal(rawMedia?.src, '/media/raw-contact.jpg')
  assert.equal(rawMedia?.alt, 'Raw media fallback')
  assert.equal(resolveGheeRoastBlockMedia(null, tenantID), undefined)

  const rendererSource = readFileSync('src/themes/ghee-roast/components/CMSPage.tsx', 'utf8')
  assert.match(rendererSource, /data-has-image=\{Boolean\(sideImage\)\}/)
  assert.match(rendererSource, /sideImage && <figure/)
  assert.match(rendererSource, /sideImage\.alt \|\| section\.title \|\| 'Contact us'/)
  assert.equal(resolveGheeRoastBlockMedia({ id: 1, tenantId: 999, url: '/foreign.jpg' }, tenantID), undefined)
})

test('Contact Form client has loading, success, error, validation, and duplicate-submit protections', () => {
  const source = readFileSync('src/themes/ghee-roast/components/ContactForm.tsx', 'utf8')
  assert.match(source, /setSubmitting\(true\)/)
  assert.match(source, /setMessageTone\('success'\)/)
  assert.match(source, /setMessageTone\('error'\)/)
  assert.match(source, /submissionGuard\.current\.begin\(\)/)
  assert.match(source, /disabled=\{submitting\}/)
  assert.match(source, /type="email"|type=\{field\.type\}/)
})

test('Contact locations support unlimited responsive counts without truncation and deterministic visibility sorting', () => {
  const unsorted = [
    location(9, { sortOrder: 1 }),
    location(3, { isPrimary: true, sortOrder: 50 }),
    location(2, { sortOrder: 1 }),
    location(4, { showOnContact: false, sortOrder: 0 }),
  ]
  assert.deepEqual(sortGheeRoastContactLocations(unsorted).map((item) => item.id), [3, 2, 9])

  for (const count of [1, 2, 3, 4, 8]) {
    const locations = Array.from({ length: count }, (_, index) => location(index + 1))
    assert.equal(sortGheeRoastContactLocations(locations).length, count)
  }
  const rendererSource = readFileSync('src/themes/ghee-roast/components/CMSPage.tsx', 'utf8')
  const css = readFileSync('src/themes/ghee-roast/components/Theme.module.css', 'utf8')
  assert.match(rendererSource, /data-location-count=\{locations\.length\}/)
  assert.doesNotMatch(rendererSource, /sortGheeRoastContactLocations\([^)]*\)\.slice/)
  assert.match(css, /repeat\(auto-fit, minmax/)
  assert.match(css, /data-location-count='1'/)
  assert.match(css, /data-location-count='2'/)
  assert.match(css, /data-location-count='3'/)
})

test('Location cards expose safe map, phone, delivery-zone, hours, and hide absent/unsafe destinations', () => {
  const valid = location(1, {
    businessHours: ['Monday: 11:00 – 23:00'],
    deliveryZones: ['South Delhi'],
    mapsUrl: 'https://maps.google.com/?q=28.5,77.2',
    phone: '9876543210',
  })
  assert.equal(gheeRoastLocationMapHref(valid), valid.mapsUrl)
  assert.match(String(gheeRoastLocationMapHref(location(2, { latitude: 28.5, longitude: 77.2 }))), /google\.com\/maps\/search/)
  assert.equal(gheeRoastLocationMapHref(location(3, { mapsUrl: 'javascript:alert(1)' })), null)
  assert.equal(gheeRoastLocationMapHref(location(4)), null)

  const rendererSource = readFileSync('src/themes/ghee-roast/components/CMSPage.tsx', 'utf8')
  assert.match(rendererSource, /href=\{`tel:\$\{location\.phone\}`\}/)
  assert.match(rendererSource, /Open \$\{location\.title\} in Google Maps/)
  assert.match(rendererSource, /rel="noopener noreferrer"/)
  assert.match(rendererSource, /mapHref && <a/)
})

test('Location schema validates coordinates/order/visibility and prevents a second tenant primary', async () => {
  for (const name of ['isPrimary', 'state', 'postalCode', 'country', 'deliveryZones', 'businessHours', 'latitude', 'longitude', 'mapButtonLabel', 'showOnContact', 'showInFooter', 'showOnHome']) {
    assert.ok(findField(Locations.fields, name), `missing Location field ${name}`)
  }
  const latitude = findField(Locations.fields, 'latitude')
  const longitude = findField(Locations.fields, 'longitude')
  const sortOrder = findField(Locations.fields, 'sortOrder')
  assert.equal((latitude?.validate as (value: unknown) => true | string)(90), true)
  assert.match(String((latitude?.validate as (value: unknown) => true | string)(91)), /between -90 and 90/)
  assert.match(String((longitude?.validate as (value: unknown) => true | string)(181)), /between -180 and 180/)
  assert.match(String((sortOrder?.validate as (value: unknown) => true | string)(1.5)), /whole number/)

  await assert.rejects(() => validatePrimaryLocation({
    data: { isPrimary: true, tenantId: tenantID },
    operation: 'create',
    req: { payload: { find: async () => ({ docs: [{ id: 2 }] }) } },
  } as never), (error: unknown) => {
    const validation = error as { data?: { errors?: Array<{ message?: string }> } }
    assert.match(String(validation.data?.errors?.[0]?.message), /Only one location/)
    return true
  })
})

test('Location mapper blocks cross-tenant rows and Contact loading remains block-driven and bounded', () => {
  const mapped = mapGheeRoastCollections({
    locations: [
      { address: 'Local', city: 'Delhi', id: 1, isActive: true, tenantId: tenantID, title: 'Local' },
      { address: 'Foreign', city: 'Delhi', id: 2, isActive: true, tenantId: 999, title: 'Foreign' },
    ],
  }, tenantID)
  assert.deepEqual(mapped.locations.map((item) => item.title), ['Local'])
  assert.equal(getGheeRoastCollectionDependencies('contact', []).locations, false)
  assert.equal(getGheeRoastCollectionDependencies('contact', [{ blockType: 'locationsBlock' }]).locations, true)
})

test('Published Site Settings social rows become ordered CTA cards without visible raw URLs', () => {
  const site = mapGheeRoastSite({ id: tenantID, name: 'Ghee Roast' }, {
    _status: 'published',
    id: 1,
    socials: [
      { displayLabel: 'Facebook', enabled: true, id: 'fb', openInNewTab: true, platform: 'facebook', sortOrder: 2, url: 'https://facebook.com/ghee' },
      { displayLabel: 'Instagram', enabled: true, handle: '@ghee', id: 'ig', platform: 'instagram', sortOrder: 1, url: 'https://instagram.com/ghee' },
      { enabled: true, id: 'bad', platform: 'youtube', sortOrder: 3, url: 'javascript:alert(1)' },
    ],
    tenantId: tenantID,
  }, tenantID)
  assert.deepEqual(site.socials.map((item) => item.platform), ['instagram', 'facebook'])

  assert.equal(site.socials[0]?.displayLabel, 'Instagram')
  assert.equal(site.socials[0]?.ctaLabel, 'Follow on Instagram')
  assert.equal(site.socials[1]?.displayLabel, 'Facebook')
  assert.equal(site.socials[1]?.ctaLabel, 'Visit Facebook')
  const rendererSource = readFileSync('src/themes/ghee-roast/components/CMSPage.tsx', 'utf8')
  assert.match(rendererSource, /data-social-count=\{items\.length\}/)
  assert.match(rendererSource, />\{item\.ctaLabel\}/)
  assert.doesNotMatch(rendererSource, />\{item\.href\}</)
})

test('Social schema requires safe external URLs for enabled unique platforms and supports editor metadata', () => {
  for (const name of ['enabled', 'platform', 'displayLabel', 'handle', 'description', 'url', 'icon', 'sortOrder', 'openInNewTab']) {
    assert.ok(findField(SiteSettings.fields, name), `missing Site Settings social field ${name}`)
  }
  assert.equal(validateSocialRows([{ enabled: true, platform: 'instagram', url: 'https://instagram.com/ghee' }]), true)
  assert.match(String(validateSocialRows([{ enabled: true, platform: 'instagram', url: '' }])), /Enter an http\/https URL/)
  assert.match(String(validateSocialRows([{ enabled: true, platform: 'instagram', url: 'javascript:alert(1)' }])), /complete http\/https URL/)
  assert.match(String(validateSocialRows([
    { enabled: true, platform: 'instagram', url: 'https://instagram.com/one' },
    { enabled: true, platform: 'instagram', url: 'https://instagram.com/two' },
  ])), /Only one enabled/)
})

test('Contact Page layout preserves editor order, skips disabled sections, and rejects duplicate singleton blocks', () => {
  assert.equal(SocialLinksBlock.slug, 'socialLinksBlock')
  assert.equal(LocationsBlock.slug, 'locationsBlock')
  const inputLayout = [
    { blockType: 'contentgridBlock', items: [{ description: 'First copy', title: 'First section' }], sectionHeader: { title: 'First' } },
    { blockType: 'socialLinksBlock', enabled: false, sectionHeader: { title: 'Hidden Social' } },
    { blockType: 'contentgridBlock', items: [{ description: 'Last copy', title: 'Last section' }], sectionHeader: { title: 'Last' } },
  ]
  const mapped = mapGheeRoastPage({
    _status: 'published',
    id: 2788,
    layout: inputLayout as never,
    pageType: 'contact',
    slug: 'contact',
    tenantId: tenantID,
    title: 'Contact Us',
  }, tenantID)
  assert.deepEqual(mapped?.layout.map((block) => block.blockType), inputLayout.map((block) => block.blockType))
  const rendererSource = readFileSync('src/themes/ghee-roast/components/CMSPage.tsx', 'utf8')
  assert.match(rendererSource, /block\.enabled === false/)
  for (const blockType of ['formBlock', 'locationsBlock', 'socialLinksBlock', 'newsletterBlock']) {
    assert.match(String(validatePageLayout([{ blockType }, { blockType }])), /only once/)
  }
})

test('Draft Contact pages remain private while the published route contract and unknown-route behavior remain unchanged', () => {
  assert.equal(mapGheeRoastPage({
    _status: 'draft',
    id: 2788,
    layout: [],
    pageType: 'contact',
    slug: 'contact',
    tenantId: tenantID,
    title: 'Contact Us',
  }, tenantID), null)
  const published = mapGheeRoastPage({
    _status: 'published',
    id: 2788,
    layout: [],
    pageType: 'contact',
    slug: 'contact',
    tenantId: tenantID,
    title: 'Contact Us',
  }, tenantID)
  assert.equal(published?.id, 2788)
  assert.equal(published?.slug, 'contact')
})
