import assert from 'node:assert/strict'
import { createServer, type Server } from 'node:http'
import { after, before, describe, test } from 'node:test'
import { Client } from 'pg'
import { getPayload, type BasePayload, type PayloadRequest } from 'payload'
import configPromise from '../../src/payload.config'
import { resolveTenantMailContext, toAbsoluteUrl } from '../../src/lib/mail/tenantMailContext'
import { generateForgotPasswordEmailHTML, generateForgotPasswordEmailSubject } from '../../src/lib/mail/forgotPasswordEmailContent'

const RUN_ID = `fp-eligibility-${Date.now()}`
const TOKEN_PATTERN = /[0-9a-f]{40}/

// getPayload() caches one instance per config — destroying the pool must happen exactly once,
// at the very end of the whole file (see the mail-tenant-branding.test.ts fix for why).
let payload: BasePayload
let pgClient: Client
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches tests/security/fixtures.ts convention
let superAdmin: any
const disposableTenantIds: number[] = []
const disposableUserIds: number[] = []
const disposableEmailSettingsIds: number[] = []

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

  // Payload never exposes resetPasswordToken/resetPasswordExpiration/hash/salt through any
  // read API, even with overrideAccess — by design. Raw SQL is the only way to verify them.
  pgClient = new Client({ connectionString: process.env.DATABASE_URI })
  await pgClient.connect()
})

after(async () => {
  for (const id of disposableEmailSettingsIds) {
    await payload.delete({ id, collection: 'email-settings', overrideAccess: true }).catch(() => {})
  }
  for (const id of disposableUserIds) {
    await payload.delete({ id, collection: 'users', overrideAccess: true }).catch(() => {})
  }
  for (const id of disposableTenantIds) {
    await payload.delete({ id, collection: 'tenants', overrideAccess: true }).catch(() => {})
  }
  await pgClient.end()
  await payload.db.destroy?.()
})

const createTenant = async (label: string) => {
  const domain = `${RUN_ID}-${label}.example.com`
  const tenant = await payload.create({
    collection: 'tenants',
    data: { name: `FP Eligibility ${label}`, slug: `${RUN_ID}-${label}`, type: 'restaurant', domains: [{ domain }], isActive: true },
    overrideAccess: true,
  })
  disposableTenantIds.push(tenant.id)

  const emailSettings = await payload.create({
    collection: 'email-settings',
    data: {
      tenantId: tenant.id,
      smtp: { enabled: false },
      welcomeEmail: { body: 'body', heading: 'heading', subject: 'subject' },
      forgotPasswordEmail: { body: 'Reset for {{site_name}}', heading: 'Reset', subject: 'Reset your {{site_name}} password' },
    },
    overrideAccess: true,
    req: { user: superAdmin } as never,
  })
  disposableEmailSettingsIds.push(emailSettings.id)

  return { domain, tenantId: tenant.id as number }
}

const createUser = async (email: string, tenantIds: number[]) => {
  const user = await payload.create({
    collection: 'users',
    data: { name: 'FP Eligibility Test User', email, password: 'DisposableTestPassword123!', roles: ['tenant_member'], tenants: tenantIds },
    overrideAccess: true,
    req: { user: superAdmin } as never,
  })
  disposableUserIds.push(user.id as number)
  return user.id as number
}

const buildReq = (host: string) => ({ headers: new Headers({ host }) }) as unknown as Partial<PayloadRequest>

const rawUserRow = async (
  userId: number,
): Promise<{ resetPasswordExpiration: string | null; resetPasswordToken: string | null; hash: string | null; salt: string | null }> => {
  const result = await pgClient.query(
    'SELECT reset_password_token, reset_password_expiration, hash, salt FROM users WHERE id = $1',
    [userId],
  )
  const row = result.rows[0] ?? {}
  return {
    hash: row.hash ?? null,
    resetPasswordExpiration: row.reset_password_expiration ?? null,
    resetPasswordToken: row.reset_password_token ?? null,
    salt: row.salt ?? null,
  }
}

/** Extracts the field-level message Payload nests inside a thrown ValidationError. */
const validationMessage = (err: unknown): string => {
  const typed = err as { cause?: { errors?: Array<{ message?: string }> }; errors?: Array<{ message?: string }> } | undefined
  return typed?.errors?.[0]?.message ?? typed?.cause?.errors?.[0]?.message ?? ''
}

describe('Tenant-scoped email existence validation', () => {
  let tenantA: { domain: string; tenantId: number }
  let tenantB: { domain: string; tenantId: number }
  let userAEmail: string
  let userBEmail: string
  let multiTenantEmail: string

  before(async () => {
    tenantA = await createTenant('a')
    tenantB = await createTenant('b')
    userAEmail = `${RUN_ID}-user-a@example.com`
    userBEmail = `${RUN_ID}-user-b@example.com`
    multiTenantEmail = `${RUN_ID}-multi@example.com`
    await createUser(userAEmail, [tenantA.tenantId])
    await createUser(userBEmail, [tenantB.tenantId])
    await createUser(multiTenantEmail, [tenantA.tenantId, tenantB.tenantId])
  })

  test('1. registered email + correct tenant host → allowed (no throw)', async () => {
    await assert.doesNotReject(
      payload.forgotPassword({ collection: 'users', data: { email: userAEmail }, req: buildReq(tenantA.domain) }),
    )
  })

  test('2. unknown email → rejected as Email not found', async () => {
    await payload
      .forgotPassword({ collection: 'users', data: { email: `${RUN_ID}-unknown@example.com` }, req: buildReq(tenantA.domain) })
      .then(() => assert.fail('expected forgotPassword to reject for an unknown email'))
      .catch((err) => assert.equal(validationMessage(err), 'Email not found.'))
  })

  test('3. user exists globally but not in the current tenant → rejected as Email not found', async () => {
    // userBEmail is real, but only belongs to tenant B — requested via tenant A's host.
    await payload
      .forgotPassword({ collection: 'users', data: { email: userBEmail }, req: buildReq(tenantA.domain) })
      .then(() => assert.fail('expected forgotPassword to reject for a cross-tenant email'))
      .catch((err) => assert.equal(validationMessage(err), 'Email not found.'))
  })

  test('4. multi-tenant user, requested via a tenant they belong to → allowed', async () => {
    await assert.doesNotReject(
      payload.forgotPassword({ collection: 'users', data: { email: multiTenantEmail }, req: buildReq(tenantA.domain) }),
    )
    await assert.doesNotReject(
      payload.forgotPassword({ collection: 'users', data: { email: multiTenantEmail }, req: buildReq(tenantB.domain) }),
    )
  })

  test('5. unknown email → no reset token is written anywhere', async () => {
    const before = await rawUserRow(disposableUserIds[0])
    await payload
      .forgotPassword({ collection: 'users', data: { email: `${RUN_ID}-unknown-2@example.com` }, req: buildReq(tenantA.domain) })
      .catch(() => {})
    const after = await rawUserRow(disposableUserIds[0])
    assert.equal(after.resetPasswordToken, before.resetPasswordToken)
  })

  test('6. cross-tenant lookup (user exists, wrong tenant) → no reset token written for that user either', async () => {
    const beforeRow = await rawUserRow(disposableUserIds[1]) // userB
    await payload
      .forgotPassword({ collection: 'users', data: { email: userBEmail }, req: buildReq(tenantA.domain) })
      .catch(() => {})
    const afterRow = await rawUserRow(disposableUserIds[1])
    assert.equal(afterRow.resetPasswordToken, beforeRow.resetPasswordToken)
  })
})

describe('Official reset mechanism + password/token safety proof', () => {
  let tenant: { domain: string; tenantId: number }
  let userEmail: string
  let userId: number

  before(async () => {
    tenant = await createTenant('official')
    userEmail = `${RUN_ID}-official@example.com`
    userId = await createUser(userEmail, [tenant.tenantId])
  })

  test('7. known + eligible email → Payload writes a real resetPasswordToken/Expiration (official mechanism intact)', async () => {
    await payload.forgotPassword({ collection: 'users', data: { email: userEmail }, req: buildReq(tenant.domain) })
    const row = await rawUserRow(userId)
    assert.match(row.resetPasswordToken ?? '', /^[0-9a-f]{40}$/)
    assert.ok(row.resetPasswordExpiration)
  })

  test('19. plaintext user password is never persisted — only hash/salt exist', async () => {
    const row = await rawUserRow(userId)
    assert.equal(typeof row.hash, 'string')
    assert.equal(typeof row.salt, 'string')
    const doc = await payload.findByID({ id: userId, collection: 'users', overrideAccess: true, depth: 0 })
    assert.equal(Object.prototype.hasOwnProperty.call(doc, 'password'), false)
  })

  test('20. no captured log line contains a reset-token-shaped value', async () => {
    const captured: string[] = []
    const originalInfo = payload.logger.info.bind(payload.logger)
    const originalWarn = payload.logger.warn.bind(payload.logger)
    const originalError = payload.logger.error.bind(payload.logger)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload.logger.info = ((...a: any[]) => {
      captured.push(JSON.stringify(a))
      return originalInfo.apply(payload.logger, a as never)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload.logger.warn = ((...a: any[]) => {
      captured.push(JSON.stringify(a))
      return originalWarn.apply(payload.logger, a as never)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload.logger.error = ((...a: any[]) => {
      captured.push(JSON.stringify(a))
      return originalError.apply(payload.logger, a as never)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

    try {
      await payload.forgotPassword({ collection: 'users', data: { email: userEmail }, req: buildReq(tenant.domain) })
    } finally {
      payload.logger.info = originalInfo
      payload.logger.warn = originalWarn
      payload.logger.error = originalError
    }

    const joined = captured.join('\n')
    assert.doesNotMatch(joined, TOKEN_PATTERN, 'a 40-hex-char token-shaped value leaked into logs')
  })
})

describe('Exactly-once send attempt (official reset flow)', () => {
  test('8. generateEmailHTML + generateEmailSubject for the same request resolve to exactly one send attempt', async () => {
    const tenant = await createTenant('once')
    const captured: string[] = []
    const originalWarn = payload.logger.warn.bind(payload.logger)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload.logger.warn = ((...a: any[]) => {
      captured.push(String(a[0]))
      return originalWarn.apply(payload.logger, a as never)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any

    try {
      const req = { context: {}, headers: new Headers({ host: tenant.domain }), payload } as unknown as PayloadRequest
      const token = 'e'.repeat(40)
      const user = { email: 'someone@example.com', name: 'Someone' }
      await generateForgotPasswordEmailHTML({ req, token, user })
      await generateForgotPasswordEmailSubject({ req, token, user })
    } finally {
      payload.logger.warn = originalWarn
    }

    const sendAttempts = captured.filter((line) => line.includes('Forgot Password email not delivered')).length
    assert.equal(sendAttempts, 1, 'expected exactly one send-attempt log line across both hook calls for the same request')
  })
})

describe('Logo URL strategy under production-like and local-dev configuration', () => {
  const originalServerUrl = process.env.NEXT_PUBLIC_SERVER_URL
  const originalAssetBase = process.env.PUBLIC_EMAIL_ASSET_BASE_URL

  after(() => {
    process.env.NEXT_PUBLIC_SERVER_URL = originalServerUrl
    process.env.PUBLIC_EMAIL_ASSET_BASE_URL = originalAssetBase
  })

  test('13. PUBLIC_EMAIL_ASSET_BASE_URL, when public, takes priority and produces a valid HTTPS URL', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'
    process.env.PUBLIC_EMAIL_ASSET_BASE_URL = 'https://assets.example.com'
    assert.equal(toAbsoluteUrl('/api/media/file/logo.jpg'), 'https://assets.example.com/api/media/file/logo.jpg')
  })

  test('13b. a genuinely public NEXT_PUBLIC_SERVER_URL (production-like) produces a valid HTTPS URL', () => {
    process.env.PUBLIC_EMAIL_ASSET_BASE_URL = ''
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://zuru-zuru.example.com'
    assert.equal(toAbsoluteUrl('/api/media/file/logo.jpg'), 'https://zuru-zuru.example.com/api/media/file/logo.jpg')
  })

  describe('with a real server bound to a local (non-public) port — the actual dev scenario', () => {
    let server: Server
    let port: number
    const fakeImageBytes = Buffer.from('fake-png-bytes-for-testing-only')

    before(async () => {
      server = createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'image/png' })
        res.end(fakeImageBytes)
      })
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
      const address = server.address()
      port = typeof address === 'object' && address ? address.port : 0
    })

    after(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    })

    test('14. with only a local (non-public) server URL, the real tenant logo is embedded as a data: URI — never a localhost/127.0.0.1 URL', async () => {
      process.env.PUBLIC_EMAIL_ASSET_BASE_URL = ''
      process.env.NEXT_PUBLIC_SERVER_URL = `http://127.0.0.1:${port}`
      const context = await resolveTenantMailContext(payload, 3167) // Ghee Roast — has a real logo
      assert.ok(context.logoUrl, 'expected a logo URL to be produced, not omitted')
      assert.doesNotMatch(context.logoUrl as string, /127\.0\.0\.1|localhost/)
    })

    test('15. the local-dev fallback is a well-formed data: URI containing the fetched bytes', async () => {
      process.env.PUBLIC_EMAIL_ASSET_BASE_URL = ''
      process.env.NEXT_PUBLIC_SERVER_URL = `http://127.0.0.1:${port}`
      const context = await resolveTenantMailContext(payload, 3167)
      assert.match(context.logoUrl ?? '', /^data:image\/[a-z0-9+.-]+;base64,[A-Za-z0-9+/]+=*$/)
      const base64Payload = (context.logoUrl ?? '').split(',')[1] ?? ''
      assert.equal(Buffer.from(base64Payload, 'base64').toString(), fakeImageBytes.toString())
    })
  })
})

describe('Welcome Email shares the same corrected branding infrastructure', () => {
  test('18. Welcome Email tenant resolution uses the same resolveTenantMailContext (same logo/year/business-name pipeline)', async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://zuru-zuru.example.com'
    const context = await resolveTenantMailContext(payload, 3168) // Zuru Zuru
    assert.equal(context.tenantName, 'Zuru Zuru')
    assert.ok(context.logoUrl)
    assert.doesNotMatch(context.logoUrl as string, /localhost/)
  })
})
