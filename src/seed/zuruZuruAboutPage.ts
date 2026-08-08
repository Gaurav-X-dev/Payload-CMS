import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type PageLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruAboutPageSeedResult = {
  aboutPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
  media: { created: number; reused: number }
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
 * Milestone Z5 — Zuru Zuru About page ("/about") only. Reuses the existing tenant and the same
 * static images already uploaded by prior Zuru Zuru seeds (matched by title, never re-uploaded).
 */
export async function seedZuruZuruAboutPageContent(payload: Payload): Promise<ZuruZuruAboutPageSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru About page seed as.')
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

  const [gyozaImage, interiorImage] = await Promise.all([
    upload({ alt: 'Gyoza and tempura', sourcePath: 'themes/zuru-zuru/images/gyoza_tempura.png', title: 'gyoza_tempura.png' }),
    upload({ alt: 'The roots of Zuru Zuru', sourcePath: 'themes/zuru-zuru/images/interior.png', title: 'interior.png' }),
  ])

  // ---------------------------------------------------------------------------
  // About page layout (exact original section order). Philosophy pillars' meta subtitle (e.g.
  // "(Hospitality from the Heart)") has no dedicated field on contentgridBlock's items; it's
  // folded into the item title, matching the Milestone Z3/Z4 precedent — see the Z5 report.
  // ---------------------------------------------------------------------------
  const layout: PageLayout = [
    {
      blockType: 'heroBlock' as const,
      desktopBackgroundImage: gyozaImage.id,
      description: 'A journey rooted in Tokyo, shaped by tradition, and shared in New Delhi.',
      enabled: true,
      eyebrow: 'Home / Our Story',
      heading: 'Our Story',
    },
    {
      blockType: 'storyBlock' as const,
      body: "Founded in 2015 by Chef Kenji Tanaka, Zuru Zuru Izakaya was born out of a profound passion for the spirited dining culture of Tokyo's alleyways. After spending 15 years mastering the intricate arts of Japanese cuisine in prestigious traditional kitchens, Chef Tanaka envisioned a space where uncompromising quality met a relaxed, communal atmosphere.\n\nAt Zuru Zuru, every bowl of ramen and every perfectly grilled skewer tells the story of a chef who believes that great food is an experience meant to be shared, loudly and joyfully.",
      eyebrow: 'Our Roots',
      imagePosition: 'left' as const,
      layout: 'simple' as const,
      media: interiorImage.id,
      mediaAlt: 'The roots of Zuru Zuru',
      title: 'A Journey Begun in Tokyo',
    },
    {
      blockType: 'contentgridBlock' as const,
      items: [
        { description: "To bring the authentic spirit of Tokyo's alleyway izakayas to our patrons by delivering unpretentious, flavor-packed dishes crafted with the finest ingredients and an unwavering dedication to tradition.", icon: 'heart', title: 'Our Mission' },
        { description: "To be recognized as Asia's most celebrated izakaya brand, redefining casual Japanese dining through continuous innovation, authentic hospitality, and a relentless pursuit of culinary excellence.", icon: 'star', title: 'Our Vision' },
      ],
      presentation: 'mission-vision' as const,
      sectionHeader: { title: 'Mission & Vision' },
      settings: { backgroundColor: 'dark' as const },
    },
    {
      blockType: 'contentgridBlock' as const,
      items: [
        { description: 'More than just service, Omotenashi is the anticipation of your needs before they arise. We welcome you not as a customer, but as an honored guest in our home, ensuring your comfort is our utmost priority.', title: 'Omotenashi (Hospitality from the Heart)' },
        { description: 'Our uncompromising dedication to our craft. From simmering our tonkotsu broth for 24 hours to sourcing the freshest seasonal ingredients, Kodawari represents our pursuit of perfection in every detail.', title: 'Kodawari (Relentless Devotion)' },
        { description: 'The spirit of the craftsman. Our chefs spend decades refining a single technique, taking immense pride in their work to elevate simple ingredients into extraordinary, memorable culinary experiences.', title: 'Shokunin (Artisan Spirit)' },
      ],
      presentation: 'pillars' as const,
      sectionHeader: {
        description: 'The guiding principles that shape every interaction and every dish at Zuru Zuru Izakaya.',
        eyebrow: 'The Core Pillars',
        title: 'Japanese Philosophy',
      },
    },
    {
      blockType: 'stepsBlock' as const,
      layoutVariant: 'timeline' as const,
      sectionHeader: { eyebrow: 'Our Evolution', title: 'The Zuru Zuru Story' },
      steps: [
        { description: 'Chef Kenji Tanaka opens the first intimate 20-seat Zuru Zuru Izakaya, introducing authentic Tokyo-style ramen and yakitori.', label: '2015', title: 'The Founding' },
        { description: 'Due to overwhelming demand, we expand our footprint, opening our flagship location with a dedicated robatayaki grill and sake lounge.', label: '2018', title: 'The Second Branch' },
        { description: 'Recognized globally by critics, Zuru Zuru receives the prestigious Asian Dining Award for Best Casual Japanese Restaurant.', label: '2021', title: 'Culinary Excellence Award' },
        { description: 'Launching our exclusive Omakase dining experience and importing rare, artisanal sakes from boutique breweries across Japan.', label: '2024', title: 'A New Era' },
      ],
      settings: { backgroundColor: 'dark' as const },
    },
    {
      blockType: 'statsBlock' as const,
      sectionHeader: { eyebrow: 'By The Numbers', title: 'Our Achievements' },
      stats: [
        { label: 'Bowls of Ramen Served', value: '1.2M+' },
        { label: 'Locations Globally', value: '3' },
        { label: 'Culinary Awards', value: '15+' },
      ],
    },
  ]

  const existingAboutPage = await findFirst(payload, 'pages', {
    and: [{ tenantId: { equals: tenantId } }, { slug: { equals: 'about' } }],
  })
  const aboutPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'A journey rooted in Tokyo, shaped by tradition, and shared in New Delhi — the story of Zuru Zuru.',
    metaTitle: 'Our Story — Zuru Zuru',
    pageType: 'about' as const,
    publishedAt: new Date().toISOString(),
    slug: 'about',
    tenantId,
    title: 'Zuru Zuru About',
  }
  const aboutPage = existingAboutPage
    ? await payload.update({ id: existingAboutPage.id, collection: 'pages', data: aboutPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: aboutPageData, overrideAccess: true, user })

  payload.logger.info('Zuru Zuru About page seed completed.')

  return {
    aboutPage: {
      blockCount: layout.length,
      id: aboutPage.id,
      status: existingAboutPage ? 'updated' : 'created',
    },
    media: { created: mediaCreated, reused: mediaReused },
  }
}
