import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type PageLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruGroupBPagesSeedResult = {
  blogPosts: { created: number; updated: number }
  events: { created: number; updated: number }
  locations: { created: number; reused: number; updated: number }
  media: { created: number; reused: number }
  pages: Record<string, { blockCount: number; id: number | string; status: 'created' | 'updated' }>
  subjectOptions: { added: string[] }
  teamMembers: { created: number; updated: number }
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

// ---------------------------------------------------------------------------
// Lexical rich-text document builder (same local pattern as every other Zuru Zuru / Curious
// Ladoo seed — headings/paragraphs render via Payload's own `<RichText>` component).
// ---------------------------------------------------------------------------

const paragraph = (text: string) => ({
  type: 'paragraph' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  children: [{ mode: 'normal' as const, text, type: 'text', version: 1, format: 0 }],
})

function richTextFromParagraphs(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      direction: null,
      version: 1,
      children: paragraphs.map(paragraph),
    },
  }
}

/**
 * Milestone Z7 — Group B: Chefs, Events, Locations, and Blog. Reuses the existing tenant and the
 * same 5 static images already uploaded by prior Zuru Zuru seeds. Also extends the Contact page's
 * formBlock with an "Event Inquiry" subject option (same technique as Group A's "Catering
 * Request"/"Partnership"), since Events' InquiryForm has no visible Subject selector.
 */
export async function seedZuruZuruGroupBPagesContent(payload: Payload): Promise<ZuruZuruGroupBPagesSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru Group B pages seed as.')
  }
  const user = superAdmin as User

  const tenant = await findFirst(payload, 'tenants', { slug: { equals: 'zuru-zuru' } })
  if (!tenant) {
    throw new Error(
      'Zuru Zuru tenant not found. Run the Milestone Z2 seed (db:seed:zuru-zuru-shell) first.',
    )
  }
  const tenantId = tenant.id

  // ---------------------------------------------------------------------------
  // Media — reuses the same static assets prior Zuru Zuru seeds already uploaded.
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

  const [chefImage, gyozaImage, heroRamenImage, heroSushiImage, interiorImage] = await Promise.all([
    upload({ alt: 'Zuru Zuru chef', sourcePath: 'themes/zuru-zuru/images/chef.png', title: 'chef.png' }),
    upload({ alt: 'Gyoza and tempura', sourcePath: 'themes/zuru-zuru/images/gyoza_tempura.png', title: 'gyoza_tempura.png' }),
    upload({ alt: 'Ramen bowl', sourcePath: 'themes/zuru-zuru/images/hero_ramen.png', title: 'hero_ramen.png' }),
    upload({ alt: 'Sushi platter', sourcePath: 'themes/zuru-zuru/images/hero_sushi.png', title: 'hero_sushi.png' }),
    upload({ alt: 'Zuru Zuru interior', sourcePath: 'themes/zuru-zuru/images/interior.png', title: 'interior.png' }),
  ])

  // ---------------------------------------------------------------------------
  // Extend the Contact page's formBlock.subjectOptions with "Event Inquiry".
  // ---------------------------------------------------------------------------
  const subjectsAdded: string[] = []
  const existingContactPage = await findFirst(payload, 'pages', {
    and: [{ tenantId: { equals: tenantId } }, { slug: { equals: 'contact' } }],
  })
  if (!existingContactPage) {
    throw new Error('Zuru Zuru Contact page not found. Run the Milestone Z6 seed (db:seed:zuru-zuru-contact-page) first.')
  }
  const fullContactPage = await payload.findByID({ id: existingContactPage.id, collection: 'pages', depth: 0, overrideAccess: true })
  const contactLayout = (fullContactPage.layout ?? []) as PageLayout
  const formBlockIndex = contactLayout.findIndex((block) => block.blockType === 'formBlock')
  if (formBlockIndex !== -1) {
    const formBlock = contactLayout[formBlockIndex] as Extract<PageLayout[number], { blockType: 'formBlock' }>
    const existingSubjects = new Set((formBlock.subjectOptions ?? []).map((option) => option.value))
    const additions = [{ label: 'Event Inquiry', value: 'Event Inquiry' }].filter((option) => !existingSubjects.has(option.value))
    if (additions.length > 0) {
      formBlock.subjectOptions = [...(formBlock.subjectOptions ?? []), ...additions]
      subjectsAdded.push(...additions.map((option) => option.value))
      await payload.update({
        id: existingContactPage.id,
        collection: 'pages',
        data: { layout: contactLayout },
        overrideAccess: true,
        user,
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Team members (Chefs page's "Culinary Masters" grid — same 4 chefs/images as the original)
  // ---------------------------------------------------------------------------
  const teamSpecs = [
    { bio: 'With an exceptional palate and a background in French-Japanese fusion, Chef Akira orchestrates the bustling kitchen with precision.', photo: chefImage.id, role: 'Chef de Cuisine', sortOrder: 0, title: 'Akira Mori' },
    { bio: 'Trained in Ginza for 12 years, Chef Haruka possesses an encyclopedic knowledge of seafood and delicate knife work.', photo: heroSushiImage.id, role: 'Sushi Master', sortOrder: 1, title: 'Haruka Suzuki' },
    { bio: 'Chef Daiki is the guardian of our broths, meticulously tending the stockpots to achieve richness and depth.', photo: heroRamenImage.id, role: 'Ramen Master', sortOrder: 2, title: 'Daiki Ito' },
    { bio: 'Chef Yumi blends matcha, yuzu, and black sesame with classic European pastry techniques.', photo: gyozaImage.id, role: 'Pastry Chef', sortOrder: 3, title: 'Yumi Yamada' },
  ]
  let teamCreated = 0
  let teamUpdated = 0
  for (const spec of teamSpecs) {
    const existing = await findFirst(payload, 'teammembers', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = { ...spec, isActive: true, tenantId }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'teammembers', data, overrideAccess: true, user })
      teamUpdated += 1
    } else {
      await payload.create({ collection: 'teammembers', data, overrideAccess: true, user })
      teamCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Events (Events page's "Upcoming Events" — the original's recurring "Every Friday, 8 PM" text
  // isn't representable on a single required `startsAt` date, so each event is seeded with one
  // concrete upcoming occurrence instead; there's also no category field, so the original's
  // Music/Tasting/Exclusive/Culture prefixes are dropped — both disclosed in the Z7 report.
  // ---------------------------------------------------------------------------
  const eventSpecs = [
    { description: 'Immerse yourself in the soulful sounds of live jazz while enjoying our signature cocktails and Izakaya bites. A perfect start to your weekend.', image: interiorImage.id, startsAt: '2026-08-14T20:00:00.000+05:30', summary: 'Live jazz and cocktails every Friday evening.', title: 'Live Tokyo Jazz' },
    { description: "Join our resident Sommelier for an exclusive journey through Japan's finest regional sakes, perfectly paired with seasonal Otsumami.", image: heroSushiImage.id, startsAt: '2026-08-15T19:00:00.000+05:30', summary: 'A guided tasting through Japan’s finest regional sakes.', title: 'Premium Sake Tasting' },
    { description: 'An intimate 12-course dining experience hosted by Executive Chef Kenji. Watch as he prepares seasonal delicacies right before your eyes.', image: chefImage.id, startsAt: '2026-08-25T19:30:00.000+05:30', summary: "An intimate 12-course omakase hosted by Executive Chef Kenji.", title: "Omakase Chef's Table" },
    { description: "We're transforming our patio into a vibrant Japanese summer festival! Enjoy yakitori stalls, takoyaki, games, and festive decorations.", endsAt: '2026-09-07T22:00:00.000+05:30', image: gyozaImage.id, startsAt: '2026-09-05T12:00:00.000+05:30', summary: 'A vibrant Japanese summer street-food festival on our patio.', title: 'Matsuri Street Food Festival' },
  ]
  let eventsCreated = 0
  let eventsUpdated = 0
  for (const spec of eventSpecs) {
    const existing = await findFirst(payload, 'events', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = { ...spec, locationName: 'Zuru Zuru Izakaya, New Delhi', status: 'published' as const, tenantId }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'events', data, overrideAccess: true, user })
      eventsUpdated += 1
    } else {
      await payload.create({ collection: 'events', data, overrideAccess: true, user })
      eventsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Locations (Locations page's 4-location grid). The flagship ("23 Shahpur Jat, New Delhi") was
  // seeded by Milestone Z3's Home seed and is reused as-is; only the 3 new branches are created
  // here. `phone` is left unset on all of them: `Locations.phone` validates as a 10-digit Indian
  // mobile number (see zuruZuruHome.ts), which the original's landline numbers don't satisfy — the
  // same pre-existing constraint already documented there, not a new Z7 gap. The original's status
  // badges ("Open Now" / "Coming Soon - Dec 2026") have no matching field anywhere on Location, so
  // (per the established content-configuration precedent) they're folded into `title`.
  // ---------------------------------------------------------------------------
  const locationSpecs = [
    {
      address: 'Zuru Zuru, Delhi, India 110049',
      businessHours: [
        { closeTime: '11:30 PM', day: 'Monday', isClosed: false, openTime: '11:00 AM' },
        { closeTime: '11:30 PM', day: 'Tuesday', isClosed: false, openTime: '11:00 AM' },
        { closeTime: '11:30 PM', day: 'Wednesday', isClosed: false, openTime: '11:00 AM' },
        { closeTime: '11:30 PM', day: 'Thursday', isClosed: false, openTime: '11:00 AM' },
        { closeTime: '11:30 PM', day: 'Friday', isClosed: false, openTime: '11:00 AM' },
        { closeTime: '11:30 PM', day: 'Saturday', isClosed: false, openTime: '11:00 AM' },
        { closeTime: '11:30 PM', day: 'Sunday', isClosed: false, openTime: '11:00 AM' },
      ],
      city: 'New Delhi',
      sortOrder: 1,
      title: 'Connaught Place, New Delhi — Open Now',
    },
    {
      address: 'Zuru Zuru, Delhi, India 110049',
      businessHours: [
        { closeTime: '12:00 AM', day: 'Monday', isClosed: false, openTime: '12:00 PM' },
        { closeTime: '12:00 AM', day: 'Tuesday', isClosed: false, openTime: '12:00 PM' },
        { closeTime: '12:00 AM', day: 'Wednesday', isClosed: false, openTime: '12:00 PM' },
        { closeTime: '12:00 AM', day: 'Thursday', isClosed: false, openTime: '12:00 PM' },
        { closeTime: '12:00 AM', day: 'Friday', isClosed: false, openTime: '12:00 PM' },
        { closeTime: '12:00 AM', day: 'Saturday', isClosed: false, openTime: '12:00 PM' },
        { closeTime: '12:00 AM', day: 'Sunday', isClosed: false, openTime: '12:00 PM' },
      ],
      city: 'Gurugram',
      sortOrder: 2,
      title: 'Cyber Hub, Gurugram — Open Now',
    },
    {
      address: 'Zuru Zuru, Delhi, India 110049',
      businessHours: [] as { closeTime: string; day: string; isClosed: boolean; openTime: string }[],
      city: 'Bengaluru',
      sortOrder: 3,
      title: 'Indiranagar, Bengaluru — Coming Soon (Dec 2026)',
    },
  ]
  let locationsCreated = 0
  let locationsUpdated = 0
  for (const spec of locationSpecs) {
    const existing = await findFirst(payload, 'locations', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = {
      ...spec,
      country: 'India',
      isActive: true,
      isPrimary: false,
      postalCode: '110049',
      showInFooter: false,
      showOnContact: false,
      showOnHome: false,
      tenantId,
    }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'locations', data, overrideAccess: true, user })
      locationsUpdated += 1
    } else {
      await payload.create({ collection: 'locations', data, overrideAccess: true, user })
      locationsCreated += 1
    }
  }
  const flagshipLocation = await findFirst(payload, 'locations', {
    and: [{ tenantId: { equals: tenantId } }, { title: { equals: '23 Shahpur Jat, New Delhi' } }],
  })
  const locationsReused = flagshipLocation ? 1 : 0

  // ---------------------------------------------------------------------------
  // Blog posts (Blog page's featured banner + 9-post grid). `readingTimeMinutes` is forcibly
  // recalculated to a hardcoded 2 by a pre-existing, out-of-scope beforeChange hook, so every
  // seeded post shows "2 Min Read" regardless of the value here — disclosed in the Z7 report.
  // `author` is left unset: BlogPosts.author is a strict relationship to real `users` accounts, and
  // there is no matching staff login for the original's fictional "Chef Hiroshi" byline.
  // ---------------------------------------------------------------------------
  const gridImages = [heroRamenImage, heroSushiImage, gyozaImage]
  const blogSpecs = [
    {
      categories: ['Behind the Scenes'],
      content: richTextFromParagraphs([
        'The secret to our signature ramen lies in the slow, meticulous simmering of pork bones over two full days.',
        'Discover the passion, precision, and traditional techniques that go into every bowl at Zuru Zuru.',
      ]),
      excerpt: 'The secret to our signature ramen lies in the slow, meticulous simmering of pork bones over two full days. Discover the passion, precision, and traditional techniques that go into every bowl at Zuru Zuru.',
      isPinned: true,
      publishedDate: '2026-10-12T00:00:00.000Z',
      title: 'Mastering the 48-Hour Tonkotsu Broth',
    },
    {
      categories: ['Recipes'],
      content: richTextFromParagraphs(['A rich, glossy shoyu tare is the backbone of a great bowl of ramen, built from soy sauce, mirin, and kombu simmered low and slow.', 'Our kitchen team walks through the ratios and timing that make it worth replicating at home.']),
      excerpt: 'Read More',
      publishedDate: '2026-09-28T00:00:00.000Z',
      title: 'Crafting the Perfect Shoyu Tare at Home',
    },
    {
      categories: ['Culture'],
      content: richTextFromParagraphs(['Sake pairing rewards curiosity more than expertise — a few simple rules about temperature and body go a long way.', 'Our sommelier shares the pairings that consistently surprise first-time guests.']),
      excerpt: 'Read More',
      publishedDate: '2026-09-15T00:00:00.000Z',
      title: "A Beginner's Guide to Japanese Sake Pairing",
    },
    {
      categories: ['Ingredients'],
      content: richTextFromParagraphs(['Every piece of tuna on our sushi counter is chosen the same morning it is served, following relationships built over a decade with a handful of trusted suppliers.', 'We trace that journey from dock to plate.']),
      excerpt: 'Read More',
      publishedDate: '2026-09-02T00:00:00.000Z',
      title: 'The Journey of Fresh Tuna: From Sea to Plate',
    },
    {
      categories: ['Desserts'],
      content: richTextFromParagraphs(['Ceremonial grade matcha is stone-ground from shade-grown leaves and never touches direct sunlight until harvest, giving it the vivid color and sweetness our dessert menu depends on.']),
      excerpt: 'Read More',
      publishedDate: '2026-08-20T00:00:00.000Z',
      title: 'Why Ceremonial Grade Matcha Matters',
    },
    {
      categories: ['Culture'],
      content: richTextFromParagraphs(['The Izakaya began as an informal stop for sake merchants and has since become a cornerstone of Japanese social life.', "We look at how the format has adapted without losing its unhurried, communal spirit."]),
      excerpt: 'Read More',
      publishedDate: '2026-08-11T00:00:00.000Z',
      title: 'The Evolution of the Izakaya in Modern Times',
    },
    {
      categories: ['Recipes'],
      content: richTextFromParagraphs(['Perfect yakitori comes down to consistent charcoal heat, precise skewering, and patience — rushing any of the three shows immediately in the char.', 'Our grill team breaks down the technique station by station.']),
      excerpt: 'Read More',
      publishedDate: '2026-07-29T00:00:00.000Z',
      title: 'Grilling Perfection: The Art of Yakitori',
    },
    {
      categories: ['Behind the Scenes'],
      content: richTextFromParagraphs(['Every dumpling on our menu is folded by hand each morning, a ritual our kitchen team treats as seriously as any other prep.', 'A single shift can fold well over a thousand.']),
      excerpt: 'Read More',
      publishedDate: '2026-07-15T00:00:00.000Z',
      title: 'Hand-folding 1,000 Gyoza Daily',
    },
    {
      categories: ['Ingredients'],
      content: richTextFromParagraphs(["Alkaline noodles get their signature bite from kansui, an alkaline mineral water that firms the wheat's gluten structure.", 'It is also what makes that satisfying slurp possible.']),
      excerpt: 'Read More',
      publishedDate: '2026-06-30T00:00:00.000Z',
      title: 'Alkaline Noodles and the Perfect Slurp',
    },
    {
      categories: ['Culture'],
      content: richTextFromParagraphs(['Omotenashi describes a form of hospitality anticipated before a guest ever has to ask for it.', 'We talk about how that philosophy shapes everything from our table settings to our service pacing.']),
      excerpt: 'Read More',
      publishedDate: '2026-06-18T00:00:00.000Z',
      title: 'Omotenashi: The Japanese Spirit of Hospitality',
    },
  ]
  let blogCreated = 0
  let blogUpdated = 0
  for (const [index, spec] of blogSpecs.entries()) {
    const existing = await findFirst(payload, 'blog-posts', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const heroImage = index === 0 ? undefined : gridImages[(index - 1) % gridImages.length].id
    const data = { ...spec, _status: 'published' as const, heroImage, status: 'published' as const, tenantId }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'blog-posts', data, overrideAccess: true, user })
      blogUpdated += 1
    } else {
      await payload.create({ collection: 'blog-posts', data, overrideAccess: true, user })
      blogCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Page upsert helper
  // ---------------------------------------------------------------------------
  const pages: ZuruZuruGroupBPagesSeedResult['pages'] = {}
  const upsertPage = async (slug: string, data: Record<string, unknown>) => {
    const existing = await findFirst(payload, 'pages', {
      and: [{ tenantId: { equals: tenantId } }, { slug: { equals: slug } }],
    })
    const layout = data.layout as PageLayout
    const doc = existing
      ? await payload.update({ id: existing.id, collection: 'pages', data: data as never, overrideAccess: true, user })
      : await payload.create({ collection: 'pages', data: data as never, overrideAccess: true, user })
    pages[slug] = { blockCount: layout.length, id: doc.id, status: existing ? 'updated' : 'created' }
    return doc
  }

  // ---------------------------------------------------------------------------
  // Chefs page
  // ---------------------------------------------------------------------------
  const kenjiBody = [
    "Born and raised in Osaka, the kitchen of Japan, Chef Kenji Tanaka's culinary journey began at the age of 16 in his family's humble udon shop. His insatiable curiosity led him to Tokyo, where he spent over a decade honing his skills under Michelin-starred sushi masters and yakitori veterans.",
    'At Zuru Zuru, he has curated a menu that acts as a love letter to the vibrant, chaotic, and utterly delicious alleyway eateries of his youth.',
    ['James Beard Foundation Award Nominee, 2023', 'Best Japanese Chef in Asia - Culinary Excellence Awards', 'Featured in “Masters of Fire: The Global Robatayaki”'].join('\n'),
  ].join('\n\n')
  await upsertPage('chefs', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Masters of their craft, united by discipline, respect, and a love of Japanese cuisine.', desktopBackgroundImage: interiorImage.id, enabled: true, eyebrow: 'Home / Chefs', heading: 'Meet Our Chefs' },
      {
        blockType: 'storyBlock' as const,
        accentPhrase: 'Executive Chef & Founder',
        body: kenjiBody,
        enableCta: false,
        eyebrow: 'The Visionary',
        imagePosition: 'left' as const,
        layout: 'simple' as const,
        media: chefImage.id,
        mediaAlt: 'Executive Chef Kenji Tanaka',
        title: 'Kenji Tanaka',
      },
      {
        blockType: 'teamBlock' as const,
        limit: 8,
        sectionHeader: { description: 'Each master brings decades of specialized experience to ensure perfection across our diverse menu.', eyebrow: 'Masters of the Craft', title: 'The Culinary Masters' },
        settings: { backgroundColor: 'dark' as const },
      },
      {
        blockType: 'storyBlock' as const,
        attribution: 'Chef Kenji Tanaka',
        layout: 'overlay' as const,
        quote: 'Great food is not born from complex recipes, but from a profound respect for the ingredients and the unrelenting discipline to execute simple techniques flawlessly, every single day.',
      },
      {
        blockType: 'ctaBlock' as const,
        ctaGroup: { enablePrimary: true, primaryCTA: { label: 'Dine with Our Chefs', type: 'custom' as const, url: '/reservation' } },
        sectionHeader: { description: 'Experience the culmination of years of mastery, passion, and tradition crafted by our exceptional culinary team.', title: 'Taste the Dedication' },
      },
    ] as PageLayout,
    metaDescription: 'Masters of their craft, united by discipline, respect, and a love of Japanese cuisine.',
    metaTitle: 'Meet Our Chefs — Zuru Zuru',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'chefs',
    tenantId,
    title: 'Zuru Zuru Chefs',
  })

  // ---------------------------------------------------------------------------
  // Events page
  // ---------------------------------------------------------------------------
  await upsertPage('events', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Discover exclusive culinary events, cultural celebrations, and immersive dining experiences at Zuru Zuru Izakaya. Join us in celebrating the art of Japanese cuisine.', desktopBackgroundImage: interiorImage.id, enabled: true, heading: 'Events & Experiences' },
      {
        blockType: 'eventsBlock' as const,
        limit: 6,
        sectionHeader: { description: 'Reserve your spot for our special limited-time experiences.', title: 'Upcoming Events' },
      },
      {
        blockType: 'contentgridBlock' as const,
        items: [
          { description: 'Learn the secrets of our rich tonkotsu broth and handmade noodles in this hands-on Sunday afternoon workshop.', title: 'Ramen Masterclass' },
          { description: "Every Tuesday, enjoy 50% off select sake carafes and complimentary chef's choice sushi rolls with your first order.", title: 'Sake & Sushi Nights' },
          { description: 'Book our private bar for your team and learn how to craft Japanese-inspired cocktails using matcha, yuzu, and shochu.', title: 'Corporate Mixology' },
        ],
        sectionHeader: { description: 'Immerse yourself in our weekly and monthly recurring events.', title: 'Regular Experiences' },
        settings: { backgroundColor: 'dark' as const },
      },
    ] as PageLayout,
    metaDescription: 'Discover exclusive culinary events, cultural celebrations, and immersive dining experiences at Zuru Zuru Izakaya.',
    metaTitle: 'Events & Experiences — Zuru Zuru',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'events',
    tenantId,
    title: 'Zuru Zuru Events',
  })

  // ---------------------------------------------------------------------------
  // Locations page
  // ---------------------------------------------------------------------------
  await upsertPage('locations', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Find a Zuru Zuru Izakaya near you and experience the authentic taste of Japan.', desktopBackgroundImage: interiorImage.id, enabled: true, heading: 'Our Locations' },
      { blockType: 'locationsBlock' as const, sectionHeader: { title: 'Our Locations' }, showMap: false },
      {
        blockType: 'contentgridBlock' as const,
        items: ['Free Wi-Fi', 'Valet Parking', 'Accessible', 'Full Bar', 'Private Dining', 'Vegan Options'].map((title) => ({ description: '', title })),
        presentation: 'partners' as const,
        sectionHeader: { description: 'Everything you need for a comfortable dining experience', title: 'Guest Amenities' },
        settings: { backgroundColor: 'dark' as const },
      },
    ] as PageLayout,
    metaDescription: 'Find a Zuru Zuru Izakaya near you and experience the authentic taste of Japan.',
    metaTitle: 'Our Locations — Zuru Zuru',
    pageType: 'locations' as const,
    publishedAt: new Date().toISOString(),
    slug: 'locations',
    tenantId,
    title: 'Zuru Zuru Locations',
  })

  // ---------------------------------------------------------------------------
  // Blog page
  // ---------------------------------------------------------------------------
  await upsertPage('blog', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Dive deep into the culinary philosophy, secret recipes, and the vibrant Izakaya culture of Japan.', desktopBackgroundImage: heroRamenImage.id, enabled: true, heading: 'Stories & Recipes' },
      {
        blockType: 'blogpreviewBlock' as const,
        limit: 10,
        presentation: 'index' as const,
        sectionHeader: { title: 'Stories & Recipes' },
      },
    ] as PageLayout,
    metaDescription: 'Dive deep into the culinary philosophy, secret recipes, and the vibrant Izakaya culture of Japan.',
    metaTitle: 'Stories & Recipes — Zuru Zuru',
    pageType: 'blog-index' as const,
    publishedAt: new Date().toISOString(),
    slug: 'blog',
    tenantId,
    title: 'Zuru Zuru Blog',
  })

  payload.logger.info('Zuru Zuru Group B pages seed completed.')

  return {
    blogPosts: { created: blogCreated, updated: blogUpdated },
    events: { created: eventsCreated, updated: eventsUpdated },
    locations: { created: locationsCreated, reused: locationsReused, updated: locationsUpdated },
    media: { created: mediaCreated, reused: mediaReused },
    pages,
    subjectOptions: { added: subjectsAdded },
    teamMembers: { created: teamCreated, updated: teamUpdated },
  }
}
