import type { FieldHook } from 'payload'
import { ValidationError } from 'payload'

import {
  normalizeTenantID,
  type TenantID,
} from '../access/tenantContext'
import { normalizeRelationshipIDs } from './sameTenantRelationship'

const MAX_TENANT_ANCESTORS = 100

const hierarchyError = (): never => {
  throw new ValidationError({
    errors: [{
      message: 'The selected parent would create an invalid tenant hierarchy.',
      path: 'parentTenant',
    }],
  })
}

export const validateTenantParent: FieldHook = async ({
  data,
  originalDoc,
  req,
  value,
}) => {
  const [parentID] = normalizeRelationshipIDs(value)
  if (!parentID) return value

  const tenantID =
    normalizeTenantID(data?.id) ??
    normalizeTenantID(originalDoc?.id)

  if (tenantID && parentID === tenantID) hierarchyError()

  const visited = new Set<TenantID>()
  let ancestorID: TenantID | null = parentID

  for (let depth = 0; ancestorID && depth < MAX_TENANT_ANCESTORS; depth += 1) {
    if (ancestorID === tenantID || visited.has(ancestorID)) hierarchyError()
    visited.add(ancestorID)

    // Tenants are identity roots and do not contain tenantId. Internal access
    // override is intentional; only id and parentTenant are selected.
    const result = await req.payload.find({
      collection: 'tenants',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      select: {
        id: true,
        parentTenant: true,
      },
      where: {
        id: {
          equals: ancestorID,
        },
      },
    })

    if (result.docs.length !== 1) hierarchyError()
    ancestorID = normalizeTenantID(result.docs[0].parentTenant)
  }

  if (ancestorID) hierarchyError()
  return value
}
