import { describe, test, before, after } from 'node:test'
import assert from 'node:assert'
import { getPayload } from 'payload'
import configPromise from '../../src/payload.config'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures'

async function fetchAPI(path: string, options: RequestInit = {}) {
  const url = new URL(path, 'http://localhost:3000')
  return fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

describe('Stage 22 - Public Read Security Audit', () => {
  let payload: any
  let fixtures: any

  before(async () => {
    payload = await getPayload({ config: configPromise })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    await cleanupSecurityFixtures(payload, fixtures)
  })

  describe('1. Protected Collections & Anonymous Access', () => {
    test('Anonymous users cannot list or read Users', async () => {
      const res = await fetchAPI('/api/users')
      const data = await res.json()
      // Users collection requires authentication or Super Admin to list all.
      // Actually readUsers returns false if not logged in.
      // Payload returns 401 or 403, or an empty list if there's a where clause that returns false?
      // Wait, readUsers returns false if !req.user. 
      // If access returns false, Payload typically returns 403.
      assert.strictEqual(res.status, 403, 'Should be forbidden')
      assert.ok(data.errors)
    })

    test('Anonymous users cannot read specific User by ID', async () => {
      const res = await fetchAPI(`/api/users/${fixtures.users.tenantAAdmin.id}`)
      assert.strictEqual(res.status, 403)
    })

    test('Anonymous users cannot read Tenants', async () => {
      const res = await fetchAPI('/api/tenants')
      assert.strictEqual(res.status, 403)
    })

    test('Anonymous users cannot read Site Settings', async () => {
      const res = await fetchAPI('/api/site-settings')
      assert.strictEqual(res.status, 403)
    })

    test('Anonymous users cannot read Contact Submissions', async () => {
      const res = await fetchAPI('/api/contact-submissions')
      assert.strictEqual(res.status, 403)
    })

    test('Anonymous users cannot read Reservations', async () => {
      const res = await fetchAPI('/api/reservations')
      assert.strictEqual(res.status, 403)
    })
  })

  describe('2. Public Collections (Tenant Isolated)', () => {
    test('Anonymous users can read public collections via domain matching (Tenants omitted if not explicit)', async () => {
      // By default without a host or DEFAULT_TENANT_SLUG matching, the public read might return no results
      // unless we provide a specific query or standard x-tenant-id header. Wait, public read can use x-tenant-id?
      // tenantPublicRead uses resolvePublicTenantID which checks host or local slug. 
      // If we query /api/pages without host, does it return empty?
      // Let's pass x-tenant-id or Host to simulate a frontend domain.
      const res = await fetchAPI('/api/pages', {
        headers: {
          'x-tenant-id': fixtures.tenants.tenantA.id.toString() // some setups allow this header
        }
      })
      const data = await res.json()
      
      // Let's just verify it's a 200 OK because pages is tenantPublicRead
      assert.strictEqual(res.status, 200)
    })

    test('Anonymous users only see PUBLISHED documents for versions-enabled collections', async () => {
      // tenantABlogPost is published
      // Let's create a draft blog post for tenantA
      const draftPost = await payload.create({
        collection: 'blog-posts',
        data: {
          title: 'Draft Post',
          slug: 'draft-post',
          content: { root: { type: 'root', format: '', indent: 0, version: 1, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, children: [{ mode: 'normal', text: 'Mock', type: 'text', version: 1 }] }] } },
          tenantId: fixtures.tenants.tenantA.id,
          _status: 'draft'
        },
        req: { user: fixtures.users.tenantAAdmin }
      })
      
      const res = await fetchAPI('/api/blog-posts', {
        headers: { 'x-tenant-id': fixtures.tenants.tenantA.id.toString() }
      })
      const data = await res.json()
      assert.strictEqual(res.status, 200)
      
      const foundDraft = data.docs.find((d: any) => d.id === draftPost.id)
      assert.strictEqual(foundDraft, undefined, 'Draft post should not be returned in public list')
    })
    
    test('Anonymous users cannot access draft by ID', async () => {
      const draftPost = await payload.create({
        collection: 'blog-posts',
        data: {
          title: 'Draft Post 2',
          slug: 'draft-post-2',
          content: { root: { type: 'root', format: '', indent: 0, version: 1, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, children: [{ mode: 'normal', text: 'Mock', type: 'text', version: 1 }] }] } },
          tenantId: fixtures.tenants.tenantA.id,
          _status: 'draft'
        },
        req: { user: fixtures.users.tenantAAdmin }
      })
      
      const res = await fetchAPI(`/api/blog-posts/${draftPost.id}`, {
        headers: { 'x-tenant-id': fixtures.tenants.tenantA.id.toString() }
      })
      // Should be 404 since publishedOnly where clause filters it out, or 403.
      assert.ok([403, 404].includes(res.status), 'Draft by ID should return 403 or 404')
    })
    
    test('Anonymous users cannot read versions', async () => {
      const res = await fetchAPI('/api/blog-posts/versions', {
        headers: { 'x-tenant-id': fixtures.tenants.tenantA.id.toString() }
      })
      assert.strictEqual(res.status, 403)
    })
  })

  describe('3. Relationship Leakage & Hidden Fields', () => {
    test('Relationship fields pointing to protected collections do not leak sensitive data', async () => {
      // Let's create a BlogPost linking to an author (Users)
      const postWithAuthor = await payload.create({
        collection: 'blog-posts',
        data: {
          title: 'Post with Author',
          slug: 'post-with-author',
          content: { root: { type: 'root', format: '', indent: 0, version: 1, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, children: [{ mode: 'normal', text: 'Mock', type: 'text', version: 1 }] }] } },
          tenantId: fixtures.tenants.tenantA.id,
          authors: [fixtures.users.tenantAAdmin.id],
          _status: 'published'
        },
        req: { user: fixtures.users.tenantAAdmin }
      })
      
      // Fetch with depth=1
      const res = await fetchAPI(`/api/blog-posts/${postWithAuthor.id}?depth=1`, {
        headers: { 'x-tenant-id': fixtures.tenants.tenantA.id.toString() }
      })
      const data = await res.json()
      
      // The author field should be populated, BUT because the user lacks read access to Users,
      // Payload will not populate the user document. It will just leave the ID or return null/error.
      // Actually Payload sets it to the ID if depth is requested but access is denied.
      const author = data.authors?.[0]
      if (author === undefined) {
        // Field omitted entirely, which is also secure
      } else if (typeof author === 'object' && author !== null) {
        // If it somehow populated, it absolutely must not contain hash or salt
        assert.ok(!author.hash, 'Hash leaked!')
        assert.ok(!author.salt, 'Salt leaked!')
        // Ideally it shouldn't even populate email for anonymous users
        assert.ok(!author.email, 'Email leaked to public!')
      } else {
        // It's just the ID (number)
        assert.strictEqual(typeof author, 'number', 'Author should be an unpopulated ID')
      }
    })
  })
  
  describe('4. Query Manipulation & Draft Bypass', () => {
    test('Public users cannot bypass draft restriction using draft=true', async () => {
      const res = await fetchAPI('/api/blog-posts?draft=true', {
        headers: { 'x-tenant-id': fixtures.tenants.tenantA.id.toString() }
      })
      const data = await res.json()
      // Either fails with 403 or simply ignores the draft=true parameter depending on how read access handles it
      // In Payload, if draft=true is passed but user doesn't have readDrafts permission, it should be rejected.
      // But actually, read access is just read: ({ req }) => ...
      // If it allows it, then drafts would leak! Let's ensure no drafts are in the response.
      const hasDrafts = data.docs?.some((d: any) => d._status === 'draft')
      assert.ok(!hasDrafts, 'Drafts leaked via draft=true')
    })
    
    test('Public users cannot expand access using where filters', async () => {
      // Try to query Users via where filter on a public endpoint? No, try to query Tenants via where filter
      const res = await fetchAPI('/api/tenants?where[id][exists]=true')
      assert.strictEqual(res.status, 403, 'Should not be able to bypass Tenants access using where clause')
    })
  })
})
