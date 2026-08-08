import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type HomeLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruHomeSeedResult = {
  homePage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
  location: { id: number | string; status: 'created' | 'updated' }
  media: { created: number; reused: number }
  menuCategory: { id: number | string; status: 'created' | 'updated' }
  menuItems: { created: number; updated: number }
  testimonial: { id: number | string; status: 'created' | 'updated' }
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

/**
 * Milestone Z3 — Zuru Zuru Home page only. Reuses the existing tenant (never creates one), and
 * every dependent record (media, menu category, menu items, testimonial, location, the Home page
 * itself) is matched by a stable business key first, so re-running never duplicates anything.
 */
export async function seedZuruZuruHomeContent(payload: Payload): Promise<ZuruZuruHomeSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru Home seed as.')
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
  // Media — reuses the theme's existing static assets (findOrUploadMedia dedups by
  // (tenantId, title), so the same file used across multiple sections uploads only once,
  // matching the original static design's own reuse of these same images).
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
    upload({ alt: 'Premium Tonkotsu Ramen Bowl', sourcePath: 'themes/zuru-zuru/images/chef.png', title: 'chef.png' }),
    upload({ alt: 'Zuru Zuru Interior', sourcePath: 'themes/zuru-zuru/images/gyoza_tempura.png', title: 'gyoza_tempura.png' }),
    upload({ alt: 'Sushi & Sashimi', sourcePath: 'themes/zuru-zuru/images/hero_ramen.png', title: 'hero_ramen.png' }),
    upload({ alt: 'Yakitori', sourcePath: 'themes/zuru-zuru/images/hero_sushi.png', title: 'hero_sushi.png' }),
    upload({ alt: 'Ramen', sourcePath: 'themes/zuru-zuru/images/interior.png', title: 'interior.png' }),
  ])

  // ---------------------------------------------------------------------------
  // Menu category + Signature Dishes (menushowcaseBlock pulls real MenuItems)
  // ---------------------------------------------------------------------------
  const existingCategory = await findFirst(payload, 'menu-categories', {
    and: [{ tenantId: { equals: tenantId } }, { title: { equals: 'Signature Dishes' } }],
  })
  const categoryData = { isActive: true, sortOrder: 0, tenantId, title: 'Signature Dishes' }
  const menuCategory = existingCategory
    ? await payload.update({ id: existingCategory.id, collection: 'menu-categories', data: categoryData, overrideAccess: true, user })
    : await payload.create({ collection: 'menu-categories', data: categoryData, overrideAccess: true, user })

  // Heat dots (0-2) map onto the existing spiceLevel enum (none/mild/medium/hot/extra_hot). Badge
  // values match the original static HomePage.tsx's badgeType per dish exactly ('chef'/'popular'/
  // 'new'); the original used two different display texts ("Best Seller" and "Popular") for the
  // same 'popular' badgeType — since MenuItems.badge stores a type, not free text, the renderer
  // shows a single canonical label ("Popular") for that type. See the Milestone Z3 report.
  const dishSpecs = [
    { badge: 'chef' as const, calories: 320, description: 'Premium fatty tuna, quail egg yolk, scallions, caviar, served with crispy nori chips and wasabi cream.', displayOrder: 0, image: heroSushiImage.id, price: 24, spiceLevel: 'mild' as const, title: 'Toro Tartare' },
    { badge: 'popular' as const, calories: 680, description: '48-hour pork bone broth, black garlic oil, chashu belly, ajitama egg, wood ear mushrooms, bamboo shoots.', displayOrder: 1, image: chefImage.id, price: 18, spiceLevel: 'medium' as const, title: 'Tonkotsu Black' },
    { badge: 'new' as const, calories: 450, description: 'Shrimp tempura, avocado, unagi eel, tobiko, eel sauce — our signature showstopper roll.', displayOrder: 2, image: gyozaImage.id, price: 22, spiceLevel: 'mild' as const, title: 'Dragon Roll' },
    { badge: 'chef' as const, calories: 520, description: 'A5 Wagyu beef skewers, charcoal-grilled with tare sauce, served with pickled ginger and shiso leaf.', displayOrder: 3, image: chefImage.id, price: 32, spiceLevel: 'mild' as const, title: 'Wagyu Yakitori' },
    { badge: 'popular' as const, calories: 380, description: 'Uji matcha mascarpone layers, white chocolate shavings, dusted with ceremonial-grade matcha powder.', displayOrder: 4, image: chefImage.id, price: 14, spiceLevel: 'none' as const, title: 'Matcha Tiramisu' },
    { badge: 'new' as const, calories: 180, description: 'Suntory whisky, fresh yuzu citrus, sparkling soda, garnished with shiso leaf and a twist of yuzu zest.', displayOrder: 5, image: gyozaImage.id, price: 16, spiceLevel: 'none' as const, title: 'Yuzu Highball' },
  ]

  let menuItemsCreated = 0
  let menuItemsUpdated = 0
  for (const spec of dishSpecs) {
    const existing = await findFirst(payload, 'menu-items', {
      and: [{ tenantId: { equals: tenantId } }, { title: { equals: spec.title } }],
    })
    const data = {
      ...spec,
      category: menuCategory.id,
      isAvailable: true,
      isFeatured: true,
      tenantId,
    }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'menu-items', data, overrideAccess: true, user })
      menuItemsUpdated += 1
    } else {
      await payload.create({ collection: 'menu-items', data, overrideAccess: true, user })
      menuItemsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Testimonial (single guest voice shown on Home)
  // ---------------------------------------------------------------------------
  const existingTestimonial = await findFirst(payload, 'testimonials', {
    and: [{ tenantId: { equals: tenantId } }, { customerName: { equals: 'Rahul Sharma' } }],
  })
  const testimonialData = {
    customerName: 'Rahul Sharma',
    customerRole: 'Food Critic, Times of India',
    isFeatured: true,
    photo: gyozaImage.id,
    rating: 5,
    review: "The Tonkotsu Black at Zuru Zuru is quite simply the best ramen I've ever had outside of Japan. The depth of flavour in that 48-hour broth is extraordinary. This is not just a restaurant — it's a destination.",
    sortOrder: 0,
    tenantId,
  }
  const testimonial = existingTestimonial
    ? await payload.update({ id: existingTestimonial.id, collection: 'testimonials', data: testimonialData, overrideAccess: true, user })
    : await payload.create({ collection: 'testimonials', data: testimonialData, overrideAccess: true, user })

  // ---------------------------------------------------------------------------
  // Location (Visit Us) — phone/email intentionally left unset here and sourced from
  // Tenant.contact instead: Locations.phone is validated as a 10-digit Indian mobile number,
  // which the original "+91 11 4052 7373" landline doesn't satisfy. `description` is repurposed
  // to hold the Parking blurb (no dedicated field exists for it).
  // ---------------------------------------------------------------------------
  const existingLocation = await findFirst(payload, 'locations', {
    and: [{ tenantId: { equals: tenantId } }, { title: { equals: '23 Shahpur Jat, New Delhi' } }],
  })
  const locationData = {
    address: '23, Shahpur Jat\nSiri Fort, New Delhi 110049\nIndia',
    businessHours: [
      { closeTime: '10:30 PM', day: 'Monday', isClosed: false, openTime: '12:00 PM' },
      { closeTime: '10:30 PM', day: 'Tuesday', isClosed: false, openTime: '12:00 PM' },
      { closeTime: '10:30 PM', day: 'Wednesday', isClosed: false, openTime: '12:00 PM' },
      { closeTime: '10:30 PM', day: 'Thursday', isClosed: false, openTime: '12:00 PM' },
      { closeTime: '11:30 PM', day: 'Friday', isClosed: false, openTime: '12:00 PM' },
      { closeTime: '11:30 PM', day: 'Saturday', isClosed: false, openTime: '12:00 PM' },
      { closeTime: '10:00 PM', day: 'Sunday', isClosed: false, openTime: '12:00 PM' },
    ],
    city: 'New Delhi',
    country: 'India',
    description: 'Complimentary valet parking available for all dine-in guests. Street parking also available nearby.',
    isActive: true,
    isPrimary: true,
    postalCode: '110049',
    showInFooter: false,
    showOnContact: true,
    showOnHome: true,
    sortOrder: 0,
    state: 'Delhi',
    tenantId,
    title: '23 Shahpur Jat, New Delhi',
  }
  const location = existingLocation
    ? await payload.update({ id: existingLocation.id, collection: 'locations', data: locationData, overrideAccess: true, user })
    : await payload.create({ collection: 'locations', data: locationData, overrideAccess: true, user })

  // ---------------------------------------------------------------------------
  // Home Page layout (exact original section order). `settings.customClasses` on the 3
  // cardgridBlock instances distinguishes Cuisine/Dining/Seasons visual treatments — see the
  // mapper's cardGridVariant() for why: cardgridBlock has no presentation discriminator field.
  // ---------------------------------------------------------------------------
  const layout: HomeLayout = [
    {
      blockType: 'heroBlock' as const,
      description: 'A Japanese Izakaya experience in the heart of Shahpur Jat, New Delhi.',
      enabled: true,
      foregroundImage: chefImage.id,
      heading: 'Good Food.\nGood Times.',
      highlightedHeading: 'Always.',
      imageAlt: 'Premium Tonkotsu Ramen Bowl',
      primaryCTALabel: 'Explore Menu',
      primaryCTAURL: '/menu',
      secondaryCTALabel: 'Reserve a Table',
      secondaryCTAURL: '/reservation',
      stampText: '印',
    },
    {
      blockType: 'featurestripBlock' as const,
      items: [
        { description: 'Casual. Vibrant. Unapologetically authentic Japanese dining.', icon: 'bowl', title: 'Izakaya Culture' },
        { description: 'Thoughtful ingredients. Honest flavours. Daily prepared.', icon: 'leaf', title: 'Japanese Soul' },
        { description: 'Small plates. Big experiences. Made for communal joy.', icon: 'users', title: 'Sharing is Caring' },
        { description: 'We do a few things. And we do them exceptionally right.', icon: 'fish', title: 'No Sushi. Just Us.' },
      ],
      presentation: 'cards' as const,
      source: 'manual' as const,
    },
    {
      blockType: 'cardgridBlock' as const,
      cards: [
        { description: 'Pristine cuts, exquisite presentation', image: { item: heroRamenImage.id }, title: 'Sushi & Sashimi' },
        { description: '48-hour simmered broths', image: { item: interiorImage.id }, title: 'Ramen' },
        { description: 'Light, crispy perfection', image: { item: interiorImage.id }, title: 'Tempura' },
        { description: 'Charcoal-grilled skewers', image: { item: heroSushiImage.id }, title: 'Yakitori' },
        { description: 'Sweet Japanese artistry', image: { item: heroSushiImage.id }, title: 'Desserts' },
        { description: 'Curated Japanese spirits & mixology', image: { item: gyozaImage.id }, title: 'Cocktails & Sake' },
      ],
      columns: '3' as const,
      sectionHeader: {
        description: 'From the delicate art of sushi to the warming depths of our 48-hour broth, every dish is a celebration of Japanese culinary tradition.',
        eyebrow: 'What We Serve',
        subtitle: '料理を探る',
        title: 'Explore Our Cuisine',
      },
      settings: { customClasses: 'cuisine' },
    },
    {
      blockType: 'storyBlock' as const,
      body: "Founded in 2015 by Chef Kenji Tanaka, Zuru Zuru was born from a simple belief — that great food should bring people together. After 15 years mastering his craft in Tokyo's finest kitchens, Chef Kenji brought the authentic spirit of Japan's izakayas to New Delhi.\n\nEvery dish, from our 48-hour simmered Tonkotsu broth to our hand-rolled gyoza, tells a story of dedication, precision, and an unwavering commitment to the Japanese philosophy of Omotenashi — hospitality from the heart.",
      cta: { label: 'Read Our Full Story', type: 'custom' as const, url: '/about' },
      enableCta: true,
      eyebrow: 'Our Story',
      imagePosition: 'left' as const,
      layout: 'panel' as const,
      media: gyozaImage.id,
      mediaAlt: 'Zuru Zuru Interior',
      title: 'A Journey Through Japanese Culinary Heritage',
    },
    {
      blockType: 'menushowcaseBlock' as const,
      categories: [menuCategory.id],
      ctaGroup: {
        alignment: 'center' as const,
        enablePrimary: true,
        enableSecondary: false,
        primaryCTA: { label: 'View Full Menu', type: 'custom' as const, url: '/menu' },
      },
      featuredOnly: true,
      limit: 6,
      sectionHeader: {
        description: 'Hand-selected by our Executive Chef — the finest creations that define the Zuru Zuru experience.',
        eyebrow: "Chef's Selection",
        subtitle: '看板料理',
        title: 'Signature Dishes',
      },
    },
    {
      blockType: 'cardgridBlock' as const,
      cards: [
        { description: 'Exclusive rooms for intimate gatherings', image: { item: heroSushiImage.id }, title: 'Private Dining' },
        { description: 'Watch our chefs craft your meal', image: { item: heroSushiImage.id }, title: 'Open Kitchen' },
        { description: 'Traditional Japanese floor seating', image: { item: heroRamenImage.id }, title: 'Tatami Seating' },
        { description: 'Warm spaces for shared moments', image: { item: heroRamenImage.id }, title: 'Family Dining' },
        { description: 'Candlelit dinners for two', image: { item: heroRamenImage.id }, title: 'Romantic Evening' },
        { description: 'Premium spaces for business dining', image: { item: chefImage.id }, title: 'Corporate Events' },
      ],
      columns: '3' as const,
      sectionHeader: {
        description: 'From intimate tatami rooms to our vibrant open kitchen, every space tells a story of Japanese elegance.',
        eyebrow: 'Ambiance',
        subtitle: '食事体験',
        title: 'The Dining Experience',
      },
      settings: { customClasses: 'dining' },
    },
    {
      blockType: 'contentgridBlock' as const,
      items: [
        { description: 'Experience our full menu in an elegant setting with warm Japanese hospitality.', icon: 'food', title: 'Dine In' },
        { description: 'Your favourite dishes, carefully packed to enjoy at home.', icon: 'briefcase', title: 'Take Away' },
        { description: 'Premium delivery via Zomato & Swiggy within 10km radius.', icon: 'moped', title: 'Home Delivery' },
        { description: 'Exclusive rooms for intimate celebrations and VIP gatherings.', icon: 'star', title: 'Private Dining' },
        { description: 'Customized menus for corporate events and team celebrations.', icon: 'briefcase', title: 'Corporate Catering' },
        { description: 'Make birthdays unforgettable with our special event packages.', icon: 'heart', title: 'Birthday Events' },
        { description: 'Elegant Japanese cuisine for your most special day.', icon: 'heart', title: 'Wedding Catering' },
        { description: 'Book your table instantly through our website, 24/7.', icon: 'calendar', title: 'Online Reservation' },
      ],
      presentation: 'services' as const,
      sectionHeader: { eyebrow: 'What We Offer', subtitle: 'サービス', title: 'Our Services' },
    },
    {
      blockType: 'contentgridBlock' as const,
      items: [
        { description: 'Daily sourced from trusted farms and fish markets across India and Japan.', icon: 'leaf', title: 'Fresh Ingredients' },
        { description: 'Premium soy, miso, dashi, nori, and sake — direct from Japanese suppliers.', icon: 'flag', title: 'Imported from Japan' },
        { description: 'Our team of Japanese-trained chefs bring 100+ years of combined experience.', icon: 'food', title: 'Master Chefs' },
        { description: 'Authentic techniques passed down through generations of Japanese artisans.', icon: 'medal', title: 'Traditional Recipes' },
        { description: 'The art of Omotenashi — heartfelt Japanese hospitality at every table.', icon: 'star', title: 'Premium Hospitality' },
        { description: 'Designed by Tokyo-based architects to evoke authentic Japanese ambiance.', icon: 'map', title: 'Luxury Interiors' },
        { description: 'Partnered with organic farms for the freshest, chemical-free produce.', icon: 'leaf', title: 'Organic Vegetables' },
        { description: 'Sashimi-grade fish delivered daily from premium coastal markets.', icon: 'fish', title: 'Fresh Seafood' },
      ],
      presentation: 'benefits' as const,
      sectionHeader: { eyebrow: 'The Zuru Zuru Difference', subtitle: '私たちの約束', title: 'Why Choose Us' },
    },
    {
      blockType: 'cardgridBlock' as const,
      cards: [
        { description: 'Cherry blossom-inspired dishes with light, floral flavours and seasonal fish.', enableLink: true, image: { item: heroSushiImage.id }, link: { label: 'View Collection', type: 'custom' as const, url: '/menu' }, title: 'Spring · 春 · Sakura' },
        { description: 'Refreshing cold noodles, grilled seafood, and crisp yuzu cocktails.', enableLink: true, image: { item: heroSushiImage.id }, link: { label: 'View Collection', type: 'custom' as const, url: '/menu' }, title: 'Summer · 夏 · Natsu' },
        { description: 'Rich mushroom hotpots, roasted root vegetables, warm sake selections.', enableLink: true, image: { item: interiorImage.id }, link: { label: 'View Collection', type: 'custom' as const, url: '/menu' }, title: 'Autumn · 秋 · Aki' },
        { description: 'Hearty nabe stews, rich Tonkotsu specials, and warming whisky flights.', enableLink: true, image: { item: interiorImage.id }, link: { label: 'View Collection', type: 'custom' as const, url: '/menu' }, title: 'Winter · 冬 · Fuyu' },
      ],
      columns: '4' as const,
      sectionHeader: {
        description: "Inspired by the changing seasons of Japan, our limited-edition menus celebrate nature's finest offerings.",
        eyebrow: 'Limited Edition',
        subtitle: '季節のメニュー',
        title: 'Seasonal Collections',
      },
      settings: { customClasses: 'seasons' },
    },
    {
      blockType: 'testimonialsBlock' as const,
      featuredOnly: true,
      limit: 1,
      presentation: 'cards' as const,
      sectionHeader: { eyebrow: 'Guest Voices', subtitle: 'お客様の声', title: 'What Our Guests Say' },
      source: 'collection' as const,
    },
    {
      blockType: 'locationsBlock' as const,
      locations: [location.id],
      sectionHeader: { eyebrow: 'Find Us', subtitle: 'アクセス', title: 'Visit Zuru Zuru' },
      showMap: true,
    },
  ]

  const existingHomePage = await findFirst(payload, 'pages', {
    and: [{ tenantId: { equals: tenantId } }, { isHomePage: { equals: true } }],
  })
  const homePageData = {
    _status: 'published' as const,
    isHomePage: true,
    layout,
    metaDescription: 'A Japanese Izakaya experience in the heart of Shahpur Jat, New Delhi — Zuru Zuru.',
    metaTitle: 'Zuru Zuru — Good Food. Good Times. Always.',
    pageType: 'home' as const,
    publishedAt: new Date().toISOString(),
    tenantId,
    title: 'Zuru Zuru Home',
  }
  const homePage = existingHomePage
    ? await payload.update({ id: existingHomePage.id, collection: 'pages', data: homePageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: homePageData, overrideAccess: true, user })

  payload.logger.info('Zuru Zuru Home seed completed.')

  return {
    homePage: {
      blockCount: layout.length,
      id: homePage.id,
      status: existingHomePage ? 'updated' : 'created',
    },
    location: { id: location.id, status: existingLocation ? 'updated' : 'created' },
    media: { created: mediaCreated, reused: mediaReused },
    menuCategory: { id: menuCategory.id, status: existingCategory ? 'updated' : 'created' },
    menuItems: { created: menuItemsCreated, updated: menuItemsUpdated },
    testimonial: { id: testimonial.id, status: existingTestimonial ? 'updated' : 'created' },
  }
}
