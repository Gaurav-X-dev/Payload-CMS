import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { revalidateTag } from 'next/cache'
import { normalizeTenantID } from '../access/tenantContext'

const invalidateByTenantId = (
  tenantId: null | number | string,
  payload: Parameters<CollectionAfterChangeHook>[0]['req']['payload'],
): void => {
  if (!tenantId) {
    payload.logger.warn('Skipped tenant cache invalidation because tenant context was missing.')
    return
  }

  payload.logger.info(`Invalidating Next.js cache for tenant: ${tenantId}`)

  try {
    revalidateTag(`tenant-${tenantId}`, 'max')
  } catch {
    payload.logger.warn(`Failed to revalidate cache tag for tenant-${tenantId}`)
  }
}

const invalidate = (
  doc: Record<string, unknown>,
  payload: Parameters<CollectionAfterChangeHook>[0]['req']['payload'],
): void => invalidateByTenantId(normalizeTenantID(doc.tenantId), payload)

export const invalidateTenantCache: CollectionAfterChangeHook = async ({
  doc,
  req: { payload },
}) => {
  invalidate(doc, payload)
  return doc
}

export const invalidateTenantCacheAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload },
}) => {
  invalidate(doc, payload)
  return doc
}

// Tenant documents are their own tenant identity (doc.id, not doc.tenantId) — e.g. editing
// branding.logo, name, isActive, or theme. P7 added persistent cross-request caches (Ghee Roast/
// Curious Ladoo/Zuru Zuru) that read those fields directly, so tenant document changes must
// invalidate the same `tenant-${id}` tag as any tenant-scoped content collection.
export const invalidateTenantCacheForTenantDocument: CollectionAfterChangeHook = async ({
  doc,
  req: { payload },
}) => {
  invalidateByTenantId(normalizeTenantID(doc.id), payload)
  return doc
}

export const invalidateTenantCacheForTenantDocumentAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload },
}) => {
  invalidateByTenantId(normalizeTenantID(doc.id), payload)
  return doc
}
