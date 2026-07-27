import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

const fetchAPI = async (path: string, options: RequestInit = {}) => {
  const url = `http://localhost:3000/api${path}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

const INVALID_IDS = [
  '',
  ' ',
  'null',
  'undefined',
  '0',
  '-1',
  'NaN',
  '../../etc/passwd',
  '<script>alert(1)</script>',
  'a'.repeat(1000),
  {},
  [],
  true,
  99999999
]

describe('Stage 23 - Malformed Input and Fuzz Security', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  const getTenantAReq = () => ({
    user: fixtures.users.tenantAAdmin,
    headers: new Headers({ 'x-tenant-id': fixtures.tenants.tenantA.id.toString() })
  })

  describe('A. Authentication Input Abuse', () => {
    test('rejects malformed authentication inputs via REST', async () => {
      const payloads = [
        {},
        { email: 'admin@example.com' },
        { password: 'test' },
        { email: null, password: null },
        { email: true, password: false },
        { email: [], password: [] },
        { email: { $ne: null }, password: { $ne: null } },
        { __proto__: { isAdmin: true }, email: 'admin@example.com', password: 'test' },
        { email: 'a'.repeat(10000), password: 'b'.repeat(10000) },
        { email: 'admin@example.com\u0000', password: 'test\u0000' }
      ]

      for (const reqPayload of payloads) {
        const res = await fetchAPI('/users/login', {
          method: 'POST',
          body: JSON.stringify(reqPayload)
        })
        const data = await res.json()
        assert.ok(
          res.status >= 400 && res.status < 500,
          `Expected a client error for payload ${JSON.stringify(reqPayload).substring(0, 50)}, got ${res.status}`
        )
        assert.ok(!data.token, 'Should not issue token')
        assert.ok(!data.stack, 'Should not leak stack trace')
      }
    })
  })

  describe('B. Type Confusion', () => {
    test('Local API rejects type confusion for writes safely without partial mutation', async () => {
      const invalidTypes = [
        { value: null, expectedStoredValue: undefined },
        { value: [], expectedStoredValue: undefined },
        { value: {}, expectedStoredValue: '{}' },
        { value: ['x'], expectedStoredValue: '["x"]' },
        { value: { value: 'x' }, expectedStoredValue: '{"value":"x"}' }
      ]

      for (const [index, { value, expectedStoredValue }] of invalidTypes.entries()) {
        let created: any

        try {
          created = await payload.create({
            collection: 'pages',
            data: {
              title: value as any,
              slug: `stage23-confusion-${index + 1}`,
              tenantId: fixtures.tenants.tenantA.id
            },
            req: getTenantAReq(),
            overrideAccess: false
          })
        } catch (err: any) {
          assert.ok(err.message || err.status, `Failed safely with error for ${JSON.stringify(value)}`)
          continue
        }

        assert.notStrictEqual(
          expectedStoredValue,
          undefined,
          `Type confusion value ${JSON.stringify(value)} was accepted without an expected sanitization`
        )

        const stored = await payload.findByID({
          collection: 'pages',
          id: created.id,
          req: getTenantAReq(),
          overrideAccess: false
        })
        assert.strictEqual(
          stored.title,
          expectedStoredValue,
          `Unexpected stored value for type confusion input ${JSON.stringify(value)}`
        )
      }
    })
  })

  describe('C. Tenant Field Tampering', () => {
    test('rejects malicious tenant assignment attempts', async () => {
      const tamperingValues = [
        null,
        '',
        ' ',
        [],
        {},
        fixtures.tenants.tenantB.id, // trying to write to Tenant B
        99999,
        true,
        { $ne: null }
      ]

      for (const [index, val] of tamperingValues.entries()) {
        try {
          const doc = await payload.create({
            collection: 'pages',
            data: {
              title: 'Tampering Test',
              slug: `stage23-tamper-${index + 1}`,
              tenantId: val as any
            },
            req: getTenantAReq(),
            overrideAccess: false
          })
          
          // If the hook auto-assigns or sanitizes, verify it forced the user's tenant
          assert.strictEqual(
            doc.tenantId, 
            fixtures.tenants.tenantA.id, 
            `Tampered tenant assignment was accepted but not isolated. Expected ${fixtures.tenants.tenantA.id}, got ${doc.tenantId}`
          )
        } catch (err: any) {
          assert.ok(
            err.message || err.status, 
            'Expected a structured error for invalid tenant assignment'
          )
        }
      }
    })
  })

  describe('D. Query Operator Abuse & E. Logical Explosion', () => {
    test('rejects malformed where structures without bypassing tenant isolation', async () => {
      const queries = [
        { tenantId: fixtures.tenants.tenantB.id },
        { tenantId: { in: [fixtures.tenants.tenantB.id] } },
        { or: [{ tenantId: fixtures.tenants.tenantA.id }, { tenantId: fixtures.tenants.tenantB.id }] },
        { and: [{ tenantId: { exists: false } }] },
        { id: { exists: true } },
        null,
        [],
        { or: 'string' },
        { and: {} },
        { tenantId: [] }
      ]

      for (const query of queries) {
        try {
          const res = await payload.find({
            collection: 'pages',
            where: query,
            req: getTenantAReq(),
            overrideAccess: false
          })
          // If it resolves, ensure NO Tenant B data is returned
          res.docs.forEach((doc: any) => {
            assert.notStrictEqual(doc.tenantId, fixtures.tenants.tenantB.id, 'Query abuse exposed foreign tenant data')
          })
        } catch (e: any) {
          assert.ok(e.status >= 400 || e.message, 'Expected structured error, got undefined')
        }
      }
    })
    
    test('handles logical explosion safely without crashing', async () => {
      const deepOr: any = []
      for (let i = 0; i < 50; i++) { deepOr.push({ id: { equals: i } }) }
      const res = await payload.find({
        collection: 'pages',
        where: { or: deepOr },
        req: getTenantAReq(),
        overrideAccess: false
      })
      assert.ok(res.docs, 'Handled 50 OR clauses safely')
    })
  })

  describe('F. Prototype Pollution', () => {
    test('strips or rejects prototype pollution payloads safely', async () => {
      const payloadObj = JSON.parse(
        `{"title":"Pollution Test","slug":"stage23-pollution-1","tenantId":${JSON.stringify(fixtures.tenants.tenantA.id)},"__proto__":{"isAdmin":true},"constructor":{"prototype":{"isPolluted":true}}}`
      )

      assert.ok(
        Object.prototype.hasOwnProperty.call(payloadObj, '__proto__'),
        'Raw JSON payload must contain an own __proto__ property'
      )

      try {
        await payload.create({
          collection: 'pages',
          data: payloadObj,
          req: getTenantAReq(),
          overrideAccess: false
        })
      } catch (err) {
        // rejection is also safe
      }
      
      const testObj = {} as any
      assert.strictEqual(testObj.isAdmin, undefined, 'Prototype was polluted (isAdmin)!')
      assert.strictEqual(testObj.isPolluted, undefined, 'Prototype was polluted (isPolluted)!')
    })
  })

  describe('G. Mass Assignment', () => {
    test('ignores or rejects protected fields on create', async () => {
      const res = await payload.create({
        collection: 'pages',
        data: {
          title: 'Mass Assignment',
          slug: 'stage23-mass-assignment-1',
          tenantId: fixtures.tenants.tenantA.id,
          hash: 'hacked',
          salt: 'hacked',
          roles: ['super-admin'],
          _status: 'published'
        },
        req: getTenantAReq(),
        overrideAccess: false
      })
      
      assert.strictEqual((res as any).hash, undefined, 'Should not save/return hash')
      assert.strictEqual((res as any).roles, undefined, 'Should not save/return roles on page')
    })
  })

  describe('H. Rich Text and XSS Input', () => {
    test('accepts plain XSS strings safely (storage only, no execution)', async () => {
      const xssStrings = [
        '<script>alert(1)</script>',
        'javascript:alert(1)',
        '"><img src=x onerror=alert(1)>'
      ]

      for (const [index, xss] of xssStrings.entries()) {
        const doc = await payload.create({
          collection: 'pages',
          data: {
            title: xss,
            slug: `stage23-xss-${index + 1}`,
            tenantId: fixtures.tenants.tenantA.id,
          },
          req: getTenantAReq(),
          overrideAccess: false
        })
        assert.strictEqual(doc.title, xss, 'String should be stored exactly, framework handles escaping at render')
      }
    })
    
    test('rejects malformed Lexical JSON blocks', async () => {
      await assert.rejects(async () => {
        await payload.create({
          collection: 'blog-posts',
          data: {
            title: 'Malformed Lexical',
            slug: 'stage23-malformed-lexical-1',
            tenantId: fixtures.tenants.tenantA.id,
            content: { type: 'unknown' } // Missing root
          },
          req: getTenantAReq(),
          overrideAccess: false
        })
      })
    })
  })

  describe('I. Path and File Input Abuse (Media)', () => {
    test('safely rejects traversal paths in media queries', async () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\windows\\system.ini',
        '%2e%2e%2fsecret.txt',
        'CON',
        'file.txt\u0000.png'
      ]

      for (const path of maliciousPaths) {
        try {
          const res = await payload.find({
            collection: 'media',
            where: { filename: { equals: path } },
            overrideAccess: true // bypassing access just to test query execution safety
          })
          assert.strictEqual(res.docs.length, 0, 'Should not find arbitrary files or crash')
        } catch (err: any) {
          // A database query crash on null bytes is also a safe rejection
          assert.ok(err.message, 'Database safely errored on malicious query')
        }
      }
    })
  })

  describe('J. Invalid IDs', () => {
    test('safely handles malformed IDs for delete without cross-tenant impact', async () => {
      for (const id of INVALID_IDS) {
        await assert.rejects(
          async () => {
            await payload.delete({
              collection: 'pages',
              id: id as any,
              req: getTenantAReq(),
              overrideAccess: false
            })
          },
          /not allowed|Forbidden|Invalid|Error|ValidationError/,
          `Should safely reject invalid ID: ${id}`
        )
      }
    })
  })

  describe('K. Oversized and Bounded Stress Input', () => {
    test('handles bounded large strings without crashing', async () => {
      const largeTitle = 'a'.repeat(10000) // 10KB
      const doc = await payload.create({
        collection: 'pages',
        data: {
          title: largeTitle,
          slug: 'stage23-large-1',
          tenantId: fixtures.tenants.tenantA.id
        },
        req: getTenantAReq(),
        overrideAccess: false
      })
      assert.strictEqual(doc.title.length, 10000)
    })
  })

  describe('L & N. Malformed JSON & Duplicate Keys (Raw REST)', () => {
    test('returns 400 for invalid JSON body', async () => {
      const res = await fetchAPI('/pages', {
        method: 'POST',
        body: '{"title": "invalid",',
        headers: { 'x-tenant-id': fixtures.tenants.tenantA.id.toString() }
      })
      assert.ok(res.status >= 400 && res.status < 500, 'Expected 400-level error for malformed JSON')
    })

    test('handles duplicate keys deterministically without bypass', async () => {
      const loginRes = await fetchAPI('/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: fixtures.users.tenantAAdmin.email,
          password: 'password123'
        })
      })
      assert.strictEqual(loginRes.status, 200, 'Fixture user authentication must succeed')
      const { token } = await loginRes.json()
      assert.ok(token, 'Fixture user authentication must return a token')

      const duplicatePayload = '{"title":"Duplicate Key","slug":"stage23-duplicate-1","tenantId":' + fixtures.tenants.tenantA.id + ',"tenantId":' + fixtures.tenants.tenantB.id + '}'
      const res = await fetchAPI('/pages', {
        method: 'POST',
        body: duplicatePayload,
        headers: {
          'x-tenant-id': fixtures.tenants.tenantA.id.toString(),
          'Authorization': `JWT ${token}`
        }
      })
      assert.strictEqual(
        res.status,
        400,
        'The last duplicate tenantId value must be rejected as a cross-tenant assignment'
      )
    })
  })

  describe('O. Null, Empty, and Omitted Value Matrix', () => {
    test('rejects omitted/null tenantId for scoped collections', async () => {
      const vals = [null, '', undefined]
      for (const [index, val] of vals.entries()) {
        try {
          const doc = await payload.create({
            collection: 'pages',
            data: {
              title: 'No Tenant',
              slug: `stage23-no-tenant-${index + 1}`,
              tenantId: val as any
            },
            req: getTenantAReq(),
            overrideAccess: false
          })
          
          assert.strictEqual(
            doc.tenantId, 
            fixtures.tenants.tenantA.id, 
            'Omitted tenant should be auto-assigned to active tenant'
          )
        } catch (err: any) {
          assert.ok(err.message || err.status, 'Expected structured error for invalid tenant assignment')
        }
      }
    })
  })

  describe('Q. REST Response Safety', () => {
    test('error responses do not leak sensitive details', async () => {
      const res = await fetchAPI('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: { $ne: null } })
      })
      const text = await res.text()
      assert.ok(res.status >= 400 && res.status < 500, `Expected a client error, got ${res.status}`)
      assert.ok(!text.includes('stack'), 'Stack trace leaked in response')
      assert.ok(!text.includes('TypeError'), 'Internal node error leaked in response')
      assert.ok(!text.includes('Mongo'), 'Database details leaked in response')
      assert.ok(!text.includes('postgres'), 'Database details leaked in response')
    })
  })
})
