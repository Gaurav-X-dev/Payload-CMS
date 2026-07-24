import type { Access, Where } from 'payload'

import {
  getUserTenantIDs,
  isSuperAdminUser,
  resolvePublicTenantID,
} from './tenantContext'

type Options = {
  publishedOnly?: boolean
}

export const tenantPublicRead = ({ publishedOnly = false }: Options = {}): Access =>
  async ({ req }) => {
    if (isSuperAdminUser(req.user)) return true

    if (req.user) {
      const tenantIDs = getUserTenantIDs(req.user)
      if (!tenantIDs.length) return false
      const authenticatedWhere: Where = {
        tenantId: {
          in: tenantIDs,
        },
      }
      return authenticatedWhere
    }

    const tenantID = await resolvePublicTenantID(req)
    if (!tenantID) return false

    const conditions: Where[] = [
      {
        tenantId: {
          equals: tenantID,
        },
      },
    ]

    if (publishedOnly) {
      conditions.push({
        _status: {
          equals: 'published',
        },
      })
    }

    return {
      and: conditions,
    }
  }

export const assignedTenantRead: Access = ({ req }) => {
  if (isSuperAdminUser(req.user)) return true
  const tenantIDs = getUserTenantIDs(req.user)
  if (!tenantIDs.length) return false
  const where: Where = {
    id: {
      in: tenantIDs,
    },
  }
  return where
}
