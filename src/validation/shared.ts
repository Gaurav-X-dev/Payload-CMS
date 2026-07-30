const RESERVED_SLUGS = new Set([
  '_next',
  'admin',
  'api',
  'assets',
  'graphql',
  'login',
  'media',
  'payload',
  'static',
])

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6})$/i
const SAFE_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u
const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const normalizeName = (value: unknown): string =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''

export const validateName = (
  value: unknown,
  { required = true }: { required?: boolean } = {},
): true | string => {
  const normalized = normalizeName(value)
  if (!normalized) return required ? 'Enter a name.' : true
  if (normalized.length < 2 || normalized.length > 100) {
    return 'Name must be between 2 and 100 characters.'
  }
  return SAFE_NAME_PATTERN.test(normalized)
    ? true
    : 'Name may contain letters, spaces, apostrophes, periods, and hyphens.'
}

export const normalizeEmail = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

export const validateEmail = (
  value: unknown,
  { required = true }: { required?: boolean } = {},
): true | string => {
  const normalized = normalizeEmail(value)
  if (!normalized) return required ? 'Enter an email address.' : true
  if (normalized.length > 254 || !EMAIL_PATTERN.test(normalized)) {
    return 'Enter a valid email address.'
  }
  return true
}

export const normalizeIndianMobile = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || !/^[+\d\s()-]+$/.test(trimmed)) return trimmed
  let digits = trimmed.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  return digits
}

export const validateIndianMobile = (
  value: unknown,
  { required = true }: { required?: boolean } = {},
): true | string => {
  const normalized = normalizeIndianMobile(value)
  if (!normalized) {
    return required ? 'Enter a valid 10-digit Indian mobile number.' : true
  }
  return /^[6-9]\d{9}$/.test(normalized)
    ? true
    : 'Enter a valid 10-digit Indian mobile number.'
}

export const normalizeContactPhone = (value: unknown): string =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''

export const validateContactPhone = (
  value: unknown,
  { required = false }: { required?: boolean } = {},
): true | string => {
  const normalized = normalizeContactPhone(value)
  if (!normalized) return required ? 'Enter a contact phone number.' : true
  if (!/^\+?[\d\s()-]+$/.test(normalized) || normalized.length > 30) {
    return 'Enter a valid contact phone number.'
  }
  const digitCount = normalized.replace(/\D/g, '').length
  return digitCount >= 7 && digitCount <= 15
    ? true
    : 'Enter a valid contact phone number.'
}

export const normalizeSlug = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/[\s]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    : ''

export const validateSlug = (
  value: unknown,
  { required = true }: { required?: boolean } = {},
): true | string => {
  const normalized = normalizeSlug(value)
  if (!normalized) return required ? 'Enter a slug.' : true
  if (normalized.length > 100 || !SAFE_SLUG_PATTERN.test(normalized)) {
    return 'Use lowercase letters, numbers, and single hyphens only.'
  }
  return RESERVED_SLUGS.has(normalized)
    ? 'This slug is reserved and cannot be used.'
    : true
}

export const normalizeDomain = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  let normalized = value.trim().toLowerCase()
  normalized = normalized.replace(/^https?:\/\//, '')
  if (normalized.endsWith('/') && normalized.indexOf('/') === normalized.length - 1) {
    normalized = normalized.slice(0, -1)
  }
  return normalized.replace(/\.$/, '')
}

export const validateDomain = (value: unknown): true | string => {
  const normalized = normalizeDomain(value)
  if (!normalized || normalized.length > 253) return 'Enter a valid hostname.'
  if (
    normalized.includes('/') ||
    normalized.includes(':') ||
    normalized.includes('*') ||
    /\s/.test(normalized)
  ) {
    return 'Enter a hostname without a protocol, port, path, or wildcard.'
  }
  if (normalized === 'localhost') return true
  const labels = normalized.split('.')
  if (labels.length < 2) return 'Enter a valid hostname.'
  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
  )
    ? true
    : 'Enter a valid hostname.'
}

export const validateSafeURL = (
  value: unknown,
  { required = false }: { required?: boolean } = {},
): true | string => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) return required ? 'Enter a URL.' : true
  if (normalized.length > 2048) return 'URL must not exceed 2048 characters.'
  if (normalized.startsWith('/') && !normalized.startsWith('//')) return true
  try {
    const parsed = new URL(normalized)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? true
      : 'Use an internal path or an http/https URL.'
  } catch {
    return 'Enter a valid internal path or http/https URL.'
  }
}

export const validateConfiguredLink = (
  value: unknown,
  type: unknown,
): true | string => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) return 'Enter a link.'

  if (type === 'anchor') {
    return /^#[A-Za-z][\w:.-]*$/.test(normalized)
      ? true
      : 'Enter a valid anchor beginning with #.'
  }
  if (type === 'email') {
    const email = normalized.toLowerCase().startsWith('mailto:')
      ? normalized.slice(7)
      : normalized
    return validateEmail(email)
  }
  if (type === 'phone') {
    const phone = normalized.toLowerCase().startsWith('tel:')
      ? normalized.slice(4)
      : normalized
    return validateContactPhone(phone, { required: true })
  }
  return validateSafeURL(normalized, { required: true })
}

export const normalizeHexColor = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

export const validateHexColor = (value: unknown): true | string =>
  HEX_COLOR_PATTERN.test(normalizeHexColor(value))
    ? true
    : 'Enter a hexadecimal color such as #fff or #d4af37.'

export const validateFiniteInteger = (
  value: unknown,
  { max, min = 0 }: { max?: number; min?: number } = {},
): true | string => {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
    return 'Enter a whole number.'
  }
  if (value < min || (max !== undefined && value > max)) {
    return `Enter a value between ${min} and ${max ?? 'the allowed maximum'}.`
  }
  return true
}

export const validateFiniteNumber = (
  value: unknown,
  {
    decimalPlaces,
    max,
    min = 0,
  }: {
    decimalPlaces?: number
    max?: number
    min?: number
  } = {},
): true | string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Enter a valid number.'
  }
  if (value < min || (max !== undefined && value > max)) {
    return `Enter a value between ${min} and ${max ?? 'the allowed maximum'}.`
  }
  if (decimalPlaces !== undefined) {
    const factor = 10 ** decimalPlaces
    if (Math.abs(Math.round(value * factor) - value * factor) > 1e-8) {
      return `Use no more than ${decimalPlaces} decimal places.`
    }
  }
  return true
}

export const validateDateOrder = (
  start: unknown,
  end: unknown,
): true | string => {
  if (!start || !end) return true
  const startTime = new Date(String(start)).getTime()
  const endTime = new Date(String(end)).getTime()
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return 'Enter valid dates.'
  }
  return startTime <= endTime
    ? true
    : 'The end date must be on or after the start date.'
}
