import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import { tenantScopedUnique } from '../hooks/tenantScopedUnique'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import {
  normalizeName,
  validateFiniteInteger,
  validateHexColor,
  validateName,
  validateSafeURL,
} from '../validation/shared'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'enabled', 'featured', 'sortOrder'],
    description: 'Manage the group\'s sub-brands and partner brands shown on the Home showcase and Brands page.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField(),
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 100,
          validate: validateName,
          hooks: { beforeValidate: [({ value }) => normalizeName(value)] },
        },
        {
          name: 'slug',
          type: 'text',
          index: true,
          hooks: { beforeValidate: [tenantScopedUnique('name')] },
          admin: { description: 'Auto-generated if left blank. Used for the #anchor on the Brands page.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'mark', type: 'text', maxLength: 10, admin: { description: 'Short glyph/mark shown on the brand card, e.g. ✦ or a short logotype.' } },
        { name: 'category', type: 'text', maxLength: 120, admin: { placeholder: 'Japanese Izakaya' } },
      ],
    },
    { name: 'shortDescription', type: 'textarea', maxLength: 300, admin: { description: 'Used on the compact Home showcase card.' } },
    { name: 'fullDescription', type: 'textarea', maxLength: 2_000, admin: { description: 'Used on the Brands page spotlight section.' } },
    { name: 'quote', type: 'textarea', maxLength: 300, admin: { description: 'Optional pull-quote for the Brands page spotlight.' } },
    {
      type: 'row',
      fields: [
        { name: 'statValue', type: 'text', maxLength: 20, admin: { placeholder: '3 Locations' } },
        { name: 'statLabel', type: 'text', maxLength: 60 },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
        {
          name: 'logo',
          type: 'relationship',
          relationTo: 'media',
          filterOptions: tenantRelationshipFilter('media'),
          hooks: { beforeValidate: [sameTenantRelationship('media')] },
        },
      ],
    },
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('media'),
      hooks: { beforeValidate: [sameTenantRelationship('media')] },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: { description: 'Optional: link to this brand\'s own Tenant record if it runs its own CMS-driven site (e.g. Ghee Roast, Zuru Zuru).' },
    },
    {
      name: 'websiteUrl',
      type: 'text',
      maxLength: 2048,
      validate: (value: unknown) => validateSafeURL(value),
      admin: { description: 'External or internal link used by "Explore Brand" (e.g. /brands#ghee, or a full https:// URL).' },
    },
    {
      name: 'links',
      type: 'array',
      maxRows: 4,
      admin: { description: 'Additional labeled links shown on the Brands page spotlight (e.g. "Visit Website", "View Menu").' },
      fields: [
        { name: 'label', type: 'text', required: true, maxLength: 80 },
        { name: 'url', type: 'text', required: true, maxLength: 2048, validate: (value: unknown) => validateSafeURL(value, { required: true }) },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'primaryColor', type: 'text', maxLength: 7, validate: (value: unknown) => (value ? validateHexColor(value) : true) },
        { name: 'accentColor', type: 'text', maxLength: 7, validate: (value: unknown) => (value ? validateHexColor(value) : true) },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true, index: true },
        { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
        { name: 'comingSoon', type: 'checkbox', defaultValue: false, admin: { description: 'Renders as a "coming soon" placeholder card instead of a full brand card.' } },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          min: 0,
          validate: (value: unknown) => validateFiniteInteger(value, { min: 0, max: 1_000_000 }),
        },
      ],
    },
  ],
  hooks: {
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
