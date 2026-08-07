import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'

type FaqsLayout = NonNullable<Page['layout']>

export type CuriousLadooFaqsSeedResult = {
  faqs: { created: number; skipped: number; updated: number }
  faqsPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
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

export async function seedCuriousLadooFaqsContent(
  payload: Payload,
): Promise<CuriousLadooFaqsSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo FAQs seed as.')
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
  // FAQs specific to the dedicated /faqs page. None of these overlap the 3 existing
  // "Services"-category FAQs already used by the Services page's faqBlock (menu
  // engineering / cloud kitchens / consulting cities) — those stay untouched and are
  // never selected here. `isFeatured` stays false: nothing on this page filters by it.
  // ---------------------------------------------------------------------------
  const faqSpecs = [
    {
      title: 'What services do you offer?',
      answer: 'We offer end-to-end hospitality consulting, including concept creation, menu development, operations management, and brand marketing.',
      sortOrder: 0,
    },
    {
      title: 'Do you work with international clients?',
      answer: 'Yes, we have experience building and managing brands globally, tailoring our approach to local markets.',
      sortOrder: 1,
    },
    {
      title: 'How long does a typical project take?',
      answer: 'The timeline varies depending on the scope. A full concept creation and launch usually takes 6 to 12 months.',
      sortOrder: 2,
    },
    {
      title: 'Do you offer ongoing management?',
      answer: 'Absolutely. We provide operational management services to ensure your concept continues to thrive post-launch.',
      sortOrder: 3,
    },
    {
      title: 'Can you help with funding or investment?',
      answer: 'While we are not a financial institution, we can assist in creating business plans and connecting you with our network of F&B investors.',
      sortOrder: 4,
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
  // FAQs Page layout (exact designer section order)
  // ---------------------------------------------------------------------------
  const layout: FaqsLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'FAQs',
      heading: 'Frequently Asked Questions',
      description: 'Find answers to common inquiries.',
    },
    {
      blockType: 'faqBlock' as const,
      presentation: 'plusminus' as const,
      items: faqIds,
      sectionHeader: {
        eyebrow: 'Frequently Asked',
        title: 'Got Questions?',
        subtitle: 'Questions?',
      },
    },
    {
      blockType: 'ctaBlock' as const,
      bgText: 'FAQ',
      sectionHeader: {
        title: 'Still Have Questions?',
        subtitle: 'Questions?',
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: false,
        primaryCTA: { type: 'custom' as const, label: 'Contact Us', url: '/contact' },
      },
    },
  ]

  const existingFaqsPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'faqs' } },
      { isHomePage: { equals: false } },
    ],
  })
  const faqsPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Frequently asked questions about our services and process.',
    metaTitle: 'FAQs | Curious Ladoo',
    pageType: 'faq' as const,
    publishedAt: new Date().toISOString(),
    slug: 'faqs',
    tenantId,
    title: 'Curious Ladoo FAQs',
  }
  const faqsPage = existingFaqsPage
    ? await payload.update({ id: existingFaqsPage.id, collection: 'pages', data: faqsPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: faqsPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo FAQs seed completed.')

  return {
    faqs: { created: faqsCreated, skipped: faqsSkipped, updated: faqsUpdated },
    faqsPage: {
      blockCount: layout.length,
      id: faqsPage.id,
      status: existingFaqsPage ? 'updated' : 'created',
    },
  }
}
