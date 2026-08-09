import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type ZuruZuruSEOSeedResult = {
  blogPosts: { updated: number; unchanged: number }
  media: { created: number; reused: number }
  seo: { fieldsUpdated: string[]; status: 'created' | 'updated' }
}

const findFirst = async <TSlug extends Parameters<Payload['find']>[0]['collection']>(
  payload: Payload,
  collection: TSlug,
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

const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength - 1)}…`
}

/** "12:00 PM" -> "12:00", "10:30 PM" -> "22:30" — schema.org's OpeningHoursSpecification requires 24-hour "opens"/"closes" values. */
function to24Hour(time12h: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time12h.trim())
  if (!match) return ''
  let hours = Number(match[1])
  const minutes = match[2]
  const meridiem = match[3].toUpperCase()
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

/**
 * Milestone Z8 — Zuru Zuru SEO. Seeds the single tenant-wide `seo` document (idempotent
 * find-or-create, only the fields listed below are ever written) and fills in the two BlogPosts
 * SEO fields (metaTitle/metaDescription) that were left empty by the Z7 Group B seed — every other
 * field on every touched record is left exactly as it was. The Restaurant JSON-LD is built only
 * from values already present in the CMS (Tenant.contact, SiteSettings.businessName/
 * siteDescription, and the flagship Location's structured address/businessHours) — nothing is
 * invented (no priceRange, no servesCuisine, no social profiles: none of those are stored as
 * discrete CMS fields anywhere for this tenant).
 */
export async function seedZuruZuruSEOContent(payload: Payload): Promise<ZuruZuruSEOSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Zuru Zuru SEO seed as.')
  }
  const user = superAdmin as User

  const tenant = await findFirst(payload, 'tenants', { slug: { equals: 'zuru-zuru' } })
  if (!tenant) {
    throw new Error('Zuru Zuru tenant not found. Run the Milestone Z2 seed (db:seed:zuru-zuru-shell) first.')
  }
  const tenantId = tenant.id
  const fullTenant = await payload.findByID({ id: tenantId, collection: 'tenants', depth: 0, overrideAccess: true })

  const siteSettings = await findFirst(payload, 'site-settings', { tenantId: { equals: tenantId } })

  const flagshipLocation = await findFirst(payload, 'locations', {
    and: [{ tenantId: { equals: tenantId } }, { isPrimary: { equals: true } }],
  })

  // ---------------------------------------------------------------------------
  // Media — reuses the same already-uploaded interior shot as the sitewide default OG image
  // (a wide/landscape asset suits a 1200x630 social preview far better than the square logo).
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
  const ogImage = await upload({ alt: 'Zuru Zuru interior', sourcePath: 'themes/zuru-zuru/images/interior.png', title: 'interior.png' })

  // ---------------------------------------------------------------------------
  // Restaurant JSON-LD — built only from existing CMS values (see the function doc comment above).
  // ---------------------------------------------------------------------------
  const openingHoursSpecification = (flagshipLocation?.businessHours ?? [])
    .filter((row) => !row.isClosed && row.openTime && row.closeTime)
    .map((row) => ({
      '@type': 'OpeningHoursSpecification',
      closes: to24Hour(row.closeTime ?? ''),
      dayOfWeek: `https://schema.org/${row.day}`,
      opens: to24Hour(row.openTime ?? ''),
    }))
    .filter((entry) => entry.opens && entry.closes)

  const businessName = siteSettings?.businessName || fullTenant.name
  const restaurantJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    address: flagshipLocation
      ? {
          '@type': 'PostalAddress',
          addressCountry: flagshipLocation.country || undefined,
          addressLocality: flagshipLocation.city || undefined,
          addressRegion: flagshipLocation.state || undefined,
          postalCode: flagshipLocation.postalCode || undefined,
          streetAddress: flagshipLocation.address || undefined,
        }
      : undefined,
    description: siteSettings?.siteDescription || undefined,
    email: fullTenant.contact?.contactEmail || undefined,
    image: ogImage.url ? `https://zuru-zuru.localhost${ogImage.url}` : undefined,
    name: businessName,
    openingHoursSpecification: openingHoursSpecification.length ? openingHoursSpecification : undefined,
    telephone: fullTenant.contact?.contactPhone || undefined,
    url: 'https://zuru-zuru.localhost',
  }

  // ---------------------------------------------------------------------------
  // SEO document (single, tenant-scoped) — idempotent find-or-create.
  // ---------------------------------------------------------------------------
  const existingSEO = await findFirst(payload, 'seo', { tenantId: { equals: tenantId } })
  const seoData = {
    bingSiteVerification: '',
    canonicalUrl: '',
    defaultOGImage: ogImage.id,
    googleSiteVerification: '',
    jsonLd: JSON.stringify(restaurantJsonLd),
    keywords: 'Japanese restaurant Delhi, Izakaya, sushi, ramen, yakitori, omakase, Zuru Zuru, Shahpur Jat, fine dining New Delhi',
    metaDescription: siteSettings?.siteDescription
      ? truncate(siteSettings.siteDescription, 160)
      : '',
    metaTitlePattern: '%s | Zuru Zuru',
    ogDescription: '',
    ogSiteName: businessName,
    ogTitle: '',
    robots: 'index, follow' as const,
    tenantId,
    twitterCard: 'summary_large_image' as const,
    twitterCreator: '',
    twitterSite: '',
  }
  if (existingSEO) {
    await payload.update({ id: existingSEO.id, collection: 'seo', data: seoData, overrideAccess: true, user })
  } else {
    await payload.create({ collection: 'seo', data: seoData, overrideAccess: true, user })
  }

  // ---------------------------------------------------------------------------
  // BlogPosts — fill in only metaTitle/metaDescription where currently empty. Every other field
  // (content, categories, publishedDate, isPinned, heroImage, ...) is left completely untouched.
  // Descriptions are trimmed copies of each post's own already-written opening content, not new
  // text. Not yet consumed by any live route — see the Milestone Z8 report ("blog detail route
  // not present").
  // ---------------------------------------------------------------------------
  const blogDescriptions: Record<string, string> = {
    'Alkaline Noodles and the Perfect Slurp': "Alkaline noodles get their signature bite from kansui, an alkaline mineral water that firms the wheat's gluten structure.",
    "A Beginner's Guide to Japanese Sake Pairing": 'Sake pairing rewards curiosity more than expertise — a few simple rules about temperature and body go a long way.',
    'Crafting the Perfect Shoyu Tare at Home': 'A rich, glossy shoyu tare is the backbone of a great bowl of ramen, built from soy sauce, mirin, and kombu simmered low and slow.',
    'Grilling Perfection: The Art of Yakitori': 'Perfect yakitori comes down to consistent charcoal heat, precise skewering, and patience — rushing any of the three shows immediately in the char.',
    'Hand-folding 1,000 Gyoza Daily': 'Every dumpling on our menu is folded by hand each morning, a ritual our kitchen team treats as seriously as any other prep.',
    'Mastering the 48-Hour Tonkotsu Broth': 'The secret to our signature ramen lies in the slow, meticulous simmering of pork bones over two full days. Discover the passion, precision, and traditional techniques that go into every bowl at Zuru Zuru.',
    'Omotenashi: The Japanese Spirit of Hospitality': 'Omotenashi describes a form of hospitality anticipated before a guest ever has to ask for it.',
    'The Evolution of the Izakaya in Modern Times': 'The Izakaya began as an informal stop for sake merchants and has since become a cornerstone of Japanese social life.',
    'The Journey of Fresh Tuna: From Sea to Plate': 'Every piece of tuna on our sushi counter is chosen the same morning it is served, following relationships built over a decade with a handful of trusted suppliers.',
    'Why Ceremonial Grade Matcha Matters': 'Ceremonial grade matcha is stone-ground from shade-grown leaves and never touches direct sunlight until harvest, giving it the vivid color and sweetness our dessert menu depends on.',
  }

  const allPosts = await payload.find({
    collection: 'blog-posts',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: { tenantId: { equals: tenantId } },
  })

  let blogUpdated = 0
  let blogUnchanged = 0
  for (const post of allPosts.docs) {
    const description = blogDescriptions[post.title]
    if (!description) continue
    const metaTitle = truncate(`${post.title} | Zuru Zuru`, 70)
    const metaDescription = truncate(description, 160)
    if (post.metaTitle === metaTitle && post.metaDescription === metaDescription) {
      blogUnchanged += 1
      continue
    }
    await payload.update({
      id: post.id,
      collection: 'blog-posts',
      data: { metaDescription, metaTitle },
      overrideAccess: true,
      user,
    })
    blogUpdated += 1
  }

  payload.logger.info('Zuru Zuru SEO seed completed.')

  return {
    blogPosts: { unchanged: blogUnchanged, updated: blogUpdated },
    media: { created: mediaCreated, reused: mediaReused },
    seo: {
      fieldsUpdated: Object.keys(seoData).filter((key) => key !== 'tenantId'),
      status: existingSEO ? 'updated' : 'created',
    },
  }
}
