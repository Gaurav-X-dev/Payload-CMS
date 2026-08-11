import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { getPayload, type BasePayload } from 'payload'
import configPromise from '../../src/payload.config'
import {
  buildEmptyDayBuckets,
  incrementBucketForTimestamp,
  rangeStartISOString,
  totalBucketCount,
} from '../../src/lib/admin/dashboard/dateBuckets'
import { getContentGrowth } from '../../src/lib/admin/dashboard/getContentGrowth'
import { getPublishingTrend } from '../../src/lib/admin/dashboard/getPublishingTrend'
import { getRecentUpdates } from '../../src/lib/admin/dashboard/getRecentUpdates'
import {
  getAPIStatus,
  getBackgroundJobsStatus,
  getStorageUsage,
} from '../../src/lib/admin/dashboard/getSystemHealth'
import { CONTENT_GROWTH_COLLECTIONS } from '../../src/lib/admin/dashboard/contentCollections'

// A tiny, valid 1x1 transparent PNG — used only to prove Storage Usage against a real,
// known-size upload, never a real asset.
const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

const ALL_CONTENT_SLUGS = new Set(CONTENT_GROWTH_COLLECTIONS.map((c) => c.slug))

const RUN_ID = `dashboard-${Date.now()}`

let payload: BasePayload
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let superAdmin: any
const disposableTenantIds: number[] = []
const disposableUserIds: number[] = []
const disposablePageIds: number[] = []
const disposableBlogPostIds: number[] = []
const disposableMediaIds: number[] = []

before(async () => {
  payload = await getPayload({ config: configPromise })
  const superAdminResult = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { roles: { contains: 'super_admin' } },
  })
  superAdmin = superAdminResult.docs[0]
  assert.ok(superAdmin, 'expected an existing Super Admin to run fixture creates as')
})

after(async () => {
  for (const id of disposableMediaIds) {
    await payload.delete({ id, collection: 'media', overrideAccess: true }).catch(() => {})
  }
  for (const id of disposablePageIds) {
    await payload.delete({ id, collection: 'pages', overrideAccess: true }).catch(() => {})
  }
  for (const id of disposableBlogPostIds) {
    await payload.delete({ id, collection: 'blog-posts', overrideAccess: true }).catch(() => {})
  }
  for (const id of disposableUserIds) {
    await payload.delete({ id, collection: 'users', overrideAccess: true }).catch(() => {})
  }
  for (const id of disposableTenantIds) {
    await payload.delete({ id, collection: 'tenants', overrideAccess: true }).catch(() => {})
  }
  await payload.db.destroy?.()
})

const createTenant = async (label: string): Promise<number> => {
  const tenant = await payload.create({
    collection: 'tenants',
    data: {
      name: `Dashboard Test ${label}`,
      slug: `${RUN_ID}-${label}`,
      type: 'restaurant',
      domains: [{ domain: `${RUN_ID}-${label}.example.com` }],
      isActive: true,
    },
    overrideAccess: true,
  })
  disposableTenantIds.push(tenant.id)
  return tenant.id
}

const createTenantAdmin = async (email: string, tenantId: number) => {
  const user = await payload.create({
    collection: 'users',
    data: {
      name: 'Dashboard Test Tenant Admin',
      email,
      password: 'DisposableTestPassword123!',
      roles: ['tenant_admin'],
      tenants: [tenantId],
    },
    overrideAccess: true,
    req: { user: superAdmin } as never,
  })
  disposableUserIds.push(user.id as number)
  return user
}

const createPage = async (
  tenantId: number,
  title: string,
  status: 'draft' | 'published',
): Promise<number> => {
  const page = await payload.create({
    collection: 'pages',
    data: { title, tenantId, _status: status } as never,
    overrideAccess: true,
    req: { user: superAdmin } as never,
  })
  disposablePageIds.push(page.id as number)
  return page.id as number
}

const createBlogPost = async (
  tenantId: number,
  title: string,
  status: 'archived' | 'draft' | 'published',
): Promise<number> => {
  const post = await payload.create({
    collection: 'blog-posts',
    data: {
      title,
      tenantId,
      status,
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Disposable test content.', version: 1 }],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
    } as never,
    overrideAccess: true,
    req: { user: superAdmin } as never,
  })
  disposableBlogPostIds.push(post.id as number)
  return post.id as number
}

const createMedia = async (tenantId: number, alt: string, sizeBytes: number) => {
  const media = await payload.create({
    collection: 'media',
    data: { alt, tenantId } as never,
    file: {
      data: ONE_PIXEL_PNG,
      mimetype: 'image/png',
      name: `${RUN_ID}-${alt.replace(/\s+/g, '-')}.png`,
      size: sizeBytes,
    },
    overrideAccess: true,
    req: { user: superAdmin } as never,
  })
  disposableMediaIds.push(media.id as number)
  return media
}

describe('dateBuckets (pure, no DB)', () => {
  test('buildEmptyDayBuckets returns N buckets ending today, all zero', () => {
    const now = new Date('2026-08-11T12:00:00.000Z')
    const buckets = buildEmptyDayBuckets(7, now)
    assert.equal(buckets.length, 7)
    assert.equal(buckets[6].date, '2026-08-11')
    assert.equal(buckets[0].date, '2026-08-05')
    assert.ok(buckets.every((b) => b.count === 0))
  })

  test('incrementBucketForTimestamp increments the matching day and ignores out-of-range timestamps', () => {
    const now = new Date('2026-08-11T12:00:00.000Z')
    const buckets = buildEmptyDayBuckets(7, now)
    incrementBucketForTimestamp(buckets, '2026-08-11T03:00:00.000Z')
    incrementBucketForTimestamp(buckets, '2026-08-11T20:00:00.000Z')
    incrementBucketForTimestamp(buckets, '2025-01-01T00:00:00.000Z') // way out of range
    incrementBucketForTimestamp(buckets, null)
    assert.equal(totalBucketCount(buckets), 2)
    assert.equal(buckets[6].count, 2)
  })

  test('rangeStartISOString is exactly 6 days before the start of today (7-day inclusive window)', () => {
    const now = new Date('2026-08-11T15:30:00.000Z')
    const start = rangeStartISOString(7, now)
    assert.equal(start, '2026-08-05T00:00:00.000Z')
  })
})

describe('Dashboard data layer — tenant isolation and real-count proof (live DB)', () => {
  let tenantA: number
  let tenantB: number
  let adminA: Awaited<ReturnType<typeof createTenantAdmin>>
  let adminB: Awaited<ReturnType<typeof createTenantAdmin>>

  before(async () => {
    tenantA = await createTenant('a')
    tenantB = await createTenant('b')
    adminA = await createTenantAdmin(`${RUN_ID}-admin-a@example.com`, tenantA)
    adminB = await createTenantAdmin(`${RUN_ID}-admin-b@example.com`, tenantB)

    // Tenant A: 3 pages (content growth material)
    await createPage(tenantA, `${RUN_ID} Page A1`, 'published')
    await createPage(tenantA, `${RUN_ID} Page A2`, 'draft')
    await createPage(tenantA, `${RUN_ID} Page A3`, 'published')

    // Tenant B: 1 page — must never appear in tenant A's numbers
    await createPage(tenantB, `${RUN_ID} Page B1`, 'published')
  })

  test('Content Growth: tenant admin sees only their own tenant\'s real count, matching a direct DB count exactly', async () => {
    const result = await getContentGrowth({
      isSuperAdmin: false,
      payload,
      user: adminA,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })

    const rangeStart = rangeStartISOString(7)
    const groundTruth = await payload.count({
      collection: 'pages',
      overrideAccess: true,
      where: {
        and: [
          { tenantId: { equals: tenantA } },
          { createdAt: { greater_than_equal: rangeStart } },
        ],
      },
    })

    assert.equal(result.total, groundTruth.totalDocs)
    assert.equal(result.total, 3, 'expected exactly the 3 pages created for tenant A (draft + published both count as "created")')
    assert.equal(result.hasAnyData, true)
  })

  test('Content Growth: tenant isolation — tenant B\'s content never leaks into tenant A\'s count', async () => {
    const resultA = await getContentGrowth({
      isSuperAdmin: false,
      payload,
      user: adminA,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })
    const resultB = await getContentGrowth({
      isSuperAdmin: false,
      payload,
      user: adminB,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })

    assert.equal(resultA.total, 3)
    assert.equal(resultB.total, 1)
  })

  test('Content Growth: Super Admin sees an aggregate that includes both tenants', async () => {
    const resultSuper = await getContentGrowth({
      isSuperAdmin: true,
      payload,
      user: superAdmin,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })

    // Super Admin's aggregate must be at least the sum of both disposable tenants' fixtures
    // (>= rather than === because the real database may have other same-day activity).
    assert.ok(resultSuper.total >= 4, `expected super admin total >= 4, got ${resultSuper.total}`)
  })

  test('Publishing Trend: only genuinely published pages are counted, never drafts', async () => {
    const result = await getPublishingTrend({
      isSuperAdmin: false,
      payload,
      user: adminA,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })

    const rangeStart = rangeStartISOString(7)
    const groundTruth = await payload.count({
      collection: 'pages',
      overrideAccess: true,
      where: {
        and: [
          { tenantId: { equals: tenantA } },
          { _status: { equals: 'published' } },
          { updatedAt: { greater_than_equal: rangeStart } },
        ],
      },
    })

    assert.equal(result.total, groundTruth.totalDocs)
    assert.equal(result.total, 2, 'expected exactly the 2 published pages for tenant A — the draft must be excluded')
    assert.ok(result.caveat.length > 0, 'expected the Pages timestamp caveat to be surfaced')
  })

  test('Publishing Trend: blog-posts use status/publishedDate semantics, archived/draft excluded', async () => {
    await createBlogPost(tenantA, `${RUN_ID} Blog Published`, 'published')
    await createBlogPost(tenantA, `${RUN_ID} Blog Draft`, 'draft')
    await createBlogPost(tenantA, `${RUN_ID} Blog Archived`, 'archived')

    const result = await getPublishingTrend({
      isSuperAdmin: false,
      payload,
      user: adminA,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })

    // 2 published pages (previous test) + 1 published blog post = 3
    assert.equal(result.total, 3)
  })

  test('Recent Updates: sorted by real updatedAt, tenant-scoped, never leaks another tenant\'s documents', async () => {
    const resultA = await getRecentUpdates({
      isSuperAdmin: false,
      payload,
      user: adminA,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })

    assert.ok(resultA.length > 0)
    assert.ok(
      resultA.every((item) => !item.title.includes('Page B1')),
      'tenant A\'s Recent Updates must never include tenant B\'s page',
    )
    for (let i = 1; i < resultA.length; i += 1) {
      assert.ok(
        resultA[i - 1].updatedAt >= resultA[i].updatedAt,
        'Recent Updates must be sorted newest-first',
      )
    }
  })

  test('API Status: reports operational for a real, working probe query', async () => {
    const status = await getAPIStatus(
      { isSuperAdmin: false, payload, user: adminA, visibleCollectionSlugs: ALL_CONTENT_SLUGS },
      'pages',
    )
    assert.equal(status.state, 'operational')
    assert.equal(typeof status.latencyMs, 'number')
  })

  test('Background Jobs: always reports the truthful "not configured" state', () => {
    assert.deepEqual(getBackgroundJobsStatus(), { state: 'not_configured' })
  })

  test('Storage Usage: real media count/filesize, tenant-scoped, matches a direct DB read exactly', async () => {
    const media = await createMedia(tenantA, `${RUN_ID} storage test`, 12345)

    const result = await getStorageUsage({
      isSuperAdmin: false,
      payload,
      user: adminA,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })

    const groundTruth = await payload.findByID({
      id: media.id,
      collection: 'media',
      depth: 0,
      overrideAccess: true,
    })

    assert.equal(result.mediaCount, 1)
    assert.equal(result.totalBytes, (groundTruth as unknown as { filesize: number }).filesize)

    const resultB = await getStorageUsage({
      isSuperAdmin: false,
      payload,
      user: adminB,
      visibleCollectionSlugs: ALL_CONTENT_SLUGS,
    })
    assert.equal(resultB.mediaCount, 0, 'tenant B must never see tenant A\'s media in its storage usage')
  })
})
