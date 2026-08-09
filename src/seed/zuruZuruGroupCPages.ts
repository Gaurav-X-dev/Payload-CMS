import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type PageLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruGroupCPagesSeedResult = {
  media: { created: number; reused: number }
  pages: Record<string, { blockCount: number; id: number | string; status: 'created' | 'updated' }>
  subjectOptions: { added: string[] }
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
 * Milestone Z7 — Group C: Reservation and Private Dining. Reuses the existing tenant, the same 5
 * static images already uploaded by prior Zuru Zuru seeds, and the existing `Reservations`
 * collection unchanged (no schema gap — every field the original Reservation form needs already
 * exists there). Private Dining's "Luxury Packages" reuses `contentgridBlock` exactly like
 * Franchise's investment tiers (price folded into title) instead of the still-stub `Packages`
 * collection, so no schema change is needed for this page either. Also extends the Contact page's
 * formBlock with a "Private Dining" subject option (same technique as every other Group A/B
 * specialized form).
 */
export async function seedZuruZuruGroupCPagesContent(payload: Payload): Promise<ZuruZuruGroupCPagesSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru Group C pages seed as.')
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

  const [chefImage, gyozaImage, heroRamenImage, heroSushiImage, interiorImage] = await Promise.all([
    upload({ alt: 'Zuru Zuru chef', sourcePath: 'themes/zuru-zuru/images/chef.png', title: 'chef.png' }),
    upload({ alt: 'Gyoza and tempura', sourcePath: 'themes/zuru-zuru/images/gyoza_tempura.png', title: 'gyoza_tempura.png' }),
    upload({ alt: 'Ramen bowl', sourcePath: 'themes/zuru-zuru/images/hero_ramen.png', title: 'hero_ramen.png' }),
    upload({ alt: 'Sushi platter', sourcePath: 'themes/zuru-zuru/images/hero_sushi.png', title: 'hero_sushi.png' }),
    upload({ alt: 'Zuru Zuru interior', sourcePath: 'themes/zuru-zuru/images/interior.png', title: 'interior.png' }),
  ])

  // ---------------------------------------------------------------------------
  // Extend the Contact page's formBlock.subjectOptions with "Private Dining".
  // ---------------------------------------------------------------------------
  const subjectsAdded: string[] = []
  const existingContactPage = await findFirst(payload, 'pages', {
    and: [{ tenantId: { equals: tenantId } }, { slug: { equals: 'contact' } }],
  })
  if (!existingContactPage) {
    throw new Error('Zuru Zuru Contact page not found. Run the Milestone Z6 seed (db:seed:zuru-zuru-contact-page) first.')
  }
  const fullContactPage = await payload.findByID({ id: existingContactPage.id, collection: 'pages', depth: 0, overrideAccess: true })
  const contactLayout = (fullContactPage.layout ?? []) as PageLayout
  const formBlockIndex = contactLayout.findIndex((block) => block.blockType === 'formBlock')
  if (formBlockIndex !== -1) {
    const formBlock = contactLayout[formBlockIndex] as Extract<PageLayout[number], { blockType: 'formBlock' }>
    const existingSubjects = new Set((formBlock.subjectOptions ?? []).map((option) => option.value))
    const additions = [{ label: 'Private Dining', value: 'Private Dining' }].filter((option) => !existingSubjects.has(option.value))
    if (additions.length > 0) {
      formBlock.subjectOptions = [...(formBlock.subjectOptions ?? []), ...additions]
      subjectsAdded.push(...additions.map((option) => option.value))
      await payload.update({
        id: existingContactPage.id,
        collection: 'pages',
        data: { layout: contactLayout },
        overrideAccess: true,
        user,
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Page upsert helper
  // ---------------------------------------------------------------------------
  const pages: ZuruZuruGroupCPagesSeedResult['pages'] = {}
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
  // Reservation page. No heroBlock: the original has no page hero at all on this route, just the
  // reservation panel itself — "Book a Table" is hardcoded in CMSReservationPage.tsx, matching the
  // same precedent every other specialized-form page uses for its own form-section heading.
  // ---------------------------------------------------------------------------
  await upsertPage('reservation', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      {
        blockType: 'contentgridBlock' as const,
        items: [
          { description: 'Prefer to speak with us? Call us at +91 11 4052 7373 between 10:00 AM and 10:00 PM daily.', title: 'Phone Reservations' },
          { description: 'For groups of 8 or more, or private dining inquiries, please contact our events team directly to discuss customized set menus.', title: 'Large Parties & Events' },
          { description: 'We kindly ask for at least 24 hours notice for any cancellations or adjustments to your reservation.', title: 'Cancellation Policy' },
          { description: 'Zuru Zuru, Delhi, India 110049', title: 'Location' },
        ],
        sectionHeader: { title: 'Details' },
      },
    ] as PageLayout,
    metaDescription: 'Book a table at Zuru Zuru Izakaya — join us for an unforgettable dining experience.',
    metaTitle: 'Reservations — Zuru Zuru',
    pageType: 'reservation' as const,
    publishedAt: new Date().toISOString(),
    slug: 'reservation',
    tenantId,
    title: 'Zuru Zuru Reservations',
  })

  // ---------------------------------------------------------------------------
  // Private Dining page
  // ---------------------------------------------------------------------------
  await upsertPage('private-dining', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Exclusive spaces for your most memorable occasions', desktopBackgroundImage: heroRamenImage.id, enabled: true, heading: 'Private Dining' },
      {
        blockType: 'storyBlock' as const,
        body: "Elevate your special moments with our bespoke private dining experiences at Zuru Zuru Izakaya. Designed for discerning guests who appreciate exclusivity and personalized service, our private rooms blend traditional Japanese aesthetics with modern luxury.\n\nWhether you're hosting an intimate gathering, a corporate dinner, or celebrating a milestone, our dedicated team will ensure every detail—from custom menus to perfectly paired sake—is executed flawlessly.",
        enableCta: false,
        imagePosition: 'right' as const,
        layout: 'panel' as const,
        media: interiorImage.id,
        mediaAlt: 'Private dining at Zuru Zuru',
        title: 'An Intimate Culinary Journey',
      },
      {
        blockType: 'cardgridBlock' as const,
        cards: [
          { description: 'Our most exclusive space featuring traditional tatami seating options with modern comfort. Accommodates up to 12 guests.', image: { item: interiorImage.id }, title: 'VIP Room' },
          { description: 'A sophisticated environment perfect for closing deals or rewarding your team. Fully equipped with discreet A/V options. Accommodates up to 24 guests.', image: { item: chefImage.id }, title: 'Corporate Dinners' },
          { description: "Celebrate life's special moments with a customized dining experience, complete with a personalized cake and special Izakaya treats.", image: { item: gyozaImage.id }, title: 'Milestone Birthdays' },
          { description: 'A beautiful, romantic setting for micro-weddings and rehearsal dinners, tailored specifically to your love story.', image: { item: heroSushiImage.id }, title: 'Intimate Weddings' },
          { description: 'An interactive, front-row seat to culinary mastery. Watch our Executive Chef prepare an exclusive 12-course tasting menu right before your eyes.', image: { item: chefImage.id }, title: "Chef's Table Omakase" },
          { description: "A guided journey through Japan's finest rice wines, led by our in-house sommelier, paired perfectly with Izakaya bites.", image: { item: interiorImage.id }, title: 'Sake Tasting Sessions' },
        ],
        sectionHeader: { eyebrow: 'Exquisite Settings', title: 'Dining Experiences' },
      },
      {
        blockType: 'contentgridBlock' as const,
        items: [
          { description: '5-Course Izakaya Menu · Welcome Sake Cocktail · Private Room Access (3 Hours) · Standard Table Decor · Dedicated Server', title: 'Silver Tier (₹4,500 / guest)' },
          { description: '8-Course Signature Menu · Premium Sake Pairing (3 Pours) · Private Room Access (4 Hours) · Floral Centerpieces · Dedicated Sommelier', title: 'Gold Tier (₹7,500 / guest · Most Popular)' },
          { description: "12-Course Omakase Menu · Exclusive Rare Sake Pairing · Private Room Access (Entire Evening) · Custom Menus & Decor · Take-home Chef's Gift Box", title: 'Platinum Tier (₹12,000 / guest)' },
        ],
        sectionHeader: { description: 'Select from our thoughtfully crafted packages for your private event.', eyebrow: 'Curated Offerings', title: 'Luxury Packages' },
        settings: { backgroundColor: 'dark' as const },
      },
    ] as PageLayout,
    metaDescription: 'Exclusive private dining spaces for your most memorable occasions at Zuru Zuru Izakaya.',
    metaTitle: 'Private Dining — Zuru Zuru',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'private-dining',
    tenantId,
    title: 'Zuru Zuru Private Dining',
  })

  payload.logger.info('Zuru Zuru Group C pages seed completed.')

  return {
    media: { created: mediaCreated, reused: mediaReused },
    pages,
    subjectOptions: { added: subjectsAdded },
  }
}
