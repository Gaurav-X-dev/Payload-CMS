import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type PageLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruGalleryPageSeedResult = {
  gallery: { created: number; updated: number }
  media: { created: number; reused: number }
  pages: Record<string, { blockCount: number; id: number | string; status: 'created' | 'updated' }>
}

const findFirst = async (
  payload: Payload,
  collection: Parameters<Payload['find']>[0]['collection'],
  where: NonNullable<Parameters<Payload['find']>[0]['where']>,
) => {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where,
  })
  return result.docs[0]
}

/**
 * Milestone Z7 — Gallery (final route, converted after the approved Gallery.category migration
 * added 'chefs'). Reuses the existing tenant and the same 5 static images every prior Zuru Zuru
 * seed already uploaded — no new media. Seeds 20 Gallery records that exactly mirror the original
 * static `GalleryLightbox`'s own `assets[index % 5]` / `categories[index % 4]` cycling pattern, so
 * the converted page's visual output (image per slot, category per slot) matches exactly, while
 * every item is now a real, independently editable CMS record instead of a hardcoded array.
 */
export async function seedZuruZuruGalleryPageContent(payload: Payload): Promise<ZuruZuruGalleryPageSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru Gallery page seed as.')
  }
  const user = superAdmin as User

  const tenant = await findFirst(payload, 'tenants', { slug: { equals: 'zuru-zuru' } })
  if (!tenant) {
    throw new Error(
      'Zuru Zuru tenant not found. Run the Milestone Z2 seed (db:seed:zuru-zuru-shell) first.',
    )
  }
  const tenantId = tenant.id

  // ---------------------------------------------------------------------------
  // Media — reuses the same static assets prior Zuru Zuru seeds already uploaded.
  // ---------------------------------------------------------------------------
  let mediaCreated = 0
  let mediaReused = 0
  const upload = async (spec: MediaUploadSpec) => {
    const before = await payload.count({
      collection: 'media',
      overrideAccess: true,
      where: { and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }] },
    })
    const doc = await findOrUploadMedia(payload, { projectRoot, spec, tenantId, user })
    if (before.totalDocs > 0) mediaReused += 1
    else mediaCreated += 1
    return doc
  }

  const [heroSushiImage, interiorImage, heroRamenImage, gyozaImage, chefImage] = await Promise.all([
    upload({ alt: 'Sushi platter', sourcePath: 'themes/zuru-zuru/images/hero_sushi.png', title: 'hero_sushi.png' }),
    upload({ alt: 'Zuru Zuru interior', sourcePath: 'themes/zuru-zuru/images/interior.png', title: 'interior.png' }),
    upload({ alt: 'Ramen bowl', sourcePath: 'themes/zuru-zuru/images/hero_ramen.png', title: 'hero_ramen.png' }),
    upload({ alt: 'Gyoza and tempura', sourcePath: 'themes/zuru-zuru/images/gyoza_tempura.png', title: 'gyoza_tempura.png' }),
    upload({ alt: 'Zuru Zuru chef', sourcePath: 'themes/zuru-zuru/images/chef.png', title: 'chef.png' }),
  ])

  // Matches the original's `assets[index % 5]` order exactly.
  const assetCycle = [heroSushiImage, interiorImage, heroRamenImage, gyozaImage, chefImage]
  // Matches the original's `['food','interior','chefs','events'][index % 4]` order, with
  // 'interior' mapped to the Gallery collection's existing 'ambiance' value (see CMSGalleryLightbox.tsx).
  const categoryCycle = ['food', 'ambiance', 'chefs', 'events'] as const

  let galleryCreated = 0
  let galleryUpdated = 0
  const galleryIds: number[] = []
  for (let index = 0; index < 20; index += 1) {
    const title = `Gallery Photo ${index + 1}`
    const data = {
      category: categoryCycle[index % categoryCycle.length],
      isFeatured: false,
      media: assetCycle[index % assetCycle.length].id,
      sortOrder: index,
      tenantId,
      title,
    }
    const existing = await findFirst(payload, 'gallery', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: title } }],
    })
    if (existing) {
      const updated = await payload.update({ id: existing.id, collection: 'gallery', data, overrideAccess: true, user })
      galleryIds.push(updated.id)
      galleryUpdated += 1
    } else {
      const created = await payload.create({ collection: 'gallery', data, overrideAccess: true, user })
      galleryIds.push(created.id)
      galleryCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Page upsert helper
  // ---------------------------------------------------------------------------
  const pages: ZuruZuruGalleryPageSeedResult['pages'] = {}
  const upsertPage = async (slug: string, data: Record<string, unknown>) => {
    const existing = await findFirst(payload, 'pages', {
      and: [{ tenantId: { equals: tenantId } }, { slug: { equals: slug } }],
    })
    const layout = data.layout as PageLayout
    const doc = existing
      ? await payload.update({ id: existing.id, collection: 'pages', data: data as never, overrideAccess: true, user })
      : await payload.create({ collection: 'pages', data: data as never, overrideAccess: true, user })
    pages[slug] = { blockCount: layout.length, id: doc.id, status: existing ? 'updated' : 'created' }
    return doc
  }

  // ---------------------------------------------------------------------------
  // Gallery page. `category: 'all'` on the block so every item is fetched in one request —
  // filtering happens client-side in CMSGalleryLightbox.tsx, matching the original exactly.
  // ---------------------------------------------------------------------------
  await upsertPage('gallery', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'A glimpse into our food, spaces, chefs, and unforgettable events.', desktopBackgroundImage: interiorImage.id, enabled: true, heading: 'Our Gallery' },
      {
        blockType: 'galleryBlock' as const,
        category: 'all' as const,
        limit: 20,
        sectionHeader: { title: 'Our Gallery' },
        source: 'collection' as const,
      },
    ] as PageLayout,
    metaDescription: 'A glimpse into our food, spaces, chefs, and unforgettable events at Zuru Zuru Izakaya.',
    metaTitle: 'Our Gallery — Zuru Zuru',
    pageType: 'gallery' as const,
    publishedAt: new Date().toISOString(),
    slug: 'gallery',
    tenantId,
    title: 'Zuru Zuru Gallery',
  })

  payload.logger.info('Zuru Zuru Gallery page seed completed.')

  return {
    gallery: { created: galleryCreated, updated: galleryUpdated },
    media: { created: mediaCreated, reused: mediaReused },
    pages,
  }
}
