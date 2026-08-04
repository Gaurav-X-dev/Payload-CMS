import type { ImageData } from '../types'

type UnknownRecord = Record<string, unknown>

const record = (value: unknown): UnknownRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const relationshipID = (value: unknown): string | null => {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  const item = record(value)
  return item && (typeof item.id === 'number' || typeof item.id === 'string')
    ? String(item.id)
    : null
}

export function resolveGheeRoastBlockMedia(
  value: unknown,
  tenantID?: number | string,
  altOverride?: unknown,
  mediaValues: unknown[] = [],
): ImageData | undefined {
  const wrapper = record(value)
  const relationship = wrapper?.item ?? wrapper?.media ?? value
  const directMedia = record(relationship)
  const rawID = relationshipID(relationship)
  const media = directMedia ?? mediaValues
    .map((entry) => record(entry))
    .find((entry) => relationshipID(entry) === rawID) ?? null
  if (!media) return undefined
  if (
    tenantID !== undefined
    && relationshipID(media.tenantId ?? media.tenantID) !== String(tenantID)
  ) return undefined
  const src = text(media.url) || text(media.src)
  if (!src || (!src.startsWith('/') && !/^https?:\/\//i.test(src))) return undefined
  const focalPoint = record(media.focalPoint)
  return {
    alt: text(altOverride) || text(wrapper?.altOverride) || text(media.alt) || text(media.title),
    focalPoint: focalPoint
      ? {
          x: typeof focalPoint.x === 'number' && Number.isFinite(focalPoint.x) ? focalPoint.x : 50,
          y: typeof focalPoint.y === 'number' && Number.isFinite(focalPoint.y) ? focalPoint.y : 50,
        }
      : undefined,
    id: typeof media.id === 'number' || typeof media.id === 'string' ? media.id : undefined,
    src,
  }
}
