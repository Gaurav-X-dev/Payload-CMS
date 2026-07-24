import type { Access } from 'payload'
import { isSuperAdminUser, isTenantAdminUser } from './tenantContext'

type Permission = 'canEditPages' | 'canEditMenu' | 'canManageRooms' | 'canManageReservations' | 'canViewSubmissions'

export const hasPermission = (permission: Permission): Access => {
  return (args) => {
    const { req: { user } } = args
    
    if (!user) return false
    
    // Super admins and Tenant Admins have all permissions implicitly
    if (isSuperAdminUser(user) || isTenantAdminUser(user)) {
      return true
    }

    // Granular permissions are not part of the current Users schema yet.
    void permission
    return false
  }
}
