import type { Access } from 'payload'
import { isSuperAdminUser, isTenantAdminUser } from './tenantContext'

export const isTenantAdmin: Access = (args) => {
  const { req: { user } } = args
  
  if (!user) return false
  
  // Super admins have access to everything
  if (isSuperAdminUser(user)) return true
  
  // Return true if the user is a tenant_admin
  // The actual scoping to a specific tenant happens in the tenantIsolation policy
  if (isTenantAdminUser(user)) {
    return true
  }
  
  return false
}
