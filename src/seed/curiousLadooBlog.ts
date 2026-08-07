import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type BlogIndexLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooBlogSeedResult = {
  blogIndexPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
  siteSettingsNewsletter: 'skipped' | 'updated'
  blogPosts: { created: number; skipped: number; updated: number }
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

export async function seedCuriousLadooBlogContent(
  payload: Payload,
): Promise<CuriousLadooBlogSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo Blog seed as.')
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
  // Media — 4 new uploads, 3 reused from Milestone 4's Home seed.
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

  const [consultingImage, culinaryArtImage, zuruZuruImage, zquickImage] = await Promise.all([
    upload({ alt: 'SOP auditing process details', sourcePath: 'themes/curious-hub/images/consulting.png', title: 'consulting.png' }),
    upload({ alt: 'Plated modern Indian dessert cost auditing', sourcePath: 'themes/curious-hub/images/culinary_art.png', title: 'culinary_art.png' }),
    upload({ alt: 'Zuru Zuru Japanese food concept', sourcePath: 'themes/curious-hub/images/zuru_zuru.png', title: 'zuru_zuru.png' }),
    upload({ alt: 'Z-Quick QSR delivery dispatch systems', sourcePath: 'themes/curious-hub/images/zquick.png', title: 'zquick.png' }),
  ])

  // ---------------------------------------------------------------------------
  // Site Settings — the blog page's newsletter box reads the shared, global
  // `newsletter` group. Nothing else in the Curious Ladoo theme currently
  // renders it, so overwriting it with the blog page's exact original copy is
  // safe. Partial update: only `newsletter` is touched — every other Site
  // Settings field (hours, socials, analytics, etc.) is left untouched by
  // Payload's partial-update semantics, matching the Milestone 13 precedent.
  // ---------------------------------------------------------------------------
  const existingSettings = await findFirst(payload, 'site-settings', { tenantId: { equals: tenantId } })
  let siteSettingsNewsletter: CuriousLadooBlogSeedResult['siteSettingsNewsletter'] = 'skipped'
  if (existingSettings) {
    await payload.update({
      id: existingSettings.id,
      collection: 'site-settings',
      data: {
        newsletter: {
          enabled: true,
          title: 'Receive F&B Operational Reports',
          description: 'Join our mailing list to receive quarterly research insights, cost benchmarks, and F&B templates.',
          placeholder: 'Enter your business email',
          buttonLabel: 'Subscribe →',
          successMessage: 'Thank you for subscribing! Our next report will arrive in your inbox soon.',
          errorMessage: 'We could not save your subscription. Please try again later.',
        },
      },
      overrideAccess: true,
      user,
    })
    siteSettingsNewsletter = 'updated'
  }

  // ---------------------------------------------------------------------------
  // Blog posts. The first 3 (Why Systems Beat Talent / The Future of Dining in
  // India / Designing Places People Remember) already exist from Milestone 4's
  // Home seed and are shared with Home's "Latest from the Journal" preview
  // (blogpreviewBlock, presentation: 'preview', source: 'collection', limit: 3,
  // sorted by -publishedDate). We only ADD detail-page-relevant fields to those
  // three (isPinned, metaTitle, a fuller article body) — never touching
  // title/slug/excerpt/heroImage/publishedDate/categories/tags, so Home's
  // rendered output (which reads exactly those untouched fields) cannot change.
  // The 4 new posts below all use publishedDate values older than the existing
  // three's oldest (2025-04-01), so they never displace them from Home's
  // limit-3 auto-pool — confirmed via the loader's existing -publishedDate sort.
  // ---------------------------------------------------------------------------
  const blogSpecs = [
    {
      title: 'Why Systems Beat Talent Every Time in Restaurants',
      isPinned: true,
      content: richTextFromParagraphs([
        "Most independent restaurants fail not because of culinary shortcomings, but because of poor operational modeling. A brilliant chef can carry a kitchen for a season, but the moment they leave, so does the consistency guests came back for.",
        'We dissect how documenting standard operating procedures (SOPs) creates consistency that chef changes can never disrupt — covering prep checklists, portion cards, plating references, and the escalation paths that keep a line moving during a Friday-night rush.',
        "The restaurants that scale past a single location are, almost without exception, the ones that treated their kitchen like a system to be engineered rather than a talent to be hired. That shift in mindset is the single highest-leverage decision an operator can make.",
      ]),
      relatedTitles: ['SOPs: The Secret to Multi-City Scaling', 'Understanding Portion Control Metrics'],
    },
    {
      title: 'The Future of Dining in India',
      isPinned: false,
      content: richTextFromParagraphs([
        'Indian cuisine is having a global moment. Regional flavours once confined to home kitchens are now the basis of ambitious concept restaurants across metros, and international audiences are following closely behind.',
        'How domestic hospitality brands can position themselves to lead the next decade comes down to three levers: authenticity that resists dilution, operational systems that travel well across cities, and a brand identity confident enough to lead rather than imitate global formats.',
        "We expect the next wave of category-defining Indian F&B brands to come from operators who treat regional cuisine as a design constraint to build around, not a limitation to design away from.",
      ]),
      relatedTitles: ['Izakaya Culture Meets the Indian Palate'],
    },
    {
      title: 'Designing Places People Remember',
      isPinned: false,
      content: richTextFromParagraphs([
        "Physical design is a spatial strategy, not decoration. Every material choice, sightline, and acoustic decision either draws a guest back or quietly pushes them toward a competitor.",
        'We outline how furniture layouts, lighting warmth parameters, and acoustic controls shape guest retention and cover rotations — the same variables hospitality groups spend the least time engineering, despite them driving some of the largest swings in repeat-visit rate.',
        'Good design is measurable. We treat every dining room the way we treat a menu: something to be tested, iterated, and optimized against real guest behaviour, not just aesthetic instinct.',
      ]),
      relatedTitles: [],
    },
    {
      title: 'SOPs: The Secret to Multi-City Scaling',
      heroImage: consultingImage.id,
      categories: ['Operations'],
      tags: ['Operations'],
      publishedDate: new Date('2025-03-01T00:00:00.000Z').toISOString(),
      excerpt: 'How central supply agreements and precise step-by-step training manuals protect brand consistency when launching franchise outlets across multiple states.',
      isPinned: false,
      content: richTextFromParagraphs([
        'How central supply agreements and precise step-by-step training manuals protect brand consistency when launching franchise outlets across multiple states.',
        'Every SKU, every prep step, and every plating reference needs to survive translation across a supply chain that no longer runs through a single kitchen. That means writing SOPs specific enough to train a new hire in a city you have never visited, yet flexible enough to absorb regional ingredient substitutions without breaking the guest experience.',
        'Central supply agreements do the rest — locking in the ingredients that must never vary, while leaving room for local sourcing on everything that safely can.',
      ]),
      relatedTitles: ['Why Systems Beat Talent Every Time in Restaurants', 'Understanding Portion Control Metrics'],
    },
    {
      title: 'Understanding Portion Control Metrics',
      heroImage: culinaryArtImage.id,
      categories: ['Engineering'],
      tags: ['Engineering'],
      publishedDate: new Date('2025-02-01T00:00:00.000Z').toISOString(),
      excerpt: 'Standardizing recipes to the gram ensures cost controls. We showcase how portion costing software models protect profit margins from rising inflation.',
      isPinned: false,
      content: richTextFromParagraphs([
        'Standardizing recipes to the gram ensures cost controls. We showcase how portion costing software models protect profit margins from rising inflation.',
        "A dish that isn't costed to the gram is a dish whose margin drifts every time an ingredient price moves. Portion control turns that drift into a controllable input — one that a kitchen manager can audit weekly instead of discovering at quarter-end.",
        'The operators who weather ingredient inflation best are rarely the ones who renegotiate hardest with suppliers. They are the ones whose recipes were engineered tightly enough that a 12% cost spike on one ingredient never threatens the whole dish.',
      ]),
      relatedTitles: ['SOPs: The Secret to Multi-City Scaling'],
    },
    {
      title: 'Izakaya Culture Meets the Indian Palate',
      heroImage: zuruZuruImage.id,
      categories: ['Culture'],
      tags: ['Culture'],
      publishedDate: new Date('2025-01-01T00:00:00.000Z').toISOString(),
      excerpt: 'A study of how Japanese comfort dining elements were re-contextualized with highball variations to match seasoning expectations in Mumbai and Delhi complexes.',
      isPinned: false,
      content: richTextFromParagraphs([
        'A study of how Japanese comfort dining elements were re-contextualized with highball variations to match seasoning expectations in Mumbai and Delhi complexes.',
        'Izakaya format brings small, shareable plates and a slower, conversation-first pace — both of which travel well into the Indian dining-out habit. The seasoning profile is where the real re-engineering happens: heat and tang calibrated to local palates without losing the format\'s essential restraint.',
        'Zuru Zuru\'s own menu development treated this as a translation exercise, not a fusion gimmick — keeping the format honest while making the flavours legible to a first-time guest.',
      ]),
      relatedTitles: ['The Future of Dining in India'],
    },
    {
      title: 'Optimizing Cloud Kitchen Dispatch Flows',
      heroImage: zquickImage.id,
      categories: ['Operations'],
      tags: ['Operations'],
      publishedDate: new Date('2024-12-01T00:00:00.000Z').toISOString(),
      excerpt: 'Thermal ventilation boxes, prep queue buffers, and dispatch algorithms — how delivery brands maintain restaurant-grade quality during traffic delays.',
      isPinned: false,
      content: richTextFromParagraphs([
        'Thermal ventilation boxes, prep queue buffers, and dispatch algorithms — how delivery brands maintain restaurant-grade quality during traffic delays.',
        'Dispatch timing is a quality variable most delivery brands under-invest in. A perfectly cooked dish sitting in the wrong packaging for eleven extra minutes arrives as a mediocre one — no amount of kitchen skill recovers that loss once the rider is on the road.',
        'We model prep-queue buffers against live traffic data so the kitchen fires a dish exactly late enough to hit the rider\'s arrival window hot, not early enough to steam in the box.',
      ]),
      relatedTitles: ['SOPs: The Secret to Multi-City Scaling'],
    },
  ]

  let blogCreated = 0
  let blogUpdated = 0
  const blogSkipped = 0
  const blogPostIdsByTitle = new Map<string, number>()
  for (const spec of blogSpecs) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured out so it never reaches payload.create/update's `data`; used via `spec.relatedTitles` in the second pass below.
    const { relatedTitles, ...specFields } = spec
    const existing = await findFirst(payload, 'blog-posts', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = { ...specFields, status: 'published' as const, _status: 'published' as const, tenantId }
    if (existing) {
      const updated = await payload.update({ id: existing.id, collection: 'blog-posts', data, overrideAccess: true, user })
      blogPostIdsByTitle.set(spec.title, updated.id)
      blogUpdated += 1
    } else {
      const created = await payload.create({ collection: 'blog-posts', data, overrideAccess: true, user })
      blogPostIdsByTitle.set(spec.title, created.id)
      blogCreated += 1
    }
  }

  // Second pass: relatedPosts references need every post's id resolved first.
  for (const spec of blogSpecs) {
    if (spec.relatedTitles.length === 0) continue
    const postId = blogPostIdsByTitle.get(spec.title)
    const relatedIds = spec.relatedTitles
      .map((title) => blogPostIdsByTitle.get(title))
      .filter((id): id is number => typeof id === 'number')
    if (postId && relatedIds.length > 0) {
      await payload.update({ id: postId, collection: 'blog-posts', data: { relatedPosts: relatedIds }, overrideAccess: true, user })
    }
  }

  // ---------------------------------------------------------------------------
  // Blog Index Page layout (hero + blogpreviewBlock[presentation: 'index'])
  // ---------------------------------------------------------------------------
  const layout: BlogIndexLayout = [
    {
      blockType: 'heroBlock' as const,
      eyebrow: 'The Journal',
      heading: 'Ideas, Reports & F&B Insights',
      description: 'We document our findings in hospitality systems. Read our detailed reports on food cost control, portion metrics, and visual design parameters.',
    },
    {
      blockType: 'blogpreviewBlock' as const,
      presentation: 'index' as const,
      source: 'collection' as const,
      sectionHeader: { title: 'Journal' },
    },
  ]

  const existingBlogIndexPage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenantId } },
      { slug: { equals: 'blog' } },
      { isHomePage: { equals: false } },
    ],
  })
  const blogIndexPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Read F&B operational research, menu engineering reports, and restaurant design insights from the Curious Ladoo journal.',
    metaTitle: 'Insights & Journal — Curious Ladoo',
    pageType: 'blog-index' as const,
    publishedAt: new Date().toISOString(),
    slug: 'blog',
    tenantId,
    title: 'Curious Ladoo Journal',
  }
  const blogIndexPage = existingBlogIndexPage
    ? await payload.update({ id: existingBlogIndexPage.id, collection: 'pages', data: blogIndexPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: blogIndexPageData, overrideAccess: true, user })

  payload.logger.info('Curious Ladoo Blog seed completed.')

  return {
    blogIndexPage: {
      blockCount: layout.length,
      id: blogIndexPage.id,
      status: existingBlogIndexPage ? 'updated' : 'created',
    },
    blogPosts: { created: blogCreated, skipped: blogSkipped, updated: blogUpdated },
    media: { created: mediaCreated, reused: mediaReused },
    siteSettingsNewsletter,
  }
}
