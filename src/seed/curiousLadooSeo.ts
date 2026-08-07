import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Payload, User } from 'payload'
import { USER_ROLES } from '../access/tenantContext'
import type { SiteSetting } from '../payload-types'
import { findOrUploadMedia, type MediaUploadSpec } from './mediaUpload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '..', '..')

export type CuriousLadooSeoSeedResult = {
  media: { created: number; reused: number }
  seo: 'skipped' | 'updated'
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

export async function seedCuriousLadooSeoContent(
  payload: Payload,
): Promise<CuriousLadooSeoSeedResult> {
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo SEO seed as.')
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
  // Media — reused, never re-uploaded (already uploaded by the Home seed).
  // ---------------------------------------------------------------------------
  let mediaCreated = 0
  let mediaReused = 0
  const before = await payload.count({
    collection: 'media',
    overrideAccess: true,
    where: { and: [{ tenantId: { equals: tenantId } }, { title: { equals: 'hero.png' } }] },
  })
  const heroImage = await findOrUploadMedia(payload, {
    projectRoot,
    spec: { alt: 'Curious Ladoo', sourcePath: 'themes/curious-hub/images/hero.png', title: 'hero.png' } satisfies MediaUploadSpec,
    tenantId,
    user,
  })
  if (before.totalDocs > 0) mediaReused += 1
  else mediaCreated += 1

  // ---------------------------------------------------------------------------
  // Site Settings — read-only here, purely to build the Organization schema's
  // `sameAs` array from the social links already configured in Milestone 3.
  // ---------------------------------------------------------------------------
  const siteSettings = (await findFirst(payload, 'site-settings', {
    tenantId: { equals: tenantId },
  })) as SiteSetting | undefined
  const socialUrls = (siteSettings?.socials ?? [])
    .filter((social) => social.enabled !== false && social.url)
    .map((social) => social.url)

  // ---------------------------------------------------------------------------
  // SEO — partial update: only `jsonLd` and `defaultOGImage` are touched. Every
  // other field (metaTitlePattern, metaDescription, keywords, robots, ogTitle,
  // ogSiteName, twitterCard, twitterSite — all already configured in Milestone
  // 3) is left completely untouched by Payload's partial-update semantics.
  // ---------------------------------------------------------------------------
  const existingSeo = await findFirst(payload, 'seo', { tenantId: { equals: tenantId } })
  let seoResult: CuriousLadooSeoSeedResult['seo'] = 'skipped'
  if (existingSeo) {
    const organizationJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Curious Ladoo',
      description: 'A premium hospitality group building restaurant brands, consulting services, cloud kitchens, and hospitality systems across India.',
      ...(socialUrls.length ? { sameAs: socialUrls } : {}),
    }
    await payload.update({
      id: existingSeo.id,
      collection: 'seo',
      data: {
        defaultOGImage: heroImage.id,
        jsonLd: JSON.stringify(organizationJsonLd, null, 2),
      },
      overrideAccess: true,
      user,
    })
    seoResult = 'updated'
  }

  payload.logger.info('Curious Ladoo SEO seed completed.')

  return {
    media: { created: mediaCreated, reused: mediaReused },
    seo: seoResult,
  }
}
