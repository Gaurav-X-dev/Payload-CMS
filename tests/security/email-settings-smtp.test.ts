import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { getPayload, type BasePayload } from 'payload'
import configPromise from '../../src/payload.config'

// Deterministic, per-run namespace so repeated runs never collide and every record this file
// creates is trivially identifiable (and removable) in the dev database.
const RUN_ID = `smtp-test-${Date.now()}`
// A clearly-fake credential — never a real SMTP password. Per project rule, real credentials
// must never appear in source, seeds, scripts, logs, or tests.
const FAKE_PASSWORD_A = 'fake-smtp-password-alpha-not-real'
const FAKE_PASSWORD_B = 'fake-smtp-password-beta-not-real'

const baseTemplateFields = {
  forgotPasswordEmail: { body: 'body', heading: 'heading', subject: 'subject' },
  welcomeEmail: { body: 'body', heading: 'heading', subject: 'subject' },
}

describe('EmailSettings SMTP password lifecycle and access control', () => {
  let payload: BasePayload
  const createdTenants: number[] = []
  const createdUsers: number[] = []
  const createdEmailSettings: number[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches tests/security/fixtures.ts convention
  let superAdmin: any

  // Each EmailSettings-creating test gets its OWN fresh tenant (tenantId is unique per tenant),
  // so tests never collide with a previous test's leftover row within the same run.
  const createTenant = async (label: string) => {
    const doc = await payload.create({
      collection: 'tenants',
      data: { name: `SMTP Test Tenant ${label}`, slug: `${RUN_ID}-${label.toLowerCase()}`, type: 'restaurant', domains: [{ domain: `${RUN_ID}-${label.toLowerCase()}.example.com` }], isActive: true },
      overrideAccess: true,
    })
    createdTenants.push(doc.id)
    return doc.id as number
  }

  before(async () => {
    payload = await getPayload({ config: configPromise })

    // enforceUserRBAC only auto-bootstraps a Super Admin when the users table is completely
    // empty, which it never is in this dev database — so a fresh Super Admin can't be created
    // without an already-authenticated Super Admin req.user. Reuse whichever real Super Admin
    // already exists instead of creating (and having to clean up) a fake one.
    const existingSuperAdmins = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { roles: { contains: 'super_admin' } },
    })
    if (!existingSuperAdmins.docs.length) {
      throw new Error('No existing Super Admin user found to run this test as.')
    }
    superAdmin = existingSuperAdmins.docs[0]
  })

  after(async () => {
    for (const id of createdEmailSettings) {
      await payload.delete({ id, collection: 'email-settings', overrideAccess: true }).catch(() => {})
    }
    for (const id of createdUsers) {
      await payload.delete({ id, collection: 'users', overrideAccess: true }).catch(() => {})
    }
    for (const id of createdTenants) {
      await payload.delete({ id, collection: 'tenants', overrideAccess: true }).catch(() => {})
    }
    await payload.db.destroy?.()
  })

  test('CREATE: a plaintext password is accepted, encrypted at rest, and never returned as plaintext or ciphertext through the normal API', async () => {
    const tenantId = await createTenant('Create')

    const created = await payload.create({
      collection: 'email-settings',
      data: {
        tenantId,
        smtp: {
          enabled: true,
          fromAddress: 'sender@example.com',
          fromName: 'Test Sender',
          host: 'smtp.example.com',
          password: FAKE_PASSWORD_A,
          port: 587,
          secure: false,
          username: 'sender@example.com',
        },
        ...baseTemplateFields,
      },
      overrideAccess: true,
      user: superAdmin,
    })
    createdEmailSettings.push(created.id)

    // A NORMAL, non-overridden read as a legitimately-authorized Super Admin must never expose
    // the plaintext or the ciphertext — only the safe boolean indicator.
    const normalRead = await payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: false, user: superAdmin })
    assert.equal((normalRead.smtp as Record<string, unknown>).password, undefined)
    assert.equal((normalRead.smtp as Record<string, unknown>).passwordEncrypted, undefined)
    assert.equal(normalRead.smtp?.passwordConfigured, true)

    // Only a direct, access-bypassing server-side read can see the ciphertext, and it must not
    // equal the plaintext (proves it was actually encrypted, not stored as-is).
    const raw = await payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: true, depth: 0 })
    const encrypted = raw.smtp?.passwordEncrypted
    assert.equal(typeof encrypted, 'string')
    assert.notEqual(encrypted, FAKE_PASSWORD_A)
    assert.match(encrypted as string, /^v1:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)
  })

  test('UPDATE: reopening the record shows a blank password field and passwordConfigured stays true', async () => {
    const tenantId = await createTenant('Reopen')

    const created = await payload.create({
      collection: 'email-settings',
      data: {
        tenantId,
        smtp: { enabled: true, fromAddress: 'sender@example.com', host: 'smtp.example.com', password: FAKE_PASSWORD_A, port: 587, username: 'sender@example.com' },
        ...baseTemplateFields,
      },
      overrideAccess: true,
      user: superAdmin,
    })
    createdEmailSettings.push(created.id)

    const reopened = await payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: false, user: superAdmin })
    assert.equal((reopened.smtp as Record<string, unknown>).password, undefined)
    assert.equal(reopened.smtp?.passwordConfigured, true)
  })

  test('UPDATE: saving with a blank password preserves the existing encrypted value', async () => {
    const tenantId = await createTenant('BlankSave')

    const created = await payload.create({
      collection: 'email-settings',
      data: {
        tenantId,
        smtp: { enabled: true, fromAddress: 'a@example.com', host: 'smtp.example.com', password: FAKE_PASSWORD_A, port: 587, username: 'a@example.com' },
        ...baseTemplateFields,
      },
      overrideAccess: true,
      user: superAdmin,
    })
    createdEmailSettings.push(created.id)

    const before = await payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: true, depth: 0 })
    const encryptedBefore = before.smtp?.passwordEncrypted

    await payload.update({
      id: created.id,
      collection: 'email-settings',
      data: { smtp: { fromName: 'Updated Name Only' } },
      overrideAccess: true,
      user: superAdmin,
    })

    const after = await payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: true, depth: 0 })
    assert.equal(after.smtp?.passwordEncrypted, encryptedBefore)
    assert.equal(after.smtp?.passwordConfigured, true)
  })

  test('UPDATE: entering a new password replaces the encrypted value', async () => {
    const tenantId = await createTenant('Replace')

    const created = await payload.create({
      collection: 'email-settings',
      data: {
        tenantId,
        smtp: { enabled: true, fromAddress: 'b@example.com', host: 'smtp.example.com', password: FAKE_PASSWORD_A, port: 587, username: 'b@example.com' },
        ...baseTemplateFields,
      },
      overrideAccess: true,
      user: superAdmin,
    })
    createdEmailSettings.push(created.id)

    const before = await payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: true, depth: 0 })
    const encryptedBefore = before.smtp?.passwordEncrypted

    await payload.update({
      id: created.id,
      collection: 'email-settings',
      data: { smtp: { password: FAKE_PASSWORD_B } },
      overrideAccess: true,
      user: superAdmin,
    })

    const after = await payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: true, depth: 0 })
    assert.notEqual(after.smtp?.passwordEncrypted, encryptedBefore)
    assert.equal(after.smtp?.passwordConfigured, true)
  })

  test('access control: public (no user) is denied', async () => {
    await assert.rejects(
      payload.find({ collection: 'email-settings', overrideAccess: false, user: null }),
    )
  })

  test('access control: Tenant Member has no EmailSettings access', async () => {
    const tenantId = await createTenant('Member')
    const member = await payload.create({
      collection: 'users',
      data: { name: 'SMTP Test Member', email: `${RUN_ID}-member@example.com`, password: 'password123', roles: ['tenant_member'], tenants: [tenantId] },
      overrideAccess: true,
      req: { user: superAdmin } as never,
    })
    createdUsers.push(member.id as number)

    await assert.rejects(
      payload.find({ collection: 'email-settings', overrideAccess: false, user: member }),
    )
  })

  test('access control: a Tenant Admin cannot read another tenant\'s EmailSettings, but can read their own', async () => {
    const tenantA = await createTenant('IsoA')
    const tenantB = await createTenant('IsoB')

    const adminA = await payload.create({
      collection: 'users',
      data: { name: 'SMTP Test Isolation Admin A', email: `${RUN_ID}-iso-a-admin@example.com`, password: 'password123', roles: ['tenant_admin'], tenants: [tenantA] },
      overrideAccess: true,
      req: { user: superAdmin } as never,
    })
    createdUsers.push(adminA.id as number)

    const adminB = await payload.create({
      collection: 'users',
      data: { name: 'SMTP Test Isolation Admin B', email: `${RUN_ID}-iso-b-admin@example.com`, password: 'password123', roles: ['tenant_admin'], tenants: [tenantB] },
      overrideAccess: true,
      req: { user: superAdmin } as never,
    })
    createdUsers.push(adminB.id as number)

    const created = await payload.create({
      collection: 'email-settings',
      data: { tenantId: tenantA, smtp: { enabled: false }, ...baseTemplateFields },
      overrideAccess: true,
      user: superAdmin,
    })
    createdEmailSettings.push(created.id)

    await assert.rejects(
      payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: false, user: adminB }),
    )

    const ownRead = await payload.findByID({ id: created.id, collection: 'email-settings', overrideAccess: false, user: adminA })
    assert.equal(ownRead.id, created.id)
  })
})
