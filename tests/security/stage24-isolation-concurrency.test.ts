import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { getPayload, type BasePayload } from 'payload'
import config from '../../src/payload.config.ts'
import { shutdownPayload } from './fixtures.ts'

const API_URL = 'http://localhost:3000/api'
const PASSWORD = 'stage24-password'
const FIXED_TIME = '2024-01-01T00:00:00.000Z'
const TENANT_SLUGS = ['stage24-tenant-a', 'stage24-tenant-b']
const USER_EMAILS = [
  'stage24-super-admin@example.com',
  'stage24-user-a@example.com',
  'stage24-user-b@example.com',
  'stage24-duplicate@example.com',
]
const PAGE_SLUGS = [
  'stage24-document-a',
  'stage24-document-b',
  'stage24-repeatable',
  'stage24-concurrent-a-1',
  'stage24-concurrent-a-2',
  'stage24-concurrent-a-3',
  'stage24-concurrent-a-4',
  'stage24-cross-a',
  'stage24-cross-b',
  'stage24-rejected-cross-tenant',
]
const MEDIA_FILENAMES = ['stage24-media-a.png']

let payload: BasePayload
let fixtures: any

const tenantID = (value: unknown) =>
  typeof value === 'object' && value !== null && 'id' in value
    ? (value as { id: unknown }).id
    : value

const apiFetch = (path: string, options: RequestInit = {}) =>
  fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

const requestFor = (user: any, tenant: any) => ({
  user,
  headers: new Headers({ 'x-tenant-id': String(tenant.id) }),
})

const assertStructuredError = (error: any) => {
  assert.ok(error?.message || error?.status, 'Expected a structured error')
  assert.notStrictEqual(error?.status, 500, 'Structured failure must never be HTTP 500')
}

const assertSafeRESTFailure = async (response: Response) => {
  assert.ok(
    response.status >= 400 && response.status < 500,
    `Expected a REST client error, got ${response.status}`,
  )

  const body = await response.clone().text()
  const forbiddenFragments = [
    'stack',
    'TypeError',
    'PostgreSQL',
    'postgres://',
    'postgresql://',
    'SELECT ',
    'INSERT ',
    'UPDATE ',
    'DELETE FROM',
    'C:\\',
    '/Users/',
    'PAYLOAD_SECRET',
    'DATABASE_URI',
  ]
  const configuredSecrets = [
    process.env.PAYLOAD_SECRET,
    process.env.DATABASE_URI,
  ].filter((value): value is string => Boolean(value))

  for (const fragment of [...forbiddenFragments, ...configuredSecrets]) {
    assert.ok(!body.includes(fragment), `REST error leaked forbidden information: ${fragment}`)
  }
}

const deleteMatching = async (
  instance: BasePayload,
  collection: 'media' | 'pages' | 'users' | 'tenants',
  where: Record<string, unknown>,
  errors: unknown[],
) => {
  try {
    const result = await instance.find({
      collection,
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where,
    } as never)

    for (const doc of result.docs) {
      try {
        if (collection === 'media') {
          await instance.db.deleteOne({
            collection,
            req: { payload: instance },
            where: { id: { equals: doc.id } },
          })
        } else {
          await instance.delete({
            collection,
            id: doc.id,
            overrideAccess: true,
          } as never)
        }
      } catch (error) {
        errors.push(error)
      }
    }
  } catch (error) {
    errors.push(error)
  }
}

const cleanupStage24Namespace = async (instance: BasePayload) => {
  const errors: unknown[] = []

  await deleteMatching(
    instance,
    'media',
    { filename: { in: MEDIA_FILENAMES } },
    errors,
  )
  await deleteMatching(
    instance,
    'pages',
    { slug: { in: PAGE_SLUGS } },
    errors,
  )
  await deleteMatching(
    instance,
    'users',
    { email: { in: USER_EMAILS } },
    errors,
  )
  await deleteMatching(
    instance,
    'tenants',
    { slug: { in: TENANT_SLUGS } },
    errors,
  )

  if (errors.length) {
    throw new AggregateError(errors, 'Stage 24 namespace cleanup failed')
  }
}

const createFixtures = async (instance: BasePayload) => {
  const tenantA = await instance.create({
    collection: 'tenants',
    data: {
      name: 'stage24-tenant-a',
      slug: TENANT_SLUGS[0],
      type: 'restaurant',
      domains: [{ domain: 'stage24-a.example.com' }],
      isActive: true,
    },
    overrideAccess: true,
  })
  const tenantB = await instance.create({
    collection: 'tenants',
    data: {
      name: 'stage24-tenant-b',
      slug: TENANT_SLUGS[1],
      type: 'restaurant',
      domains: [{ domain: 'stage24-b.example.com' }],
      isActive: true,
    },
    overrideAccess: true,
  })
  const superAdmin = await instance.create({
    collection: 'users',
    data: {
      name: 'stage24-super-admin',
      email: USER_EMAILS[0],
      password: PASSWORD,
      roles: ['super_admin'],
      tenants: [],
    },
    overrideAccess: true,
  })
  const privilegedRequest = { user: superAdmin }
  const userA = await instance.create({
    collection: 'users',
    data: {
      name: 'stage24-user-a',
      email: USER_EMAILS[1],
      password: PASSWORD,
      roles: ['tenant_admin'],
      tenants: [tenantA.id],
    },
    req: privilegedRequest,
    overrideAccess: true,
  })
  const userB = await instance.create({
    collection: 'users',
    data: {
      name: 'stage24-user-b',
      email: USER_EMAILS[2],
      password: PASSWORD,
      roles: ['tenant_admin'],
      tenants: [tenantB.id],
    },
    req: privilegedRequest,
    overrideAccess: true,
  })
  const pageA = await instance.create({
    collection: 'pages',
    data: {
      title: 'stage24-document-a',
      slug: PAGE_SLUGS[0],
      tenantId: tenantA.id,
      _status: 'published',
    },
    req: privilegedRequest,
    overrideAccess: true,
  })
  const pageB = await instance.create({
    collection: 'pages',
    data: {
      title: 'stage24-document-b',
      slug: PAGE_SLUGS[1],
      tenantId: tenantB.id,
      _status: 'published',
    },
    req: privilegedRequest,
    overrideAccess: true,
  })
  const mediaA = await instance.db.create({
    collection: 'media',
    data: {
      alt: 'stage24-media-a',
      tenantId: tenantA.id,
      filename: MEDIA_FILENAMES[0],
      mimeType: 'image/png',
      filesize: 68,
      createdAt: FIXED_TIME,
      updatedAt: FIXED_TIME,
    },
    req: { payload: instance },
  })

  return { tenantA, tenantB, superAdmin, userA, userB, pageA, pageB, mediaA }
}

describe('Stage 24 - Test Isolation and Concurrency Hardening', () => {
  before(async () => {
    payload = await getPayload({ config })
    await cleanupStage24Namespace(payload)
    fixtures = await createFixtures(payload)
  })

  after(async () => {
    const errors: unknown[] = []

    if (payload) {
      try {
        await cleanupStage24Namespace(payload)
      } catch (error) {
        errors.push(error)
      }
      try {
        await shutdownPayload(payload)
      } catch (error) {
        errors.push(error)
      }
    }

    if (errors.length) {
      throw new AggregateError(errors, 'Stage 24 teardown failed')
    }
  })

  test('deterministic fixtures are isolated and repeatable', async () => {
    const tenantResults = await payload.find({
      collection: 'tenants',
      overrideAccess: true,
      pagination: false,
      where: { slug: { in: TENANT_SLUGS } },
    })
    assert.strictEqual(tenantResults.docs.length, 2)

    const first = await payload.create({
      collection: 'pages',
      data: {
        title: 'stage24-repeatable',
        slug: PAGE_SLUGS[2],
        tenantId: fixtures.tenantA.id,
      },
      req: requestFor(fixtures.userA, fixtures.tenantA),
      overrideAccess: false,
    })
    await payload.delete({ collection: 'pages', id: first.id, overrideAccess: true })
    const second = await payload.create({
      collection: 'pages',
      data: {
        title: 'stage24-repeatable',
        slug: PAGE_SLUGS[2],
        tenantId: fixtures.tenantA.id,
      },
      req: requestFor(fixtures.userA, fixtures.tenantA),
      overrideAccess: false,
    })
    assert.strictEqual(second.slug, PAGE_SLUGS[2])
    assert.strictEqual(tenantID(second.tenantId), fixtures.tenantA.id)
  })

  test('bounded concurrent same-tenant creates remain complete and protected', async () => {
    const operations = [1, 2, 3, 4].map((index) =>
      payload.create({
        collection: 'pages',
        data: {
          title: `stage24-concurrent-a-${index}`,
          slug: `stage24-concurrent-a-${index}`,
          tenantId: fixtures.tenantA.id,
          roles: ['super_admin'],
          hash: 'forbidden',
        } as any,
        req: requestFor(fixtures.userA, fixtures.tenantA),
        overrideAccess: false,
      }),
    )
    const results = await Promise.allSettled(operations)
    const rejected = results.filter((result) => result.status === 'rejected')
    rejected.forEach((result: any) => assertStructuredError(result.reason))
    assert.strictEqual(rejected.length, 0, 'Bounded same-tenant creates should all succeed')

    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      assert.strictEqual(tenantID(result.value.tenantId), fixtures.tenantA.id)
      assert.strictEqual((result.value as any).roles, undefined)
      assert.strictEqual((result.value as any).hash, undefined)
    }

    const stored = await payload.find({
      collection: 'pages',
      overrideAccess: true,
      pagination: false,
      where: { slug: { in: PAGE_SLUGS.slice(3, 7) } },
    })
    assert.strictEqual(stored.docs.length, 4)
    stored.docs.forEach((doc) =>
      assert.strictEqual(tenantID(doc.tenantId), fixtures.tenantA.id))
  })

  test('bounded concurrent cross-tenant operations never mix request context', async () => {
    const results = await Promise.allSettled([
      payload.create({
        collection: 'pages',
        data: {
          title: 'stage24-cross-a',
          slug: PAGE_SLUGS[7],
          tenantId: fixtures.tenantA.id,
        },
        req: requestFor(fixtures.userA, fixtures.tenantA),
        overrideAccess: false,
      }),
      payload.create({
        collection: 'pages',
        data: {
          title: 'stage24-cross-b',
          slug: PAGE_SLUGS[8],
          tenantId: fixtures.tenantB.id,
        },
        req: requestFor(fixtures.userB, fixtures.tenantB),
        overrideAccess: false,
      }),
      payload.create({
        collection: 'pages',
        data: {
          title: 'stage24-rejected-cross-tenant',
          slug: PAGE_SLUGS[9],
          tenantId: fixtures.tenantB.id,
        },
        req: requestFor(fixtures.userA, fixtures.tenantA),
        overrideAccess: false,
      }),
      payload.update({
        collection: 'pages',
        id: fixtures.pageB.id,
        data: { title: 'stage24-illegal-update-by-a' },
        req: requestFor(fixtures.userA, fixtures.tenantA),
        overrideAccess: false,
      }),
      payload.findByID({
        collection: 'pages',
        id: fixtures.pageB.id,
        req: requestFor(fixtures.userA, fixtures.tenantA),
        overrideAccess: false,
      }),
      payload.delete({
        collection: 'pages',
        id: fixtures.pageB.id,
        req: requestFor(fixtures.userA, fixtures.tenantA),
        overrideAccess: false,
      }),
      payload.update({
        collection: 'pages',
        id: fixtures.pageA.id,
        data: { title: 'stage24-illegal-update' },
        req: requestFor(fixtures.userB, fixtures.tenantB),
        overrideAccess: false,
      }),
      payload.findByID({
        collection: 'pages',
        id: fixtures.pageA.id,
        req: requestFor(fixtures.userB, fixtures.tenantB),
        overrideAccess: false,
      }),
      payload.delete({
        collection: 'pages',
        id: fixtures.pageA.id,
        req: requestFor(fixtures.userB, fixtures.tenantB),
        overrideAccess: false,
      }),
    ])

    assert.strictEqual(results[0].status, 'fulfilled')
    assert.strictEqual(results[1].status, 'fulfilled')
    for (const result of results.slice(2)) {
      assert.strictEqual(result.status, 'rejected')
      if (result.status === 'rejected') assertStructuredError(result.reason)
    }

    const rejectedCreate = await payload.find({
      collection: 'pages',
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: PAGE_SLUGS[9] } },
    })
    assert.strictEqual(rejectedCreate.docs.length, 0)

    const unchangedA = await payload.findByID({
      collection: 'pages',
      id: fixtures.pageA.id,
      overrideAccess: true,
    })
    const unchangedB = await payload.findByID({
      collection: 'pages',
      id: fixtures.pageB.id,
      overrideAccess: true,
    })
    assert.strictEqual(unchangedA.title, 'stage24-document-a')
    assert.strictEqual(tenantID(unchangedA.tenantId), fixtures.tenantA.id)
    assert.strictEqual(unchangedB.title, 'stage24-document-b')
    assert.strictEqual(tenantID(unchangedB.tenantId), fixtures.tenantB.id)

    const visibleA = await payload.find({
      collection: 'pages',
      req: requestFor(fixtures.userA, fixtures.tenantA),
      overrideAccess: false,
      pagination: false,
    })
    const visibleB = await payload.find({
      collection: 'pages',
      req: requestFor(fixtures.userB, fixtures.tenantB),
      overrideAccess: false,
      pagination: false,
    })
    visibleA.docs.forEach((doc) =>
      assert.strictEqual(tenantID(doc.tenantId), fixtures.tenantA.id))
    visibleB.docs.forEach((doc) =>
      assert.strictEqual(tenantID(doc.tenantId), fixtures.tenantB.id))
  })

  test('concurrent duplicate unique resources leave exactly one sanitized record', async () => {
    const duplicateCreate = () => payload.create({
      collection: 'users',
      data: {
        name: 'stage24-duplicate',
        email: USER_EMAILS[3],
        password: PASSWORD,
        roles: ['super_admin'],
        tenants: [fixtures.tenantB.id],
      },
      req: requestFor(fixtures.userA, fixtures.tenantA),
      overrideAccess: false,
    })
    const results = await Promise.allSettled([duplicateCreate(), duplicateCreate()])
    const successful = results.filter((result) => result.status === 'fulfilled')
    const failed = results.filter((result) => result.status === 'rejected')

    assert.strictEqual(successful.length, 1)
    assert.strictEqual(failed.length, 1)
    if (failed[0].status === 'rejected') assertStructuredError(failed[0].reason)

    const stored = await payload.find({
      collection: 'users',
      depth: 0,
      overrideAccess: true,
      pagination: false,
      where: { email: { equals: USER_EMAILS[3] } },
    })
    assert.strictEqual(stored.docs.length, 1)
    assert.deepStrictEqual(stored.docs[0].roles, ['tenant_member'])
    assert.deepStrictEqual(stored.docs[0].tenants, [fixtures.tenantA.id])
  })

  test('authentication and session state remain tenant isolated', async () => {
    const loginA = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: USER_EMAILS[1], password: PASSWORD }),
    })
    const loginB = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: USER_EMAILS[2], password: PASSWORD }),
    })
    assert.strictEqual(loginA.status, 200)
    assert.strictEqual(loginB.status, 200)
    const authA = await loginA.json()
    const authB = await loginB.json()
    assert.ok(authA.token)
    assert.ok(authB.token)
    assert.notStrictEqual(authA.token, authB.token)

    const crossA = await apiFetch(`/pages/${fixtures.pageB.id}`, {
      headers: {
        Authorization: `JWT ${authA.token}`,
        'x-tenant-id': String(fixtures.tenantB.id),
      },
    })
    const crossB = await apiFetch(`/pages/${fixtures.pageA.id}`, {
      headers: {
        Authorization: `JWT ${authB.token}`,
        'x-tenant-id': String(fixtures.tenantA.id),
      },
    })
    await assertSafeRESTFailure(crossA)
    await assertSafeRESTFailure(crossB)

    const invalid = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: USER_EMAILS[1], password: 'invalid-password' }),
    })
    await assertSafeRESTFailure(invalid)
    const invalidBody = await invalid.json()
    assert.ok(!invalidBody.token)

    const loginCookie = loginA.headers.get('set-cookie')?.split(';')[0]
    assert.ok(loginCookie)
    const logout = await apiFetch('/users/logout', {
      method: 'POST',
      headers: { cookie: loginCookie },
    })
    assert.strictEqual(logout.status, 200)
    const clearedCookie = logout.headers.get('set-cookie')?.split(';')[0] || ''
    const afterLogout = await apiFetch('/users/me', {
      headers: { cookie: clearedCookie },
    })
    assert.notStrictEqual(afterLogout.status, 500)
    const afterLogoutBody = await afterLogout.json()
    assert.ok(!afterLogoutBody.user, 'Logged-out cookie retained stale authentication state')
  })

  test('media fixture is singular and assigned only to Tenant A', async () => {
    const media = await payload.find({
      collection: 'media',
      depth: 0,
      overrideAccess: true,
      pagination: false,
      where: { filename: { equals: MEDIA_FILENAMES[0] } },
    })
    assert.strictEqual(media.docs.length, 1)
    assert.strictEqual(media.docs[0].id, fixtures.mediaA.id)
    assert.strictEqual(tenantID(media.docs[0].tenantId), fixtures.tenantA.id)
  })
})
