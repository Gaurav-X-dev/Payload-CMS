import React from 'react'
import { headers } from 'next/headers'
import '../../styles/globals.css'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  // The middleware will inject the tenant config as a header 
  // (In a real app, this might be a parsed JSON string or we fetch it based on domain)
  // For this boilerplate, we'll mock the extraction of the config:
  
  const tenantConfigStr = headersList.get('x-tenant-config')
  let tenantConfig = null
  
  if (tenantConfigStr) {
    try {
      tenantConfig = JSON.parse(tenantConfigStr)
    } catch (e) {
      console.error('Failed to parse tenant config header')
    }
  }

  // Fallback defaults if no tenant config is present yet
  const branding = tenantConfig?.branding || {
    primaryColor: '#1a1a1a',
    accentColor: '#d4af37',
    backgroundColor: '#ffffff',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingTransform: 'none',
    cardRadius: '8px'
  }

  // Inject CSS Variables for this specific tenant
  const tenantStyles = {
    '--brand-primary': branding.primaryColor,
    '--brand-accent': branding.accentColor,
    '--brand-background': branding.backgroundColor,
    '--font-heading': `"${branding.headingFont}", sans-serif`,
    '--font-body': `"${branding.bodyFont}", sans-serif`,
    '--heading-transform': branding.headingTransform,
    '--card-radius': branding.cardRadius,
  } as React.CSSProperties

  // Create Google Fonts URL
  const fontsToLoad = [branding.headingFont, branding.bodyFont]
  if (branding.decorativeFont) fontsToLoad.push(branding.decorativeFont)
  
  const uniqueFonts = Array.from(new Set(fontsToLoad)).map(f => f.replace(/ /g, '+'))
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${uniqueFonts.map(f => `family=${f}:wght@400;600;700`).join('&')}&display=swap`

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
      </head>
      <body style={tenantStyles}>
        {/* We can also provide the tenant config via React Context here if needed */}
        {children}
      </body>
    </html>
  )
}
