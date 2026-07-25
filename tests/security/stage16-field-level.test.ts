import assert from 'node:assert/strict'
import test, { describe, before, after } from 'node:test'
import { getPayload } from 'payload'

process.env.PAYLOAD_SECRET = 'test-secret_key'

import config from '../../src/payload.config.ts'
import { setupSecurityFixtures, cleanupSecurityFixtures } from './fixtures.ts'

let payload: any
let fixtures: any

describe('Stage 16 - Field-Level Security', () => {
  before(async () => {
    payload = await getPayload({ config })
    fixtures = await setupSecurityFixtures(payload)
  })

  after(async () => {
    if (payload && fixtures) {
      await cleanupSecurityFixtures(payload, fixtures)
    }
  })

  test('Tenant Member cannot spoof their own apiKey', async () => {
    const { user } = await payload.login({
      collection: 'users',
      data: {
        email: fixtures.users.tenantAMember.email,
        password: 'password123',
      },
    })
    
    const newApiKey = 'sp00f3d-api-k3y-12345'
    
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        apiKey: newApiKey,
      },
      req: {
        user,
        headers: new Headers({ 'x-tenant-id': String(fixtures.tenants.tenantA.id) })
      },
      overrideAccess: false,
    })
    
    const checkUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
    })

    assert.notStrictEqual(checkUser.apiKey, newApiKey, 'Should not allow a user to update their own apiKey')
  })
})
