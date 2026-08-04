import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { getGheeRoastCollectionDependencies } from '../src/lib/site/gheeRoastContentCore.ts'
import type { GheeRoastContentResult } from '../src/lib/site/gheeRoastContentCore.ts'
import { GheeRoastHomePromosBlock } from '../src/blocks/GheeRoastHomePromos.ts'
import { GheeRoastHomeQualityBlock } from '../src/blocks/GheeRoastHomeQuality.ts'
import { GheeRoastHomeStoryBlock } from '../src/blocks/GheeRoastHomeStory.ts'
import {
  mapGheeRoastCollections,
  mapGheeRoastPage,
} from '../src/themes/ghee-roast/mappers/cmsContent.ts'
import { resolveGheeRoastBlockMedia } from '../src/themes/ghee-roast/utils/cmsBlockMedia.ts'
import { getGheeRoastPageRenderMode } from '../src/themes/ghee-roast/utils/getPageRenderMode.ts'
import { resolveGheeRoastHomeLayout } from '../src/themes/ghee-roast/utils/homeLayout.ts'
import type { GheeRoastPageDocument } from '../src/themes/ghee-roast/mappers/cmsContent.ts'
import type { Page } from '../src/payload-types.ts'

const tenantID = 3167
const publishedPage = (layout: Array<Record<string, unknown>>): GheeRoastPageDocument => ({
  _status: 'published',
  id: 71,
  isHomePage: true,
  layout: layout as unknown as Page['layout'],
  slug: '',
  tenantId: tenantID,
  title: 'Home',
})

const contentFor = (layout: Array<Record<string, unknown>> | null): GheeRoastContentResult => ({
  page: layout === null ? null : mapGheeRoastPage(publishedPage(layout), tenantID),
  tenantState: 'active',
} as GheeRoastContentResult)

const cmsSource = readFileSync('src/themes/ghee-roast/components/CMSPage.tsx', 'utf8')
const homeSource = readFileSync('src/themes/ghee-roast/pages/HomePage.tsx', 'utf8')
const rendererSource = readFileSync('src/themes/ghee-roast/GheeRoastPageRenderer.tsx', 'utf8')

test('published Home Page preserves its CMS Layout blocks', () => {
  const page = mapGheeRoastPage(publishedPage([{ blockType: 'gheeHomeStoryBlock', heading: 'CMS Story' }]), tenantID)
  const story = page?.layout[0]
  assert.equal(story?.blockType === 'gheeHomeStoryBlock' ? story.heading : undefined, 'CMS Story')
})

test('draft Home Page is not mapped for public rendering', () => {
  assert.equal(mapGheeRoastPage({ ...publishedPage([]), _status: 'draft' }, tenantID), null)
})

test('published Home Page with empty Layout renders no legacy sections', () => {
  assert.equal(getGheeRoastPageRenderMode({ content: contentFor([]), hasRegisteredPage: true, pathname: '/' }), 'cms')
})

test('hero-only Home Page renders only the CMS Hero', () => {
  assert.equal(getGheeRoastPageRenderMode({ content: contentFor([{ blockType: 'heroBlock' }]), hasRegisteredPage: true, pathname: '/' }), 'cms')
})

test('published Home Page with a body Layout block uses CMS rendering', () => {
  assert.equal(getGheeRoastPageRenderMode({ content: contentFor([{ blockType: 'heroBlock' }, { blockType: 'statsBlock' }]), hasRegisteredPage: true, pathname: '/' }), 'cms')
})

test('Layout array order is preserved exactly', () => {
  const order = ['statsBlock', 'gheeHomeStoryBlock', 'galleryBlock']
  const page = mapGheeRoastPage(publishedPage(order.map((blockType) => ({ blockType }))), tenantID)
  assert.deepEqual(page?.layout.map((block) => block.blockType), order)
})

test('renderer skips disabled blocks without removing their data', () => {
  assert.match(cmsSource, /block\.enabled === false \|\| settings\?\.enabled === false/)
})

test('Our Story block exposes complete editable CMS fields', () => {
  const names = GheeRoastHomeStoryBlock.fields.flatMap((field) => {
    if ('name' in field && field.name) return [field.name]
    return 'fields' in field && Array.isArray(field.fields)
      ? field.fields.flatMap((child) => 'name' in child && child.name ? [child.name] : [])
      : []
  })
  assert.deepEqual(names, ['eyebrow', 'heading', 'highlightedHeading', 'description', 'images', 'bulletPoints', 'experienceBadge', 'cta', 'settings'])
})

test('Our Story renders the CMS heading instead of static home data', () => {
  assert.match(cmsSource, /gheeHomeStoryBlock/)
  assert.match(cmsSource, /text\(block\.heading\)/)
  assert.doesNotMatch(cmsSource, /homeData\.introduction/)
})

test('Our Story resolves populated Media and field Alt first', () => {
  assert.deepEqual(resolveGheeRoastBlockMedia({ id: 8, tenantId: tenantID, url: '/media/story.jpg', alt: 'Media alt' }, tenantID, 'Field alt'), {
    alt: 'Field alt', id: 8, src: '/media/story.jpg',
  })
})

test('raw Media IDs are handled safely without a broken URL', () => {
  assert.equal(resolveGheeRoastBlockMedia(8, tenantID), undefined)
})

test('missing and foreign Media relationships are safely omitted', () => {
  assert.equal(resolveGheeRoastBlockMedia(null, tenantID), undefined)
  assert.equal(resolveGheeRoastBlockMedia({ id: 8, tenantId: 999, url: '/foreign.jpg' }, tenantID), undefined)
})

test('Our Story bullet points and experience badge have dedicated rendering', () => {
  assert.match(cmsSource, /block\.bulletPoints/)
  assert.match(cmsSource, /block\.experienceBadge/)
  assert.match(cmsSource, /styles\.legacyBadge/)
})

test('complete CTA pairs render and incomplete pairs remain hidden', () => {
  assert.match(cmsSource, /label && href \? \{ href, label \} : undefined/)
  assert.match(cmsSource, /storyCTA && <ActionLink/)
})

test('Quality section is a complete CMS block', () => {
  assert.equal(GheeRoastHomeQualityBlock.slug, 'gheeHomeQualityBlock')
  assert.match(cmsSource, /gheeHomeQualityBlock/)
  assert.match(cmsSource, /styles\.whyList/)
})

test('Promotional split is a complete ordered CMS block', () => {
  assert.equal(GheeRoastHomePromosBlock.slug, 'gheeHomePromosBlock')
  assert.match(cmsSource, /block\.promos/)
  assert.match(cmsSource, /styles\.splitPromos/)
})

test('Stats use dynamic block values and support the legacy visual strip', () => {
  assert.match(cmsSource, /Array\.isArray\(block\.stats\)/)
  assert.match(cmsSource, /styles\.statsSection/)
})

test('Testimonials are sourced dynamically with deterministic limit', () => {
  assert.match(cmsSource, /content\.collections\.testimonials/)
  assert.match(cmsSource, /items\.slice\(0, limit\)/)
})

test('Gallery is sourced dynamically and safely supports empty results', () => {
  assert.match(cmsSource, /content\.collections\.gallery/)
  assert.match(cmsSource, /No gallery images are published/)
})

test('Specials are sourced from tenant Menu Items and render block CTA settings', () => {
  assert.match(cmsSource, /content\.collections\.menu\.items/)
  assert.match(cmsSource, /const ctas = record\(block\.ctaGroup\)/)
})

test('Newsletter block owns all its business copy without Site Settings mixing', () => {
  const newsletterBranch = cmsSource.slice(cmsSource.indexOf("type === 'newsletterBlock'"), cmsSource.indexOf("type === 'formBlock'"))
  assert.doesNotMatch(newsletterBranch, /content\.site\.newsletter/)
  assert.match(rendererSource, /showNewsletter=\{normalizedPathname !== '\/' && !cmsHome\}/)
})

test('tenant filtering rejects a foreign Home Page and foreign collection rows', () => {
  assert.equal(mapGheeRoastPage({ ...publishedPage([]), tenantId: 999 }, tenantID), null)
  const mapped = mapGheeRoastCollections({ testimonials: [{ customerName: 'Foreign', id: 1, review: 'No', tenantId: 999 }] }, tenantID, { fallbacksEnabled: false })
  assert.equal(mapped.testimonials.length, 0)
})

test('CMS Home queries only collections required by actual blocks', () => {
  const none = getGheeRoastCollectionDependencies('home', [{ blockType: 'gheeHomeStoryBlock' }])
  assert.equal(none.menu, false)
  assert.equal(none.gallery, false)
  assert.equal(none.testimonials, false)
  const required = getGheeRoastCollectionDependencies('home', [{ blockType: 'menushowcaseBlock' }, { blockType: 'galleryBlock' }, { blockType: 'testimonialsBlock' }])
  assert.equal(required.menu, true)
  assert.equal(required.gallery, true)
  assert.equal(required.testimonials, true)
})

test('legacy hero-only Home gets one deterministic Site Settings feature placement', () => {
  const hero = { blockType: 'heroBlock', id: 'hero' }
  const resolved = resolveGheeRoastHomeLayout({
    hasBrandFeatures: true,
    isHomePage: true,
    layout: [hero],
  })
  assert.deepEqual(resolved.map((block) => block.blockType), ['heroBlock', 'featurestripBlock'])
  assert.equal(resolved[1] && 'source' in resolved[1] ? resolved[1].source : undefined, 'site-settings')
  assert.equal(resolved[1]?.id, 'site-settings-brand-features')
})

test('explicit Feature Strip placement remains authoritative and is never duplicated', () => {
  const layout = [
    { blockType: 'heroBlock' },
    { blockType: 'gheeHomeStoryBlock' },
    { blockType: 'featurestripBlock', source: 'site-settings' },
  ]
  assert.equal(resolveGheeRoastHomeLayout({
    hasBrandFeatures: true,
    isHomePage: true,
    layout,
  }), layout)
})

test('legacy Home content is retained only in the deprecated compatibility component', () => {
  assert.match(homeSource, /homeData\.introduction/)
  assert.match(homeSource, /homeData\.process/)
  assert.match(homeSource, /homeData\.stats/)
  assert.doesNotMatch(rendererSource, /from '.\/pages\/HomePage'/)
  assert.match(rendererSource, /await import\('\.\/utils\/getPageComponent'\)/)
})

test('CMS Home does not let static Home content override CMS blocks', () => {
  assert.doesNotMatch(homeSource, /hasCMSBody/)
  assert.doesNotMatch(cmsSource, /from '..\/data\/home'/)
})

test('block row keys never use Sort Order as their sole identity', () => {
  assert.match(cmsSource, /text\(block\.id\) \|\| `\$\{type\}-\$\{index\}`/)
  assert.doesNotMatch(cmsSource, /key=\{[^}]*sortOrder/)
})

test('other themes are not imported or modified by the Ghee Home renderer', () => {
  assert.doesNotMatch(cmsSource, /zuru-zuru|curious-hub/i)
  assert.doesNotMatch(rendererSource, /ZuruZuru|CuriousHub/)
})
