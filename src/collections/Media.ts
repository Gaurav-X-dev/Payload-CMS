import { ValidationError } from 'payload'
import type { CollectionBeforeOperationHook, CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import {
  SVGValidationError,
  validateAndSanitizeSVGUpload,
} from '../validation/svgSafety'

export const MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024

export const validateMediaUploadSize: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (
    (operation === 'create' || operation === 'update') &&
    req.file &&
    req.file.size > MAX_MEDIA_FILE_SIZE
  ) {
    throw new ValidationError({
      errors: [{
        message: 'Images must be 10 MB or smaller.',
        path: 'file',
      }],
    })
  }

  return args
}

export const validateSVGMediaUpload: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  if ((operation !== 'create' && operation !== 'update') || !req.file) return args

  try {
    const sanitized = await validateAndSanitizeSVGUpload(req.file)
    req.context.svgUploadSanitized = Boolean(sanitized)
    if (sanitized) {
      req.file.data = sanitized
      req.file.size = sanitized.length
    }
  } catch (error) {
    throw new ValidationError({
      errors: [{
        message: error instanceof SVGValidationError
          ? error.message
          : 'The SVG upload could not be validated.',
        path: 'file',
      }],
    })
  }

  return args
}

/**
 * Media Collection
 * 
 * Purpose: Central repository for all images, documents, and visual assets used across 
 * the platform. 
 * 
 * Design Decisions:
 * 1. Strict Isolation: Uploaded media is strictly tied to a specific tenant via 'tenantId'. 
 *    This ensures "Zuru Zuru" admins don't see "Ghee Roast" assets in their media picker.
 * 2. Organization: Added 'folder' and 'tags' to help admins organize large asset libraries.
 * 3. Art Direction: Added a 'focalPoint' group (X/Y) so frontend components (like the Hero block)
 *    can accurately crop images dynamically using CSS object-position.
 * 4. S3 Storage: Uploads are offloaded via the '@payloadcms/storage-s3' adapter configured in payload.config.ts.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 1024, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' }
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'tenantId', 'updatedAt'],
  },
  access: {
    // Media must be readable by the public frontend
    read: tenantPublicRead(),
    // Only super admins or members of the assigned tenant can modify/upload
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ required: false }),
    {
      name: 'alt',
      type: 'text',
      required: true,
      maxLength: 250,
      admin: {
        description: 'Important for SEO and Accessibility.',
      }
    },
    {
      name: 'title',
      type: 'text',
      maxLength: 200,
    },
    {
      name: 'caption',
      type: 'textarea',
      maxLength: 1_000,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        { name: 'tag', type: 'text', maxLength: 50 }
      ]
    },
    {
      name: 'folder',
      type: 'text',
      maxLength: 100,
      admin: {
        description: 'Optional categorization folder.',
        position: 'sidebar'
      }
    },
    {
      name: 'focalPoint',
      type: 'group',
      admin: {
        description: 'Set X and Y coordinates (0 to 100) for image cropping.',
        position: 'sidebar'
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'x', type: 'number', min: 0, max: 100, defaultValue: 50 },
            { name: 'y', type: 'number', min: 0, max: 100, defaultValue: 50 },
          ]
        }
      ]
    },
    {
      name: 'svgSanitized',
      type: 'checkbox',
      defaultValue: false,
      access: { create: () => false, update: () => false },
      admin: { hidden: true, readOnly: true },
    },

    // --- Audit Fields ---
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    }
  ],
  hooks: {
    beforeOperation: [validateMediaUploadSize, validateSVGMediaUpload],
    beforeChange: [
      ({ req, data, operation, originalDoc }) => {
        if (req.context?.developmentReset === true) return data
        data.svgSanitized = req.file
          ? req.context.svgUploadSanitized === true
          : originalDoc?.svgSanitized === true
        data.uploadedBy = operation === 'create'
          ? req.user?.id
          : originalDoc?.uploadedBy
        data.updatedBy = req.user?.id ?? originalDoc?.updatedBy
        return data
      }
    ],
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  }
}
