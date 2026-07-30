import assert from 'node:assert/strict'
import test from 'node:test'
import { AllBlocks } from '../src/blocks/index.ts'
import { linkField } from '../src/blocks/shared/linkField.ts'
import {
  emptyGheeRoastContent,
  type GheeRoastContentResult,
} from '../src/lib/site/gheeRoastContentCore.ts'
import { buildGheeRoastMetadata } from '../src/themes/ghee-roast/utils/buildGheeRoastMetadata.ts'
import {
  GHEE_ROAST_SUPPORTED_BLOCK_TYPES,
  isGheeRoastSupportedBlock,
} from '../src/themes/ghee-roast/utils/blockSupport.ts'
import { getGheeRoastPageRenderMode } from '../src/themes/ghee-roast/utils/getPageRenderMode.ts'

const fallbackContent = (): GheeRoastContentResult => emptyGheeRoastContent({
  fallbacksEnabled: true,
  tenantName: 'Fixture Ghee Roast',
  tenantState: 'fallback',
})

const cmsPage = (
  blocks: Array<Record<string, unknown>>,
): GheeRoastContentResult => ({
  ...fallbackContent(),
  page: {
    canonicalUrl: 'https://ghee-roast.example/fixture',
    hero: {
      eyebrow: 'CMS eyebrow',
      subtitle: 'CMS hero subtitle',
      title: 'CMS hero title',
    },
    id: 7,
    isHomePage: false,
    layout: blocks,
    metaDescription: 'CMS page description',
    metaImage: {
      alt: 'CMS social image',
      src: 'https://cdn.example/cms.jpg',
    },
    metaTitle: 'CMS page title',
    noIndex: false,
    slug: 'fixture',
    title: 'Fixture',
  },
  seo: {
    canonicalUrl: 'https://ghee-roast.example',
    description: 'Global description',
    ogSiteName: 'CMS Ghee',
    robots: 'index, nofollow',
    titlePattern: '%s | CMS Ghee',
    twitterCard: 'summary',
  },
  tenantState: 'active',
})

test('render decision keeps known legacy pages, applies CMS bodies, and 404s unsafe states', () => {
  const fallback = fallbackContent()
  assert.equal(getGheeRoastPageRenderMode({
    content: fallback,
    hasRegisteredPage: true,
    pathname: '/about',
  }), 'legacy')
  assert.equal(getGheeRoastPageRenderMode({
    content: cmsPage([{ blockType: 'heroBlock' }]),
    hasRegisteredPage: true,
    pathname: '/about',
  }), 'legacy', 'a hero-only CMS page composes its CMS hero with the legacy body')
  assert.equal(getGheeRoastPageRenderMode({
    content: cmsPage([{ blockType: 'heroBlock' }, { blockType: 'ctaBlock' }]),
    hasRegisteredPage: true,
    pathname: '/about',
  }), 'cms')
  assert.equal(getGheeRoastPageRenderMode({
    content: cmsPage([{ blockType: 'richtextBlock' }]),
    hasRegisteredPage: false,
    pathname: '/fixture',
  }), 'cms')
  assert.equal(getGheeRoastPageRenderMode({
    content: fallback,
    hasRegisteredPage: false,
    pathname: '/unknown',
  }), 'not-found')
  for (const tenantState of ['inactive', 'missing'] as const) {
    assert.equal(getGheeRoastPageRenderMode({
      content: { ...fallback, tenantState },
      hasRegisteredPage: true,
      pathname: '/',
    }), 'not-found')
  }
})

test('metadata uses the same CMS page result and fails closed for unknown tenants/routes', () => {
  const metadata = buildGheeRoastMetadata({
    content: cmsPage([{ blockType: 'heroBlock' }]),
    registeredMetadata: {
      description: 'Legacy description',
      title: 'Legacy title',
    },
  })
  assert.equal(metadata.title, 'CMS page title | CMS Ghee')
  assert.equal(metadata.description, 'CMS page description')
  assert.deepEqual(metadata.alternates, {
    canonical: 'https://ghee-roast.example/fixture',
  })
  assert.deepEqual(metadata.robots, { follow: false, index: true })
  assert.deepEqual(metadata.openGraph?.images, [{
    alt: 'CMS social image',
    url: 'https://cdn.example/cms.jpg',
  }])

  const fallback = fallbackContent()
  const fallbackMetadata = buildGheeRoastMetadata({
    content: fallback,
    registeredMetadata: {
      description: 'Legacy description',
      title: 'Legacy title',
    },
  })
  assert.equal(fallbackMetadata.title, 'Legacy title')
  assert.equal(fallbackMetadata.description, 'Legacy description')
  assert.deepEqual(buildGheeRoastMetadata({
    content: { ...fallback, tenantState: 'missing' },
    registeredMetadata: {
      description: 'Must not leak',
      title: 'Must not leak',
    },
  }), {})
  assert.deepEqual(buildGheeRoastMetadata({ content: fallback }), {})
})

test('every Payload block exposed to Ghee pages has a deterministic renderer disposition', () => {
  const configured = AllBlocks.map((block) => block.slug).sort()
  assert.deepEqual(configured, [...GHEE_ROAST_SUPPORTED_BLOCK_TYPES].sort())
  assert.ok(configured.every(isGheeRoastSupportedBlock))
  assert.equal(isGheeRoastSupportedBlock('unknownBlock'), false)
})

test('CMS link validation requires only the target appropriate to the selected link type', () => {
  const fields = linkField().fields
  const findNamedField = (
    values: unknown[],
    name: string,
  ): Record<string, unknown> | null => {
    for (const value of values) {
      if (!value || typeof value !== 'object') continue
      const field = value as Record<string, unknown>
      if (field.name === name) return field
      const nested = Array.isArray(field.fields) ? field.fields : []
      const match = findNamedField(nested, name)
      if (match) return match
    }
    return null
  }
  const reference = findNamedField(fields, 'reference')
  const url = findNamedField(fields, 'url')
  assert.ok(reference)
  assert.ok(url)
  const validateReference = reference.validate as (
    value: unknown,
    args: { siblingData: unknown },
  ) => true | string
  const validateURL = url.validate as (
    value: unknown,
    args: { siblingData: unknown },
  ) => true | string

  assert.equal(validateReference(7, { siblingData: { type: 'reference' } }), true)
  assert.match(String(validateReference(null, { siblingData: { type: 'reference' } })), /Select an internal page/)
  assert.equal(validateReference(null, { siblingData: { type: 'custom' } }), true)
  assert.equal(validateURL(null, { siblingData: { type: 'reference' } }), true)
  assert.equal(validateURL('/menu', { siblingData: { type: 'custom' } }), true)
  assert.match(String(validateURL('javascript:alert(1)', { siblingData: { type: 'custom' } })), /http\/https/)
})
