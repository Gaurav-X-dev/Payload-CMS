import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import { isSuperAdmin } from '../access/isSuperAdmin'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'

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
    tenantField(),
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Important for SEO and Accessibility.',
      }
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        { name: 'tag', type: 'text' }
      ]
    },
    {
      name: 'folder',
      type: 'text',
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

    // --- Audit Fields ---
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      access: { update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      access: { update: () => false },
      admin: { readOnly: true, position: 'sidebar' },
    }
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (operation === 'create') {
          data.uploadedBy = req.user?.id
        }
        data.updatedBy = req.user?.id
        return data
      }
    ],
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  }
}
