import type { CollectionConfig, SelectFieldValidation, Where } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantIsolation } from '../access/tenantIsolation'
import { tenantContentMutations } from '../access/tenantContext'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import {
  normalizeIndianMobile,
  validateIndianMobile,
  validateFiniteInteger,
  validateSafeURL,
} from '../validation/shared'
import { validateBrandFeatureRows } from '../validation/orderedRows'
import {
  validateExternalHTTPURL,
  validateSocialRows,
} from '../validation/contactPage'
import {
  GHEE_ROAST_ICON_NAMES,
  validateGheeRoastIconName,
} from '../themes/ghee-roast/iconRegistry'
import { tenantRelationshipFilter } from '../hooks/sameTenantRelationship'
import { sameTenantSVGRelationship } from '../hooks/sameTenantSVGRelationship'
import { SVG_MIME_TYPE } from '../validation/svgSafety'

const trimText = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value

const filterTenantMedia = tenantRelationshipFilter('media')

const validateBuiltInFeatureIcon: SelectFieldValidation = (value, { siblingData }) => {
  const row = siblingData && typeof siblingData === 'object'
    ? siblingData as Record<string, unknown>
    : {}
  if (row.iconSource === 'custom-svg') return true
  return value ? validateGheeRoastIconName(value) : 'Choose a Built-in Icon.'
}

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  admin: {
    useAsTitle: 'id',
    description: 'Manage core operational settings for this tenant. Limited to one document per tenant.',
    defaultColumns: ['businessName', '_status', 'updatedAt'],
  },
  versions: { drafts: true },
  access: {
    read: tenantIsolation,
    ...tenantContentMutations,
  },
  fields: [
    tenantField({ unique: true }), // 1:1 Tenant-Scoped Global
    
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Business Info',
          fields: [
            {
              name: 'businessName',
              type: 'text',
              required: true,
              maxLength: 100,
              admin: { placeholder: 'Very Good Ghee Roast' },
            },
            { name: 'legalName', type: 'text', maxLength: 100 },
            { name: 'taxId', type: 'text', maxLength: 50 },
            { name: 'tagline', type: 'text', maxLength: 160, admin: { description: 'Short brand line used in the header and footer.', placeholder: 'Flavours that stay.' } },
            { name: 'siteDescription', type: 'textarea', maxLength: 1_000, admin: { description: 'Brand summary used in the footer and as a metadata fallback.' } },
            { name: 'contactAddress', type: 'textarea', maxLength: 500, admin: { description: 'Public address or service-area description.' } },
          ]
        },
        {
          label: 'Restaurant Info',
          fields: [
            { name: 'cuisineType', type: 'text', maxLength: 100 },
            { 
              name: 'priceRange', 
              type: 'select', 
              options: ['$', '$$', '$$$', '$$$$'] 
            },
          ]
        },
        {
          label: 'Google Maps',
          fields: [
            {
              name: 'mapsUrl',
              type: 'text',
              maxLength: 2048,
              validate: (value: unknown) => validateSafeURL(value),
            },
            { name: 'mapsEmbedCode', type: 'textarea', maxLength: 10_000 },
          ]
        },
        {
          label: 'Business Hours',
          fields: [
            {
              name: 'hours',
              type: 'array',
              fields: [
                { 
                  name: 'day', 
                  type: 'select', 
                  required: true,
                  options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                },
                { name: 'openTime', type: 'text', maxLength: 20, admin: { placeholder: '13:00' } },
                { name: 'closeTime', type: 'text', maxLength: 20, admin: { placeholder: '22:00' } },
                { name: 'isClosed', type: 'checkbox', defaultValue: false },
              ]
            }
          ]
        },
        {
          label: 'Integrations',
          fields: [
            {
              name: 'whatsappNumber',
              type: 'text',
              maxLength: 10,
              validate: (value: unknown) =>
                validateIndianMobile(value, { required: false }),
              hooks: {
                beforeValidate: [({ value }) => normalizeIndianMobile(value)],
              },
            },
            {
              name: 'deliverySettings',
              type: 'group',
              fields: [
                { name: 'enableDelivery', type: 'checkbox', defaultValue: false },
                {
                  name: 'deliveryUrls',
                  type: 'array',
                  admin: { description: 'Public ordering platforms shown across the site.' },
                  fields: [
                    { name: 'platform', type: 'text', required: true, maxLength: 80, admin: { placeholder: 'Swiggy' } },
                    { name: 'url', type: 'text', required: true, maxLength: 2048, validate: (value: unknown) => validateSafeURL(value, { required: true }) },
                  ],
                },
              ],
            },
            { name: 'reservationSettings', type: 'group', fields: [ { name: 'provider', type: 'select', options: ['internal', 'opentable', 'resy'] }, { name: 'providerUrl', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value) } ] }
          ]
        },
        {
          label: 'Social Links',
          fields: [
            {
              name: 'socials',
              type: 'array',
              validate: (value: unknown) => validateSocialRows(value),
              admin: {
                description: 'Published social CTAs. Enabled platforms must be unique and use complete http/https URLs.',
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'enabled', type: 'checkbox', defaultValue: true },
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      options: ['instagram', 'facebook', 'youtube', 'twitter', 'linkedin', 'whatsapp', 'tiktok', 'other'],
                    },
                    {
                      name: 'icon',
                      type: 'select',
                      defaultValue: 'platform',
                      options: ['platform', 'instagram', 'facebook', 'youtube', 'twitter', 'linkedin', 'whatsapp', 'link'],
                    },
                    { name: 'sortOrder', type: 'number', defaultValue: 0, min: 0, validate: (value: unknown) => validateFiniteInteger(value) },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'displayLabel', type: 'text', maxLength: 80, hooks: { beforeValidate: [({ value }) => trimText(value)] } },
                    { name: 'handle', type: 'text', maxLength: 120, hooks: { beforeValidate: [({ value }) => trimText(value)] } },
                    { name: 'ctaLabel', type: 'text', maxLength: 80, hooks: { beforeValidate: [({ value }) => trimText(value)] } },
                  ],
                },
                { name: 'description', type: 'textarea', maxLength: 300, hooks: { beforeValidate: [({ value }) => trimText(value)] } },
                {
                  name: 'url',
                  type: 'text',
                  maxLength: 2048,
                  validate: (value: unknown) => validateExternalHTTPURL(value),
                },
                { name: 'openInNewTab', type: 'checkbox', defaultValue: true },
              ]
            }
          ]
        },
        {
          label: 'Analytics & Scripts',
          fields: [
            { name: 'googleAnalyticsId', type: 'text' },
            { name: 'facebookPixelId', type: 'text' },
            { name: 'customHeaderScripts', type: 'code', admin: { language: 'html' } },
            { name: 'customFooterScripts', type: 'code', admin: { language: 'html' } },
          ]
        },
        {
          label: 'Feature Flags',
          fields: [
            { name: 'maintenanceMode', type: 'checkbox', defaultValue: false },
            { name: 'showAnnouncementBar', type: 'checkbox', defaultValue: false },
            {
              name: 'announcementText',
              type: 'text',
              maxLength: 300,
              admin: {
                condition: (_, siblingData) => siblingData?.showAnnouncementBar,
                placeholder: 'Authentic coastal flavours · Slow-roasted in pure ghee',
              },
            },
            {
              name: 'newsletter',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                { name: 'title', type: 'text', defaultValue: 'Join The Flavour Club', maxLength: 120 },
                { name: 'highlightedWord', type: 'text', defaultValue: 'Flavour', maxLength: 40 },
                { name: 'description', type: 'textarea', maxLength: 500 },
                {
                  type: 'row',
                  fields: [
                    { name: 'placeholder', type: 'text', defaultValue: 'Enter your email address', maxLength: 120 },
                    { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe', maxLength: 80 },
                  ],
                },
                { name: 'privacyText', type: 'text', defaultValue: 'We respect your privacy. Unsubscribe anytime.', maxLength: 300 },
                { name: 'successMessage', type: 'text', defaultValue: 'Thank you for joining the list.', maxLength: 300 },
                { name: 'errorMessage', type: 'text', defaultValue: 'We could not save your signup. Please try again later.', maxLength: 300 },
              ],
            },
          ]
        },
        {
          label: 'Brand Features',
          fields: [
            {
              name: 'featureStrip',
              type: 'array',
              maxRows: 5,
              validate: (value: unknown) => validateBrandFeatureRows(value),
              admin: {
                description: 'Brand features shown below the Ghee Roast Home Hero. Add up to 5 rows. An empty list intentionally hides the section, and Sort Order must be unique across enabled and disabled rows.',
                initCollapsed: true,
                components: {
                  RowLabel: {
                    exportName: 'BrandFeatureRowLabel',
                    path: './components/admin/BrandFeatureRowLabel',
                  },
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { description: 'Only enabled features appear on the home page.' },
                    },
                    {
                      name: 'sortOrder',
                      type: 'number',
                      required: true,
                      defaultValue: 0,
                      min: 0,
                      validate: (value: unknown) =>
                        validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
                      admin: { description: 'Use a unique whole number. Lower values appear first.' },
                    },
                  ],
                },
                {
                  name: 'iconSource',
                  type: 'select',
                  required: true,
                  defaultValue: 'built-in',
                  options: [
                    { label: 'Built-in Icon', value: 'built-in' },
                    { label: 'Custom SVG', value: 'custom-svg' },
                  ],
                  admin: { description: 'Choose a controlled built-in icon or a validated SVG from Media.' },
                },
                {
                  name: 'icon',
                  label: 'Built-in Icon',
                  type: 'select',
                  defaultValue: 'spice',
                  options: GHEE_ROAST_ICON_NAMES.map((name) => ({
                    label: name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase()),
                    value: name,
                  })),
                  validate: validateBuiltInFeatureIcon,
                  admin: {
                    condition: (_, siblingData) => siblingData?.iconSource !== 'custom-svg',
                    description: 'Select an icon from the supported Ghee Roast icon registry.',
                  },
                },
                {
                  name: 'customSVG',
                  label: 'Custom SVG Icon',
                  type: 'relationship',
                  relationTo: 'media',
                  filterOptions: async (args) => {
                    const tenantFilter = await filterTenantMedia(args)
                    const svgFilter: Where = {
                      and: [
                        { mimeType: { equals: SVG_MIME_TYPE } },
                        { svgSanitized: { equals: true } },
                      ],
                    }
                    if (tenantFilter === false) return false
                    if (tenantFilter === true) return svgFilter
                    return { and: [tenantFilter, svgFilter] }
                  },
                  hooks: { beforeValidate: [sameTenantSVGRelationship] },
                  admin: {
                    condition: (_, siblingData) => siblingData?.iconSource === 'custom-svg',
                    description: 'Upload a simple, single-color SVG for best results. Maximum SVG size: 256 KB.',
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  minLength: 2,
                  maxLength: 60,
                  admin: { placeholder: 'Authentic Recipes' },
                  hooks: { beforeValidate: [({ value }) => trimText(value)] },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  minLength: 5,
                  maxLength: 180,
                  admin: { placeholder: 'Rooted in tradition. Made for today.' },
                  hooks: { beforeValidate: [({ value }) => trimText(value)] },
                },
              ],
            },
          ]
        },
      ]
    }
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
