export const GHEE_ROAST_ICON_NAMES = [
  'arrow',
  'bowl',
  'briefcase',
  'building',
  'cake',
  'calendar',
  'caretDown',
  'caretRight',
  'check',
  'chef',
  'clock',
  'coriander',
  'delivery',
  'diamond',
  'event',
  'facebook',
  'fire',
  'ghee',
  'handcrafted',
  'hands',
  'heart',
  'instagram',
  'leaf',
  'map',
  'martini',
  'medal',
  'moped',
  'pepper',
  'phone',
  'shield',
  'spice',
  'star',
  'sun',
  'utensils',
  'wedding',
  'youtube',
] as const

export const GHEE_ROAST_FALLBACK_ICON = 'spice'

const supportedIcons = new Set<string>(GHEE_ROAST_ICON_NAMES)

export const isGheeRoastIconName = (value: unknown): value is string =>
  typeof value === 'string' && supportedIcons.has(value.trim())

export const normalizeGheeRoastIconName = (value: unknown): string =>
  isGheeRoastIconName(value) ? value.trim() : GHEE_ROAST_FALLBACK_ICON

export const validateGheeRoastIconName = (value: unknown): true | string => {
  if (value === null || value === undefined || value === '') return true
  return isGheeRoastIconName(value)
    ? true
    : `Choose a supported Ghee Roast icon: ${GHEE_ROAST_ICON_NAMES.join(', ')}.`
}
