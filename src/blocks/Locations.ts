import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const LocationsBlock: Block = {
  slug: 'locationsBlock',
  interfaceName: 'LocationsBlock',
  fields: [
    sectionHeader(),
    {
      name: 'locations',
      type: 'relationship',
      relationTo: 'locations',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('locations'),
      hooks: { beforeValidate: [sameTenantRelationship('locations')] },
      admin: { description: 'Leave empty to show every active location.' },
    },
    { name: 'showMap', type: 'checkbox', defaultValue: true },
    blockSettings(),
  ],
}
