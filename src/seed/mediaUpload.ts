import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Payload, User } from 'payload'
import type { Media } from '../payload-types'

const MIME_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export type MediaUploadSpec = {
  /** Relative to the repo's public/ directory, e.g. 'themes/curious-hub/images/hero.png'. */
  alt: string
  caption?: string
  focalPoint?: { x: number; y: number }
  sourcePath: string
  title: string
}

/**
 * Idempotently uploads a static source asset into Payload Media for the given tenant.
 * Lookup key is (tenantId, title) — title is set to the deterministic source filename, so
 * re-running never creates duplicates. Never accepts or returns a hardcoded Media ID; every
 * ID used downstream comes from this function's live lookup/create result.
 */
export async function findOrUploadMedia(
  payload: Payload,
  {
    projectRoot,
    spec,
    tenantId,
    user,
  }: {
    projectRoot: string
    spec: MediaUploadSpec
    tenantId: number
    user: User
  },
): Promise<Media> {
  const existing = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { tenantId: { equals: tenantId } },
        { title: { equals: spec.title } },
      ],
    },
  })
  if (existing.docs[0]) return existing.docs[0]

  const absolutePath = path.join(projectRoot, 'public', spec.sourcePath)
  const buffer = await readFile(absolutePath)
  const ext = path.extname(absolutePath).toLowerCase()
  const mimetype = MIME_TYPES[ext]
  if (!mimetype) {
    throw new Error(`Unsupported/unsafe media MIME type for source asset: ${spec.sourcePath}`)
  }

  const created = await payload.create({
    collection: 'media',
    data: {
      alt: spec.alt,
      caption: spec.caption,
      focalPoint: spec.focalPoint
        ? { x: spec.focalPoint.x, y: spec.focalPoint.y }
        : undefined,
      tenantId,
      title: spec.title,
    },
    file: {
      data: buffer,
      mimetype,
      name: path.basename(absolutePath),
      size: buffer.length,
    },
    overrideAccess: true,
    user,
  })
  return created
}
