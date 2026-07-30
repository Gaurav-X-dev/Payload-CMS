export const themeStaticFallbacksEnabled = (
  value = process.env.ENABLE_THEME_STATIC_FALLBACKS,
): boolean => value?.trim().toLowerCase() === 'true'

export const tenantCanRenderGheeRoast = (tenant: {
  isActive?: boolean | null
  theme?: string | null
}): boolean =>
  tenant.isActive !== false && (!tenant.theme || tenant.theme === 'ghee-roast')
