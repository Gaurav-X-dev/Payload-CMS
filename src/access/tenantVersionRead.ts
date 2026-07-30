import type { Access } from 'payload'
import {
  getUserTenantIDs,
  isSuperAdminUser,
  normalizeTenantID,
} from './tenantContext'

export const tenantVersionRead: Access = async ({ req }) => {
  if (isSuperAdminUser(req.user)) return true

  if (req.user) {
    const tenantIDs = getUserTenantIDs(req.user)
    if (!tenantIDs.length) return false

    let activeTenantIDs = tenantIDs
    if (req.user.tenants && req.user.tenants.length > 0 && typeof req.user.tenants[0] === 'object') {
      activeTenantIDs = req.user.tenants
        .filter(
          (tenant) =>
            typeof tenant === 'object' &&
            tenant !== null &&
            'isActive' in tenant &&
            tenant.isActive === true,
        )
        .map(normalizeTenantID)
        .filter((tenantID): tenantID is number => tenantID !== null)
    } else if (tenantIDs.length > 0) {
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

    return {
      'version.tenantId': {
        in: activeTenantIDs,
      },
    }
  }

  return false
}
