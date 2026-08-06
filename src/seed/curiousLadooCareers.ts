import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'

type CareersLayout = NonNullable<Page['layout']>

export type CuriousLadooCareersSeedResult = {
  careersPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
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

export async function seedCuriousLadooCareersContent(
  payload: Payload,
): Promise<CuriousLadooCareersSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo Careers seed as.')
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
  // Careers Page layout (exact designer section order: hero, open positions, values, cta)
  // ---------------------------------------------------------------------------
  const layout: CareersLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'Careers',
      heading: 'Join Our Team',
      description: 'We are always looking for talented individuals.',
    },
    {
      blockType: 'careersBlock' as const,
      sectionHeader: {
        eyebrow: 'Join Our Team',
        title: 'Open Positions.',
        subtitle: 'Positions.',
        description:
          "We're always looking for curious, talented people who want to build the future of hospitality.",
      },
      positions: [
        {
          title: 'Executive Chef',
          department: 'Culinary',
          location: 'New Delhi, India',
          type: 'Full-time',
          description: 'Lead culinary development for new concepts.',
        },
        {
          title: 'Marketing Manager',
          department: 'Marketing',
          location: 'Mumbai, India',
          type: 'Full-time',
          description: 'Drive brand awareness and customer acquisition.',
        },
        {
          title: 'Restaurant Manager',
          department: 'Operations',
          location: 'Dubai, UAE',
          type: 'Full-time',
          description: 'Oversee daily operations of our flagship location.',
        },
        {
          title: 'Graphic Designer',
          department: 'Design',
          location: 'Remote',
          type: 'Contract',
          description: 'Create visual assets for our brand portfolio.',
        },
      ],
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'pillars' as const,
      bgText: 'VALUES',
      sectionHeader: {
        eyebrow: 'Why Work Here',
        title: 'Our Values.',
        subtitle: 'Values.',
      },
      items: [
        { title: 'Passion for Food' },
        { title: 'Creative Problem Solving' },
        { title: 'Collaborative Spirit' },
        { title: 'Commitment to Excellence' },
      ],
    },
    {
      blockType: 'ctaBlock' as const,
      bgText: 'CAREERS',
      sectionHeader: {
        title: "Don't See Your Role?",
        subtitle: 'Role?',
        description: "We're always open to conversations with talented people. Drop us a line.",
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: false,
        primaryCTA: { type: 'email' as const, label: 'Send Your CV', url: 'hello@curiousladoo.com' },
      },
    },
  ]

  const existingCareersPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'careers' } },
      { isHomePage: { equals: false } },
    ],
  })
  const careersPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Join our team of passionate hospitality professionals.',
    metaTitle: 'Careers | Curious Ladoo',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'careers',
    tenantId,
    title: 'Curious Ladoo Careers',
  }
  const careersPage = existingCareersPage
    ? await payload.update({ id: existingCareersPage.id, collection: 'pages', data: careersPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: careersPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo Careers seed completed.')

  return {
    careersPage: {
      blockCount: layout.length,
      id: careersPage.id,
      status: existingCareersPage ? 'updated' : 'created',
    },
  }
}
