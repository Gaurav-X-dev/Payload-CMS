import type { CollectionConfig } from 'payload'
import { tenantField } from '../fields/tenantField'
import { tenantContentMutations } from '../access/tenantContext'
import { tenantPublicRead } from '../access/tenantPublicRead'
import {
  invalidateTenantCache,
  invalidateTenantCacheAfterDelete,
} from '../hooks/invalidateTenantCache'
import {
  normalizeIndianMobile,
  validateIndianMobile,
  validateFiniteInteger,
  validateFiniteNumber,
  validateSafeURL,
} from '../validation/shared'
import { validatePrimaryLocation } from '../hooks/validatePrimaryLocation'

const optionalFiniteNumber = (
  value: unknown,
  min: number,
  max: number,
): true | string => value === null || value === undefined || value === ''
  ? true
  : validateFiniteNumber(value, { decimalPlaces: 7, min, max })

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'isPrimary', 'showOnContact', 'isActive', 'sortOrder'],
    description: 'Manage public kitchens, service areas, addresses, contacts, maps, and ordering links.',
  },
  access: {
    read: tenantPublicRead(),
    ...tenantContentMutations,
  },
  fields: [
    tenantField(),
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 120,
      admin: { placeholder: 'Delhi Delivery Kitchen' },
    },
    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', required: true, maxLength: 100 },
        { name: 'state', type: 'text', maxLength: 100 },
        { name: 'postalCode', type: 'text', maxLength: 20 },
        { name: 'country', type: 'text', defaultValue: 'India', maxLength: 100 },
      ],
    },
    { name: 'address', type: 'textarea', required: true, maxLength: 500 },
    { name: 'description', type: 'textarea', maxLength: 1_000 },
    {
      name: 'deliveryZones',
      type: 'array',
      maxRows: 30,
      admin: { description: 'Service areas shown on the Contact location card.' },
      fields: [{ name: 'zone', type: 'text', required: true, maxLength: 120 }],
    },
    {
      name: 'businessHours',
      type: 'array',
      maxRows: 14,
      admin: { description: 'Optional location-specific hours shown on the Contact card.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'day', type: 'text', required: true, maxLength: 80 },
            { name: 'openTime', type: 'text', maxLength: 40 },
            { name: 'closeTime', type: 'text', maxLength: 40 },
            { name: 'isClosed', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          maxLength: 10,
          validate: (value: unknown) => validateIndianMobile(value, { required: false }),
          hooks: { beforeValidate: [({ value }) => normalizeIndianMobile(value)] },
        },
        { name: 'email', type: 'email' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'mapsUrl', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value) },
        { name: 'mapsEmbedUrl', type: 'text', maxLength: 2048, validate: (value: unknown) => validateSafeURL(value) },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'latitude', type: 'number', validate: (value: unknown) => optionalFiniteNumber(value, -90, 90) },
        { name: 'longitude', type: 'number', validate: (value: unknown) => optionalFiniteNumber(value, -180, 180) },
        { name: 'mapButtonLabel', type: 'text', defaultValue: 'Find on Map', maxLength: 80 },
      ],
    },
    {
      name: 'orderLinks',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text', required: true, maxLength: 80 },
        { name: 'url', type: 'text', required: true, maxLength: 2048, validate: (value: unknown) => validateSafeURL(value, { required: true }) },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'isActive', label: 'Enabled', type: 'checkbox', defaultValue: true, index: true },
        { name: 'isPrimary', type: 'checkbox', defaultValue: false, index: true },
        { name: 'sortOrder', type: 'number', defaultValue: 0, min: 0, validate: (value: unknown) => validateFiniteInteger(value) },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'showOnContact', label: 'Show on Contact Page', type: 'checkbox', defaultValue: true, index: true },
        { name: 'showInFooter', type: 'checkbox', defaultValue: false },
        { name: 'showOnHome', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
  hooks: {
    beforeValidate: [validatePrimaryLocation],
    afterChange: [invalidateTenantCache],
    afterDelete: [invalidateTenantCacheAfterDelete],
  },
}
