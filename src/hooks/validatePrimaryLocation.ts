import { ValidationError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'
import {
  normalizeTenantID,
  resolveTrustedTenantID,
} from '../access/tenantContext'

export const validatePrimaryLocation: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const isPrimary = (data.isPrimary ?? originalDoc?.isPrimary) === true
  if (!isPrimary) return data

  const tenantID = normalizeTenantID(data.tenantId)
    ?? normalizeTenantID(originalDoc?.tenantId)
    ?? await resolveTrustedTenantID(req)
  if (!tenantID) return data

  const currentID = normalizeTenantID(data.id) ?? normalizeTenantID(originalDoc?.id)
  const result = await req.payload.find({
    collection: 'locations',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    select: { id: true },
    where: {
      and: [
        { tenantId: { equals: tenantID } },
        { isPrimary: { equals: true } },
        ...(currentID ? [{ id: { not_equals: currentID } }] : []),
      ],
    },
  } as never) as { docs: Array<{ id: number | string }> }

  if (result.docs.length) {
    throw new ValidationError({
      errors: [{
        message: 'Only one location may be marked as primary for this tenant.',
        path: 'isPrimary',
      }],
    })
  }

  return data
}
