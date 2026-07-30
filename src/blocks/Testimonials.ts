import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const TestimonialsBlock: Block = {
  slug: 'testimonialsBlock',
  interfaceName: 'TestimonialsBlock',
  fields: [
    sectionHeader(),
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'collection',
      options: [{ label: 'Testimonials collection', value: 'collection' }, { label: 'Manual selection', value: 'manual' }],
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('testimonials'),
      hooks: { beforeValidate: [sameTenantRelationship('testimonials')] },
      admin: { condition: (_, siblingData) => siblingData?.source === 'manual' },
    },
    { name: 'featuredOnly', type: 'checkbox', defaultValue: true, admin: { condition: (_, siblingData) => siblingData?.source === 'collection' } },
    { name: 'limit', type: 'number', min: 1, max: 12, defaultValue: 3 },
    blockSettings(),
  ],
}
