import { ValidationError } from 'payload'
import type { FieldHook } from 'payload'
import {
  normalizeRelationshipIDs,
  sameTenantRelationship,
} from './sameTenantRelationship'
import { isSanitizedSVGMedia } from '../validation/svgSafety'

const enforceSameTenantMedia = sameTenantRelationship('media')

export const sameTenantSVGRelationship: FieldHook = async (args) => {
  const value = await enforceSameTenantMedia(args)
  const ids = normalizeRelationshipIDs(value)
  if (!ids.length) return value

  const result = await args.req.payload.find({
    collection: 'media',
    depth: 0,
    limit: ids.length,
    overrideAccess: true,
    pagination: false,
    select: {
      filename: true,
      id: true,
      mimeType: true,
      svgSanitized: true,
    },
    where: {
      id: { in: ids },
    },
  })

  if (result.docs.length !== ids.length || !result.docs.every((document) => isSanitizedSVGMedia(document))) {
    throw new ValidationError({
      errors: [{
        message: 'Select a validated SVG Media file from the active tenant.',
        path: args.path?.join('.') || 'customSVG',
      }],
    })
  }

  return value
}
