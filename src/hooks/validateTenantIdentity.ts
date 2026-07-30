import type { CollectionBeforeValidateHook, Where } from 'payload'
import { ValidationError } from 'payload'
import {
  normalizeDomain,
  normalizeEmail,
  normalizeHexColor,
  normalizeName,
  normalizeContactPhone,
  normalizeSlug,
  validateContactPhone,
  validateDomain,
  validateEmail,
  validateHexColor,
  validateName,
  validateSlug,
} from '../validation/shared'

type TenantInput = Record<string, unknown> & {
  branding?: Record<string, unknown> | null
  contact?: Record<string, unknown> | null
  domains?: Array<Record<string, unknown>> | null
}

const tenantValidationError = (
  errors: Array<{ message: string; path: string }>,
): never => {
  throw new ValidationError({ errors })
}

export const validateTenantIdentity: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const input = data as TenantInput
  const errors: Array<{ message: string; path: string }> = []

  if (input.name !== undefined || operation === 'create') {
    input.name = normalizeName(input.name)
    const result = validateName(input.name)
    if (result !== true) errors.push({ message: result, path: 'name' })
  }

  const slugSource = input.slug || input.name || originalDoc?.slug
  if (slugSource !== undefined || operation === 'create') {
    input.slug = normalizeSlug(slugSource)
    const result = validateSlug(input.slug)
    if (result !== true) errors.push({ message: result, path: 'slug' })
  }

  if (input.contact) {
    if (input.contact.contactEmail !== undefined) {
      input.contact.contactEmail = normalizeEmail(input.contact.contactEmail)
      const result = validateEmail(input.contact.contactEmail, { required: false })
      if (result !== true) errors.push({ message: result, path: 'contact.contactEmail' })
    }
    const contactPhone = input.contact.contactPhone
    if (contactPhone !== undefined) {
      input.contact.contactPhone = normalizeContactPhone(contactPhone)
      const result = validateContactPhone(input.contact.contactPhone)
      if (result !== true) {
        errors.push({
          message: result,
          path: 'contact.contactPhone',
        })
      }
    }
  }

  const colors = ['primaryColor', 'accentColor', 'backgroundColor'] as const
  if (input.branding) {
    for (const color of colors) {
      if (input.branding[color] === undefined) continue
      input.branding[color] = normalizeHexColor(input.branding[color])
      const result = validateHexColor(input.branding[color])
      if (result !== true) {
        errors.push({ message: result, path: `branding.${color}` })
      }
    }
  }

  const normalizedDomains = (input.domains ?? []).map((entry) => ({
    ...entry,
    domain: normalizeDomain(entry.domain),
  }))
  if (input.domains !== undefined) {
    input.domains = normalizedDomains
    for (const [index, entry] of normalizedDomains.entries()) {
      const result = validateDomain(entry.domain)
      if (result !== true) {
        errors.push({ message: result, path: `domains.${index}.domain` })
      }
    }
    const domains = normalizedDomains.map((entry) => String(entry.domain))
    if (new Set(domains).size !== domains.length) {
      errors.push({
        message: 'A domain may be assigned only once.',
        path: 'domains',
      })
    }
  }

  if (errors.length) tenantValidationError(errors)

  const originalID = originalDoc?.id
  const withoutCurrentTenant = originalID
    ? [{ id: { not_equals: originalID } } satisfies Where]
    : []

  if (input.slug) {
    const duplicateSlug = await req.payload.find({
      collection: 'tenants',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { slug: { equals: input.slug } },
          ...withoutCurrentTenant,
        ],
      },
    })
    if (duplicateSlug.docs.length) {
      tenantValidationError([{
        message: 'This tenant slug is already in use.',
        path: 'slug',
      }])
    }
  }

  if (normalizedDomains.length) {
    const duplicateDomain = await req.payload.find({
      collection: 'tenants',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { 'domains.domain': { in: normalizedDomains.map((entry) => entry.domain) } },
          ...withoutCurrentTenant,
        ],
      },
    })
    if (duplicateDomain.docs.length) {
      tenantValidationError([{
        message: 'One or more domains are already assigned to another tenant.',
        path: 'domains',
      }])
    }
  }

  if (input.isPrimary === true) {
    const existingPrimary = await req.payload.find({
      collection: 'tenants',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { isPrimary: { equals: true } },
          ...withoutCurrentTenant,
        ],
      },
    })
    if (existingPrimary.docs.length) {
      tenantValidationError([{
        message: 'Only one tenant may be marked as primary.',
        path: 'isPrimary',
      }])
    }
  }

  return data
}
