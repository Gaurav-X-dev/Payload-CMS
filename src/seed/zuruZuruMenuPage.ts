import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { Page } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

type PageLayout = NonNullable<Page['layout']>

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruMenuPageSeedResult = {
  media: { created: number; reused: number }
  menuCategories: { created: number; updated: number }
  menuItems: { created: number; updated: number }
  menuPage: { blockCount: number; id: number | string; status: 'created' | 'updated' }
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
 * Milestone Z4 — Zuru Zuru Menu page ("/menu") only. Reuses the existing tenant and the same 5
 * static images already uploaded by the Milestone Z3 Home seed (matched by title, never
 * re-uploaded). Category slugs are set explicitly (not auto-generated) so they match the existing
 * `MenuBrowser` client component's hardcoded filter keys exactly, requiring zero UI changes beyond
 * sourcing its data from the CMS instead of the static `data/menu.ts` import.
 */
export async function seedZuruZuruMenuPageContent(payload: Payload): Promise<ZuruZuruMenuPageSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru Menu page seed as.')
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
  // Media — reuses the same 5 static assets the Z3 Home seed already uploaded.
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
  // Menu categories — explicit slugs matching MenuBrowser's existing filter keys exactly.
  // ---------------------------------------------------------------------------
  const categorySpecs = [
    { slug: 'sushi', sortOrder: 0, title: 'Sushi & Sashimi' },
    { slug: 'ramen', sortOrder: 1, title: 'Ramen' },
    { slug: 'tempura', sortOrder: 2, title: 'Tempura' },
    { slug: 'yakitori', sortOrder: 3, title: 'Yakitori' },
    { slug: 'dessert', sortOrder: 4, title: 'Desserts' },
    { slug: 'drinks', sortOrder: 5, title: 'Drinks' },
  ]

  let categoriesCreated = 0
  let categoriesUpdated = 0
  const categoryIds: Record<string, number> = {}
  for (const spec of categorySpecs) {
    const existing = await findFirst(payload, 'menu-categories', {
      and: [{ tenantId: { equals: tenantId } }, { slug: { equals: spec.slug } }],
    })
    const data = { ...spec, isActive: true, tenantId }
    if (existing) {
      const updated = await payload.update({ id: existing.id, collection: 'menu-categories', data, overrideAccess: true, user })
      categoryIds[spec.slug] = updated.id
      categoriesUpdated += 1
    } else {
      const created = await payload.create({ collection: 'menu-categories', data, overrideAccess: true, user })
      categoryIds[spec.slug] = created.id
      categoriesCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Menu items — matches data/menu.ts 1:1. The Japanese dish name (e.g. "スパイシーツナロール")
  // has no dedicated field; it's folded into the title, matching the Home page's Seasonal
  // Collections precedent (see the Milestone Z4 report). Note: "Dragon Roll" here (Sushi &
  // Sashimi, ₹1150) is a genuinely different dish from the Z3 Home page's Signature-Dishes
  // "Dragon Roll" ($22) — a pre-existing inconsistency in the original static site, preserved as
  // two distinct records and disambiguated below by (tenant, title, category).
  // ---------------------------------------------------------------------------
  const dishSpecs = [
    { category: 'sushi', description: 'Fresh yellowfin tuna minced with our house-made spicy mayo, cucumber, topped with sesame seeds and scallions.', image: heroSushiImage.id, price: 850, title: 'Spicy Tuna Roll · スパイシーツナロール' },
    // Explicit slug: this title auto-slugifies to "dragon-roll" (non-ASCII/Japanese characters and
    // the "·" separator are stripped), colliding with the Z3 Home page's separate, genuinely
    // different "Dragon Roll" Signature Dish ($22, its own category) — see the Milestone Z4 report.
    { category: 'sushi', description: 'Shrimp tempura and cucumber inside, draped with thinly sliced avocado, eel sauce, and spicy mayo drizzle.', image: heroRamenImage.id, price: 1150, slug: 'dragon-roll-full-menu', title: 'Dragon Roll · ドラゴンロール' },
    { category: 'sushi', description: 'Imitation crab, ripe avocado, crisp cucumber, rolled inside-out with toasted sesame seeds.', image: gyozaImage.id, price: 750, title: 'California Roll · カリフォルニアロール' },
    { category: 'sushi', description: '5 pieces of premium, thick-cut Norwegian salmon served raw over shredded daikon radish.', image: interiorImage.id, price: 950, title: 'Salmon Sashimi (Sake) · サーモン刺身' },
    { category: 'sushi', description: '5 pieces of exquisite bluefin tuna, known for its deep ruby red color and firm, meaty texture.', image: gyozaImage.id, price: 1050, title: 'Tuna Sashimi (Maguro) · マグロ刺身' },
    { category: 'sushi', description: '5 pieces of buttery, delicate yellowtail, served with a hint of jalapeño and yuzu soy.', image: heroSushiImage.id, price: 1100, title: 'Yellowtail Sashimi (Hamachi) · ハマチ刺身' },
    { category: 'sushi', description: '2 pieces of butterflied, cooked tiger shrimp resting gently on hand-pressed vinegared sushi rice.', image: heroSushiImage.id, price: 600, title: 'Ebi Nigiri (Shrimp) · エビ握り' },
    { category: 'sushi', description: '2 pieces of grilled freshwater eel, glazed with sweet and savory unagi tare, bound with a strip of nori.', image: interiorImage.id, price: 750, title: 'Unagi Nigiri (Eel) · うなぎ握り' },
    { category: 'sushi', description: '2 pieces of classic Japanese sweet rolled omelette served over sushi rice. A delicate balance of sweet and savory.', image: chefImage.id, price: 450, title: 'Tamago Nigiri (Egg) · 玉子握り' },
    { category: 'ramen', description: 'Rich 24-hour pork bone broth, artisanal thin noodles, chashu pork belly, ajitama (soft-boiled egg), wood ear mushrooms, and scallions.', image: heroRamenImage.id, price: 950, title: 'Signature Tonkotsu Ramen · 豚骨ラーメン' },
    { category: 'ramen', description: 'Clear chicken and soy sauce broth, wavy noodles, tender chicken chashu, menma (bamboo shoots), narutomaki, and nori.', image: heroSushiImage.id, price: 850, title: 'Tokyo Shoyu Ramen · 醤油ラーメン' },
    { category: 'ramen', description: 'Nutty and robust miso-pork broth, thick curly noodles, ground pork, sweet corn, butter, and bean sprouts.', image: gyozaImage.id, price: 900, title: 'Hokkaido Miso Ramen · 味噌ラーメン' },
    { category: 'ramen', description: 'Fiery chili-infused chicken broth, topped with crispy Japanese fried chicken (karaage), bok choy, and chili oil.', image: gyozaImage.id, price: 950, title: 'Spicy Karaage Ramen · スパイシー唐揚げラーメン' },
    { category: 'tempura', description: '5 pieces of jumbo black tiger shrimp, lightly battered and fried to golden perfection. Served with warm tentsuyu dipping broth.', image: heroSushiImage.id, price: 800, title: 'Ebi Tempura (Shrimp) · 海老天ぷら' },
    { category: 'tempura', description: 'An assortment of seasonal vegetables including sweet potato, eggplant, lotus root, and bell peppers in a crispy, light batter.', image: heroSushiImage.id, price: 650, title: 'Yasai Tempura · 野菜天ぷら' },
    { category: 'yakitori', description: '2 skewers of succulent chicken thigh and charred negi (Japanese scallions), grilled over binchotan charcoal with tare glaze.', image: gyozaImage.id, price: 500, title: 'Negima (Chicken & Scallion) · ねぎま' },
    { category: 'yakitori', description: '2 skewers of house-ground seasoned chicken meatballs, glazed with sweet soy and served with a raw egg yolk for dipping.', image: chefImage.id, price: 550, title: 'Tsukune (Chicken Meatballs) · つくね' },
    { category: 'yakitori', description: '2 skewers of tender, juicy chicken thigh seasoned simply with sea salt (shio) and a squeeze of fresh lemon.', image: heroRamenImage.id, price: 480, title: 'Momo (Chicken Thigh) · もも' },
    { category: 'dessert', description: 'Premium Uji matcha infused ice cream, delivering a perfect balance of earthy bitterness and creamy sweetness.', image: gyozaImage.id, price: 400, title: 'Matcha Ice Cream · 抹茶アイス' },
    { category: 'dessert', description: '3 pieces of chewy, sweet rice dough filled with assorted ice cream flavors (Strawberry, Mango, Black Sesame).', image: chefImage.id, price: 450, title: 'Assorted Mochi Ice Cream · 雪見だいふく' },
    { category: 'dessert', description: 'A Japanese twist on a classic. Light, fluffy, and infused with tart yuzu citrus, set on a buttery graham cracker crust.', image: interiorImage.id, price: 550, title: 'Yuzu Cheesecake · 柚子チーズケーキ' },
    { category: 'drinks', description: 'A comforting carafe of our house Junmai sake, gently warmed to enhance its aromatic and savory profile. Serves 2.', image: interiorImage.id, price: 800, title: 'Traditional Hot Sake · 熱燗 (Atsukan)' },
    { category: 'drinks', description: "Japan's oldest beer brand. Crisp, perfectly balanced taste and a smooth finish. Served ice cold on tap. 500ml.", image: gyozaImage.id, price: 450, title: 'Sapporo Premium Draft · サッポロ生ビール' },
    { category: 'drinks', description: 'A refreshing mocktail blending ceremonial grade matcha, fresh yuzu juice, sparkling water, and a touch of honey.', image: heroRamenImage.id, price: 350, title: 'Matcha Yuzu Lemonade · 抹茶柚子レモネード' },
    { category: 'ramen', description: 'Our signature clear broth infused with white truffle oil, topped with chashu, bamboo shoots, and a perfectly soft-boiled egg.', image: heroRamenImage.id, price: 1250, title: 'Truffle Shoyu Ramen · トリュフ醤油ラーメン' },
    { category: 'sushi', description: 'Premium wagyu beef, asparagus tempura, truffle mayo, and gold flakes in a breathtaking presentation.', image: heroSushiImage.id, price: 1400, title: 'Cyber Hub Roll · サイバーハブロール' },
  ]

  let itemsCreated = 0
  let itemsUpdated = 0
  for (const [index, spec] of dishSpecs.entries()) {
    const categoryId = categoryIds[spec.category]
    const existing = await findFirst(payload, 'menu-items', {
      and: [
        { tenantId: { equals: tenantId } },
        { title: { equals: spec.title } },
        { category: { equals: categoryId } },
      ],
    })
    const data = {
      category: categoryId,
      description: spec.description,
      displayOrder: index,
      image: spec.image,
      isAvailable: true,
      isFeatured: false,
      price: spec.price,
      slug: 'slug' in spec ? spec.slug : undefined,
      tenantId,
      title: spec.title,
    }
    if (existing) {
      await payload.update({ id: existing.id, collection: 'menu-items', data, overrideAccess: true, user })
      itemsUpdated += 1
    } else {
      await payload.create({ collection: 'menu-items', data, overrideAccess: true, user })
      itemsCreated += 1
    }
  }

  // ---------------------------------------------------------------------------
  // Menu page layout: inner hero (heroBlock) + full browsable menu (menushowcaseBlock, reused in
  // "show everything" mode: featuredOnly false, all 6 real cuisine categories explicitly listed
  // so the Z3 Home page's separate "Signature Dishes" category is excluded from this browse view).
  // ---------------------------------------------------------------------------
  const layout: PageLayout = [
    {
      blockType: 'heroBlock' as const,
      description: 'Authentic Japanese dishes prepared with premium ingredients, traditional technique, and uncompromising care.',
      desktopBackgroundImage: chefImage.id,
      enabled: true,
      heading: 'Our Menu',
    },
    {
      blockType: 'menushowcaseBlock' as const,
      categories: Object.values(categoryIds),
      ctaGroup: { enablePrimary: false, enableSecondary: false },
      featuredOnly: false,
      limit: 30,
      sectionHeader: { title: 'Our Menu' },
    },
  ]

  const existingMenuPage = await findFirst(payload, 'pages', {
    and: [{ tenantId: { equals: tenantId } }, { slug: { equals: 'menu' } }],
  })
  const menuPageData = {
    _status: 'published' as const,
    isHomePage: false,
    layout,
    metaDescription: 'Authentic Japanese dishes prepared with premium ingredients, traditional technique, and uncompromising care — Zuru Zuru.',
    metaTitle: 'Our Menu — Zuru Zuru',
    pageType: 'menu' as const,
    publishedAt: new Date().toISOString(),
    slug: 'menu',
    tenantId,
    title: 'Zuru Zuru Menu',
  }
  const menuPage = existingMenuPage
    ? await payload.update({ id: existingMenuPage.id, collection: 'pages', data: menuPageData, overrideAccess: true, user })
    : await payload.create({ collection: 'pages', data: menuPageData, overrideAccess: true, user })

  payload.logger.info('Zuru Zuru Menu page seed completed.')

  return {
    media: { created: mediaCreated, reused: mediaReused },
    menuCategories: { created: categoriesCreated, updated: categoriesUpdated },
    menuItems: { created: itemsCreated, updated: itemsUpdated },
    menuPage: {
      blockCount: layout.length,
      id: menuPage.id,
      status: existingMenuPage ? 'updated' : 'created',
    },
  }
}
