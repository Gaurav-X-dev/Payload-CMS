import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type BrandsLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooBrandsSeedResult = {
  brands: { updated: number }
  brandsPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
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

export async function seedCuriousLadooBrandsContent(
  payload: Payload,
): Promise<CuriousLadooBrandsSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo Brands seed as.')
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
  // Media (fully reused from Milestone 4 — no new uploads for this milestone)
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

  const [heroImage] = await Promise.all([
    upload({ alt: 'Cinematic restaurant atmosphere — Curious Ladoo', sourcePath: 'themes/curious-hub/images/visual_story.png', title: 'visual_story.png' }),
  ])

  // ---------------------------------------------------------------------------
  // Extend the 3 existing Brand records (Milestone 4) with spotlight-only fields.
  // Partial update: only the fields below are touched. name/category/mark/image/
  // tenant/websiteUrl/enabled/featured/comingSoon/sortOrder are left exactly as
  // Milestone 4 set them, so Home's brandsshowcaseBlock (presentation: 'grid') is
  // provably unaffected.
  // ---------------------------------------------------------------------------
  const brandSpotlightSpecs = [
    {
      name: 'Zuru Zuru',
      slug: 'zuru',
      fullDescription: 'Comfort food. Reliably good times. Zuru Zuru is our interpretation of a traditional Japanese izakaya. We celebrate artisanal ramens, charcoal robata skewers, and highball culture, re-engineered carefully for the urban Indian consumer.',
      quote: '"The detail in Zuru Zuru\'s branding — from the custom ceramics to the lighting flow — creates an immersive dining pocket that immediately builds repeat guests."',
      statValue: '3 Cities',
      statLabel: 'Active Rollout',
      links: [
        { label: 'ig', url: '/brands#zuru' },
        { label: 'web', url: '/brands#zuru' },
      ],
    },
    {
      name: 'Ghee Roast',
      slug: 'ghee',
      fullDescription: 'Coastal flavours. Bold and soulful. Ghee Roast brings the heritage cuisines of Mangalore, Kerala, and Tamil Nadu into a contemporary editorial dining environment. We pair traditional clay-pot slow cooking with modern beverage systems.',
      quote: '"We saw a 45% increase in lunch table turnovers after implementing the menu engineering SOPs crafted for Ghee Roast by the CL group."',
      statValue: '4.8 ★',
      statLabel: 'Customer Rating',
      links: [
        { label: 'ig', url: '/brands#ghee' },
        { label: 'web', url: '/brands#ghee' },
      ],
    },
    {
      name: 'Z-Quick',
      slug: 'quick',
      fullDescription: 'Great taste, engineered fast. Z-Quick is our high-efficiency cloud kitchen concept, serving premium wraps, rice bowls, and sides. Designed for high density urban sectors, it runs on custom dispatch algorithms that ensure food arrives hot and crisp.',
      quote: '"Z-Quick is a masterclass in packaging engineering. The heat-vented containers ensure delivery food stays restaurant-grade."',
      statValue: '18 Min',
      statLabel: 'Avg Delivery Time',
      links: [
        { label: 'ig', url: '/brands#quick' },
        { label: 'web', url: '/brands#quick' },
      ],
    },
  ] as const

  let brandsUpdated = 0
  for (const spec of brandSpotlightSpecs) {
    const existing = await findFirst(payload, 'brands', {
      and: [{ tenantId: { equals: tenantId } }, { name: { equals: spec.name } }],
    })
    if (!existing) {
      throw new Error(
        `Brand "${spec.name}" not found. Run the Milestone 4 seed (db:seed:curious-ladoo-home) first — the Brands page extends those records rather than recreating them.`,
      )
    }
    await payload.update({
      id: existing.id,
      collection: 'brands',
      data: {
        slug: spec.slug,
        fullDescription: spec.fullDescription,
        quote: spec.quote,
        statValue: spec.statValue,
        statLabel: spec.statLabel,
        links: spec.links.map((link) => ({ ...link })),
      },
      overrideAccess: true,
      user,
    })
    brandsUpdated += 1
  }

  // ---------------------------------------------------------------------------
  // Brands Page layout (exact designer section order)
  // ---------------------------------------------------------------------------
  const layout: BrandsLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'Our Portfolio',
      heading: 'Distinct Identities, Unified Excellence',
      description: 'We build dining concepts that celebrate heritage and convenience, each running on customized operational systems designed for consistency and scale.',
      foregroundImage: heroImage.id,
      imageAlt: 'Cinematic restaurant atmosphere — Curious Ladoo',
    },
    {
      blockType: 'brandsshowcaseBlock' as const,
      presentation: 'spotlight' as const,
      sectionHeader: {
        // Not rendered by the Spotlight presentation — kept only for the admin list view.
        title: 'Brand Spotlights',
      },
      brands: [],
      limit: 3,
    },
    {
      blockType: 'pipelineBlock' as const,
      sectionHeader: {
        eyebrow: 'Pipelines',
        title: 'What We Are Incubating.',
        subtitle: 'Incubating.',
        description: 'Curious Ladoo is constantly researching new F&B segments. In the coming year, we are launching two new concepts:',
      },
      items: [
        { label: 'Project Roastery (Q1 2026):', description: 'An artisanal coffee roastery concept combined with sourdough bakery operations, systemized for business complexes.' },
        { label: 'Project Botanical (Q3 2026):', description: 'A high-end cocktail lounge emphasizing native Indian botanicals, local distillates, and cold-pressed infusion bars.' },
      ],
      enableLink: true,
      link: { type: 'custom' as const, label: 'Partner on Concepts', url: '/contact?interest=brand' },
      spotlight: {
        enabled: true,
        icon: '☕',
        title: 'Project Roastery',
        description: 'Minimal styling, high-efficiency pour-overs, and custom sourdough profiles launching in corporate high-streets.',
      },
      spotlightPosition: 'right' as const,
    },
    {
      blockType: 'ctaBlock' as const,
      sectionHeader: {
        eyebrow: 'Licensing & Franchising',
        title: 'Bring Our Brands to\n Your Market.',
        subtitle: 'Your Market.',
        description: 'We provide complete operational manual binders, supply agreements, visual templates, and tech licensing for our brands.',
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: true,
        primaryCTA: { type: 'custom' as const, label: 'Franchise Inquiry', url: '/contact?interest=b2b' },
        secondaryCTA: { type: 'custom' as const, label: 'Explore Services', url: '/services' },
      },
    },
  ]

  const existingBrandsPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'brands' } },
      { isHomePage: { equals: false } },
    ],
  })
  const brandsPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Explore restaurant brands by Curious Ladoo, including Zuru Zuru Japanese Izakaya, Ghee Roast South Indian Cuisine, and Z-Quick premium delivery.',
    metaTitle: 'Our Brands — Curious Ladoo',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'brands',
    tenantId,
    title: 'Curious Ladoo Brands',
  }
  const brandsPage = existingBrandsPage
    ? await payload.update({ id: existingBrandsPage.id, collection: 'pages', data: brandsPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: brandsPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo Brands seed completed.')

  return {
    brands: { updated: brandsUpdated },
    brandsPage: {
      blockCount: layout.length,
      id: brandsPage.id,
      status: existingBrandsPage ? 'updated' : 'created',
    },
    media: { created: mediaCreated, reused: mediaReused },
  }
}
