import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildTrustedOrigins,
  normalizeOrigin,
  parseTrustedOriginList,
} from '../src/lib/security/trustedOrigins.ts'
import { localSiteRegistry } from '../src/lib/site/resolveLocalSite.ts'

// The exact origin Railway logged as rejected:
//   Request origin "https://payload-cms-production-6ff4.up.railway.app"
//   is not in the CORS/CSRF allowlist.
const RAILWAY_PRODUCTION_ORIGIN = 'https://payload-cms-production-6ff4.up.railway.app'

const production = { includeDevelopmentOrigins: false }

test('normalizeOrigin strips path, query and trailing slash, and lowercases the host', () => {
  const cases: ReadonlyArray<readonly [string, string]> = [
    ['https://Example.com', 'https://example.com'],
    ['https://example.com/', 'https://example.com'],
    ['https://example.com/admin', 'https://example.com'],
    ['https://example.com/admin/?a=1#b', 'https://example.com'],
    ['  https://example.com  ', 'https://example.com'],
    // Default ports are dropped; non-default ports are significant and kept.
    ['https://example.com:443', 'https://example.com'],
    ['http://example.com:80', 'http://example.com'],
    ['http://localhost:3000', 'http://localhost:3000'],
  ]

  for (const [input, expected] of cases) {
    assert.equal(normalizeOrigin(input), expected, input)
  }
})

test('normalizeOrigin rejects wildcards, schemeless values and malformed input', () => {
  for (const input of [
    '*',
    '',
    '   ',
    null,
    undefined,
    // A scheme is required: guessing between http and https is how an allowlist silently ends up
    // trusting the wrong one, and `new URL('localhost:3000')` parses `localhost:` as a protocol.
    'example.com',
    'localhost:3000',
    '//example.com',
    'ftp://example.com',
    'javascript:alert(1)',
    'not a url',
  ]) {
    assert.equal(normalizeOrigin(input), null, String(input))
  }
})

test('parseTrustedOriginList splits, normalizes and drops invalid entries', () => {
  assert.deepEqual(
    parseTrustedOriginList('https://a.example.com, https://b.example.com/admin/ ,,bad,*'),
    ['https://a.example.com', 'https://b.example.com'],
  )
  assert.deepEqual(parseTrustedOriginList(''), [])
  assert.deepEqual(parseTrustedOriginList(null), [])
})

/** Requirement 1: the origin production actually rejected must now be allowed. */
test('the Railway production origin is allowed', () => {
  const origins = buildTrustedOrigins({ serverURL: null, ...production })
  assert.ok(
    origins.includes(RAILWAY_PRODUCTION_ORIGIN),
    `expected ${RAILWAY_PRODUCTION_ORIGIN} in ${JSON.stringify(origins)}`,
  )
})

/**
 * Requirement 2: custom tenant domains keep working. The site registry is the single source of
 * truth for which hostnames this deployment serves, so every non-local entry becomes an allowed
 * https origin automatically — adding a custom domain there cannot leave CORS/CSRF behind.
 */
test('every non-local site-registry hostname becomes an allowed https origin', () => {
  const origins = buildTrustedOrigins({ serverURL: null, ...production })

  for (const hostname of Object.keys(localSiteRegistry)) {
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.localhost')
    if (isLocal) continue

    assert.ok(origins.includes(`https://${hostname}`), `missing https://${hostname}`)
  }
})

/** Requirements 3 and 4: never `*`, and never anything that would defeat the CSRF check. */
test('the allowlist is never a wildcard and every entry is a bare origin', () => {
  const origins = buildTrustedOrigins({
    extraOrigins: 'https://admin.example.com',
    serverURL: 'https://example.com',
    ...production,
  })

  assert.ok(origins.length > 0)
  assert.ok(!origins.includes('*'))

  for (const origin of origins) {
    assert.match(origin, /^https?:\/\/[^/]+$/, `${origin} must be scheme://host[:port] only`)
    assert.equal(origin, normalizeOrigin(origin), `${origin} must already be normalized`)
  }
})

test('the allowlist is deduplicated even when sources overlap', () => {
  const origins = buildTrustedOrigins({
    extraOrigins: `${RAILWAY_PRODUCTION_ORIGIN}, ${RAILWAY_PRODUCTION_ORIGIN}/admin/`,
    serverURL: RAILWAY_PRODUCTION_ORIGIN,
    ...production,
  })

  assert.equal(origins.filter((origin) => origin === RAILWAY_PRODUCTION_ORIGIN).length, 1)
  assert.equal(new Set(origins).size, origins.length)
})

test('NEXT_PUBLIC_SERVER_URL and PAYLOAD_TRUSTED_ORIGINS are both honoured', () => {
  const origins = buildTrustedOrigins({
    extraOrigins: 'https://staging.example.com,https://admin.example.com/',
    serverURL: 'https://canonical.example.com/',
    ...production,
  })

  assert.ok(origins.includes('https://canonical.example.com'))
  assert.ok(origins.includes('https://staging.example.com'))
  assert.ok(origins.includes('https://admin.example.com'))
})

/** Requirement 7: localhost development must keep working. */
test('development origins are present in development and absent in production', () => {
  const dev = buildTrustedOrigins({
    includeDevelopmentOrigins: true,
    serverURL: 'http://localhost:3000',
  })
  assert.ok(dev.includes('http://localhost:3000'))
  assert.ok(dev.includes('http://ghee-roast.localhost:3000'))
  assert.ok(dev.includes('http://zuru-zuru.localhost:3000'))

  const prod = buildTrustedOrigins({ serverURL: null, ...production })
  assert.ok(!prod.some((origin) => origin.includes('localhost')))
  assert.ok(!prod.some((origin) => origin.includes('127.0.0.1')))
})

test('a bare IPv6 registry entry never produces a malformed origin', () => {
  const origins = buildTrustedOrigins({ includeDevelopmentOrigins: true, serverURL: null })

  // `::1` is in the registry but is not a valid URL host without brackets; it must be skipped
  // rather than emitted as `http://::1:3000`.
  for (const origin of origins) {
    assert.equal(origin, normalizeOrigin(origin), `${origin} must be a valid normalized origin`)
  }
  assert.ok(!origins.some((origin) => origin.includes('::1')))
})
