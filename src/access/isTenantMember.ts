import type { Access } from 'payload'
import { getUserTenantIDs, isSuperAdminUser } from './tenantContext'

export const isTenantMember: Access = (args) => {
  const { req: { user } } = args
  
  if (!user) return false
  
  // Super admins have access to everything
  if (isSuperAdminUser(user)) return true
  
  const tenantIds = getUserTenantIDs(user)

  if (tenantIds.length) {
    return {
      tenants: {
        in: tenantIds,
      },
    }
  }
  
  return false
}
