import type { Access } from 'payload'
import { isSuperAdminUser } from './tenantContext'

export const isSuperAdmin: Access = ({ req: { user } }) => isSuperAdminUser(user)
