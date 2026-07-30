import type { Block } from 'payload'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'

export const EventsBlock: Block = {
  slug: 'eventsBlock',
  interfaceName: 'EventsBlock',
  fields: [
    sectionHeader(),
    {
      name: 'events',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('events'),
      hooks: { beforeValidate: [sameTenantRelationship('events')] },
      admin: { description: 'Leave empty to show all published events.' },
    },
    { name: 'featuredOnly', type: 'checkbox', defaultValue: false },
    { name: 'limit', type: 'number', min: 1, max: 24, defaultValue: 6 },
    blockSettings(),
  ],
}
