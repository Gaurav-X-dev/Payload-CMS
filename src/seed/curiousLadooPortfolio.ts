import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type PortfolioLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooPortfolioSeedResult = {
  media: { created: number; reused: number }
  portfolioItems: { created: number; skipped: number; updated: number }
  portfolioPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
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

export async function seedCuriousLadooPortfolioContent(
  payload: Payload,
): Promise<CuriousLadooPortfolioSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo Portfolio seed as.')
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
  // Media — 2 new uploads, 5 reused from earlier milestones
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
    culinaryArtImage,
    zuruZuruImage,
    gheeRoastImage,
    zQuickImage,
    consultingImage,
    visualStoryImage,
  ] = await Promise.all([
    upload({ alt: 'Case studies and turnkey restaurant launches', sourcePath: 'themes/curious-hub/images/t2_interior.png', title: 't2_interior.png' }),
    upload({ alt: 'Plated modern Indian dish - menu engineering project', sourcePath: 'themes/curious-hub/images/culinary_art.png', title: 'culinary_art.png' }),
    upload({ alt: 'Zuru Zuru BKC Mumbai restaurant design', sourcePath: 'themes/curious-hub/images/zuru_zuru.png', title: 'zuru_zuru.png' }),
    upload({ alt: 'Ghee Roast Connaught Place Delhi interior design', sourcePath: 'themes/curious-hub/images/ghee_roast.png', title: 'ghee_roast.png' }),
    upload({ alt: 'Z-Quick cloud kitchen deployment', sourcePath: 'themes/curious-hub/images/zquick.png', title: 'zquick.png' }),
    upload({ alt: 'Coastal Table restaurant menu auditing', sourcePath: 'themes/curious-hub/images/consulting.png', title: 'consulting.png' }),
    upload({ alt: 'Mockup of modern minimalistic coffee roastery interior', sourcePath: 'themes/curious-hub/images/visual_story.png', title: 'visual_story.png' }),
  ])

  // ---------------------------------------------------------------------------
  // Portfolio items (exact designer order)
  // ---------------------------------------------------------------------------
  const itemSpecs = [
    {
      title: 'Zuru Zuru BKC, Mumbai',
      category: 'Turnkey Operations',
      year: '2024',
      description: 'Turnkey launch of a 1,800 sq ft Japanese Izakaya. We executed demographic white space research, kitchen ventilation engineering, and full staff recruitment.',
      coverImage: zuruZuruImage.id,
      sortOrder: 0,
    },
    {
      title: 'Ghee Roast CP, New Delhi',
      category: 'Restaurant Design',
      year: '2023',
      description: 'Visual and spatial design celebrating South Indian architectural heritage. Custom carved wooden pillars, warm lighting arrays, and 80-cover layout optimization.',
      coverImage: gheeRoastImage.id,
      sortOrder: 1,
    },
    {
      title: 'Modern Indian Fine Dining Audit',
      category: 'Menu Engineering',
      year: '2023',
      description: 'Data-driven menu cost analysis for a leading Goa boutique resort. Portion size standardization and ingredient supply re-routing reduced food cost by 6.2%.',
      coverImage: culinaryArtImage.id,
      sortOrder: 2,
    },
    {
      title: 'Z-Quick Hub, Gurugram',
      category: 'Turnkey Operations',
      year: '2023',
      description: 'Launch of a multi-brand cloud kitchen system. Custom order dispatch monitors and temperature controlled packaging reduced preparation delays by 22%.',
      coverImage: zQuickImage.id,
      sortOrder: 3,
    },
    {
      title: 'The Coastal Table Redesign',
      category: 'Menu Engineering',
      year: '2022',
      description: 'Full brand architecture turnaround. Analyzed menu item popularity parameters to design a streamlined menu sheet, boosting dinner beverage sales by 35%.',
      coverImage: consultingImage.id,
      sortOrder: 4,
    },
    {
      title: 'Minimalist Roastery Mockup',
      category: 'Restaurant Design',
      year: '2022',
      description: 'Spatial blueprints and material selection lists for a luxury corporate lobby roastery, emphasizing natural woods, light concrete, and open bar counters.',
      coverImage: visualStoryImage.id,
      sortOrder: 5,
    },
  ] as const

  let itemsCreated = 0
  let itemsUpdated = 0
  const itemsSkipped = 0
  for (const spec of itemSpecs) {
    const existing = await findFirst(payload, 'portfolio', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = { ...spec, tenantId }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'portfolio', data, overrideAccess: true, user })
      itemsUpdated += 1
    } else {
      await payload.create({ collection: 'portfolio', data, overrideAccess: true, user })
      itemsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Portfolio Page layout (exact designer section order)
  // ---------------------------------------------------------------------------
  const layout: PortfolioLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'Our Archives',
      heading: 'Case Studies &\nTurnkey Launches',
      description: 'Explore how we combine menu cost modeling, sensory spatial design, and airtight operations to launch enduring F&B businesses.',
      foregroundImage: heroImage.id,
      imageAlt: 'Case studies and turnkey restaurant launches',
    },
    {
      blockType: 'portfolioshowcaseBlock' as const,
      sectionHeader: {
        // Not rendered by the Portfolio showcase — kept only for the admin list view.
        title: 'Case Studies',
      },
      items: [],
      limit: 12,
    },
    {
      blockType: 'compareBlock' as const,
      sectionHeader: {
        eyebrow: 'Transformation Showcase',
        title: 'Before & After.',
        subtitle: 'After.',
        description: 'A visual example of how we re-design un-optimized spaces into functional, premium dining layouts.',
      },
      before: {
        badgeLabel: 'Before (Raw Structure)',
        placeholderText: 'Unfinished Concrete Column Shell',
      },
      after: {
        badgeLabel: 'After (Ghee Roast CP)',
        media: { item: gheeRoastImage.id },
      },
    },
    {
      blockType: 'ctaBlock' as const,
      sectionHeader: {
        eyebrow: 'Work with Us',
        title: 'Want to Turnaround Your\nRestaurant Business?',
        subtitle: 'Restaurant Business?',
        description: 'We audit menu metrics, interior systems, and staff pipelines to rebuild underperforming F&B properties.',
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: true,
        primaryCTA: { type: 'custom' as const, label: 'Book a Brand Audit', url: '/contact?interest=consulting' },
        secondaryCTA: { type: 'custom' as const, label: 'Our 15 Services', url: '/services' },
      },
    },
  ]

  const existingPortfolioPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'portfolio' } },
      { isHomePage: { equals: false } },
    ],
  })
  const portfolioPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'View the portfolio and case studies of Curious Ladoo, showcasing restaurant designs, engineered menus, and turnaround operations.',
    metaTitle: 'Portfolio & Cases — Curious Ladoo',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'portfolio',
    tenantId,
    title: 'Curious Ladoo Portfolio',
  }
  const portfolioPage = existingPortfolioPage
    ? await payload.update({ id: existingPortfolioPage.id, collection: 'pages', data: portfolioPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: portfolioPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo Portfolio seed completed.')

  return {
    media: { created: mediaCreated, reused: mediaReused },
    portfolioItems: { created: itemsCreated, skipped: itemsSkipped, updated: itemsUpdated },
    portfolioPage: {
      blockCount: layout.length,
      id: portfolioPage.id,
      status: existingPortfolioPage ? 'updated' : 'created',
    },
  }
}
