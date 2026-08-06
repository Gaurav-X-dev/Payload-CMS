import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type HowWeWorkLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooHowWeWorkSeedResult = {
  howWeWorkPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
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

export async function seedCuriousLadooHowWeWorkContent(
  payload: Payload,
): Promise<CuriousLadooHowWeWorkSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo How We Work seed as.')
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
  // Media — 1 new upload, 5 reused from earlier milestones
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

  const [
    heroImage,
    discoveryImage,
    conceptImage,
    buildImage,
    launchImage,
    scaleImage,
  ] = await Promise.all([
    upload({ alt: 'Our F&B development roadmap', sourcePath: 'themes/curious-hub/images/t3_interior.png', title: 't3_interior.png' }),
    upload({ alt: 'Discover phase - F&B demography and feasibility research', sourcePath: 'themes/curious-hub/images/team_about.png', title: 'team_about.png' }),
    upload({ alt: 'Concept phase - brand identity and interior architecture', sourcePath: 'themes/curious-hub/images/zuru_zuru.png', title: 'zuru_zuru.png' }),
    upload({ alt: 'Build phase - kitchen architecture layouts and SOP documentation', sourcePath: 'themes/curious-hub/images/kitchen_ops.png', title: 'kitchen_ops.png' }),
    upload({ alt: 'Launch phase - restaurant soft launch and operations locking', sourcePath: 'themes/curious-hub/images/ghee_roast.png', title: 'ghee_roast.png' }),
    upload({ alt: 'Scale phase - franchise licensing models and multi-city supply lines', sourcePath: 'themes/curious-hub/images/consulting.png', title: 'consulting.png' }),
  ])

  // ---------------------------------------------------------------------------
  // How We Work Page layout (exact designer section order)
  // ---------------------------------------------------------------------------
  const layout: HowWeWorkLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'Our Methodology',
      heading: 'From Curiosity to Scale: Our F&B Development Roadmap',
      description: "Every brand we design is built on a structured, repeatable five-stage workflow. Here's how we transform blank slates into category-defining culinary icons.",
      foregroundImage: heroImage.id,
      imageAlt: 'Our F&B development roadmap',
    },
    {
      blockType: 'stepsBlock' as const,
      layoutVariant: 'visual-timeline' as const,
      presentation: 'cards' as const,
      sectionHeader: {
        // Not rendered by the Visual Timeline layout — kept only for the admin list view.
        title: 'Development Roadmap',
      },
      steps: [
        { label: '01', title: 'Discovery & Feasibility', description: 'Every project begins with questions. We execute exhaustive demographic analysis, study supply chain constraints, analyze adjacent market competitors, and establish a clear financial model before defining the food concept.', media: { item: discoveryImage.id } },
        { label: '02', title: 'Concept & Brand Design', description: 'Once we establish financial feasibility, our creative division develops the brand narrative. This includes defining the exact culinary profile, visual identities, interior design layouts, signage, and customer service story.', media: { item: conceptImage.id } },
        { label: '03', title: 'Kitchen Build & SOP Binders', description: 'Our CAD planners layout commercial kitchen spaces to optimize thermal efficiency and worker safety. Concurrently, our operations division documents comprehensive standard operating procedure (SOP) manuals and binds recipe cards.', media: { item: buildImage.id } },
        { label: '04', title: 'Operational Launch', description: 'We execute structured soft-launch phases, integrating real-time dining customer feedback to refine seasoning levels, timing loops, and POS processes. Only when these variables are locked do we execute public marketing pushes.', media: { item: launchImage.id } },
        { label: '05', title: 'Systemized Scale', description: 'With locked operations, we scale concepts. We implement supply chain networks, draft detailed licensing frameworks, select certified franchise partners, and establish remote audit checkpoints to maintain brand consistency.', media: { item: scaleImage.id } },
      ],
    },
    {
      blockType: 'pipelineBlock' as const,
      sectionHeader: {
        eyebrow: 'Project Lifecycle',
        title: 'Speed to Market.',
        subtitle: 'Market.',
        description: 'From initial demographic mapping to the final grand launch, our development lifecycle typically takes 16 to 22 weeks. By integrating design, licensing, menu engineering, and compliance under one holding team, we reduce traditional market entry times by 30%.\n\nWe maintain active project dashboards for our licensing partners, ensuring full transparency across contractor timelines, kitchen certifications, and recipe locking.',
      },
      items: [],
      enableLink: false,
      spotlight: {
        enabled: true,
        value: '16 Wks',
        title: 'Average Concept Launch',
        description: 'From feasibility validation to serving the first dish.',
      },
      spotlightPosition: 'right' as const,
    },
    {
      blockType: 'ctaBlock' as const,
      sectionHeader: {
        eyebrow: 'Partner with Us',
        title: "Have a Space or a Brand Idea?\n Let's Co-Create.",
        subtitle: "Let's Co-Create.",
        description: 'If you are a landlord, investor, or culinary entrepreneur, contact our development division to discuss concepts.',
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: true,
        primaryCTA: { type: 'custom' as const, label: 'Pitch a Project', url: '/contact?interest=brand' },
        secondaryCTA: { type: 'custom' as const, label: 'Our Philosophy', url: '/about' },
      },
    },
  ]

  const existingHowWeWorkPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'how-we-work' } },
      { isHomePage: { equals: false } },
    ],
  })
  const howWeWorkPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Learn about the five-step F&B development process of Curious Ladoo: Discover, Concept, Build, Launch, and Scale.',
    metaTitle: 'How We Work — Curious Ladoo',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'how-we-work',
    tenantId,
    title: 'Curious Ladoo How We Work',
  }
  const howWeWorkPage = existingHowWeWorkPage
    ? await payload.update({ id: existingHowWeWorkPage.id, collection: 'pages', data: howWeWorkPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: howWeWorkPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo How We Work seed completed.')

  return {
    howWeWorkPage: {
      blockCount: layout.length,
      id: howWeWorkPage.id,
      status: existingHowWeWorkPage ? 'updated' : 'created',
    },
    media: { created: mediaCreated, reused: mediaReused },
  }
}
