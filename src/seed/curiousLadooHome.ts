import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type HomeLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooHomeSeedResult = {
  brands: { created: number; skipped: number; updated: number }
  blogPosts: { created: number; skipped: number; updated: number }
  homePage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
  media: { created: number; reused: number }
  teamMembers: { created: number; skipped: number; updated: number }
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

const richTextFromParagraphs = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    direction: null,
    version: 1,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      children: [{ mode: 'normal' as const, text, type: 'text', version: 1 }],
    })),
  },
})

export async function seedCuriousLadooHomeContent(
  payload: Payload,
): Promise<CuriousLadooHomeSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo Home seed as.')
  }
  const user = superAdmin as User

  const curiousLadoo = await findFirst(payload, 'tenants', { slug: { equals: 'curious-ladoo' } })
  if (!curiousLadoo) {
    throw new Error(
      'Curious Ladoo tenant not found. Run the Milestone 3 seed (db:seed:curious-ladoo) first.',
    )
  }
  const tenantId = curiousLadoo.id

  // Looked up only — never created, updated, or deleted by this script.
  const gheeRoastTenant = await findFirst(payload, 'tenants', { slug: { equals: 'ghee-roast' } })
  const zuruZuruTenant = await findFirst(payload, 'tenants', { slug: { equals: 'zuru-zuru' } })

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

  const [
    heroImage,
    aboutMainImage,
    edgeImage,
    visualStoryImage,
    zuruZuruImage,
    gheeRoastImage,
    zQuickImage,
    journal1Image,
    journal2Image,
    journal3Image,
    leaderArjunImage,
    leaderPriyaImage,
    leaderSiddharthImage,
  ] = await Promise.all([
    upload({ alt: 'Restaurant interior with editorial design elements', sourcePath: 'themes/curious-hub/images/t3_composite.jpg', title: 't3_composite.jpg' }),
    upload({ alt: 'Premium restaurant interior by Curious Ladoo', sourcePath: 'themes/curious-hub/images/hero.png', title: 'hero.png' }),
    upload({ alt: 'Curious Ladoo team in strategic consulting', sourcePath: 'themes/curious-hub/images/consulting.png', title: 'consulting.png' }),
    upload({ alt: 'Cinematic restaurant atmosphere — Curious Ladoo', sourcePath: 'themes/curious-hub/images/visual_story.png', title: 'visual_story.png' }),
    upload({ alt: 'Zuru Zuru — Japanese Izakaya restaurant', sourcePath: 'themes/curious-hub/images/zuru_zuru.png', title: 'zuru_zuru.png' }),
    upload({ alt: 'Ghee Roast — South Indian coastal restaurant', sourcePath: 'themes/curious-hub/images/ghee_roast.png', title: 'ghee_roast.png' }),
    upload({ alt: 'Z-Quick — premium delivery brand', sourcePath: 'themes/curious-hub/images/zquick.png', title: 'zquick.png' }),
    upload({ alt: 'Why Systems Beat Talent Every Time — article cover', sourcePath: 'themes/curious-hub/images/journal1.png', title: 'journal1.png' }),
    upload({ alt: 'The Future of Dining in India — article cover', sourcePath: 'themes/curious-hub/images/journal2.png', title: 'journal2.png' }),
    upload({ alt: 'Designing Places People Remember — article cover', sourcePath: 'themes/curious-hub/images/journal3.png', title: 'journal3.png' }),
    upload({ alt: 'Arjun Rao, Founder & CEO', sourcePath: 'themes/curious-hub/images/leader_arjun.png', title: 'leader_arjun.png' }),
    upload({ alt: 'Priya Malhotra, Chief Brand Officer', sourcePath: 'themes/curious-hub/images/leader_priya.png', title: 'leader_priya.png' }),
    upload({ alt: 'Siddharth Kumar, Head of Operations', sourcePath: 'themes/curious-hub/images/leader_siddharth.png', title: 'leader_siddharth.png' }),
  ])

  // ---------------------------------------------------------------------------
  // Brands
  // ---------------------------------------------------------------------------
  const brandSpecs = [
    {
      category: 'Japanese Izakaya',
      enabled: true,
      featured: true,
      image: zuruZuruImage.id,
      mark: '九小',
      name: 'Zuru Zuru',
      shortDescription: 'Comfort food. Reliably good times. A Japanese izakaya experience built for the Indian palate.',
      sortOrder: 0,
      tenant: zuruZuruTenant?.id,
      websiteUrl: '/brands#zuru',
    },
    {
      category: 'South Indian Cuisine',
      enabled: true,
      featured: true,
      image: gheeRoastImage.id,
      mark: '✦',
      name: 'Ghee Roast',
      shortDescription: 'Coastal flavours. Bold and soulful. South Indian cuisine celebrated with modern design and pride.',
      sortOrder: 1,
      tenant: gheeRoastTenant?.id,
      websiteUrl: '/brands#ghee',
    },
    {
      category: 'Quick Service & Delivery',
      enabled: true,
      featured: true,
      image: zQuickImage.id,
      mark: '⬡⬡',
      name: 'Z-Quick',
      shortDescription: 'Great taste. Made fast. Made for now. Premium delivery-first brand built for the modern urban consumer.',
      sortOrder: 2,
      websiteUrl: '/brands#quick',
    },
    {
      category: "What's Next",
      comingSoon: true,
      enabled: true,
      featured: true,
      mark: '+',
      name: 'Future Brands',
      shortDescription: "More experiences coming soon. We're always building what's next in hospitality.",
      sortOrder: 3,
      websiteUrl: '/brands#future',
    },
  ] as const

  let brandsCreated = 0
  let brandsUpdated = 0
  const brandsSkipped = 0
  for (const spec of brandSpecs) {
    const existing = await findFirst(payload, 'brands', {
      and: [{ tenantId: { equals: tenantId } }, { name: { equals: spec.name } }],
    })
    const data = { ...spec, tenantId }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'brands', data, overrideAccess: true, user })
      brandsUpdated += 1
    } else {
      await payload.create({ collection: 'brands', data, overrideAccess: true, user })
      brandsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Testimonials
  // ---------------------------------------------------------------------------
  const testimonialSpecs = [
    {
      customerName: 'Rajiv Kumar',
      customerRole: 'Founder, Makhani House',
      isFeatured: true,
      rating: 5,
      review: "Curious Ladoo didn't just design our restaurant — they built us a business. The systems they put in place made scaling to three locations feel effortless.",
      sortOrder: 0,
    },
    {
      customerName: 'Sunita Patel',
      customerRole: 'Director, The Coastal Table',
      isFeatured: true,
      rating: 5,
      review: 'Their menu engineering approach transformed our profitability without compromising what guests loved. Revenue up 40% in six months post-redesign.',
      sortOrder: 1,
    },
    {
      customerName: 'Arjun Mehta',
      customerRole: 'Franchise Partner, Zuru Zuru',
      isFeatured: true,
      rating: 5,
      review: 'As a franchise partner, the support from CL has been exceptional. Their systems are airtight, and their team genuinely cares about your success.',
      sortOrder: 2,
    },
  ] as const

  let testimonialsCreated = 0
  let testimonialsUpdated = 0
  const testimonialsSkipped = 0
  for (const spec of testimonialSpecs) {
    const existing = await findFirst(payload, 'testimonials', {
      and: [{ tenantId: { equals: tenantId } }, { customerName: { equals: spec.customerName } }],
    })
    const data = { ...spec, tenantId }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'testimonials', data, overrideAccess: true, user })
      testimonialsUpdated += 1
    } else {
      await payload.create({ collection: 'testimonials', data, overrideAccess: true, user })
      testimonialsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Team Members
  // ---------------------------------------------------------------------------
  const teamSpecs = [
    {
      bio: '15 years in hospitality across India and Southeast Asia. Serial brand builder. Passionate about systems that outlast founders.',
      isActive: true,
      photo: leaderArjunImage.id,
      role: 'Founder & CEO',
      sortOrder: 0,
      title: 'Arjun Rao',
    },
    {
      bio: 'Brand strategist with deep roots in luxury hospitality. Led identity projects for over 30 F&B brands across South Asia.',
      isActive: true,
      photo: leaderPriyaImage.id,
      role: 'Chief Brand Officer',
      sortOrder: 1,
      title: 'Priya Malhotra',
    },
    {
      bio: 'Operations specialist with a systems-first mindset. Built SOPs used by 20+ restaurant brands across 8 cities.',
      isActive: true,
      photo: leaderSiddharthImage.id,
      role: 'Head of Operations',
      sortOrder: 2,
      title: 'Siddharth Kumar',
    },
  ] as const

  let teamCreated = 0
  let teamUpdated = 0
  const teamSkipped = 0
  for (const spec of teamSpecs) {
    const existing = await findFirst(payload, 'teammembers', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = { ...spec, tenantId }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'teammembers', data, overrideAccess: true, user })
      teamUpdated += 1
    } else {
      await payload.create({ collection: 'teammembers', data, overrideAccess: true, user })
      teamCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Blog Posts (Journal)
  // ---------------------------------------------------------------------------
  const blogSpecs = [
    {
      excerpt: "Most restaurants fail not because of bad food, but because of bad processes. Here's how systemizing your operations builds a business that outlasts any one chef.",
      heroImage: journal1Image.id,
      isFeatured: true,
      publishedDate: new Date('2025-06-01T00:00:00.000Z').toISOString(),
      status: 'published' as const,
      _status: 'published' as const,
      tags: ['Operations'],
      title: 'Why Systems Beat Talent Every Time in Restaurants',
    },
    {
      excerpt: 'Indian cuisine is having a global moment. How domestic hospitality brands can position themselves to lead the next decade.',
      heroImage: journal2Image.id,
      isFeatured: false,
      publishedDate: new Date('2025-05-01T00:00:00.000Z').toISOString(),
      status: 'published' as const,
      _status: 'published' as const,
      tags: ['Culture'],
      title: 'The Future of Dining in India',
    },
    {
      excerpt: "Great restaurant design isn't about aesthetics alone. It's about engineering emotion, memory, and the desire to return.",
      heroImage: journal3Image.id,
      isFeatured: false,
      publishedDate: new Date('2025-04-01T00:00:00.000Z').toISOString(),
      status: 'published' as const,
      _status: 'published' as const,
      tags: ['Design'],
      title: 'Designing Places People Remember',
    },
  ]

  let blogCreated = 0
  let blogUpdated = 0
  const blogSkipped = 0
  const blogPostIds: (number | string)[] = []
  for (const spec of blogSpecs) {
    const existing = await findFirst(payload, 'blog-posts', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = {
      ...spec,
      content: richTextFromParagraphs([spec.excerpt]),
      tenantId,
    }
    if (existing) {
      const updated = await payload.update({ id: existing.id, collection: 'blog-posts', data, overrideAccess: true, user })
      blogPostIds.push(updated.id)
      blogUpdated += 1
    } else {
      const created = await payload.create({ collection: 'blog-posts', data, overrideAccess: true, user })
      blogPostIds.push(created.id)
      blogCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Home Page layout (exact designer section order)
  // ---------------------------------------------------------------------------
  const layout: HomeLayout = [
    {
      blockType: 'heroBlock' as const,
      description: 'A hospitality company for a different kind of future. We build restaurant brands with curiosity, systems and soul.',
      enabled: true,
      foregroundImage: heroImage.id,
      heading: "We question. We design.",
      highlightedHeading: "We build what's next.",
      imageAlt: 'Restaurant interior with editorial design elements',
      primaryCTALabel: 'Explore Our Work',
      primaryCTAURL: '/#services',
      secondaryCTALabel: "Let's Collaborate",
      secondaryCTAURL: '/#cta',
    },
    {
      blockType: 'tickerBlock' as const,
      items: [
        { icon: '◈', name: 'Cloud Kitchen', description: 'Delivery-first · Systems that scale.' },
        { icon: '九小', name: 'Zuru Zuru', description: 'Japanese Izakaya · Comfort food. Good times.' },
        { icon: '✦', iconStyle: '1.4rem', name: 'Ghee Roast', description: 'South Indian Cuisine · Coastal flavours. Bold & soulful.' },
        { icon: '⬡⬡', name: 'Z-Quick', description: 'Quick service · Great taste. Made for now.' },
        { icon: '+', name: 'Future Brands', description: "What's next · More experiences coming soon." },
        { icon: 'CL', iconStyle: '0.9rem', name: 'Consulting', description: 'Strategy · Brand · Operations' },
      ],
    },
    {
      blockType: 'storyBlock' as const,
      layout: 'panel' as const,
      eyebrow: 'Hospitality Reimagined',
      title: "We don't just open restaurants. We build systems.",
      accentPhrase: 'build systems.',
      quote: 'Curious by nature. Deliberate by design. Enduring by systems.',
      body: 'Curious Ladoo is a multi-service hospitality group based in New Delhi. We own and operate restaurant brands, provide B2B consulting, design menus, build cloud kitchens, and help other hospitality businesses scale through systems, technology, and training.',
      media: aboutMainImage.id,
      secondaryMedia: journal1Image.id,
      mediaAlt: 'Premium restaurant interior by Curious Ladoo',
      imagePosition: 'right' as const,
      statBadge: { enabled: true, value: '15+', label: 'Hospitality Services' },
      enableCta: true,
      cta: { type: 'anchor' as const, label: 'Explore All Services', url: '#services' },
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'pillars' as const,
      sectionHeader: {
        eyebrow: 'Our Philosophy',
        title: 'How We Think.',
        subtitle: 'Think.',
        description: 'We build at the intersection of curiosity, creativity, and conviction. Thoughtful systems. Human experiences. Enduring brands.',
      },
      items: [
        { icon: 'question', title: 'Question', description: 'Curiosity drives better ideas. We question assumptions before we design solutions.' },
        { icon: 'design', title: 'Design', description: 'Intentional design creates meaning. Experience first — always. Spaces that shape behaviour.' },
        { icon: 'build', title: 'Build', description: 'Systems bring clarity. People bring life. We build processes that create consistency at scale.' },
        { icon: 'people', title: 'People', description: "Culture builds what strategy can't. We invest in people at every level of the hospitality ecosystem." },
        { icon: 'care', title: 'Care', description: 'Hospitality is at our core — always. Every brand we build is rooted in genuine human care.' },
      ],
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'services' as const,
      sectionHeader: {
        eyebrow: 'What We Offer',
        title: '15 Services. One Vision.',
        subtitle: 'One Vision.',
        description: 'From concept to operations, from brand strategy to kitchen planning — our services are built for the future of hospitality in India and beyond.',
      },
      items: [
        { icon: 'restaurant-brands', title: 'Restaurant Brands', description: 'We create and operate distinct restaurant brands with unique identities, menus, and guest experiences.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'delivery', title: 'Delivery Services', description: 'Premium delivery operations with efficient cloud kitchen infrastructure and logistics management.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'cloud-kitchen', title: 'Cloud Kitchen', description: 'Delivery-first kitchen models designed for maximum efficiency, scalability, and brand consistency.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'consulting', title: 'Hospitality Consulting', description: 'Strategic consulting for restaurant launches, turnarounds, SOP development, and growth planning.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'menu-engineering', title: 'Menu Engineering', description: 'Data-driven menu design that balances profitability, guest preference, and culinary excellence.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'restaurant-design', title: 'Restaurant Design', description: 'Interior concepts and spatial planning that create environments guests return to again and again.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'brand-strategy', title: 'Brand Strategy', description: 'Full brand architecture — from naming and identity to positioning, tone of voice, and visual language.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'operations', title: 'Operations Management', description: 'SOPs, training frameworks, quality control systems, and ongoing operational support for teams.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'franchise', title: 'Franchise Development', description: 'Complete franchise systems — model development, documentation, partner selection, and launch support.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'kitchen-planning', title: 'Kitchen Planning', description: 'Commercial kitchen design, equipment planning, workflow optimization, and compliance guidance.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'technology', title: 'Technology Solutions', description: 'POS systems, inventory management, analytics dashboards, and digital ordering integrations.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'staff-training', title: 'Staff Training', description: 'Comprehensive training programs for FOH, BOH, management, and hospitality service standards.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'investment', title: 'Investment Partnerships', description: 'Strategic investment in promising hospitality concepts — from seed to scale with full operational support.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'managed-services', title: 'Managed Services', description: 'End-to-end restaurant management for operators who want professional systems without the overhead.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
        { icon: 'new-brand', title: 'New Brand Development', description: 'Full-cycle concept creation — market research, naming, identity, menu, design, and launch strategy.', enableLink: true, link: { type: 'custom', label: 'Explore', url: '/services' } },
      ],
    },
    {
      blockType: 'brandsshowcaseBlock' as const,
      sectionHeader: {
        eyebrow: 'Restaurant Brands',
        title: 'Distinct Identities. Shared Principles.',
        subtitle: 'Shared Principles.',
      },
      brands: [],
      limit: 4,
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'b2b' as const,
      sectionHeader: {
        eyebrow: 'Partner With Us',
        title: 'B2B Solutions.',
        subtitle: 'Solutions.',
        description: "We're always open to conversations with investors, franchise partners, landlords, and suppliers who share our vision for the future of hospitality.",
      },
      items: [
        { icon: 'investors', title: 'Investors', description: 'Strategic investment in our brands and new concepts. We co-create with partners who bring capital and conviction.', enableLink: true, link: { type: 'email', label: 'Build With Us', url: 'hello@curiousladoo.com' } },
        { icon: 'franchise-partners', title: 'Franchise Partners', description: 'Grow with proven brands. Our franchise model comes with full systems, training, and ongoing operational support.', enableLink: true, link: { type: 'email', label: 'Grow With Us', url: 'hello@curiousladoo.com' } },
        { icon: 'landlords', title: 'Landlords & Spaces', description: "We're looking for premium locations across India. Retail spaces, high streets, and mixed-use developments.", enableLink: true, link: { type: 'email', label: 'Partner With Us', url: 'hello@curiousladoo.com' } },
        { icon: 'suppliers', title: 'Suppliers & Vendors', description: 'Quality ingredients, equipment, and services — we work with suppliers who share our commitment to excellence.', enableLink: true, link: { type: 'email', label: 'Work With Us', url: 'hello@curiousladoo.com' } },
      ],
    },
    {
      blockType: 'stepsBlock' as const,
      layoutVariant: 'numbered-steps' as const,
      presentation: 'cards' as const,
      sectionHeader: {
        eyebrow: 'Our Process',
        title: 'How We Build',
        description: "Every successful hospitality brand is built on a repeatable, intentional process. Here's ours.",
      },
      steps: [
        { label: '01', title: 'Discover', description: 'Deep dive into market, location, competition, and consumer insight. Curiosity first.' },
        { label: '02', title: 'Concept', description: 'Brand identity, menu direction, interior language, and guest experience story.' },
        { label: '03', title: 'Build', description: 'Kitchen planning, team recruitment, SOP development, technology setup, and design execution.' },
        { label: '04', title: 'Launch', description: 'Soft launch, feedback integration, team training, media strategy, and community building.' },
        { label: '05', title: 'Scale', description: 'Franchise development, multi-city expansion, brand licensing, and investor partnerships.' },
      ],
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'edge' as const,
      media: { item: edgeImage.id },
      mediaPosition: 'left' as const,
      sectionHeader: {
        eyebrow: 'Why Choose Us',
        title: 'Our Difference.',
        subtitle: 'Difference.',
      },
      items: [
        { icon: '◈', title: 'Systems-First Thinking', description: 'We build processes before aesthetics. Every brand is backed by SOPs, training, and technology.' },
        { icon: '✦', title: 'Design-Led Experience', description: 'Every touchpoint is intentionally designed — from signage to staff uniforms to plate presentation.' },
        { icon: '∞', title: 'Future-Ready Infrastructure', description: 'Our technology and systems are built to scale across cities, formats, and new service categories.' },
        { icon: '◯', title: 'Human at the Core', description: 'Behind every system is a culture of care. Our people are our most important brand asset.' },
      ],
    },
    {
      blockType: 'statsBlock' as const,
      presentation: 'cards' as const,
      sectionHeader: { title: 'Our Achievements' },
      stats: [
        { value: '15+', label: 'Hospitality Services', animatedTarget: 15, animatedSuffix: '+' },
        { value: '3', label: 'Restaurant Brands', animatedTarget: 3, animatedSuffix: '' },
        { value: '50+', label: 'B2B Partners', animatedTarget: 50, animatedSuffix: '+' },
        { value: '5+', label: 'Cities Active', animatedTarget: 5, animatedSuffix: '+' },
      ],
    },
    {
      blockType: 'storyBlock' as const,
      layout: 'overlay' as const,
      quote: "We don't just run restaurants.\nWe build hospitality businesses.",
      attribution: '— CL Philosophy',
      overlayMedia: visualStoryImage.id,
      mediaAlt: 'Cinematic restaurant atmosphere — Curious Ladoo',
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'industries' as const,
      sectionHeader: {
        eyebrow: 'Scope of Work',
        title: 'Industries We Serve.',
        subtitle: 'Serve.',
      },
      items: [
        { icon: '🍜', title: 'Full Service Restaurants', description: 'Dine-in experiences with rich brand identities' },
        { icon: '📦', title: 'Cloud Kitchens', description: 'Delivery-first, multi-brand ghost kitchens' },
        { icon: '🏨', title: 'Hotels & Resorts', description: 'F&B consulting for hospitality properties' },
        { icon: '🏢', title: 'Corporate Catering', description: 'Office and institutional dining solutions' },
        { icon: '🚀', title: 'QSR & Fast Casual', description: 'Quick service formats with brand premium' },
        { icon: '🎪', title: 'Events & Pop-ups', description: 'Temporary hospitality experiences and venues' },
        { icon: '📊', title: 'F&B Investors', description: 'Strategic advisory for F&B investment portfolios' },
        { icon: '🏗️', title: 'Real Estate & Malls', description: 'F&B zone planning for commercial properties' },
      ],
    },
    {
      blockType: 'testimonialsBlock' as const,
      presentation: 'cards' as const,
      source: 'collection' as const,
      featuredOnly: true,
      limit: 3,
      sectionHeader: {
        eyebrow: 'Client Stories',
        title: 'Voices That Trust Us.',
        subtitle: 'Trust Us.',
      },
    },
    {
      blockType: 'blogpreviewBlock' as const,
      source: 'collection' as const,
      featuredOnly: false,
      limit: 3,
      sectionHeader: {
        eyebrow: 'From Our Journal',
        title: 'Ideas & Insights.',
        subtitle: 'Insights.',
      },
    },
    {
      blockType: 'teamBlock' as const,
      members: [],
      limit: 3,
      sectionHeader: {
        eyebrow: 'The People',
        title: 'Meet Our Leaders.',
        subtitle: 'Leaders.',
        description: 'Curious minds. Deliberate builders. Hospitality obsessives.',
      },
    },
    {
      blockType: 'stepsBlock' as const,
      layoutVariant: 'timeline' as const,
      presentation: 'cards' as const,
      sectionHeader: {
        eyebrow: 'Our Journey',
        title: 'From Curious to Category-Defining.',
        subtitle: 'Category-Defining.',
      },
      steps: [
        { label: '2020', title: 'Founded', description: 'Curious Ladoo established with a single restaurant consulting project and a big vision.' },
        { label: '2021', title: 'Zuru Zuru Launched', description: 'Our first restaurant brand opens in New Delhi to immediate critical acclaim.' },
        { label: '2022', title: 'Ghee Roast Opens', description: 'South Indian brand launches; franchise enquiries begin within 60 days of opening.' },
        { label: '2023', title: 'B2B Division', description: 'CL Consulting officially launched. 20+ clients in Year 1. Z-Quick delivery brand goes live.' },
        { label: '2025+', title: 'Scale & Expand', description: 'Multi-city franchise rollout, 5+ new brands in development, technology platform launch.' },
      ],
    },
    {
      blockType: 'contentgridBlock' as const,
      presentation: 'partners' as const,
      sectionHeader: {
        eyebrow: 'Partners & Collaborators',
        title: 'Built With Great People.',
        subtitle: 'Great People.',
      },
      items: [
        { title: 'Zuru Zuru' },
        { title: 'Ghee Roast' },
        { title: 'Z-Quick' },
        { title: 'NRAI' },
        { title: 'India Food Forum' },
        { title: 'Swiggy' },
        { title: 'Zomato' },
        { title: 'Future Brands' },
      ],
    },
    {
      blockType: 'ctaBlock' as const,
      sectionHeader: {
        eyebrow: "Let's Build Together",
        title: 'Ready to Build Something Remarkable?',
        subtitle: 'Remarkable?',
        description: "Whether you're an investor, franchise partner, aspiring restaurateur, or a hospitality brand looking to scale — we'd love to hear from you.",
      },
      ctaGroup: {
        alignment: 'left' as const,
        enablePrimary: true,
        enableSecondary: true,
        primaryCTA: { type: 'email' as const, label: 'hello@curiousladoo.com', url: 'hello@curiousladoo.com' },
        secondaryCTA: { type: 'custom' as const, label: 'Our Process', url: '/how-we-work' },
      },
    },
  ]

  const existingHomePage = await findFirst(payload, 'pages', {
    and: [{ tenantId: { equals: tenantId } }, { isHomePage: { equals: true } }],
  })
  const homePageData = {
    _status: 'published' as const,
    isHomePage: true,
    layout,
    metaDescription: 'Curious Ladoo is a premium hospitality group building restaurant brands, consulting services, cloud kitchens, and hospitality systems across India.',
    metaTitle: "Curious Ladoo — We Build Hospitality That Lasts",
    pageType: 'home' as const,
    publishedAt: new Date().toISOString(),
    tenantId,
    title: 'Curious Ladoo Home',
  }
  const homePage = existingHomePage
    ? await payload.update({ id: existingHomePage.id, collection: 'pages', data: homePageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: homePageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo Home seed completed.')

  return {
    brands: { created: brandsCreated, skipped: brandsSkipped, updated: brandsUpdated },
    blogPosts: { created: blogCreated, skipped: blogSkipped, updated: blogUpdated },
    homePage: {
      blockCount: layout.length,
      id: homePage.id,
      status: existingHomePage ? 'updated' : 'created',
    },
    media: { created: mediaCreated, reused: mediaReused },
    teamMembers: { created: teamCreated, skipped: teamSkipped, updated: teamUpdated },
    testimonials: { created: testimonialsCreated, skipped: testimonialsSkipped, updated: testimonialsUpdated },
  }
}
