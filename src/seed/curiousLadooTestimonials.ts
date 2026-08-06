import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'

type TestimonialsLayout = NonNullable<Page['layout']>

export type CuriousLadooTestimonialsSeedResult = {
  testimonialsPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
  testimonials: { created: number; skipped: number; updated: number }
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

export async function seedCuriousLadooTestimonialsContent(
  payload: Payload,
): Promise<CuriousLadooTestimonialsSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo Testimonials seed as.')
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
  // Testimonials specific to this page. `isFeatured` stays false so these never
  // appear in Home's `featuredOnly: true` preview (unaffected — still exactly the
  // 3 testimonials seeded in Milestone 4). No `photo` is set: the original static
  // page's avatar markup (`{t.avatar}`) rendered the raw file path as literal text
  // instead of an actual image, and the referenced avatar-N.jpg files don't exist
  // in the repo at all — a pre-existing bug, not a design choice. The existing
  // TestimonialsSection already has a correct photo-or-initials fallback (same one
  // Home's testimonials already use), so leaving photo unset renders initials.
  // ---------------------------------------------------------------------------
  const testimonialSpecs = [
    {
      customerName: 'John Doe',
      customerRole: 'Food Group',
      isFeatured: false,
      rating: 5,
      review: 'Curious Ladoo transformed our business. Their strategic insights were invaluable.',
      sortOrder: 0,
    },
    {
      customerName: 'Jane Smith',
      customerRole: 'Cafe Co',
      isFeatured: false,
      rating: 5,
      review: 'Their creative approach is unmatched. They brought our vision to life perfectly.',
      sortOrder: 1,
    },
    {
      customerName: 'Mike Johnson',
      customerRole: 'Capital Partners',
      isFeatured: false,
      rating: 5,
      review: 'A reliable partner for F&B investments. Highly recommend their operational expertise.',
      sortOrder: 2,
    },
    {
      customerName: 'Sarah Williams',
      customerRole: 'Hospitality Inc',
      isFeatured: false,
      rating: 5,
      review: 'The training programs they implemented drastically improved our service quality.',
      sortOrder: 3,
    },
  ] as const

  let testimonialsCreated = 0
  let testimonialsUpdated = 0
  const testimonialsSkipped = 0
  const testimonialIds: number[] = []
  for (const spec of testimonialSpecs) {
    const existing = await findFirst(payload, 'testimonials', {
      and: [{ tenantId: { equals: tenantId } }, { customerName: { equals: spec.customerName } }],
    })
    const data = { ...spec, tenantId }
    if (existing) {
      const updated = await payload.update({ id: existing.id, collection: 'testimonials', data, overrideAccess: true, user })
      testimonialIds.push(updated.id)
      testimonialsUpdated += 1
    } else {
      const created = await payload.create({ collection: 'testimonials', data, overrideAccess: true, user })
      testimonialIds.push(created.id)
      testimonialsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Testimonials Page layout (exact designer section order)
  // ---------------------------------------------------------------------------
  const layout: TestimonialsLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'Testimonials',
      heading: 'Client Stories',
      description: 'What people say about working with us.',
    },
    {
      blockType: 'testimonialsBlock' as const,
      presentation: 'cards' as const,
      source: 'manual' as const,
      testimonials: testimonialIds,
      sectionHeader: {
        eyebrow: 'What Our Clients Say',
        title: 'Real Stories. Real Results.',
        subtitle: 'Real Results.',
      },
    },
    {
      blockType: 'ctaBlock' as const,
      bgText: 'STORIES',
      sectionHeader: {
        title: 'Ready to Write Your Story?',
        subtitle: 'Story?',
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: true,
        primaryCTA: { type: 'custom' as const, label: "Let's Talk", url: '/contact' },
        secondaryCTA: { type: 'custom' as const, label: 'View Portfolio', url: '/portfolio' },
      },
    },
  ]

  const existingTestimonialsPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'testimonials' } },
      { isHomePage: { equals: false } },
    ],
  })
  const testimonialsPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Hear from our clients and partners.',
    metaTitle: 'Testimonials | Curious Ladoo',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'testimonials',
    tenantId,
    title: 'Curious Ladoo Testimonials',
  }
  const testimonialsPage = existingTestimonialsPage
    ? await payload.update({ id: existingTestimonialsPage.id, collection: 'pages', data: testimonialsPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: testimonialsPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo Testimonials seed completed.')

  return {
    testimonialsPage: {
      blockCount: layout.length,
      id: testimonialsPage.id,
      status: existingTestimonialsPage ? 'updated' : 'created',
    },
    testimonials: { created: testimonialsCreated, skipped: testimonialsSkipped, updated: testimonialsUpdated },
  }
}
