import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'

import {
  getAuthenticatedTenantID,
  isSuperAdminUser,
  normalizeTenantID,
  resolvePublicTenantID,
} from '../access/tenantContext'

const tenantError = (message: string): never => {
  throw new ValidationError({
    errors: [{ message, path: 'tenantId' }],
  })
}

export const assignTenant: CollectionBeforeValidateHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data
  if (req.context?.developmentReset === true) return data

  const originalTenantID = normalizeTenantID(originalDoc?.tenantId)

  if (isSuperAdminUser(req.user)) {
    const selectedTenantID = normalizeTenantID(data.tenantId) ?? originalTenantID
    if (!selectedTenantID) {
      return tenantError('A tenant must be selected.')
    }
    data.tenantId = selectedTenantID
    return data
  }

  if (operation === 'update' && originalTenantID) {
    if (data.tenantId !== undefined) {
      const requestedTenantID = normalizeTenantID(data.tenantId)
      if (!requestedTenantID || requestedTenantID !== originalTenantID) {
        return tenantError('Changing the tenant is not permitted.')
      }
    }
    data.tenantId = originalTenantID
    return data
  }

  if (req.user) {
    const authenticatedTenantID = getAuthenticatedTenantID(req)
    if (!authenticatedTenantID) {
      return tenantError(
        'Select one of your assigned tenants using the trusted tenant context.',
      )
    }

    if (data.tenantId) {
      const requestedTenantID = normalizeTenantID(data.tenantId)
      if (requestedTenantID && requestedTenantID !== authenticatedTenantID) {
        return tenantError('You do not have permission to create content for the specified tenant.')
      }
    }

    data.tenantId = authenticatedTenantID
    return data
  }

  const publicTenantID = await resolvePublicTenantID(req)
  if (!publicTenantID) {
    return tenantError('A valid tenant context is required.')
  }
  if (data.tenantId !== undefined) {
    const requestedTenantID = normalizeTenantID(data.tenantId)
    if (!requestedTenantID || requestedTenantID !== publicTenantID) {
      return tenantError('The submitted tenant does not match the public site.')
    }
  }

  data.tenantId = publicTenantID
  return data
}
