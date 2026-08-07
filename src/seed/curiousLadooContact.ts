import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type ContactLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooContactSeedResult = {
  contactPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
  faqs: { created: number; skipped: number; updated: number }
  locations: { created: number; skipped: number; updated: number }
  media: { created: number; reused: number }
  siteSettingsHours: 'skipped' | 'updated'
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

export async function seedCuriousLadooContactContent(
  payload: Payload,
): Promise<CuriousLadooContactSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo Contact seed as.')
  }
  const user = superAdmin as User

  const curiousLadoo = await findFirst(payload, 'tenants', { slug: { equals: 'curious-ladoo' } })
  if (!curiousLadoo) {
    throw new Error(
      'Curious Ladoo tenant not found. Run the Milestone 3 seed (db:seed:curious-ladoo) first.',
    )
  }
  const tenantId = curiousLadoo.id

  // ---------------------------------------------------------------------------
  // Media — reused from How We Work's seed (Milestone 9), never re-uploaded.
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
  const heroImage = await upload({
    alt: 'Premium restaurant interior by Curious Ladoo',
    sourcePath: 'themes/curious-hub/images/t3_interior.png',
    title: 't3_interior.png',
  })

  // ---------------------------------------------------------------------------
  // Locations — 3 offices, matching the original page's Global Locations list.
  // New Delhi is the sole primary location and also backs the "General Inquiries"
  // card indirectly (that card actually reads the tenant's own contact.contactEmail/
  // contactPhone, already seeded in Milestone 3 — no per-location email/phone needed
  // here since the original design never showed one on a per-location basis).
  // ---------------------------------------------------------------------------
  const locationSpecs = [
    {
      title: 'New Delhi (HQ)',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      address: 'First Floor, E-Block, Connaught Place, New Delhi, Delhi 110001',
      isPrimary: true,
      sortOrder: 0,
    },
    {
      title: 'Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address: 'Level 4, The Capital, BKC, Mumbai, Maharashtra 400051',
      isPrimary: false,
      sortOrder: 1,
    },
    {
      title: 'Tokyo',
      city: 'Tokyo',
      state: '',
      country: 'Japan',
      address: 'Roppongi Hills Mori Tower, Minato City, Tokyo 106-6108',
      isPrimary: false,
      sortOrder: 2,
    },
  ] as const

  let locationsCreated = 0
  let locationsUpdated = 0
  const locationsSkipped = 0
  for (const spec of locationSpecs) {
    const existing = await findFirst(payload, 'locations', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = {
      ...spec,
      isActive: true,
      showOnContact: true,
      tenantId,
    }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'locations', data, overrideAccess: true, user })
      locationsUpdated += 1
    } else {
      await payload.create({ collection: 'locations', data, overrideAccess: true, user })
      locationsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Site Settings — add the global Operating Hours rows. Partial update: only the
  // `hours` field is touched, every other Site Settings field (socials, newsletter,
  // analytics, etc.) is left completely untouched by Payload's partial-update
  // semantics.
  // ---------------------------------------------------------------------------
  const existingSettings = await findFirst(payload, 'site-settings', { tenantId: { equals: tenantId } })
  let siteSettingsHours: CuriousLadooContactSeedResult['siteSettingsHours'] = 'skipped'
  if (existingSettings) {
    await payload.update({
      id: existingSettings.id,
      collection: 'site-settings',
      data: {
        hours: [
          { day: 'Monday' as const, openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
          { day: 'Tuesday' as const, openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
          { day: 'Wednesday' as const, openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
          { day: 'Thursday' as const, openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
          { day: 'Friday' as const, openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
          { day: 'Saturday' as const, openTime: '10:00 AM', closeTime: '04:00 PM', isClosed: false },
          { day: 'Sunday' as const, openTime: '', closeTime: '', isClosed: true },
        ],
      },
      overrideAccess: true,
      user,
    })
    siteSettingsHours = 'updated'
  }

  // ---------------------------------------------------------------------------
  // FAQs specific to the Contact page. None overlap the FAQs used by Ghee Roast,
  // Services, the dedicated FAQs page, or Careers.
  // ---------------------------------------------------------------------------
  const faqSpecs = [
    {
      title: 'How do I partner with Curious Ladoo as a franchisee?',
      answer: 'We look for franchise partners with operational experience and strong alignment with our brand values. We provide comprehensive operational SOPs, supply chain pipelines, staff training programs, and regional marketing support. Fill out the contact form with the area of interest set to "B2B Solutions" to start.',
      sortOrder: 0,
    },
    {
      title: 'What consulting services do you offer?',
      answer: 'Our consulting division covers menu engineering, commercial kitchen layouts, F&B brand concept creation, staff recruitment/training, operations auditing, and technology integration (POS/analytics). We work with individual restaurants as well as luxury hotel groups.',
      sortOrder: 1,
    },
    {
      title: 'Are you looking for new retail spaces?',
      answer: 'Yes, we are actively looking for commercial spaces, high streets, and premium mall spots of 1,200 to 4,000 sq ft across tier-1 cities in India for our brands Zuru Zuru and Ghee Roast. Real estate partners are welcome to write to us directly at hello@curiousladoo.com.',
      sortOrder: 2,
    },
  ] as const

  let faqsCreated = 0
  let faqsUpdated = 0
  const faqsSkipped = 0
  const faqIds: number[] = []
  for (const spec of faqSpecs) {
    const existing = await findFirst(payload, 'faqs', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = { ...spec, isActive: true, isFeatured: false, tenantId }
    if (existing) {
      const updated = await payload.update({ id: existing.id, collection: 'faqs', data, overrideAccess: true, user })
      faqIds.push(updated.id)
      faqsUpdated += 1
    } else {
      const created = await payload.create({ collection: 'faqs', data, overrideAccess: true, user })
      faqIds.push(created.id)
      faqsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Contact Page layout (exact designer section order: hero, form+info split,
  // decorative office map, FAQ). pageType MUST be 'contact' — the shared
  // validateContactSubmissionSubject hook looks up the tenant's published
  // pageType IN ['contact', 'catering'] page to resolve allowed subjectOptions;
  // any other pageType would silently fall back to the wrong (Ghee-Roast-default)
  // subject list and reject every real submission from this page's own form.
  // ---------------------------------------------------------------------------
  const layout: ContactLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'Connect',
      heading: "Let's Build Hospitality That Endures",
      description: 'Whether you have a retail space, a franchise inquiry, want to invest, or need menu engineering, our doors are open.',
      foregroundImage: heroImage.id,
      imageAlt: 'Premium restaurant interior by Curious Ladoo',
    },
    {
      blockType: 'formBlock' as const,
      formType: 'contact' as const,
      showContactInfoCards: true,
      subjectOptions: [
        { label: 'New Brand Creation', value: 'brand' },
        { label: 'Restaurant Consulting', value: 'consulting' },
        { label: 'B2B Solutions', value: 'b2b' },
        { label: 'General Inquiry', value: 'other' },
      ],
      submitLabel: 'Send Message',
      successMessage: 'Thank you for reaching out! We will get back to you shortly.',
      errorMessage: 'We could not submit the form. Please check your details and try again.',
      sectionHeader: { title: 'Start a Conversation' },
    },
    {
      blockType: 'officeMapBlock' as const,
      sectionHeader: {
        eyebrow: 'Interactive Directory',
        title: 'Where We',
        subtitle: 'Operate.',
        description: 'Click on a marker to view details about our global administrative and consulting workspaces.',
      },
      markers: [
        { label: 'HQ — New Delhi Office', left: '65%', top: '52%' },
        { label: 'Mumbai Office', left: '62%', top: '58%' },
        { label: 'Tokyo Office', left: '78%', top: '38%' },
        { label: 'Dubai Office', left: '54%', top: '56%' },
      ],
    },
    {
      blockType: 'faqBlock' as const,
      presentation: 'tabs' as const,
      items: faqIds,
      sectionHeader: {
        eyebrow: 'FAQs',
        title: 'Common',
        subtitle: 'Queries.',
      },
    },
  ]

  const existingContactPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'contact' } },
      { isHomePage: { equals: false } },
    ],
  })
  const contactPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Get in touch with Curious Ladoo. Partner with us for restaurant brands, hospitality consulting, franchise development, and systems scaling.',
    metaTitle: 'Contact Us — Curious Ladoo',
    pageType: 'contact' as const,
    publishedAt: new Date().toISOString(),
    slug: 'contact',
    tenantId,
    title: 'Curious Ladoo Contact',
  }
  const contactPage = existingContactPage
    ? await payload.update({ id: existingContactPage.id, collection: 'pages', data: contactPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: contactPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo Contact seed completed.')

  return {
    contactPage: {
      blockCount: layout.length,
      id: contactPage.id,
      status: existingContactPage ? 'updated' : 'created',
    },
    faqs: { created: faqsCreated, skipped: faqsSkipped, updated: faqsUpdated },
    locations: { created: locationsCreated, skipped: locationsSkipped, updated: locationsUpdated },
    media: { created: mediaCreated, reused: mediaReused },
    siteSettingsHours,
  }
}
