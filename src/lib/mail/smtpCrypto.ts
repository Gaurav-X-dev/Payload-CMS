import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const FORMAT_VERSION = 'v1'

/**
 * Normalizes the arbitrary-length, operator-chosen MAIL_SETTINGS_ENCRYPTION_KEY into the exact
 * 32 bytes AES-256 requires. The key is read fresh from process.env on every call — never cached,
 * never stored anywhere else, never exposed through Payload.
 */
const deriveKey = (): Buffer => {
  const secret = process.env.MAIL_SETTINGS_ENCRYPTION_KEY
  if (!secret) {
    throw new Error('MAIL_SETTINGS_ENCRYPTION_KEY is not configured.')
  }
  return createHash('sha256').update(secret).digest()
}

export const isMailEncryptionConfigured = (): boolean => Boolean(process.env.MAIL_SETTINGS_ENCRYPTION_KEY)

/** AES-256-GCM, authenticated, with a fresh random IV per call. Stored as v1:<iv>:<authTag>:<ciphertext> (hex). */
export const encryptSecret = (plaintext: string): string => {
  const key = deriveKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [FORMAT_VERSION, iv.toString('hex'), authTag.toString('hex'), ciphertext.toString('hex')].join(':')
}

export const decryptSecret = (stored: string): string => {
  const parts = stored.split(':')
  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
    throw new Error('Unsupported encrypted value format.')
  }
  const [, ivHex, authTagHex, ciphertextHex] = parts
  const key = deriveKey()
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextHex, 'hex')), decipher.final()])
  return plaintext.toString('utf8')
}
