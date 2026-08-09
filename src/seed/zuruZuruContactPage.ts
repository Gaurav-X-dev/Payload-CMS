import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type PageLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruContactPageSeedResult = {
  contactPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
  faqs: { created: number; updated: number }
  location: { id: number | string; status: 'created' | 'updated' }
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
 * Milestone Z6 — Zuru Zuru Contact page ("/contact") only. Reuses the existing tenant, the
 * existing primary Location (23 Shahpur Jat — created in Milestone Z3, only updated here to add
 * its Google Maps embed URL, never duplicated), and the same static chef.png image already
 * uploaded by prior Zuru Zuru seeds.
 */
export async function seedZuruZuruContactPageContent(payload: Payload): Promise<ZuruZuruContactPageSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru Contact page seed as.')
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
  // Media — reuses the same static asset prior Zuru Zuru seeds already uploaded.
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

  const chefImage = await upload({ alt: 'Zuru Zuru chef', sourcePath: 'themes/zuru-zuru/images/chef.png', title: 'chef.png' })

  // ---------------------------------------------------------------------------
  // Location — updates the existing primary Location in place (never creates a second one) to
  // add the Google Maps embed URL the original static Contact page's iframe used.
  // ---------------------------------------------------------------------------
  const existingLocation = await findFirst(payload, 'locations', {
    and: [{ tenantId: { equals: tenantId } }, { title: { equals: '23 Shahpur Jat, New Delhi' } }],
  })
  if (!existingLocation) {
    throw new Error(
      'Zuru Zuru primary Location not found. Run the Milestone Z3 seed (db:seed:zuru-zuru-home) first.',
    )
  }
  const location = await payload.update({
    id: existingLocation.id,
    collection: 'locations',
    data: {
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.664878206969!2d77.21404107528574!3d28.549791487834575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce21213401737%3A0xe54e616c68bf5bf6!2sNew%20Delhi%2C%20Delhi%20110049!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      showOnContact: true,
    },
    overrideAccess: true,
    user,
  })

  // ---------------------------------------------------------------------------
  // FAQs (matches the original Contact page's 3 accordion items exactly)
  // ---------------------------------------------------------------------------
  const faqSpecs = [
    { answer: 'Yes, we have a dedicated vegetarian and vegan menu, including our signature Mushroom Shoyu Ramen and various plant-based sushi rolls.', sortOrder: 0, title: 'Do you offer vegetarian options?' },
    { answer: 'We embrace a smart casual dress code. We ask that guests refrain from wearing athletic wear or beachwear.', sortOrder: 1, title: 'Is there a dress code?' },
    { answer: 'Yes, we offer complimentary valet parking for all our dining guests.', sortOrder: 2, title: 'Do you have parking?' },
  ]

  let faqsCreated = 0
  let faqsUpdated = 0
  const faqIds: number[] = []
  for (const spec of faqSpecs) {
    const existing = await findFirst(payload, 'faqs', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = { ...spec, isActive: true, tenantId }
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
  // Contact page layout (exact original section order). The dark "Location / Opening Hours /
  // Contact" info grid is sourced entirely from the global shell at render time (no block needed
  // — see CMSContactPage.tsx). Subject options match the original form's exact 4 values; label
  // and value are identical for each, since the reused `FormField` component (Shared.tsx) submits
  // the option's visible label text as the field value.
  // ---------------------------------------------------------------------------
  const layout: PageLayout = [
    {
      blockType: 'heroBlock' as const,
      description: 'We would love to hear from you',
      desktopBackgroundImage: chefImage.id,
      enabled: true,
      heading: 'Get in Touch',
    },
    {
      blockType: 'formBlock' as const,
      enabled: true,
      errorMessage: 'We could not submit the form. Please check your details or contact the restaurant directly.',
      formType: 'contact' as const,
      sectionHeader: {
        description: "Have a question or feedback? We'd love to hear from you.",
        title: 'Send a Message',
      },
      submitLabel: 'Send Message',
      subjectOptions: [
        { label: 'General Inquiry', value: 'General Inquiry' },
        { label: 'Feedback', value: 'Feedback' },
        { label: 'Careers', value: 'Careers' },
        { label: 'Press & Media', value: 'Press & Media' },
      ],
      successMessage: 'Thank you. We will be in touch shortly.',
    },
    {
      blockType: 'locationsBlock' as const,
      locations: [location.id],
      sectionHeader: { title: 'Map' },
      showMap: true,
    },
    {
      blockType: 'faqBlock' as const,
      items: faqIds,
      sectionHeader: {
        description: 'Quick answers to common inquiries',
        title: 'Frequently Asked Questions',
      },
    },
  ]

  const existingContactPage = await findFirst(payload, 'pages', {
    and: [{ tenantId: { equals: tenantId } }, { slug: { equals: 'contact' } }],
  })
  const contactPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Get in touch with Zuru Zuru — reach out for questions, feedback, careers, or press enquiries.',
    metaTitle: 'Get in Touch — Zuru Zuru',
    pageType: 'contact' as const,
    publishedAt: new Date().toISOString(),
    slug: 'contact',
    tenantId,
    title: 'Zuru Zuru Contact',
  }
  const contactPage = existingContactPage
    ? await payload.update({ id: existingContactPage.id, collection: 'pages', data: contactPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: contactPageData, overrideAccess: true, user })

  payload.logger.info('Zuru Zuru Contact page seed completed.')

  return {
    contactPage: {
      blockCount: layout.length,
      id: contactPage.id,
      status: existingContactPage ? 'updated' : 'created',
    },
    faqs: { created: faqsCreated, updated: faqsUpdated },
    location: { id: location.id, status: 'updated' },
    media: { created: mediaCreated, reused: mediaReused },
  }
}
