import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type PageLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruGroupAPagesSeedResult = {
  faqs: { created: number; updated: number }
  media: { created: number; reused: number }
  pages: Record<string, { blockCount: number; id: number | string; status: 'created' | 'updated' }>
  subjectOptions: { added: string[] }
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
// Lexical rich-text document builder (local to this seed, matching the pattern every other Zuru
// Zuru / Curious Ladoo seed uses — headings render via Payload's own `<RichText>` component).
// ---------------------------------------------------------------------------

type TextRun = { bold?: boolean; text: string }
type RichTextSegment =
  | { level?: 'h2' | 'h3' | 'h4'; text: string; type: 'heading' }
  | { runs: TextRun[]; type: 'paragraph' }

const paragraph = (text: string): RichTextSegment => ({ runs: [{ text }], type: 'paragraph' })
const heading = (text: string, level: 'h2' | 'h3' | 'h4' = 'h2'): RichTextSegment => ({ level, text, type: 'heading' })

function buildRichText(segments: RichTextSegment[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      direction: null,
      version: 1,
      children: segments.map((segment) => segment.type === 'heading'
        ? {
            type: 'heading',
            tag: segment.level ?? 'h2',
            format: '' as const,
            indent: 0,
            version: 1,
            children: [{ mode: 'normal' as const, text: segment.text, type: 'text', version: 1 }],
          }
        : {
            type: 'paragraph',
            format: '' as const,
            indent: 0,
            version: 1,
            children: segment.runs.map((run) => ({
              mode: 'normal' as const,
              text: run.text,
              type: 'text',
              version: 1,
              format: run.bold ? 1 : 0,
            })),
          }),
    },
  }
}

/**
 * Milestone Z7 — Group A: Catering, Careers, Franchise, FAQ, Privacy Policy, and Terms. Reuses the
 * existing tenant and the same 5 static images already uploaded by prior Zuru Zuru seeds (matched
 * by title, never re-uploaded). Also extends the Milestone Z6 Contact page's formBlock with two
 * additional subject options ("Catering Request", "Partnership") so this group's specialized
 * inquiry forms — which have no visible Subject selector — can submit a subject already present in
 * the tenant's configured pool (`validateContactSubmissionSubject` scans every `contact`/
 * `catering`-pageType page's formBlock.subjectOptions) without a schema change.
 */
export async function seedZuruZuruGroupAPagesContent(payload: Payload): Promise<ZuruZuruGroupAPagesSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru Group A pages seed as.')
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
  // Extend the Z6 Contact page's formBlock.subjectOptions (content update, not a schema change).
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
    const additions = [
      { label: 'Catering Request', value: 'Catering Request' },
      { label: 'Partnership', value: 'Partnership' },
    ].filter((option) => !existingSubjects.has(option.value))
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
  // FAQs (FAQ page's 8 reservation/dining questions — distinct titles from the Z6 Contact page's 3)
  // ---------------------------------------------------------------------------
  const faqSpecs = [
    { answer: 'Reservations are strongly recommended, especially for evenings and weekends. Walk-ins are always welcome and seated subject to availability.', sortOrder: 0, title: 'Do I need a reservation?' },
    { answer: 'Reservations open 60 days in advance through our website or by phone.', sortOrder: 1, title: 'How far in advance can I reserve?' },
    { answer: 'We request at least 24 hours notice for cancellations or changes.', sortOrder: 2, title: 'What is your cancellation policy?' },
    { answer: 'Yes. For parties of eight or more, please contact our events team for set-menu and private dining options.', sortOrder: 3, title: 'Do you accommodate large groups?' },
    { answer: 'Yes, our menu includes vegetarian and vegan dishes. Please inform your server of dietary requirements.', sortOrder: 4, title: 'Do you offer vegetarian or vegan dishes?' },
    { answer: 'We make every reasonable effort, but our kitchen handles common allergens and cannot guarantee an allergen-free environment.', sortOrder: 5, title: 'Can you accommodate food allergies?' },
    { answer: 'Yes, selected dishes are available for takeaway and delivery within our service areas.', sortOrder: 6, title: 'Do you offer delivery and takeaway?' },
    { answer: 'We accept major credit and debit cards, UPI, and cash.', sortOrder: 7, title: 'What payment methods do you accept?' },
  ]
  let faqsCreated = 0
  let faqsUpdated = 0
  const faqIds: number[] = []
  for (const spec of faqSpecs) {
    const existing = await findFirst(payload, 'faqs', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = { ...spec, isActive: true, tenantId }
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
  // Page upsert helper
  // ---------------------------------------------------------------------------
  const pages: ZuruZuruGroupAPagesSeedResult['pages'] = {}
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
  // FAQ page
  // ---------------------------------------------------------------------------
  await upsertPage('faq', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Everything you need to know before your Zuru Zuru experience.', desktopBackgroundImage: heroRamenImage.id, enabled: true, heading: 'Frequently Asked Questions' },
      { blockType: 'faqBlock' as const, items: faqIds, sectionHeader: { title: 'Reservations' } },
    ] as PageLayout,
    metaDescription: 'Everything you need to know before your Zuru Zuru experience.',
    metaTitle: 'Frequently Asked Questions — Zuru Zuru',
    pageType: 'faq' as const,
    publishedAt: new Date().toISOString(),
    slug: 'faq',
    tenantId,
    title: 'Zuru Zuru FAQ',
  })

  // ---------------------------------------------------------------------------
  // Privacy Policy page
  // ---------------------------------------------------------------------------
  const privacyRichText = buildRichText([
    heading('1. Introduction'),
    paragraph('Welcome to Zuru Zuru Izakaya. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website, dine at our restaurant, or use our services, and tell you about your privacy rights and how the law protects you.'),
    heading('2. The Data We Collect About You'),
    paragraph('Personal data means any information about an individual from which that person can be identified. We may collect Identity Data, Contact Data, Financial Data, Transaction Data, Profile Data, and Usage Data.'),
    heading('3. How We Collect Your Data'),
    paragraph('We collect data through direct interactions, including reservations, orders, newsletter subscriptions, promotions, surveys, and feedback, and through automated technologies such as cookies and server logs.'),
    heading('4. How We Use Your Personal Data'),
    paragraph('We will only use your personal data when the law allows us to, including to perform a contract, pursue legitimate interests, or comply with a legal obligation.'),
    heading('5. Data Security'),
    paragraph('We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, accessed, altered, or disclosed without authorisation.'),
    heading('6. Data Retention'),
    paragraph('We retain your personal data only for as long as reasonably necessary to fulfil the purposes for which it was collected.'),
    heading('7. Your Legal Rights'),
    paragraph('You may request access, correction, erasure, restriction, transfer, object to processing, or withdraw consent. Contact privacy@zuruzuru.in.'),
    heading('8. Contact Us'),
    paragraph('Email: privacy@zuruzuru.in · Postal address: 23 Shahpur Jat, Siri Fort, New Delhi 110049, India · Telephone: +91 11 4052 7373'),
  ])
  await upsertPage('privacy-policy', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'How we collect, use, and protect your data.', desktopBackgroundImage: interiorImage.id, enabled: true, heading: 'Privacy Policy' },
      { blockType: 'richtextBlock' as const, content: privacyRichText },
    ] as PageLayout,
    metaDescription: 'How Zuru Zuru collects, uses, and protects your data.',
    metaTitle: 'Privacy Policy — Zuru Zuru',
    pageType: 'legal' as const,
    publishedAt: new Date().toISOString(),
    slug: 'privacy-policy',
    tenantId,
    title: 'Zuru Zuru Privacy Policy',
  })

  // ---------------------------------------------------------------------------
  // Terms & Conditions page
  // ---------------------------------------------------------------------------
  const termsRichText = buildRichText([
    heading('1. Agreement to Terms'),
    paragraph('These Terms and Conditions constitute a legally binding agreement between you and Zuru Zuru Izakaya concerning your access to and use of www.zuruzuru.in and related services. By accessing the Site, you agree to be bound by these Terms and Conditions.'),
    heading('2. Reservations and Cancellation Policy'),
    paragraph("Reservations may be made online, by phone, or in person. We hold reserved tables for 15 minutes. We request a minimum of 4 hours' notice for cancellations, and 24 hours for large groups or private events."),
    heading('3. Dietary Requirements and Allergies'),
    paragraph('We make every effort to accommodate dietary requirements and food allergies, but cannot guarantee a completely allergen-free environment due to cross-contamination risk.'),
    heading('4. Online Ordering and Delivery'),
    paragraph('Orders are subject to acceptance. Estimated delivery times are guidelines. Refunds are processed at management discretion for incorrect or unsatisfactory orders.'),
    heading('5. Intellectual Property Rights'),
    paragraph('The Site, its code, functionality, designs, text, photographs, graphics, trademarks, and service marks are owned or controlled by us or licensed to us and protected by law.'),
    heading('6. User Representations'),
    paragraph('You represent that information you provide is accurate, that you have legal capacity, and that you will not use the Site for an illegal or unauthorised purpose.'),
    heading('7. Modifications and Interruptions'),
    paragraph('We reserve the right to change, modify, or remove Site contents and will not be liable for modification, price change, suspension, or discontinuance.'),
    heading('8. Governing Law'),
    paragraph('These Terms are governed by the laws of India. The courts of New Delhi have exclusive jurisdiction.'),
    heading('9. Contact Us'),
    paragraph('Zuru Zuru Izakaya · 23 Shahpur Jat, Siri Fort, New Delhi 110049, India · +91 11 4052 7373 · legal@zuruzuru.in'),
  ])
  await upsertPage('terms', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Please read these terms carefully before using our services.', desktopBackgroundImage: interiorImage.id, enabled: true, heading: 'Terms & Conditions' },
      { blockType: 'richtextBlock' as const, content: termsRichText },
    ] as PageLayout,
    metaDescription: 'Terms and conditions for using Zuru Zuru services.',
    metaTitle: 'Terms & Conditions — Zuru Zuru',
    pageType: 'legal' as const,
    publishedAt: new Date().toISOString(),
    slug: 'terms',
    tenantId,
    title: 'Zuru Zuru Terms',
  })

  // ---------------------------------------------------------------------------
  // Careers page
  // ---------------------------------------------------------------------------
  await upsertPage('careers', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Build a rewarding career serving authentic Japanese cuisine in an environment that values passion, respect, and continuous growth.', desktopBackgroundImage: chefImage.id, enabled: true, heading: 'Join Our Team' },
      {
        blockType: 'contentgridBlock' as const,
        items: [
          { description: "Rooted in the Japanese concept of Wa (harmony), we foster a supportive, respectful workplace where everyone's voice is heard.", title: 'Respect & Culture' },
          { description: 'From knife skills to sake sommelier certification, we invest heavily in your professional development and culinary education.', title: 'Continuous Training' },
          { description: 'We believe in promoting from within. Many of our head chefs and managers started their journey with us in entry-level roles.', title: 'Growth Opportunities' },
          { description: 'We value your well-being with flexible scheduling, consecutive days off, and respect for your personal time outside the kitchen.', title: 'Work-Life Balance' },
        ],
        sectionHeader: { description: 'Discover the Zuru Zuru difference', title: 'Why Work With Us' },
      },
      {
        blockType: 'contentgridBlock' as const,
        items: [
          { description: '', title: 'Comprehensive Health Insurance' },
          { description: '', title: 'Free Shift Meals' },
          { description: '', title: 'Competitive Salary + Tips' },
          { description: '', title: 'Paid Time Off' },
          { description: '', title: '50% Family Dining Discount' },
          { description: '', title: 'Late Night Commute Allowance' },
          { description: '', title: 'Performance Bonuses' },
          { description: '', title: 'Uniforms & Footwear Allowance' },
        ],
        presentation: 'partners' as const,
        sectionHeader: { description: 'We take care of our team members', title: 'Perks & Benefits' },
        settings: { backgroundColor: 'dark' as const },
      },
      {
        blockType: 'careersBlock' as const,
        positions: [
          { department: 'Culinary Team', description: 'Seeking an experienced Sushi Chef with a passion for precision and traditional techniques.', location: 'Delhi, India', title: 'Sushi Chef (Itamae)', type: 'Full-time' },
          { department: 'Front of House', description: 'Looking for a dynamic leader to oversee daily operations and ensure impeccable guest experiences.', location: 'Delhi, India', title: 'Restaurant Manager', type: 'Full-time' },
          { department: 'Beverage', description: 'Passionate about sake? Help our guests navigate our extensive curated sake menu.', location: 'Delhi, India', title: 'Sake Sommelier', type: 'Part-time' },
        ],
        sectionHeader: { description: 'Find your place in our growing family', title: 'Current Openings' },
      },
    ] as PageLayout,
    metaDescription: 'Join the Zuru Zuru team — explore current openings and build a rewarding career in Japanese hospitality.',
    metaTitle: 'Join Our Team — Zuru Zuru',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'careers',
    tenantId,
    title: 'Zuru Zuru Careers',
  })

  // ---------------------------------------------------------------------------
  // Franchise page
  // ---------------------------------------------------------------------------
  await upsertPage('franchise', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Partner with Zuru Zuru and bring an award-winning Japanese Izakaya experience to your city.', desktopBackgroundImage: interiorImage.id, enabled: true, heading: 'Franchise Opportunity' },
      {
        blockType: 'contentgridBlock' as const,
        items: [
          { description: '600–900 sq. ft. · Food court / high street · 25–40 seats · Estimated opening: 5–7 months', title: 'Express (₹75L – ₹1Cr)' },
          { description: '1,500–2,000 sq. ft. · Premium high street / mall · 60–90 seats · Estimated opening: 7–9 months', title: 'Classic (₹1.5Cr – ₹2Cr)' },
          { description: '3,000–4,500 sq. ft. · Flagship destination · 120–180 seats · Estimated opening: 9–12 months', title: 'Premium (₹3Cr – ₹4Cr)' },
        ],
        sectionHeader: { title: 'Investment Overview' },
      },
      {
        blockType: 'contentgridBlock' as const,
        items: ['Location & Setup', 'Culinary Training', 'Operations Support', 'Marketing & Brand', 'Supply Chain', 'Business Review'].map((title) => ({
          description: 'Comprehensive guidance from our experienced franchise and restaurant operations team.',
          title,
        })),
        sectionHeader: { title: 'What We Provide' },
      },
      {
        blockType: 'statsBlock' as const,
        sectionHeader: { title: 'Proven Success Metrics' },
        stats: [
          { label: 'Average EBITDA', value: '28%' },
          { label: 'Average Break-even', value: '18 Mo' },
          { label: 'Average Guest Rating', value: '4.8★' },
          { label: 'Repeat Customers', value: '65%' },
        ],
      },
    ] as PageLayout,
    metaDescription: 'Partner with Zuru Zuru and bring an award-winning Japanese Izakaya experience to your city.',
    metaTitle: 'Franchise Opportunity — Zuru Zuru',
    pageType: 'generic' as const,
    publishedAt: new Date().toISOString(),
    slug: 'franchise',
    tenantId,
    title: 'Zuru Zuru Franchise',
  })

  // ---------------------------------------------------------------------------
  // Catering page
  // ---------------------------------------------------------------------------
  const cateringMenuRichText = buildRichText([
    heading('Sample Catering Menu', 'h3'),
    paragraph('This is a representative selection. We customize menus for every event.'),
    heading("Hors d'Oeuvres", 'h4'),
    { runs: [{ bold: true, text: 'Wagyu Beef Tataki' }, { text: ' — Ponzu, crispy garlic, microgreens' }], type: 'paragraph' as const },
    { runs: [{ bold: true, text: 'Spicy Tuna Tartare' }, { text: ' — Served on crispy rice cakes' }], type: 'paragraph' as const },
    { runs: [{ bold: true, text: 'Mushroom Gyoza (V)' }, { text: ' — Truffle oil, scallion soy dipping sauce' }], type: 'paragraph' as const },
    heading('Live Stations', 'h4'),
    paragraph('Premium Sushi Bar · Robata Grill'),
    heading('Main Courses', 'h4'),
    paragraph('Miso Black Cod · Braised Pork Belly (Kakuni)'),
  ])
  await upsertPage('catering', {
    _status: 'published' as const,
    isHomePage: false,
    layout: [
      { blockType: 'heroBlock' as const, description: 'Bring the exceptional taste of Zuru Zuru to your chosen venue', desktopBackgroundImage: heroSushiImage.id, enabled: true, heading: 'Catering Services' },
      {
        blockType: 'cardgridBlock' as const,
        cards: [
          { description: 'Make your special day unforgettable with a spectacular feast of premium sushi, elegant izakaya dishes, and live action stations that will dazzle your guests.', image: { item: heroSushiImage.id }, title: 'Wedding Receptions' },
          { description: 'From executive board lunches to grand gala dinners, our corporate catering ensures a sophisticated and smooth dining experience for your business associates.', image: { item: interiorImage.id }, title: 'Corporate Events' },
          { description: 'Turn your party into a lively culinary celebration. We provide interactive food stations, customized sake menus, and vibrant flavors for all ages.', image: { item: gyozaImage.id }, title: 'Birthday Celebrations' },
          { description: 'Enjoy our robust yakitori grills and refreshing Japanese salads in the open air. Perfect for summer garden parties and outdoor retreats.', image: { item: heroRamenImage.id }, title: 'Outdoor Gatherings' },
        ],
        sectionHeader: { description: 'We offer bespoke catering solutions tailored perfectly to the scale and style of your gathering.', eyebrow: 'Our Expertise', title: 'Catered Events' },
      },
      {
        blockType: 'contentgridBlock' as const,
        items: [
          { description: 'Contact us to discuss your event size, dietary requirements, and specific vision.', title: '1. Consultation' },
          { description: 'Experience a private tasting session and finalize your bespoke menu selection.', title: '2. Tasting & Menu' },
          { description: 'We coordinate logistics, staffing, and equipment with your venue managers.', title: '3. Preparation' },
          { description: 'Relax and enjoy your event as our expert team delivers a flawless culinary experience.', title: '4. Execution' },
        ],
        sectionHeader: { eyebrow: 'The Process', title: 'How It Works' },
        settings: { backgroundColor: 'dark' as const },
      },
      { blockType: 'richtextBlock' as const, content: cateringMenuRichText },
    ] as PageLayout,
    metaDescription: 'Bring the exceptional taste of Zuru Zuru to your chosen venue — bespoke catering for weddings, corporate events, and celebrations.',
    metaTitle: 'Catering Services — Zuru Zuru',
    pageType: 'catering' as const,
    publishedAt: new Date().toISOString(),
    slug: 'catering',
    tenantId,
    title: 'Zuru Zuru Catering',
  })

  payload.logger.info('Zuru Zuru Group A pages seed completed.')

  return {
    faqs: { created: faqsCreated, updated: faqsUpdated },
    media: { created: mediaCreated, reused: mediaReused },
    pages,
    subjectOptions: { added: subjectsAdded },
  }
}
