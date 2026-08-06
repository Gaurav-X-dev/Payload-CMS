import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type ServicesLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooServicesSeedResult = {
  faqs: { created: number; skipped: number; updated: number }
  media: { created: number; reused: number }
  servicesPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
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

export async function seedCuriousLadooServicesContent(
  payload: Payload,
): Promise<CuriousLadooServicesSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo Services seed as.')
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

  const [bannerImage, brandsImage, consultingImage, menuImage, techImage] = await Promise.all([
    upload({ alt: '15 core capabilities, one integrated philosophy', sourcePath: 'themes/curious-hub/images/banner_services.png', title: 'banner_services.png' }),
    upload({ alt: 'Hospitality brand design - Zuru Zuru restaurant setup', sourcePath: 'themes/curious-hub/images/zuru_zuru.png', title: 'zuru_zuru.png' }),
    upload({ alt: 'Hospitality consulting services by Curious Ladoo', sourcePath: 'themes/curious-hub/images/consulting.png', title: 'consulting.png' }),
    upload({ alt: 'Menu engineering and dish cost optimization', sourcePath: 'themes/curious-hub/images/journal1.png', title: 'journal1.png' }),
    upload({ alt: 'Technology integrations in commercial kitchen operations', sourcePath: 'themes/curious-hub/images/kitchen_ops.png', title: 'kitchen_ops.png' }),
  ])

  // ---------------------------------------------------------------------------
  // FAQs (Services-specific; explicitly selected in the block, not left to "show all")
  // ---------------------------------------------------------------------------
  const faqSpecs = [
    {
      answer: "We work on a fixed-fee model for recipe development, coupled with a performance incentive based on food-cost reductions achieved during the first 6 months post-implementation. This guarantees that our incentives align directly with your brand's profitability.",
      category: 'Services',
      isActive: true,
      sortOrder: 0,
      title: 'How do you charge for menu engineering?',
    },
    {
      answer: 'Yes. We have specialized CAD planners who design multi-brand kitchen workspaces to optimize thermal exhaustion, chef movement, storage space, and order pickup areas. This design language improves order preparation times by up to 20%.',
      category: 'Services',
      isActive: true,
      sortOrder: 1,
      title: 'Can you design commercial cloud kitchens?',
    },
    {
      answer: 'Our consulting team operates pan-India, with active projects in Delhi NCR, Mumbai, Bengaluru, Goa, and Hyderabad. We also consult for selected international hospitality concepts in Dubai and Tokyo.',
      category: 'Services',
      isActive: true,
      sortOrder: 2,
      title: 'What cities do you consult in?',
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
    const data = { ...spec, tenantId }
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
  // Services Page layout (exact designer section order)
  // ---------------------------------------------------------------------------
  const layout: ServicesLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'Our Services',
      heading: '15 Core Capabilities, One Integrated Philosophy',
      description: 'We build restaurant brands from concept to execution. We engineer menus for profit, optimize kitchens for speed, and implement technologies that scale.',
      foregroundImage: bannerImage.id,
      imageAlt: '15 core capabilities, one integrated philosophy',
    },
    {
      blockType: 'capabilityBlock' as const,
      sectionHeader: {
        title: 'End-to-End Sustenance.',
        subtitle: 'Sustenance.',
        description: "A restaurant's success is governed by variables that must work in absolute harmony. Our 15 specialized F&B services ensure that whether you are launching a new concept, systemizing a kitchen, or scaling globally, you are doing so with proven methodologies.",
      },
      items: [
        {
          number: '01',
          anchorId: 'brands',
          title: 'Restaurant Brands & Incubation',
          description: 'We conceptualize, launch, and operate premium dining brands. From identifying regional demographic white spaces to crafting distinct menu structures and training culinary directors, we deliver turnkey operations.',
          features: [
            { text: 'Demographic mapping' },
            { text: 'Brand identity design' },
            { text: 'Turnkey launch operations' },
            { text: 'Concept feasibility tests' },
          ],
          enableLink: true,
          link: { type: 'custom' as const, label: 'Explore Brands', url: '/brands' },
          media: { item: brandsImage.id },
          reverse: false,
        },
        {
          number: '02',
          anchorId: 'consulting',
          title: 'Hospitality Consulting & Advisory',
          description: 'Our consulting division audits operational bottlenecks, optimizes F&B operations, designs kitchen workflows, and builds standard operating procedures (SOPs) that help hotels and independent operators scale efficiently.',
          features: [
            { text: 'Workflow architecture' },
            { text: 'Standard operating procedures' },
            { text: 'Operations auditing' },
            { text: 'Kitchen flow design' },
          ],
          enableLink: true,
          link: { type: 'custom' as const, label: 'Get Consulted', url: '/contact?interest=consulting' },
          media: { item: consultingImage.id },
          reverse: true,
        },
        {
          number: '03',
          anchorId: 'menu',
          title: 'Menu Engineering & Design',
          description: 'We combine culinary artistry with mathematical analysis. We engineer recipes, optimize food cost parameters, train chefs on precise portioning, and design physical and digital menus to maximize gross profits.',
          features: [
            { text: 'Recipe cost engineering' },
            { text: 'Ingredient supply chains' },
            { text: 'Visual menu architecture' },
            { text: 'Portion size optimization' },
          ],
          enableLink: true,
          link: { type: 'custom' as const, label: 'View Case Studies', url: '/portfolio' },
          media: { item: menuImage.id },
          reverse: false,
        },
        {
          number: '04',
          anchorId: 'tech',
          title: 'F&B Technology & Systems',
          description: 'We implement advanced technology solutions, integrating POS architectures, real-time inventory tracking, AI-based demand forecasting, and automated supply chains to reduce wastage and increase bottom lines.',
          features: [
            { text: 'POS system integrations' },
            { text: 'Inventory automation' },
            { text: 'Supply chain analytics' },
            { text: 'Kitchen display setups' },
          ],
          enableLink: true,
          link: { type: 'custom' as const, label: 'How We Integrate', url: '/how-we-work' },
          media: { item: techImage.id },
          reverse: true,
        },
      ],
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'benefits' as const,
      sectionHeader: {
        title: 'Our Systems Advantage.',
        subtitle: 'Advantage.',
        description: 'Why major hospitality names trust Curious Ladoo to build their workflows.',
      },
      items: [
        { title: 'PORTION CONTROL SYSTEMS', description: 'Our digital SOP binders outline recipe portioning to the gram. This ensures taste consistency across cities while controlling food cost variance to within 1%.' },
        { title: 'COMMERCIAL COMPLIANCE', description: 'We handle full regulatory audits, including food safety inspections, municipal licensing, pollution controls, and structural approvals for kitchens.' },
        { title: 'STAFF RETENTION MODELS', description: 'We structure structured training programs and clear career advancement ladders that reduce standard FOH and BOH attrition levels by 30%.' },
      ],
    },
    {
      blockType: 'faqBlock' as const,
      sectionHeader: {
        title: 'Frequently Asked Questions.',
        subtitle: 'Questions.',
      },
      items: faqIds,
      limit: 10,
    },
    {
      blockType: 'ctaBlock' as const,
      sectionHeader: {
        eyebrow: 'Partner with Us',
        title: 'Ready to Optimize Your\n F&B Operations?',
        subtitle: 'F&B Operations?',
        description: 'Reach out to our brand consultants to arrange a comprehensive operational audit or concept review.',
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: true,
        primaryCTA: { type: 'custom' as const, label: 'Book an Audit', url: '/contact?interest=consulting' },
        secondaryCTA: { type: 'custom' as const, label: 'Our Workflow', url: '/how-we-work' },
      },
    },
  ]

  const existingServicesPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'services' } },
      { isHomePage: { equals: false } },
    ],
  })
  const servicesPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Discover the 15 hospitality services offered by Curious Ladoo, including menu engineering, restaurant consulting, brand creation, and staff training.',
    metaTitle: 'Services — Curious Ladoo',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'services',
    tenantId,
    title: 'Curious Ladoo Services',
  }
  const servicesPage = existingServicesPage
    ? await payload.update({ id: existingServicesPage.id, collection: 'pages', data: servicesPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: servicesPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo Services seed completed.')

  return {
    faqs: { created: faqsCreated, skipped: faqsSkipped, updated: faqsUpdated },
    media: { created: mediaCreated, reused: mediaReused },
    servicesPage: {
      blockCount: layout.length,
      id: servicesPage.id,
      status: existingServicesPage ? 'updated' : 'created',
    },
  }
}
