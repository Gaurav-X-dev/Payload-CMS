import type { CollectionSlug, FieldHook, Where } from 'payload'
import { ValidationError } from 'payload'
import {
  normalizeTenantID,
  resolveTrustedTenantID,
} from '../access/tenantContext'
import { validateSlug } from '../validation/shared'

/**
 * Ensures a field (usually a slug) is unique per-tenant rather than globally.
 * Also handles automatic URL-safe slug generation if the field is left blank.
 * 
 * @param fallbackField The field to pull from if the slug is empty (e.g., 'title')
 */
export const tenantScopedUnique = (fallbackField: string = 'title'): FieldHook => {
  return async ({ value, data, req, operation, originalDoc, collection }) => {
    let finalValue = value

    // 1. Auto-generate if empty
    if (!finalValue && data?.[fallbackField]) {
      finalValue = data[fallbackField]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }

    // If it's a page and is the homepage, the slug might be empty deliberately.
    // Pages validates that only one Home Page exists for the tenant.
    if (collection && collection.slug === 'pages' && data?.isHomePage) {
      return ''
    }

    if (!finalValue) return finalValue

    // 2. Format to be URL safe just in case the user typed it manually
    finalValue = finalValue
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const slugValidation = validateSlug(finalValue)
    if (slugValidation !== true) {
      throw new ValidationError({
        errors: [{ path: 'slug', message: slugValidation }],
      })
    }

    // 3. Check for tenant-scoped uniqueness
    const tenantId =
      normalizeTenantID(data?.tenantId) ??
      normalizeTenantID(originalDoc?.tenantId) ??
      await resolveTrustedTenantID(req)
    if (!tenantId) {
      throw new ValidationError({
        errors: [
          {
            path: 'tenantId',
            message: 'A tenant is required before validating slug uniqueness.',
          },
        ],
      })
    }

    const conditions: Where[] = [
      { slug: { equals: finalValue } },
      { tenantId: { equals: tenantId } },
    ]

    const originalID = originalDoc?.id
    if (operation === 'update' && originalID) {
      conditions.push({
        id: {
          not_equals: originalID,
        },
      })
    }

    if (!collection?.slug) {
      throw new ValidationError({
        errors: [{ path: 'slug', message: 'Collection context is required.' }],
      })
    }

    const result = await req.payload.find({
      collection: collection.slug as CollectionSlug,
      where: { and: conditions },
      depth: 0,
      limit: 1,
      draft: true,
      overrideAccess: true,
    })

    if (result.docs.length > 0) {
      throw new ValidationError({
        errors: [
          {
            path: 'slug',
            message: `This slug "${finalValue}" is already in use by another document in this tenant. It must be unique.`,
          },
        ],
      })
    }

    return finalValue
  }
}
