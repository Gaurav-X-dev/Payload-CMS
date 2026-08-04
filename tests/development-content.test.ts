import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import type { Payload } from 'payload'
import { resolveLocalSite } from '../src/lib/site/resolveLocalSite.ts'
import { resolveHostname } from '../src/lib/site/resolveHostname.ts'
import {
  gheeRoastLegacyFallbacksEnabled,
  tenantCanRenderGheeRoast,
  themeStaticFallbacksEnabled,
} from '../src/lib/site/themeFallbacks.ts'
import {
  seedDevelopmentContent,
  validateDevelopmentSeedEnvironment,
} from '../src/seed/development.ts'
import {
  assertDevelopmentResetAllowed,
  resetDevelopmentData,
} from '../src/seed/resetDevelopmentData.ts'
import {
  emptyGheeRoastHero,
  emptyGheeRoastNavigation,
  mapGheeRoastHero,
  mapGheeRoastNavigation,
} from '../src/themes/ghee-roast/mappers/cmsContent.ts'

test('development reset refuses production and requires confirmation', () => {
  assert.throws(
    () => assertDevelopmentResetAllowed({ confirm: true, nodeEnv: 'production' }),
    /disabled/,
  )
  assert.throws(
    () => assertDevelopmentResetAllowed({ confirm: false, nodeEnv: 'development' }),
    /--confirm/,
  )
  assert.doesNotThrow(
    () => assertDevelopmentResetAllowed({ confirm: true, nodeEnv: 'development' }),
  )
})

test('development seed validates every credential without logging passwords', () => {
  assert.throws(
    () => validateDevelopmentSeedEnvironment({}),
    /SEED_SUPER_ADMIN_NAME/,
  )
})

test('hostname normalization supports localhost ports, www, and unknown domains', () => {
  assert.equal(resolveHostname('ghee-roast.localhost:3000'), 'ghee-roast.localhost')
  assert.equal(resolveHostname('www.ghee-roast.localhost:3000'), 'ghee-roast.localhost')
  assert.equal(resolveHostname('unknown.example:8080'), 'unknown.example')
  assert.equal(resolveLocalSite('ghee-roast.localhost:3000')?.key, 'ghee-roast')
  assert.equal(resolveLocalSite('unknown.example:8080'), null)
})

test('inactive or mismatched tenants cannot expose the Ghee Roast theme', () => {
  assert.equal(tenantCanRenderGheeRoast({ isActive: true, theme: 'ghee-roast' }), true)
  assert.equal(tenantCanRenderGheeRoast({ isActive: false, theme: 'ghee-roast' }), false)
  assert.equal(tenantCanRenderGheeRoast({ isActive: true, theme: 'zuru-zuru' }), false)
  assert.equal(tenantCanRenderGheeRoast({ isActive: true }), false)
})

test('static fallback configuration is explicit and disabled by default', () => {
  assert.equal(themeStaticFallbacksEnabled(undefined), false)
  assert.equal(themeStaticFallbacksEnabled('false'), false)
  assert.equal(themeStaticFallbacksEnabled('TRUE'), true)
  assert.equal(gheeRoastLegacyFallbacksEnabled(undefined, 'development'), false)
  assert.equal(gheeRoastLegacyFallbacksEnabled('true', 'development'), true)
  assert.equal(gheeRoastLegacyFallbacksEnabled('true', 'production'), false)
})

test('navigation mapper is tenant scoped and never injects static links', () => {
  const mapped = mapGheeRoastNavigation({
    tenantId: 10,
    brandName: 'CMS Brand',
    links: [
      { blockType: 'link', enabled: true, label: 'Contact', sortOrder: 20, type: 'internal', url: '/contact' },
      { blockType: 'link', enabled: true, label: 'Home', sortOrder: 0, type: 'internal', url: '/' },
      { blockType: 'link', enabled: false, label: 'Hidden', sortOrder: 10, type: 'internal', url: '/hidden' },
    ],
    cta: { enabled: true, label: 'Reserve', url: '/contact' },
  }, 10)

  assert.equal(mapped.brandName, 'CMS Brand')
  assert.deepEqual(mapped.items.map((item) => item.label), ['Home', 'Contact'])
  assert.equal(mapped.cta.label, 'Reserve')
  assert.deepEqual(
    mapGheeRoastNavigation({ tenantId: 11, brandName: 'Foreign' }, 10),
    emptyGheeRoastNavigation(),
  )
  assert.deepEqual(mapGheeRoastNavigation(null, 10), emptyGheeRoastNavigation())
  assert.deepEqual(
    mapGheeRoastNavigation(null, 10, {
      fallbacksEnabled: false,
      tenantName: 'Ghee Roast',
    }),
    emptyGheeRoastNavigation('Ghee Roast'),
  )
  assert.deepEqual(
    mapGheeRoastNavigation({ tenantId: 11, brandName: 'Foreign' }, 10, {
      fallbacksEnabled: false,
    }),
    emptyGheeRoastNavigation(),
  )
  assert.deepEqual(
    mapGheeRoastNavigation(null, 10, {
      fallbacksEnabled: true,
      tenantName: 'Ghee Roast',
    }),
    emptyGheeRoastNavigation('Ghee Roast'),
  )
})

test('hero mapper returns only the requested tenant published homepage', () => {
  const mapped = mapGheeRoastHero({
    _status: 'published',
    isHomePage: true,
    tenantId: 10,
    layout: [{
      blockType: 'heroBlock',
      description: 'CMS description',
      enabled: true,
      heading: 'CMS heading',
      highlightedHeading: 'CMS highlight',
      primaryCTALabel: 'Menu',
      primaryCTAURL: '/menu',
      secondaryCTALabel: 'Delivery',
      secondaryCTAURL: '/delivery',
    }],
  }, 10)

  assert.equal(mapped.heading, 'CMS heading')
  assert.equal(mapped.description, 'CMS description')
  assert.deepEqual(
    mapGheeRoastHero({ _status: 'published', tenantId: 11, isHomePage: true, layout: [] }, 10),
    emptyGheeRoastHero(),
  )
  assert.deepEqual(mapGheeRoastHero(null, 10), emptyGheeRoastHero())
  assert.deepEqual(
    mapGheeRoastHero(null, 10, { fallbacksEnabled: false }),
    emptyGheeRoastHero(),
  )
  assert.equal(emptyGheeRoastHero().enabled, false)
})

type StoredDocument = Record<string, unknown> & { id: number }

const matchesWhere = (document: StoredDocument, where: Record<string, unknown>): boolean => {
  if (Array.isArray(where.and)) {
    return where.and.every((condition) => matchesWhere(document, condition as Record<string, unknown>))
  }
  return Object.entries(where).every(([field, condition]) => {
    const operator = condition as { equals?: unknown }
    return !('equals' in operator) || document[field] === operator.equals
  })
}

const createPayloadMock = (initial: Record<string, StoredDocument[]> = {}) => {
  const data = new Map(
    Object.entries(initial).map(([collection, documents]) => [
      collection,
      documents.map((document) => ({ ...document })),
    ]),
  )
  let nextID = Math.max(
    0,
    ...Array.from(data.values()).flat().map((document) => document.id),
  ) + 1
  const operations = {
    deletes: [] as Array<{ collection: string, id: number }>,
    updates: [] as Array<{ collection: string, id: number }>,
  }

  const payload = {
    create: async ({ collection, data: input }: { collection: string, data: Record<string, unknown> }) => {
      const document = { ...input, id: nextID++ }
      data.set(collection, [...(data.get(collection) ?? []), document])
      return document
    },
    delete: async ({ collection, id }: { collection: string, id: number }) => {
      operations.deletes.push({ collection, id })
      const documents = data.get(collection) ?? []
      const document = documents.find((item) => item.id === id)
      data.set(collection, documents.filter((item) => item.id !== id))
      return document
    },
    find: async ({ collection, where }: { collection: string, where?: Record<string, unknown> }) => ({
      docs: (data.get(collection) ?? []).filter((document) => !where || matchesWhere(document, where)),
      totalDocs: data.get(collection)?.length ?? 0,
    }),
    logger: {
      info: () => undefined,
      warn: () => undefined,
    },
    update: async ({ collection, data: input, id }: { collection: string, data: Record<string, unknown>, id: number }) => {
      const documents = data.get(collection) ?? []
      const index = documents.findIndex((document) => document.id === id)
      const document = { ...documents[index], ...input, id }
      documents[index] = document
      operations.updates.push({ collection, id })
      return document
    },
  } as unknown as Payload

  return { data, operations, payload }
}

test('development reset dry-run reports counts without changing records', async () => {
  const { data, operations, payload } = createPayloadMock({
    media: [{ id: 1, tenantId: 5 }],
    nav: [{ id: 2, tenantId: 5 }],
    pages: [{ id: 3, tenantId: 5 }],
    'site-settings': [{ id: 4, tenantId: 5 }],
    tenants: [{ id: 5 }],
    users: [{ id: 6, email: 'remove@example.test', tenants: [5] }],
  })
  const before = JSON.stringify(Array.from(data.entries()))

  const summary = await resetDevelopmentData(payload, {
    confirm: true,
    dryRun: true,
    nodeEnv: 'development',
  })

  assert.equal(JSON.stringify(Array.from(data.entries())), before)
  assert.equal(operations.deletes.length, 0)
  assert.equal(operations.updates.length, 0)
  assert.equal(summary.nav, 1)
  assert.equal(summary.pages, 1)
  assert.equal(summary['site-settings'], 1)
  assert.equal(summary.tenants, 1)
  assert.equal(summary.users, 1)
  assert.equal(summary.media, 0)
})

test('development reset removes tenant content and detaches retained media', async () => {
  const { data, payload } = createPayloadMock({
    media: [{ id: 1, tenantId: 10, uploadedBy: 20, updatedBy: 20 }],
    nav: [{ id: 2, tenantId: 10 }],
    pages: [{ id: 3, tenantId: 10 }],
    'site-settings': [{ id: 4, tenantId: 10 }],
    tenants: [{ id: 10 }],
    users: [
      { id: 20, email: 'remove@example.test', tenants: [10] },
      { id: 21, email: 'keep@example.test', tenants: [10] },
    ],
  })

  await resetDevelopmentData(payload, {
    confirm: true,
    nodeEnv: 'development',
    preserveEmails: ['KEEP@example.test'],
  })

  assert.equal(data.get('nav')?.length, 0)
  assert.equal(data.get('pages')?.length, 0)
  assert.equal(data.get('site-settings')?.length, 0)
  assert.equal(data.get('tenants')?.length, 0)
  assert.deepEqual(data.get('users')?.map((user) => user.email), ['keep@example.test'])
  assert.deepEqual(data.get('users')?.[0]?.tenants, [])
  assert.equal(data.get('media')?.length, 1)
  assert.equal(data.get('media')?.[0]?.tenantId, null)
})

test('development reset deletes media only with the explicit include flag', async () => {
  const { data, payload } = createPayloadMock({
    media: [{ id: 1, tenantId: 10 }],
    tenants: [{ id: 10 }],
  })

  await resetDevelopmentData(payload, {
    confirm: true,
    includeMedia: true,
    nodeEnv: 'development',
  })

  assert.equal(data.get('media')?.length, 0)
  assert.equal(data.get('tenants')?.length, 0)
})

test('development startup does not invoke seed or tenant default creation', () => {
  const packageJSON = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { scripts: Record<string, string> }
  const payloadConfig = readFileSync(
    new URL('../src/payload.config.ts', import.meta.url),
    'utf8',
  )

  assert.equal(packageJSON.scripts.dev, 'next dev')
  assert.doesNotMatch(packageJSON.scripts.dev, /seed/i)
  assert.doesNotMatch(payloadConfig, /createTenantDefaults|seedDevelopmentContent/)
})

test('development seed is idempotent and assigns the tenant administrator', async () => {
  const { data, payload } = createPayloadMock()
  const environment = {
    SEED_SUPER_ADMIN_EMAIL: 'admin@example.test',
    SEED_SUPER_ADMIN_NAME: 'Super Admin',
    SEED_SUPER_ADMIN_PASSWORD: 'not-logged-super-password',
    SEED_TENANT_DOMAIN: 'ghee-roast.localhost',
    SEED_TENANT_USER_EMAIL: 'manager@example.test',
    SEED_TENANT_USER_NAME: 'Ghee Manager',
    SEED_TENANT_USER_PASSWORD: 'not-logged-tenant-password',
  }

  const first = await seedDevelopmentContent(payload, environment)
  const second = await seedDevelopmentContent(payload, environment)

  assert.deepEqual(second, first)
  assert.equal(data.get('users')?.length, 2)
  assert.equal(data.get('tenants')?.length, 1)
  assert.equal(data.get('site-settings')?.length, 1)
  assert.equal(data.get('nav')?.length, 1)
  assert.equal(data.get('pages')?.length, 1)

  const users = data.get('users') ?? []
  const superAdmin = users.find((user) => user.email === 'admin@example.test')
  const tenantAdmin = users.find((user) => user.email === 'manager@example.test')
  assert.deepEqual(superAdmin?.roles, ['super_admin'])
  assert.deepEqual(superAdmin?.tenants, [])
  assert.deepEqual(tenantAdmin?.roles, ['tenant_admin'])
  assert.deepEqual(tenantAdmin?.tenants, [first.tenantID])
})
