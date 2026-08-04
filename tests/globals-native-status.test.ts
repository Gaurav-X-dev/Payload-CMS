process.env.PAYLOAD_SECRET = 'test-secret-key'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import { v4 as uuidv4 } from 'uuid'

describe('Globals Native Status Versioning', () => {
  let payload: any

  let testTenant1: any
  let testTenant2: any
  const superAdminReq = { user: { roles: ['super_admin'] } } as any

  before(async () => {
    payload = await getPayload({ config: configPromise })

    testTenant1 = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Test Tenant A',
        type: 'restaurant',
        isActive: true,
        slug: `tenant-1-${uuidv4().substring(0, 8)}`,
        domains: [{ domain: `test1-${uuidv4().substring(0, 8)}.local` }],
      },
    })
    testTenant2 = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Test Tenant B',
        type: 'restaurant',
        isActive: true,
        slug: `tenant-2-${uuidv4().substring(0, 8)}`,
        domains: [{ domain: `test2-${uuidv4().substring(0, 8)}.local` }],
      },
    })
  })

  after(async () => {
    if (payload) {
      await payload.destroy()
      const pool = payload.db?.pool
      if (pool && typeof pool.end === 'function') {
        const idleClients = new Set((pool._idle ?? []).map((entry: any) => entry.client))
        for (const client of pool._clients ?? []) {
          if (!idleClients.has(client) && typeof client.release === 'function') {
            client.release()
          }
        }
        await pool.end()
      }
    }
  })

  it('Site Settings: draft-only record remains absent publicly', async () => {
    await payload.create({
      collection: 'site-settings',
      req: superAdminReq,
      data: {
        tenantId: testTenant2.id,
        businessName: 'Draft Biz',
        _status: 'draft',
      },
      overrideAccess: true,
    })

    // Simulate loader query (overrideAccess: true, draft: false)
    const publicQuery = await payload.find({
      collection: 'site-settings',
      where: {
        'tenantId': { equals: testTenant2.id },
        '_status': { equals: 'published' },
      },
      overrideAccess: true,
    })
    assert.strictEqual(publicQuery.docs.length, 0)
  })

  it('Site Settings: published record + newer draft keeps old published content live', async () => {
    const pub = await payload.create({
      collection: 'site-settings',
      req: superAdminReq,
      data: {
        tenantId: testTenant1.id,
        businessName: 'Published Biz',
        _status: 'published',
      },
      overrideAccess: true,
    })

    let publicQuery = await payload.find({
      collection: 'site-settings',
      where: {
        'tenantId': { equals: testTenant1.id },
        '_status': { equals: 'published' },
      },
      overrideAccess: true,
    })
    assert.strictEqual(publicQuery.docs.length, 1)
    assert.strictEqual(publicQuery.docs[0].businessName, 'Published Biz')

    await payload.update({
      collection: 'site-settings',
      id: pub.id,
      req: superAdminReq,
      data: {
        businessName: 'Draft Update',
      },
      draft: true,
      overrideAccess: true,
    })

    publicQuery = await payload.find({
      collection: 'site-settings',
      where: {
        'tenantId': { equals: testTenant1.id },
        '_status': { equals: 'published' },
      },
      overrideAccess: true,
    })
    assert.strictEqual(publicQuery.docs.length, 1)
    assert.strictEqual(publicQuery.docs[0].businessName, 'Published Biz')

    const internalQuery = await payload.findByID({
      collection: 'site-settings',
      id: pub.id,
      draft: true,
      overrideAccess: true,
    })
    assert.strictEqual(internalQuery.businessName, 'Draft Update')
    
    await payload.update({
      collection: 'site-settings',
      id: pub.id,
      req: superAdminReq,
      data: {
        _status: 'published',
      },
      overrideAccess: true,
    })
    
    publicQuery = await payload.find({
      collection: 'site-settings',
      where: {
        'tenantId': { equals: testTenant1.id },
        '_status': { equals: 'published' },
      },
      overrideAccess: true,
    })
    assert.strictEqual(publicQuery.docs.length, 1)
    assert.strictEqual(publicQuery.docs[0].businessName, 'Draft Update') 
  })

  it('Nav & Footer: draft-only record remains absent publicly', async () => {
    await payload.create({
      collection: 'nav',
      req: superAdminReq,
      data: {
        tenantId: testTenant2.id,
        internal_name: 'Draft Nav',
        location: 'header',
        _status: 'draft',
      },
      overrideAccess: true,
    })

    const publicQuery = await payload.find({
      collection: 'nav',
      where: {
        'tenantId': { equals: testTenant2.id },
        '_status': { equals: 'published' },
      },
      overrideAccess: true,
    })
    assert.strictEqual(publicQuery.docs.length, 0)
  })

  it('Tenant Isolation: Public query does not leak into other tenants', async () => {
    const publicQueryT2 = await payload.find({
      collection: 'site-settings',
      where: {
        'tenantId': { equals: testTenant2.id },
        '_status': { equals: 'published' },
      },
      overrideAccess: true,
    })
    assert.strictEqual(publicQueryT2.docs.length, 0)
  })

})

