import { validateSafeURL } from './shared'

type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

export const DEFAULT_CONTACT_SUBJECT_OPTIONS = [
  { label: 'General Enquiry', value: 'General Enquiry' },
  { label: 'Catering Request', value: 'Catering Request' },
  { label: 'Feedback', value: 'Feedback' },
  { label: 'Partnership', value: 'Partnership' },
] as const

export const validateExternalHTTPURL = (
  value: unknown,
  { required = false }: { required?: boolean } = {},
): true | string => {
  const normalized = text(value)
  if (!normalized) return required ? 'Enter an http/https URL.' : true
  const safe = validateSafeURL(normalized, { required: true })
  if (safe !== true || normalized.startsWith('/')) {
    return 'Enter a complete http/https URL.'
  }
  return true
}

export const validateContactSubjectRows = (value: unknown): true | string => {
  if (value === null || value === undefined || value === '') return true
  if (!Array.isArray(value)) return 'Subject Options must be a list.'
  if (value.length > 12) return 'Add no more than 12 subject options.'

  const seen = new Set<string>()
  for (const [index, entryValue] of value.entries()) {
    const entry = record(entryValue)
    const label = text(entry?.label)
    const optionValue = text(entry?.value)
    if (!label || !optionValue) {
      return `Subject option ${index + 1} requires both a label and value.`
    }
    const normalized = optionValue.toLocaleLowerCase('en-IN')
    if (seen.has(normalized)) return `Subject option value "${optionValue}" is duplicated.`
    seen.add(normalized)
  }
  return true
}

export const validateSocialRows = (value: unknown): true | string => {
  if (value === null || value === undefined || value === '') return true
  if (!Array.isArray(value)) return 'Social Links must be a list.'

  const enabledPlatforms = new Set<string>()
  for (const [index, entryValue] of value.entries()) {
    const entry = record(entryValue)
    const enabled = entry?.enabled !== false
    const platform = text(entry?.platform)
    const url = text(entry?.url)

    if (!platform) return `Social link ${index + 1} requires a platform.`
    if (enabled) {
      const normalizedPlatform = platform.toLocaleLowerCase('en-IN')
      if (enabledPlatforms.has(normalizedPlatform)) {
        return `Only one enabled ${platform} social link is allowed.`
      }
      enabledPlatforms.add(normalizedPlatform)
    }

    const urlValidation = validateExternalHTTPURL(url, { required: enabled })
    if (urlValidation !== true) return `Social link ${index + 1}: ${urlValidation}`
  }
  return true
}

