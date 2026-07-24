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

      let activeTenantIDs = tenantIDs
      // req.user.tenants is populated during auth
      if (req.user.tenants && req.user.tenants.length > 0 && typeof req.user.tenants[0] === 'object') {
        activeTenantIDs = req.user.tenants
          .filter((t: any) => t && t.isActive === true)
          .map((t: any) => t.id)
      } else if (tenantIDs.length > 0) {
        // Fallback: fetch active ones
        const activeTenants = await req.payload.find({
          collection: 'tenants',
          where: {
            id: { in: tenantIDs },
            isActive: { equals: true },
          },
          depth: 0,
          pagination: false,
        })
        activeTenantIDs = activeTenants.docs.map(t => t.id)
      }

      if (!activeTenantIDs.length) return false

      const authenticatedWhere: Where = {
        tenantId: {
          in: activeTenantIDs,
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
