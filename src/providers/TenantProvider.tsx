'use client'

import React, { createContext, useContext } from 'react'

const TenantContext = createContext<any>(null)

export const TenantProvider: React.FC<{
  tenant: any
  children: React.ReactNode
}> = ({ tenant, children }) => {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => useContext(TenantContext)
