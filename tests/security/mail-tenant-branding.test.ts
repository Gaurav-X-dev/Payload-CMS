import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { getPayload, type BasePayload, type PayloadRequest } from 'payload'
import configPromise from '../../src/payload.config'
import { resolveTenantMailContext, toAbsoluteUrl } from '../../src/lib/mail/tenantMailContext'
import { renderPlainText } from '../../src/lib/mail/renderTemplate'
import { generateForgotPasswordEmailHTML, generateForgotPasswordEmailSubject } from '../../src/lib/mail/forgotPasswordEmailContent'

const GHEE_ROAST_TENANT_ID = 3167
const CURIOUS_LADOO_TENANT_ID = 3181
const ZURU_ZURU_TENANT_ID = 3168

// getPayload() caches one instance per config — calling payload.db.destroy() in more than one
// describe block's `after()` closes the shared pool early and hangs every later DB call. One
// shared instance, destroyed exactly once at the very end of the whole file.
let payload: BasePayload
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
  assert.ok(superAdmin, 'expected an existing Super Admin to run tenant-scoped fixture creates as')
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
  await payload.db.destroy?.()
})

describe('toAbsoluteUrl — logo URL safety (pure, no DB)', () => {
  const originalServerUrl = process.env.NEXT_PUBLIC_SERVER_URL

  after(() => {
    process.env.NEXT_PUBLIC_SERVER_URL = originalServerUrl
  })

  test('relative media URL becomes a valid absolute URL when NEXT_PUBLIC_SERVER_URL is a real public host', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://ghee-roast.example.com'
    assert.equal(toAbsoluteUrl('/api/media/file/logo.jpg'), 'https://ghee-roast.example.com/api/media/file/logo.jpg')
  })

  test('an already-absolute media URL (e.g. S3/CDN) passes through unchanged regardless of NEXT_PUBLIC_SERVER_URL', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'
    assert.equal(toAbsoluteUrl('https://cdn.example.com/logo.png'), 'https://cdn.example.com/logo.png')
  })

  test('returns null (never a broken URL) when NEXT_PUBLIC_SERVER_URL is localhost', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'
    assert.equal(toAbsoluteUrl('/api/media/file/logo.jpg'), null)
  })

  test('returns null for 127.0.0.1, ::1, and *.localhost bases', () => {
    for (const base of ['http://127.0.0.1:3000', 'http://[::1]:3000', 'http://ghee-roast.localhost:3000']) {
      process.env.NEXT_PUBLIC_SERVER_URL = base
      assert.equal(toAbsoluteUrl('/api/media/file/logo.jpg'), null, `expected null for base ${base}`)
    }
  })

  test('returns null when there is no media URL at all, or NEXT_PUBLIC_SERVER_URL is unset', () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://example.com'
    assert.equal(toAbsoluteUrl(null), null)
    assert.equal(toAbsoluteUrl(undefined), null)
    process.env.NEXT_PUBLIC_SERVER_URL = ''
    assert.equal(toAbsoluteUrl('/api/media/file/logo.jpg'), null)
  })
})

describe('Template placeholder resolution (pure, no DB)', () => {
  test('{{current_year}} resolves to the real current year', () => {
    const year = String(new Date().getFullYear())
    assert.equal(renderPlainText('© {{current_year}} Acme', { current_year: year }), `© ${year} Acme`)
  })

  test('{{year}} resolves as a backward-compatible alias when supplied alongside {{current_year}}', () => {
    const year = String(new Date().getFullYear())
    assert.equal(renderPlainText('© {{year}} Acme', { current_year: year, year }), `© ${year} Acme`)
  })

  test('an unknown placeholder is left literal and visible, never silently dropped or executed', () => {
    assert.equal(renderPlainText('Hello {{not_a_real_variable}}', { current_year: '2026' }), 'Hello {{not_a_real_variable}}')
  })
})

describe('Tenant branding resolution (live DB — read-only against the 3 real tenants)', () => {
  before(() => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://mail-branding-test.example.com'
  })

  test('Ghee Roast context resolves Ghee Roast branding', async () => {
    const context = await resolveTenantMailContext(payload, GHEE_ROAST_TENANT_ID)
    assert.equal(context.tenantName, 'Ghee Roast')
    assert.match(context.siteName, /Ghee Roast/i)
  })

  test('Curious Ladoo context resolves Curious Ladoo branding', async () => {
    const context = await resolveTenantMailContext(payload, CURIOUS_LADOO_TENANT_ID)
    assert.equal(context.tenantName, 'Curious Ladoo')
  })

  test('Zuru Zuru context resolves Zuru Zuru branding', async () => {
    const context = await resolveTenantMailContext(payload, ZURU_ZURU_TENANT_ID)
    assert.equal(context.tenantName, 'Zuru Zuru')
  })

  test('no cross-tenant branding fallback: each tenant resolves distinct, non-overlapping identity', async () => {
    const [ghee, curious, zuru] = await Promise.all([
      resolveTenantMailContext(payload, GHEE_ROAST_TENANT_ID),
      resolveTenantMailContext(payload, CURIOUS_LADOO_TENANT_ID),
      resolveTenantMailContext(payload, ZURU_ZURU_TENANT_ID),
    ])
    const names = [ghee.tenantName, curious.tenantName, zuru.tenantName]
    assert.equal(new Set(names).size, 3, 'expected 3 distinct tenant names, found overlap')
    // If any tenant has a resolved logo, it must never equal another tenant's logo URL.
    const logos = [ghee.logoUrl, curious.logoUrl, zuru.logoUrl].filter((url): url is string => Boolean(url))
    assert.equal(new Set(logos).size, logos.length, 'expected no two tenants to share the same logo URL')
  })
})

describe('Forgot Password content safety (live DB — disposable fixtures, cleaned up at file end)', () => {
  let tenantId: number
  let domain: string

  before(async () => {
    process.env.NEXT_PUBLIC_SERVER_URL = 'https://mail-branding-test.example.com'
    domain = `mail-branding-test-${Date.now()}.example.com`

    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Mail Branding Test Tenant',
        slug: `mail-branding-test-${Date.now()}`,
        type: 'restaurant',
        domains: [{ domain }],
        isActive: true,
      },
      overrideAccess: true,
    })
    tenantId = tenant.id
    disposableTenantIds.push(tenantId)

    // Body deliberately includes the literal text "{{password}}" — Forgot Password must never
    // resolve it to a real value, proving the exclusion is structural, not just unused.
    const emailSettings = await payload.create({
      collection: 'email-settings',
      data: {
        tenantId,
        smtp: { enabled: false },
        welcomeEmail: { body: 'body', heading: 'heading', subject: 'subject' },
        forgotPasswordEmail: {
          body: 'Reset for {{user_email}} on {{site_name}}. Definitely not: {{password}}',
          heading: 'Reset your password',
          subject: 'Reset your {{site_name}} password',
        },
        footer: { footerText: '© {{current_year}} Mail Branding Test' },
      },
      overrideAccess: true,
      req: { user: superAdmin } as never,
    })
    disposableEmailSettingsIds.push(emailSettings.id)
  })

  const buildFakeReq = (host: string): PayloadRequest =>
    ({ context: {}, headers: new Headers({ host }), payload }) as unknown as PayloadRequest

  test('a literal {{password}} in the template body never resolves to a real value', async () => {
    const req = buildFakeReq(domain)
    const html = await generateForgotPasswordEmailHTML({ req, token: 'a'.repeat(40), user: { email: 'someone@example.com', name: 'Someone' } })

    assert.match(html, /\{\{password\}\}/, 'unknown placeholder should still appear literally')
    assert.doesNotMatch(html, /Definitely not: (?!\{\{password\}\})\S/, 'no real value should have been substituted for {{password}}')
  })

  test('the footer placeholder {{current_year}} resolves to the real year, not literal text', async () => {
    const req = buildFakeReq(domain)
    const html = await generateForgotPasswordEmailHTML({ req, token: 'b'.repeat(40), user: { email: 'someone@example.com', name: 'Someone' } })

    assert.doesNotMatch(html, /\{\{current_year\}\}/)
    assert.match(html, new RegExp(String(new Date().getFullYear())))
  })

  test('subject is CMS-managed (not hardcoded) and resolves {{site_name}}', async () => {
    const req = buildFakeReq(domain)
    const subject = await generateForgotPasswordEmailSubject({ req, token: 'c'.repeat(40), user: { email: 'someone@example.com', name: 'Someone' } })

    assert.doesNotMatch(subject, /\{\{site_name\}\}/)
    assert.match(subject, /Reset your .+ password/)
  })

  test('reset URL always uses the trusted NEXT_PUBLIC_SERVER_URL, never a client-supplied/spoofed Host header', async () => {
    // A completely different, attacker-controlled Host header — must have zero influence on
    // the reset link's origin, which must always come from server-side trusted config.
    const spoofedReq = ({ context: {}, headers: new Headers({ host: 'evil-attacker.example.net' }), payload }) as unknown as PayloadRequest
    const html = await generateForgotPasswordEmailHTML({ req: spoofedReq, token: 'd'.repeat(40), user: { email: 'someone@example.com', name: 'Someone' } })

    assert.doesNotMatch(html, /evil-attacker\.example\.net/)
    assert.match(html, /mail-branding-test\.example\.com\/admin\/reset\//)
  })
})

describe('Forgot Password email-existence validation (live DB — disposable fixtures, never real accounts)', () => {
  // SUPERSEDES the prior anti-enumeration test in this suite. As of the explicit business
  // requirement documented in the M2.10 checkpoint, a known/eligible email and an unknown one
  // are now DELIBERATELY distinguishable (known → succeeds, unknown → "Email not found") — see
  // tests/security/forgot-password-eligibility.test.ts for the full, dedicated coverage of this
  // behavior (tenant scoping, cross-tenant rejection, multi-tenant users, no-token proof, etc.).
  // This test only re-confirms the same two outward-facing outcomes from this suite's own
  // disposable fixtures, so this file doesn't silently keep asserting the old, now-incorrect
  // expectation.
  let userId: number
  let domain: string

  before(async () => {
    const superAdminResult = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { roles: { contains: 'super_admin' } },
    })
    const superAdmin = superAdminResult.docs[0]
    assert.ok(superAdmin, 'expected an existing Super Admin to create the disposable test user as')

    domain = `mail-enum-test-${Date.now()}.example.com`
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Mail Enumeration Test Tenant',
        slug: `mail-enum-test-${Date.now()}`,
        type: 'restaurant',
        domains: [{ domain }],
        isActive: true,
      },
      overrideAccess: true,
    })
    disposableTenantIds.push(tenant.id)

    // A disposable user in a tenant with no SMTP configured — never a real account, never a
    // tenant capable of an actual send.
    const user = await payload.create({
      collection: 'users',
      data: {
        name: 'Mail Enumeration Test User',
        email: `mail-enum-test-${Date.now()}@example.com`,
        password: 'DisposableTestPassword123!',
        roles: ['tenant_member'],
        tenants: [tenant.id],
      },
      overrideAccess: true,
      req: { user: superAdmin } as never,
    })
    userId = user.id
    disposableUserIds.push(userId)
  })

  test('a known, tenant-eligible email succeeds; an unknown email is rejected as Email not found', async () => {
    const knownEmailResult = await payload.findByID({ id: userId, collection: 'users', overrideAccess: true, depth: 0 })
    const knownEmail = knownEmailResult.email

    const req = { headers: new Headers({ host: domain }) } as unknown as Partial<PayloadRequest>

    await assert.doesNotReject(
      payload.forgotPassword({ collection: 'users', data: { email: knownEmail as string }, req }),
    )
    await assert.rejects(
      payload.forgotPassword({ collection: 'users', data: { email: `no-such-user-${Date.now()}@example.com` }, req }),
    )
  })
})
