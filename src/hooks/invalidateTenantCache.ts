import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { revalidateTag } from 'next/cache'
import { normalizeTenantID } from '../access/tenantContext'

const invalidate = (
  doc: Record<string, unknown>,
  payload: Parameters<CollectionAfterChangeHook>[0]['req']['payload'],
): void => {
  const tenantId = normalizeTenantID(doc.tenantId)
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
