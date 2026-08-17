import assert from 'node:assert/strict'
import test from 'node:test'

import { buildSmtpTransportOptions } from '../src/lib/mail/smtpTransport.ts'
import type { TenantSmtpConfig } from '../src/lib/mail/smtpTransport.ts'
import { resolveSmtpHostIPv4 } from '../src/lib/mail/smtpDns.ts'
import type { SmtpAddressLookup } from '../src/lib/mail/smtpDns.ts'

const config: TenantSmtpConfig = {
  fromAddress: 'no-reply@example.test',
  fromName: 'Example',
  host: 'smtp.example.test',
  port: 465,
  secure: true,
  username: 'no-reply@example.test',
}

// Every test here is offline by construction: resolveSmtpHostIPv4 takes an injected lookup, and
// buildSmtpTransportOptions is a pure function. No socket is opened and no DNS query is made.
const lookupReturning = (...addresses: string[]): SmtpAddressLookup => async () => addresses
const lookupRejecting = (): SmtpAddressLookup => async () => {
  throw Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' })
}

/**
 * Regression guard for the production hang traced in the Railway audit: sendTenantEmail is
 * awaited inside a Payload afterChange hook, and Payload awaits afterChange BEFORE committing the
 * request transaction. With nodemailer's defaults (2 min connect / 30 s greeting / 10 min socket)
 * an unreachable SMTP host turned "create a user" into a multi-minute request that also pinned a
 * Postgres pool connection. These bounds must stay explicit.
 */
test('SMTP transport options always carry explicit, request-safe timeouts', () => {
  const options = buildSmtpTransportOptions(config, 'plaintext-password', {
    address: '203.0.113.10',
    servername: config.host,
  })

  for (const key of ['connectionTimeout', 'greetingTimeout', 'socketTimeout'] as const) {
    assert.equal(typeof options[key], 'number', `${key} must be set explicitly`)
    assert.ok(options[key] > 0, `${key} must be positive`)
    assert.ok(
      options[key] <= 30_000,
      `${key} must stay well under nodemailer's request-blocking defaults`,
    )
  }
})

test('SMTP transport options carry the tenant credentials unchanged', () => {
  const options = buildSmtpTransportOptions(config, 'plaintext-password', {
    address: '203.0.113.10',
    servername: config.host,
  })

  assert.equal(options.port, config.port)
  assert.equal(options.secure, config.secure)
  assert.equal(options.auth.user, config.username)
  assert.equal(options.auth.pass, 'plaintext-password')
})

/**
 * Regression guard for `connect ENETUNREACH 2a00:1450:4025:401::6c:587` in production. The
 * transport must dial a resolved IPv4 literal, never the hostname — handing nodemailer a hostname
 * lets its own resolver pick randomly between A and AAAA records, which is what reached IPv6.
 */
test('SMTP transport dials the resolved IPv4 literal, not the hostname', () => {
  const options = buildSmtpTransportOptions(config, 'pw', {
    address: '203.0.113.10',
    servername: config.host,
  })

  assert.equal(options.host, '203.0.113.10')
  assert.notEqual(options.host, config.host)
})

/**
 * Connecting to an IP would leave TLS with nothing to verify against, so the original hostname
 * must travel as `servername`. Nodemailer applies it on both TLS paths (implicit TLS on 465 and
 * the STARTTLS upgrade on 587), and Node checks the certificate against it.
 */
test('SMTP transport preserves the hostname for TLS/SNI and certificate verification', () => {
  const options = buildSmtpTransportOptions(config, 'pw', {
    address: '203.0.113.10',
    servername: config.host,
  })

  assert.equal(options.servername, config.host)
  assert.equal(options.tls?.servername, config.host)
})

test('SMTP transport never weakens TLS verification', () => {
  const options = buildSmtpTransportOptions(config, 'pw', {
    address: '203.0.113.10',
    servername: config.host,
  }) as Record<string, unknown>

  // rejectUnauthorized must stay at Node's secure default; setting it at all would be a red flag.
  assert.equal(options.rejectUnauthorized, undefined)
  assert.equal((options.tls as Record<string, unknown>).rejectUnauthorized, undefined)
  assert.equal(options.ignoreTLS, undefined)
  assert.equal(options.secure, true)
})

/**
 * `family: 4` was the previous attempt at this fix and was inert: nodemailer replaces the hostname
 * with a resolved IP before calling net.connect, and Node ignores `family` for an IP literal.
 * Asserting its absence keeps anyone from re-adding it and believing the problem is handled.
 */
test('SMTP transport does not rely on the inert family option', () => {
  const options = buildSmtpTransportOptions(config, 'pw', {
    address: '203.0.113.10',
    servername: config.host,
  }) as Record<string, unknown>

  assert.equal(options.family, undefined)
})

test('a hostname resolves to its IPv4 address and keeps the hostname as servername', async () => {
  const resolution = await resolveSmtpHostIPv4('smtp.gmail.com', {
    lookup: lookupReturning('142.250.185.109', '142.250.185.110'),
  })

  assert.equal(resolution.ok, true)
  assert.ok(resolution.ok)
  assert.equal(resolution.address, '142.250.185.109')
  assert.equal(resolution.servername, 'smtp.gmail.com')
})

test('an IPv6 address is never selected even when the lookup returns one', async () => {
  const resolution = await resolveSmtpHostIPv4('smtp.gmail.com', {
    lookup: lookupReturning('2a00:1450:4025:401::6c', '142.250.185.109'),
  })

  assert.ok(resolution.ok)
  assert.equal(resolution.address, '142.250.185.109')
})

test('a lookup that yields only IPv6 fails fast with a safe reason', async () => {
  const resolution = await resolveSmtpHostIPv4('ipv6-only.example.test', {
    lookup: lookupReturning('2a00:1450:4025:401::6c'),
  })

  assert.equal(resolution.ok, false)
  assert.ok(!resolution.ok)
  assert.equal(resolution.reason, 'smtp_dns_no_ipv4_address')
})

test('a failed DNS lookup fails fast with a safe reason and never throws', async () => {
  const resolution = await resolveSmtpHostIPv4('does-not-exist.example.test', {
    lookup: lookupRejecting(),
  })

  assert.equal(resolution.ok, false)
  assert.ok(!resolution.ok)
  assert.equal(resolution.reason, 'smtp_dns_ipv4_lookup_failed')
})

test('a hanging DNS lookup is bounded by the timeout rather than stalling the request', async () => {
  const started = Date.now()
  const resolution = await resolveSmtpHostIPv4('slow.example.test', {
    lookup: () => new Promise<string[]>(() => {}),
    timeoutMs: 50,
  })

  assert.ok(!resolution.ok)
  assert.equal(resolution.reason, 'smtp_dns_ipv4_lookup_failed')
  assert.ok(Date.now() - started < 2_000, 'must give up on the configured timeout')
})

test('an explicitly configured IP literal is honoured without inventing a servername', async () => {
  const ipv4 = await resolveSmtpHostIPv4('203.0.113.10', { lookup: lookupRejecting() })
  assert.ok(ipv4.ok)
  assert.equal(ipv4.address, '203.0.113.10')
  assert.equal(ipv4.servername, undefined)

  // An operator who configured an IPv6 literal meant it — that is a different decision from
  // letting DNS hand us an unroutable AAAA record, and it is not silently overridden.
  const ipv6 = await resolveSmtpHostIPv4('2a00:1450:4025:401::6c', { lookup: lookupRejecting() })
  assert.ok(ipv6.ok)
  assert.equal(ipv6.address, '2a00:1450:4025:401::6c')
})

test('an empty host fails without attempting a lookup', async () => {
  const resolution = await resolveSmtpHostIPv4('   ', {
    lookup: () => assert.fail('lookup must not run for an empty host'),
  })

  assert.ok(!resolution.ok)
  assert.equal(resolution.reason, 'smtp_host_missing')
})

test('no failure reason ever carries a credential', async () => {
  const reasons = [
    (await resolveSmtpHostIPv4('   ', { lookup: lookupRejecting() })) as { reason?: string },
    (await resolveSmtpHostIPv4('a.example.test', { lookup: lookupRejecting() })) as {
      reason?: string
    },
    (await resolveSmtpHostIPv4('b.example.test', { lookup: lookupReturning('::1') })) as {
      reason?: string
    },
  ]

  for (const { reason } of reasons) {
    assert.match(String(reason), /^smtp_[a-z0-9_]+$/, 'reasons must stay opaque, safe codes')
  }
})
