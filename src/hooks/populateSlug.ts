import type { FieldHook } from 'payload'

const format = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

export const populateSlug =
  (fallback: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (typeof value === 'string' && value !== '') {
      return format(value)
    }
    const fallbackData = data?.[fallback] || originalDoc?.[fallback]
    if (fallbackData && typeof fallbackData === 'string') {
      return format(fallbackData)
    }
    return value
  }
