import type { Access } from 'payload'
import { getTenantReadScope } from './tenantContext'

// Read-only membership scope. Mutations use the operation-specific helpers
// exported by tenantContext so Tenant Members cannot modify business content.
export const tenantIsolation: Access = (args) => {
  return getTenantReadScope(args.req)
}
