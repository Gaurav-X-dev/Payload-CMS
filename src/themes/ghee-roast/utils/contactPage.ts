import type { GheeRoastLocationData } from '../dynamicTypes'
import { safeGheeRoastExternalHref } from '../mappers/cmsContent'

export const gheeRoastLocationMapHref = (location: GheeRoastLocationData): string | null => {
  const configured = safeGheeRoastExternalHref(location.mapsUrl)
  if (configured) return configured
  if (
    typeof location.latitude === 'number'
    && Number.isFinite(location.latitude)
    && location.latitude >= -90
    && location.latitude <= 90
    && typeof location.longitude === 'number'
    && Number.isFinite(location.longitude)
    && location.longitude >= -180
    && location.longitude <= 180
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`
  }
  return null
}

export const sortGheeRoastContactLocations = (
  locations: GheeRoastLocationData[],
): GheeRoastLocationData[] => [...locations]
  .filter((location) => location.showOnContact)
  .sort((left, right) =>
    Number(right.isPrimary) - Number(left.isPrimary)
    || left.sortOrder - right.sortOrder
    || String(left.id).localeCompare(String(right.id), 'en', { numeric: true }))

