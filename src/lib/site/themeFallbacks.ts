/**
 * @deprecated Ghee Roast legacy content is retained only as a temporary
 * conversion reference. Use gheeRoastLegacyFallbacksEnabled for the explicit,
 * development-only compatibility path.
 */
export const themeStaticFallbacksEnabled = (
  value = process.env.ENABLE_THEME_STATIC_FALLBACKS,
): boolean => value?.trim().toLowerCase() === 'true'

export const gheeRoastLegacyFallbacksEnabled = (
  value = process.env.ENABLE_GHEE_ROAST_LEGACY_FALLBACKS,
  nodeEnvironment = process.env.NODE_ENV,
): boolean =>
  nodeEnvironment !== 'production'
  && value?.trim().toLowerCase() === 'true'

export const tenantCanRenderGheeRoast = (tenant: {
  isActive?: boolean | null
  theme?: string | null
}): boolean =>
  tenant.isActive !== false && tenant.theme === 'ghee-roast'
