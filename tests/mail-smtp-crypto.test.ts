import assert from 'node:assert/strict'
import test from 'node:test'

process.env.MAIL_SETTINGS_ENCRYPTION_KEY = 'test-only-encryption-key-not-for-real-use'

const { decryptSecret, encryptSecret } = await import('../src/lib/mail/smtpCrypto.ts')

test('encryptSecret/decryptSecret round-trips the original plaintext', () => {
  const plaintext = 'Hostinger-App-Password-123!'
  const stored = encryptSecret(plaintext)
  assert.equal(decryptSecret(stored), plaintext)
})

test('encryptSecret uses the documented v1:<iv>:<authTag>:<ciphertext> hex format', () => {
  const stored = encryptSecret('any-password')
  const parts = stored.split(':')
  assert.equal(parts.length, 4)
  assert.equal(parts[0], 'v1')
  assert.equal(parts[1].length, 24) // 12-byte IV as hex
  assert.equal(parts[2].length, 32) // 16-byte GCM auth tag as hex
  assert.match(parts[3], /^[0-9a-f]+$/)
})

test('encryptSecret never reuses an IV: the same plaintext encrypted twice yields different ciphertext', () => {
  const a = encryptSecret('same-password')
  const b = encryptSecret('same-password')
  assert.notEqual(a, b)
  const [, ivA] = a.split(':')
  const [, ivB] = b.split(':')
  assert.notEqual(ivA, ivB)
})

test('decryptSecret rejects a tampered ciphertext (authentication fails)', () => {
  const stored = encryptSecret('tamper-test-password')
  const [version, iv, authTag, ciphertext] = stored.split(':')
  const tamperedByte = ciphertext.slice(0, -2) + (ciphertext.slice(-2) === '00' ? '01' : '00')
  const tampered = [version, iv, authTag, tamperedByte].join(':')
  assert.throws(() => decryptSecret(tampered))
})

test('decryptSecret rejects an unsupported/malformed stored format', () => {
  assert.throws(() => decryptSecret('not-the-right-format'))
  assert.throws(() => decryptSecret('v2:aa:bb:cc'))
})

test('encryptSecret throws a clear error when MAIL_SETTINGS_ENCRYPTION_KEY is missing', async () => {
  const original = process.env.MAIL_SETTINGS_ENCRYPTION_KEY
  delete process.env.MAIL_SETTINGS_ENCRYPTION_KEY
  try {
    assert.throws(() => encryptSecret('x'), /MAIL_SETTINGS_ENCRYPTION_KEY/)
  } finally {
    process.env.MAIL_SETTINGS_ENCRYPTION_KEY = original
  }
})
