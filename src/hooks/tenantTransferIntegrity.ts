import type {
  CollectionBeforeValidateHook,
  CollectionSlug,
  PayloadRequest,
} from 'payload'
import { ValidationError } from 'payload'

import {
  isSuperAdminUser,
  normalizeTenantID,
  type TenantID,
} from '../access/tenantContext'
import { validateRelationshipForTenant } from './sameTenantRelationship'

type RelationshipDescriptor = {
  path: string
  relationTo: CollectionSlug
}

const OUTBOUND_RELATIONSHIPS: Partial<
  Record<CollectionSlug, RelationshipDescriptor[]>
> = {
  pages: [
    { path: 'parent', relationTo: 'pages' },
    { path: 'metaImage', relationTo: 'media' },
  ],
  'menu-categories': [
    { path: 'icon', relationTo: 'media' },
    { path: 'image', relationTo: 'media' },
  ],
  'menu-items': [
    { path: 'category', relationTo: 'menu-categories' },
    { path: 'image', relationTo: 'media' },
    { path: 'gallery', relationTo: 'media' },
    { path: 'recommendedItems', relationTo: 'menu-items' },
    { path: 'upsellItems', relationTo: 'menu-items' },
  ],
  'blog-posts': [
    { path: 'heroImage', relationTo: 'media' },
    { path: 'author', relationTo: 'users' },
    { path: 'metaImage', relationTo: 'media' },
    { path: 'relatedPosts', relationTo: 'blog-posts' },
    { path: 'relatedMenuItems', relationTo: 'menu-items' },
  ],
  gallery: [{ path: 'media', relationTo: 'media' }],
  testimonials: [{ path: 'photo', relationTo: 'media' }],
  nav: [
    { path: 'links.page', relationTo: 'pages' },
    { path: 'links.columns.links', relationTo: 'pages' },
  ],
  seo: [{ path: 'defaultOGImage', relationTo: 'media' }],
}

type InboundDescriptor = {
  collection: CollectionSlug
  path: string
  tenantIdentity?: 'documentID' | 'tenantId'
}

const INBOUND_RELATIONSHIPS: Partial<
  Record<CollectionSlug, InboundDescriptor[]>
> = {
  media: [
    { collection: 'pages', path: 'metaImage' },
    { collection: 'menu-categories', path: 'icon' },
    { collection: 'menu-categories', path: 'image' },
    { collection: 'menu-items', path: 'image' },
    { collection: 'menu-items', path: 'gallery' },
    { collection: 'blog-posts', path: 'heroImage' },
    { collection: 'blog-posts', path: 'metaImage' },
    { collection: 'gallery', path: 'media' },
    { collection: 'testimonials', path: 'photo' },
    { collection: 'seo', path: 'defaultOGImage' },
    {
      collection: 'tenants',
      path: 'branding.logo',
      tenantIdentity: 'documentID',
    },
    {
      collection: 'tenants',
      path: 'branding.favicon',
      tenantIdentity: 'documentID',
    },
  ],
  pages: [
    { collection: 'pages', path: 'parent' },
    { collection: 'nav', path: 'links.page' },
    { collection: 'nav', path: 'links.columns.links' },
  ],
  'menu-categories': [
    { collection: 'menu-items', path: 'category' },
  ],
  'menu-items': [
    { collection: 'menu-items', path: 'recommendedItems' },
    { collection: 'menu-items', path: 'upsellItems' },
    { collection: 'blog-posts', path: 'relatedMenuItems' },
  ],
  'blog-posts': [
    { collection: 'blog-posts', path: 'relatedPosts' },
  ],
}

const transferError = (): never => {
  throw new ValidationError({
    errors: [{
      message: 'This tenant transfer would make an existing relationship unavailable.',
      path: 'tenantId',
    }],
  })
}

const valuesAtPath = (value: unknown, path: string): unknown[] => {
  const segments = path.split('.')

  const walk = (current: unknown, index: number): unknown[] => {
    if (current === null || current === undefined) return []
    if (Array.isArray(current)) {
      return current.flatMap((item) => walk(item, index))
    }
    if (index === segments.length) return [current]
    if (typeof current !== 'object') return []

    return walk(
      (current as Record<string, unknown>)[segments[index]],
      index + 1,
    )
  }

  return walk(value, 0)
}

const validateOutboundRelationships = async ({
  collection,
  document,
  req,
  tenantID,
}: {
  collection: CollectionSlug
  document: Record<string, unknown>
  req: PayloadRequest
  tenantID: TenantID
}): Promise<void> => {
  for (const descriptor of OUTBOUND_RELATIONSHIPS[collection] ?? []) {
    await validateRelationshipForTenant({
      path: descriptor.path,
      relationTo: descriptor.relationTo,
      req,
      tenantID,
      value: valuesAtPath(document, descriptor.path),
    })
  }
}

const validateInboundRelationships = async ({
  collection,
  documentID,
  req,
  tenantID,
}: {
  collection: CollectionSlug
  documentID: TenantID
  req: PayloadRequest
  tenantID: TenantID
}): Promise<void> => {
  for (const descriptor of INBOUND_RELATIONSHIPS[collection] ?? []) {
    const tenantCondition: import('payload').Where = descriptor.tenantIdentity === 'documentID'
      ? { id: { not_equals: tenantID } }
      : { tenantId: { not_equals: tenantID } }

    const result = await req.payload.find({
      collection: descriptor.collection,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      select: { id: true },
      where: {
        and: [
          tenantCondition,
          {
            [descriptor.path]: {
              equals: documentID,
            },
          },
        ],
      },
    } as never) as { docs: Array<{ id: number }> }

    if (result.docs.length) transferError()
  }
}

export const validateTenantTransfer: CollectionBeforeValidateHook = async ({
  collection,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || !data || !originalDoc) return data

  const originalTenantID = normalizeTenantID(originalDoc.tenantId)
  const nextTenantID = normalizeTenantID(data.tenantId) ?? originalTenantID

  if (!originalTenantID || !nextTenantID || originalTenantID === nextTenantID) {
    return data
  }

  if (!isSuperAdminUser(req.user)) transferError()

  const documentID = normalizeTenantID(originalDoc.id)
  if (!documentID) return transferError()

  const currentDocument = {
    ...originalDoc,
    ...data,
  } as Record<string, unknown>

  await validateOutboundRelationships({
    collection: collection.slug,
    document: currentDocument,
    req,
    tenantID: nextTenantID,
  })

  await validateInboundRelationships({
    collection: collection.slug,
    documentID,
    req,
    tenantID: nextTenantID,
  })

  return data
}
