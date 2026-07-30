import type {
  CollectionSlug,
  FieldHook,
  FilterOptions,
  PayloadRequest,
  User,
  Where,
} from 'payload'
import { ValidationError } from 'payload'

import {
  getUserTenantIDs,
  getAuthenticatedTenantID,
  isSuperAdminUser,
  normalizeTenantID,
  resolveTrustedTenantID,
  type AuthorizationUser,
  type TenantID,
} from '../access/tenantContext'

const relationshipError = (path: string): never => {
  throw new ValidationError({
    errors: [{
      message: 'The selected related document is not available for the active tenant.',
      path,
    }],
  })
}

const duplicateRelationshipError = (path: string): never => {
  throw new ValidationError({
    errors: [{
      message: 'The same related document cannot be selected more than once.',
      path,
    }],
  })
}

/**
 * Supports raw IDs, populated documents, polymorphic `{ value }` wrappers,
 * arrays, and localized value maps. IDs are de-duplicated before querying.
 */
export const normalizeRelationshipIDs = (value: unknown): TenantID[] => {
  const ids = new Set<TenantID>()
  const visited = new Set<object>()

  const visit = (candidate: unknown): void => {
    const directID = normalizeTenantID(candidate)
    if (directID) {
      ids.add(directID)
      return
    }

    if (candidate === null || candidate === undefined || candidate === '') return

    if (Array.isArray(candidate)) {
      candidate.forEach(visit)
      return
    }

    if (typeof candidate !== 'object' || visited.has(candidate)) return
    visited.add(candidate)

    if ('id' in candidate) {
      visit(candidate.id)
      return
    }

    if ('value' in candidate) {
      visit(candidate.value)
      return
    }

    // Relationship hooks normally receive a locale-specific value. This
    // fallback also supports localized maps supplied by Local API callers.
    Object.values(candidate).forEach(visit)
  }

  visit(value)
  return [...ids]
}

export const hasDuplicateRelationshipIDs = (value: unknown): boolean => {
  if (!Array.isArray(value)) return false
  const ids = value.flatMap((entry) => normalizeRelationshipIDs(entry))
  return ids.length !== new Set(ids).size
}

type ValidateRelationshipArgs = {
  path: string
  relationTo: CollectionSlug
  req: PayloadRequest
  tenantID: TenantID
  value: unknown
}

export const validateRelationshipForTenant = async ({
  path,
  relationTo,
  req,
  tenantID,
  value,
}: ValidateRelationshipArgs): Promise<void> => {
  const ids = normalizeRelationshipIDs(value)
  if (!ids.length) return

  if (relationTo === 'users') {
    // Users are intentionally multi-tenant and have no tenantId field.
    const result = await req.payload.find({
      collection: 'users',
      depth: 0,
      limit: ids.length,
      overrideAccess: true,
      pagination: false,
      select: {
        id: true,
        tenants: true,
      },
      where: {
        id: {
          in: ids,
        },
      },
    })

    const valid = result.docs.length === ids.length && result.docs.every((doc) =>
      getUserTenantIDs(doc as { tenants?: User['tenants'] }).includes(tenantID))

    if (!valid) relationshipError(path)
    return
  }

  // overrideAccess is intentional for integrity checks. Tenant isolation is
  // enforced explicitly in this database query, not delegated to access rules.
  const result = await req.payload.find({
    collection: relationTo,
    depth: 0,
    limit: ids.length,
    overrideAccess: true,
    pagination: false,
    select: { id: true },
    where: {
      and: [
        {
          id: {
            in: ids,
          },
        },
        {
          tenantId: {
            equals: tenantID,
          },
        },
      ],
    },
  } as never) as { docs: Array<{ id: number }> }

  if (result.docs.length !== ids.length) relationshipError(path)
}

type SameTenantOptions = {
  parentTenantIdentity?: 'documentID' | 'tenantId'
  path?: string
}

type TenantRelationshipFilterOptions = {
  excludeCurrentDocument?: boolean
  parentTenantIdentity?: 'documentID' | 'tenantId'
}

type TenantRelationshipFilter = Exclude<FilterOptions, null | Where>

export const tenantRelationshipFilter = (
  relationTo: CollectionSlug,
  {
    excludeCurrentDocument = false,
    parentTenantIdentity = 'tenantId',
  }: TenantRelationshipFilterOptions = {},
): TenantRelationshipFilter => ({ data, id, req, user }) => {
  const document = data && typeof data === 'object'
    ? data as Record<string, unknown>
    : {}
  const tenantID = parentTenantIdentity === 'documentID'
    ? normalizeTenantID(id)
    : normalizeTenantID(document.tenantId) ?? getAuthenticatedTenantID(req)

  const conditions: import('payload').Where[] = []
  if (tenantID) {
    conditions.push(
      relationTo === 'users'
        ? { tenants: { in: [tenantID] } }
        : { tenantId: { equals: tenantID } },
    )
  } else if (!isSuperAdminUser(user as AuthorizationUser)) {
    const tenantIDs = getUserTenantIDs(user as AuthorizationUser)
    if (!tenantIDs.length) return false
    conditions.push(
      relationTo === 'users'
        ? { tenants: { in: tenantIDs } }
        : { tenantId: { in: tenantIDs } },
    )
  }

  if (excludeCurrentDocument && id !== undefined) {
    conditions.push({ id: { not_equals: id } })
  }

  if (!conditions.length) return true
  return conditions.length === 1 ? conditions[0] : { and: conditions }
}

export const sameTenantRelationship = (
  relationTo: CollectionSlug,
  {
    parentTenantIdentity = 'tenantId',
    path,
  }: SameTenantOptions = {},
): FieldHook => async ({
  data,
  originalDoc,
  path: runtimePath,
  req,
  value,
}) => {
  const validationPath = path || runtimePath?.join('.') || relationTo
  if (hasDuplicateRelationshipIDs(value)) {
    return duplicateRelationshipError(validationPath)
  }

  const ids = normalizeRelationshipIDs(value)
  if (!ids.length) return value

  const tenantID = parentTenantIdentity === 'documentID'
    ? normalizeTenantID(data?.id) ?? normalizeTenantID(originalDoc?.id)
    : normalizeTenantID(data?.tenantId) ??
      normalizeTenantID(originalDoc?.tenantId) ??
      await resolveTrustedTenantID(req)

  if (!tenantID) return relationshipError(validationPath)

  await validateRelationshipForTenant({
    path: validationPath,
    relationTo,
    req,
    tenantID,
    value,
  })

  return value
}
