import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
import { getGheeRoastCollectionDependencies } from '../src/lib/site/gheeRoastContentCore.ts'
import { validatePageLayout } from '../src/validation/pageLayout.ts'
import { mapGheeRoastPage } from '../src/themes/ghee-roast/mappers/cmsContent.ts'
import type { GheeRoastPageDocument } from '../src/themes/ghee-roast/mappers/cmsContent.ts'
import type { GheeRoastPageBlock } from '../src/themes/ghee-roast/dynamicTypes.ts'

const emptyContent = (): GheeRoastContentResult => emptyGheeRoastContent({
  fallbacksEnabled: false,
  tenantName: 'Fixture Ghee Roast',
  tenantState: 'empty',
})

const cmsPage = (
  blocks: Array<Record<string, unknown>>,
): GheeRoastContentResult => ({
  ...emptyContent(),
  page: {
    canonicalUrl: 'https://ghee-roast.example/fixture',
    hero: {
      eyebrow: 'CMS eyebrow',
      subtitle: 'CMS hero subtitle',
      title: 'CMS hero title',
    },
    id: 7,
    isHomePage: false,
    layout: blocks as unknown as GheeRoastPageBlock[],
    metaDescription: 'CMS page description',
    metaImage: {
      alt: 'CMS social image',
      src: 'https://cdn.example/cms.jpg',
    },
    metaTitle: 'CMS page title',
    noIndex: false,
    pageType: 'generic',
    redirect: undefined,
    slug: 'fixture',
    template: 'default',
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

test('page type, not slug guessing, controls page-specific collection dependencies', () => {
  const about = mapGheeRoastPage({
    _status: 'published',
    id: 9,
    isHomePage: false,
    layout: [],
    pageType: 'about',
    slug: 'our-story-any-slug',
    tenantId: 3167,
    title: 'Our Story',
  }, 3167)
  assert.equal(about?.pageType, 'about')
  assert.equal(getGheeRoastCollectionDependencies('about', []).team, true)
  assert.equal(getGheeRoastCollectionDependencies('generic', []).team, false)
})

test('page record maps only safe configured redirects', () => {
  const base: GheeRoastPageDocument = {
    _status: 'published',
    id: 10,
    isHomePage: false,
    layout: [],
    pageType: 'generic',
    slug: 'old-page',
    tenantId: 3167,
    title: 'Old Page',
  }
  assert.deepEqual(mapGheeRoastPage({
    ...base,
    redirect: { enableRedirect: true, permanent: false, redirectUrl: '/new-page' },
  }, 3167)?.redirect, { href: '/new-page', permanent: false })
  assert.equal(mapGheeRoastPage({
    ...base,
    redirect: { enableRedirect: true, redirectUrl: 'javascript:alert(1)' },
  }, 3167)?.redirect, undefined)
})

test('page layout rejects duplicate singleton blocks, misplaced Hero, and duplicate anchors', () => {
  assert.match(String(validatePageLayout([{ blockType: 'heroBlock' }, { blockType: 'heroBlock' }])), /only once/)
  assert.match(String(validatePageLayout([{ blockType: 'richtextBlock' }, { blockType: 'heroBlock' }])), /must be the first/)
  assert.match(String(validatePageLayout([
    { blockType: 'richtextBlock', settings: { htmlId: 'same' } },
    { blockType: 'ctaBlock', settings: { htmlId: 'same' } },
  ])), /more than one block/)
  assert.equal(validatePageLayout([
    { blockType: 'heroBlock' },
    { blockType: 'statsBlock', settings: { htmlId: 'proof-1' } },
  ]), true)
})

test('render decision applies CMS pages, keeps an empty Home shell, and 404s unknown routes', () => {
  const empty = emptyContent()
  assert.equal(getGheeRoastPageRenderMode({
    content: empty,
    hasRegisteredPage: false,
    pathname: '/',
  }), 'cms')
  assert.equal(getGheeRoastPageRenderMode({
    content: cmsPage([{ blockType: 'heroBlock' }]),
    hasRegisteredPage: true,
    pathname: '/about',
  }), 'cms', 'a published CMS page never composes with a legacy body')
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
    content: empty,
    hasRegisteredPage: false,
    pathname: '/unknown',
  }), 'not-found')
  assert.equal(getGheeRoastPageRenderMode({
    content: empty,
    hasRegisteredPage: true,
    pathname: '/about',
  }), 'legacy', 'only the explicit development compatibility path supplies a registered legacy page')
  for (const tenantState of ['inactive', 'missing'] as const) {
    assert.equal(getGheeRoastPageRenderMode({
      content: { ...empty, tenantState },
      hasRegisteredPage: true,
      pathname: '/',
    }), 'not-found')
  }
})

test('metadata uses the same CMS page result and fails closed for unknown tenants/routes', () => {
  const metadata = buildGheeRoastMetadata({
    content: cmsPage([{ blockType: 'heroBlock' }]),
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

  const empty = emptyContent()
  const emptyMetadata = buildGheeRoastMetadata({ content: empty })
  assert.equal(emptyMetadata.title, 'Fixture Ghee Roast')
  assert.equal(emptyMetadata.description, undefined)
  assert.deepEqual(emptyMetadata.robots, { follow: true, index: false })
  assert.deepEqual(buildGheeRoastMetadata({
    content: { ...empty, tenantState: 'missing' },
  }), {})
})

test('normal Ghee Roast runtime has no static legacy data dependency', () => {
  const normalRuntimeFiles = [
    'src/lib/site/gheeRoastContentCore.ts',
    'src/lib/site/getGheeRoastMetadata.ts',
    'src/themes/ghee-roast/GheeRoastPageRenderer.tsx',
    'src/themes/ghee-roast/index.ts',
    'src/themes/ghee-roast/mappers/cmsContent.ts',
    'src/themes/ghee-roast/utils/buildGheeRoastMetadata.ts',
  ]
  for (const file of normalRuntimeFiles) {
    const source = readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /(?:from|import\()\s*['"][^'"]*\/data\//)
  }

  const renderer = readFileSync('src/themes/ghee-roast/GheeRoastPageRenderer.tsx', 'utf8')
  const publicExports = readFileSync('src/themes/ghee-roast/index.ts', 'utf8')
  assert.match(renderer, /gheeRoastLegacyFallbacksEnabled\(\)/)
  assert.match(renderer, /await import\('\.\/utils\/getPageComponent'\)/)
  assert.doesNotMatch(publicExports, /getPageComponent|gheeRoastPageRegistry/)
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
