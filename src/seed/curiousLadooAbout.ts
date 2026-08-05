import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type AboutLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooAboutSeedResult = {
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

export async function seedCuriousLadooAboutContent(
  payload: Payload,
): Promise<CuriousLadooAboutSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo About seed as.')
  }
  const user = superAdmin as User

  const curiousLadoo = await findFirst(payload, 'tenants', { slug: { equals: 'curious-ladoo' } })
  if (!curiousLadoo) {
    throw new Error(
      'Curious Ladoo tenant not found. Run the Milestone 3 seed (db:seed:curious-ladoo) first.',
    )
  }
  const tenantId = curiousLadoo.id

  const teamMemberCount = await payload.count({
    collection: 'teammembers',
    overrideAccess: true,
    where: { tenantId: { equals: tenantId } },
  })
  if (teamMemberCount.totalDocs === 0) {
    throw new Error(
      'No Curious Ladoo team members found. Run the Milestone 4 seed (db:seed:curious-ladoo-home) first — About reuses the same leadership records.',
    )
  }

  // ---------------------------------------------------------------------------
  // Media
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

  const [bannerImage, teamImage, officeImage] = await Promise.all([
    upload({ alt: 'Curious Ladoo — crafting experiences, systemizing success', sourcePath: 'themes/curious-hub/images/banner_about.png', title: 'banner_about.png' }),
    upload({ alt: 'Curious Ladoo creative directors collaborating in office', sourcePath: 'themes/curious-hub/images/team_about.png', title: 'team_about.png' }),
    upload({ alt: 'Curious Ladoo clean modern minimalist design headquarters', sourcePath: 'themes/curious-hub/images/office_tokyo.png', title: 'office_tokyo.png' }),
  ])

  // ---------------------------------------------------------------------------
  // About Page layout (exact designer section order)
  // ---------------------------------------------------------------------------
  const layout: AboutLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'Our Story',
      heading: 'Crafting Experiences, Systemizing Success',
      description: 'We are a different kind of hospitality company — building restaurant brands with operational clarity, visual conviction, and a culture of care.',
      foregroundImage: bannerImage.id,
      imageAlt: 'Curious Ladoo — crafting experiences, systemizing success',
    },
    {
      blockType: 'storyBlock' as const,
      layout: 'simple' as const,
      title: 'Hospitality Built on',
      accentPhrase: 'Conviction.',
      body: 'Founded in New Delhi in 2020, Curious Ladoo began with a singular premise: that the restaurant business is not just an art, but a discipline of systems. While great food brings guests in, it is premium design and airtight operational processes that bring them back.\n\nToday, we own and operate prominent restaurant brands, run delivery operations, build cloud kitchen architectures, and advise other major hospitality entities across South Asia. We build with curiosity, design with meaning, and manage with mathematical rigor.',
      media: teamImage.id,
      mediaAlt: 'Curious Ladoo creative directors collaborating in office',
      imagePosition: 'left' as const,
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'mission-vision' as const,
      media: { item: officeImage.id },
      mediaPosition: 'right' as const,
      sectionHeader: {
        eyebrow: 'Directives',
        title: 'Mission & Vision.',
        subtitle: 'Vision.',
      },
      items: [
        {
          title: 'Our Mission',
          description: 'To elevate the hospitality ecosystem by designing dining experiences that evoke deep emotion and backing them with technology-led operational models that scale effortlessly.',
        },
        {
          title: 'Our Vision',
          description: "To be South Asia's premier hospitality incubator, establishing restaurant brands that define their culinary categories and sets a new global benchmark for operational excellence.",
        },
      ],
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'values' as const,
      sectionHeader: {
        title: 'Our Core Values.',
        subtitle: 'Values.',
        description: 'The principles that shape our work, from menu engineering to board meetings.',
      },
      items: [
        { title: 'Question assumptions', description: 'We remain curious. We analyze demography, context, and operational viability before drawing a single sketch.' },
        { title: 'Design experiences', description: 'Design is not decoration. It governs consumer flow, employee efficiency, and sensory memory. Experience is everything.' },
        { title: 'Build systems', description: 'We document standard operating procedures for everything. Scaling is impossible without repeatable, reliable systems.' },
      ],
    },
    {
      blockType: 'teamBlock' as const,
      members: [],
      limit: 3,
      sectionHeader: {
        title: 'Our Leadership.',
        subtitle: 'Leadership.',
        description: 'Curious minds. Deliberate builders. Hospitality obsessives.',
      },
    },
    {
      blockType: 'stepsBlock' as const,
      layoutVariant: 'timeline' as const,
      presentation: 'cards' as const,
      sectionHeader: {
        title: 'Our Milestones.',
        subtitle: 'Milestones.',
      },
      steps: [
        { label: '2020', title: 'Conceived', description: 'Established in New Delhi with a team of three consultants and one vision.' },
        { label: '2021', title: 'Zuru Zuru Opens', description: 'Our flagship Japanese Izakaya brand opens, setting new standards for comfort dining.' },
        { label: '2022', title: 'Ghee Roast Launches', description: 'Coastal South Indian food celebrated in a premium design layout, leading to rapid expansion.' },
        { label: '2023', title: 'Consulting Expansion', description: 'Curious Ladoo Consulting official launch. Built infrastructure for 20+ partner brands.' },
        { label: '2025+', title: 'Scalability', description: 'Expanding to 5 additional cities, launching delivery systems and technology platforms.' },
      ],
    },
    {
      blockType: 'ctaBlock' as const,
      sectionHeader: {
        eyebrow: 'Work with Us',
        title: "Let's Build Something\nthat Endures.",
        subtitle: 'Endures.',
        description: "If you share our obsession with design and systems, let's explore synergies together.",
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: true,
        primaryCTA: { type: 'custom' as const, label: 'Contact Our Team', url: '/contact' },
        secondaryCTA: { type: 'custom' as const, label: 'Explore Services', url: '/services' },
      },
    },
  ]

  const existingAboutPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { pageType: { equals: 'about' } },
      { isHomePage: { equals: false } },
    ],
  })
  const aboutPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Learn about Curious Ladoo, our team, our values, and our journey building category-defining hospitality brands in India.',
    metaTitle: 'About Us — Curious Ladoo',
    pageType: 'about' as const,
    publishedAt: new Date().toISOString(),
    slug: 'about',
    tenantId,
    title: 'Curious Ladoo About',
  }
  const aboutPage = existingAboutPage
    ? await payload.update({ id: existingAboutPage.id, collection: 'pages', data: aboutPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: aboutPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo About seed completed.')

  return {
    aboutPage: {
      blockCount: layout.length,
      id: aboutPage.id,
      status: existingAboutPage ? 'updated' : 'created',
    },
    media: { created: mediaCreated, reused: mediaReused },
  }
}
