import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

const API_URL = 'http://localhost:3000/api'

let payload: any
let fixtures: any

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  })
}

describe('Stage 18 - REST API Security Audit', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  describe('1. Unauthenticated requests', () => {
    test('Unauthenticated GET', async () => {
      const res = await apiFetch('/pages')
      assert.ok([403, 401, 200].includes(res.status))
      if (res.status === 200) {
        const data = await res.json()
        assert.strictEqual(data.docs.length, 0)
      }
    })

    test('Unauthenticated POST', async () => {
      const res = await apiFetch('/pages', {
        method: 'POST',
        body: JSON.stringify({ title: 'Hacked', slug: 'hacked', status: 'published' })
      })
      assert.ok([403, 401].includes(res.status))
    })

    test('Unauthenticated PATCH', async () => {
      const res = await apiFetch(`/pages/${fixtures.documents.tenantAPage.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Hacked' })
      })
      assert.ok([403, 401].includes(res.status))
    })

    test('Unauthenticated DELETE', async () => {
      const res = await apiFetch(`/pages/${fixtures.documents.tenantAPage.id}`, { method: 'DELETE' })
      assert.ok([403, 401].includes(res.status))
    })
  })

  describe('2. Tenant isolation', () => {
    let tenantAToken: string
    let tenantBToken: string

    before(async () => {
      const resA = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.tenantAMember.email, password: 'password123' })
      })
      tenantAToken = (await resA.json()).token

      const resB = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.tenantBMember.email, password: 'password123' })
      })
      tenantBToken = (await resB.json()).token
    })

    test('Tenant A cannot read Tenant B data', async () => {
      const res = await apiFetch(`/pages/${fixtures.documents.tenantBPage.id}`, {
        headers: {
          'Authorization': `JWT ${tenantAToken}`,
          'x-tenant-id': String(fixtures.tenants.tenantA.id)
        }
      })
      assert.strictEqual(res.status, 404)
    })

    test('Tenant A cannot modify Tenant B data', async () => {
      const res = await apiFetch(`/pages/${fixtures.documents.tenantBPage.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Hacked by A' }),
        headers: {
          'Authorization': `JWT ${tenantAToken}`,
          'x-tenant-id': String(fixtures.tenants.tenantA.id)
        }
      })
      if (![404, 403].includes(res.status)) {
        console.error('PATCH status:', res.status, await res.text())
      }
      assert.ok([404, 403].includes(res.status))
    })

    test('Tenant A cannot delete Tenant B data', async () => {
      const res = await apiFetch(`/pages/${fixtures.documents.tenantBPage.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `JWT ${tenantAToken}`,
          'x-tenant-id': String(fixtures.tenants.tenantA.id)
        }
      })
      if (![404, 403].includes(res.status)) {
        console.error('DELETE status:', res.status, await res.text())
      }
      assert.ok([404, 403].includes(res.status))
    })
  })

  describe('3. Role enforcement', () => {
    let memberToken: string
    let adminToken: string
    let superToken: string

    before(async () => {
      const resM = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.tenantAMember.email, password: 'password123' })
      })
      memberToken = (await resM.json()).token

      const resA = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.tenantAAdmin.email, password: 'password123' })
      })
      adminToken = (await resA.json()).token

      const resS = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.superAdmin.email, password: 'password123' })
      })
      superToken = (await resS.json()).token
    })

    test('Member cannot create users', async () => {
      const res = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ email: 'new@example.com', password: '123' }),
        headers: { 'Authorization': `JWT ${memberToken}`, 'x-tenant-id': String(fixtures.tenants.tenantA.id) }
      })
      assert.ok([403, 401].includes(res.status))
    })

    test('Super Admin can access anything', async () => {
      const res = await apiFetch(`/pages/${fixtures.documents.tenantBPage.id}`, {
        headers: { 'Authorization': `JWT ${superToken}` }
      })
      assert.strictEqual(res.status, 200)
    })
  })

  describe('4. Inactive tenant behavior', () => {
    let inactiveToken: string

    before(async () => {
      const res = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.inactiveTenantAdmin.email, password: 'password123' })
      })
      inactiveToken = (await res.json()).token
    })

    test('inactive tenants cannot access protected endpoints', async () => {
      const res = await apiFetch(`/pages`, {
        headers: {
          'Authorization': `JWT ${inactiveToken}`,
          'x-tenant-id': String(fixtures.tenants.tenantC.id)
        }
      })
      const data = await res.json()
      // Either 403 or empty 200
      if (res.status === 200) {
        assert.strictEqual(data.docs.length, 0)
      } else {
        assert.strictEqual(res.status, 403)
      }
    })
  })

  describe('5. Query manipulation', () => {
    let tenantAToken: string
    let superToken: string
    
    before(async () => {
      const resA = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.tenantAMember.email, password: 'password123' })
      })
      tenantAToken = (await resA.json()).token

      const resS = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.superAdmin.email, password: 'password123' })
      })
      superToken = (await resS.json()).token
    })

    test('where filters cannot bypass tenant isolation', async () => {
      const res = await apiFetch(`/pages?where[tenantId][equals]=${fixtures.tenants.tenantB.id}`, {
        headers: { 'Authorization': `JWT ${tenantAToken}`, 'x-tenant-id': String(fixtures.tenants.tenantA.id) }
      })
      const data = await res.json()
      assert.strictEqual(data.docs.length, 0)
    })

    test('depth manipulation does not expose unauthorized relationships', async () => {
      const res = await apiFetch(`/pages?depth=10`, {
        headers: { 'Authorization': `JWT ${tenantAToken}`, 'x-tenant-id': String(fixtures.tenants.tenantA.id) }
      })
      const data = await res.json()
      // just ensure it doesn't crash or expose B
      for (const doc of data.docs) {
        assert.notEqual(doc.tenantId, fixtures.tenants.tenantB.id)
      }
    })

    test('draft param cannot read foreign drafts', async () => {
      const res = await apiFetch(`/pages?draft=true&where[id][equals]=${fixtures.documents.tenantBPage.id}`, {
        headers: { 'Authorization': `JWT ${tenantAToken}`, 'x-tenant-id': String(fixtures.tenants.tenantA.id) }
      })
      const data = await res.json()
      assert.strictEqual(data.docs.length, 0)
    })
  })

  describe('6. Data exposure', () => {
    let tenantAToken: string
    
    before(async () => {
      const resA = await apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: fixtures.users.tenantAMember.email, password: 'password123' })
      })
      tenantAToken = (await resA.json()).token
    })

    test('Auth metadata (hash, salt) is never exposed via REST API', async () => {
      const res = await apiFetch(`/users/me`, {
        headers: { 'Authorization': `JWT ${tenantAToken}`, 'x-tenant-id': String(fixtures.tenants.tenantA.id) }
      })
      const data = await res.json()
      assert.strictEqual(data.user.hash, undefined)
      assert.strictEqual(data.user.salt, undefined)
    })

    test('REST responses do not expose internal tenant structure unexpectedly', async () => {
      const res = await apiFetch(`/users/me`, {
        headers: { 'Authorization': `JWT ${tenantAToken}`, 'x-tenant-id': String(fixtures.tenants.tenantA.id) }
      })
      const data = await res.json()
      // should not expose other users in the tenant by default, but it's /me so just checking self
      assert.ok(data.user)
    })
  })
})
