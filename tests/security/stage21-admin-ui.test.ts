import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any
const appURL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'

async function fetchAPI(path: string, options: RequestInit = {}) {
  return fetch(`${appURL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

async function login(email: string, password: string = 'password123') {
  const res = await fetchAPI('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  const cookie = res.headers.get('set-cookie') || ''
  return { token: data.token, cookie, user: data.user }
}

describe('Stage 21 - Admin UI Security Audit', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      try {
        await cleanupSecurityFixtures(payload, fixtures)
      } catch (err) {
        console.error('CLEANUP ERROR:', err)
      }
    }
  })

  describe('1. Admin authentication & /api/access visibility', () => {
    test('unauthenticated users get minimal access via /api/access', async () => {
      const res = await fetchAPI('/api/access')
      const data = await res.json()
      
      assert.ok(!data.collections.users?.read?.permission)
      assert.ok(!data.collections.tenants?.read?.permission)
      
      assert.ok(!data.collections.pages?.create?.permission)
      assert.ok(!data.collections.pages?.update?.permission)
      assert.ok(!data.collections.pages?.delete?.permission)
    })

    test('Tenant Admin gets scoped access via /api/access', async () => {
      const { cookie } = await login(fixtures.users.tenantAAdmin.email)
      
      const res = await fetchAPI('/api/access', {
        headers: { 
          cookie,
          'x-tenant-id': fixtures.tenants.tenantA.id.toString()
        }
      })
      const data = await res.json()

      assert.ok(data.collections.users?.read?.permission) // Has a where clause
      // (users.create is omitted by Payload access API due to context checks)
      
      // Tenant Admin cannot delete users (Super Admin only)
      assert.ok(!data.collections.users?.delete?.permission)
      
      // Tenant Admin cannot create/update/delete tenants
      assert.ok(!data.collections.tenants?.create?.permission)
      assert.ok(!data.collections.tenants?.update?.permission)
      assert.ok(!data.collections.tenants?.delete?.permission)
    })

    test('Tenant Member gets scoped access via /api/access', async () => {
      const { cookie } = await login(fixtures.users.tenantAMember.email)
      
      const res = await fetchAPI('/api/access', {
        headers: { 
          cookie,
          'x-tenant-id': fixtures.tenants.tenantA.id.toString()
        }
      })
      const data = await res.json()

      // Members cannot create users
      assert.ok(!data.collections.users?.create?.permission)
      assert.ok(!data.collections.users?.delete?.permission)
      
      // Members can read pages but NOT create them
      assert.ok(data.collections.pages?.read?.permission)
      assert.ok(!data.collections.pages?.create?.permission)
    })
  })

  describe('2. Sensitive Data Exposure via Admin UI Bootstrap', () => {
    test('login response does not expose hash, salt, or secrets', async () => {
      const { user } = await login(fixtures.users.tenantAMember.email)
      
      assert.strictEqual(user.hash, undefined)
      assert.strictEqual(user.salt, undefined)
      assert.strictEqual(user.resetPasswordToken, undefined)
    })
    
    test('/api/users/me does not expose sensitive fields', async () => {
      const { cookie } = await login(fixtures.users.tenantAMember.email)
      const res = await fetchAPI('/api/users/me', { headers: { cookie } })
      const data = await res.json()
      
      assert.ok(data.user)
      assert.strictEqual(data.user.hash, undefined)
      assert.strictEqual(data.user.salt, undefined)
      assert.strictEqual(data.user.apiKey, undefined)
    })
  })

  describe('3. Field-level protection enforcement', () => {
    test('cannot update readOnly / access-restricted fields even via REST', async () => {
      const { cookie, user } = await login(fixtures.users.tenantAAdmin.email)
      
      const res = await fetchAPI(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { cookie, 'x-tenant-id': fixtures.tenants.tenantA.id.toString() },
        body: JSON.stringify({ roles: ['super_admin'] }) // tenant admin trying to make themselves super_admin
      })
      
      const data = await res.json()
      assert.ok(!data.doc.roles.includes('super_admin'))
      assert.ok(data.doc.roles.includes('tenant_admin'))
    })
  })
})
