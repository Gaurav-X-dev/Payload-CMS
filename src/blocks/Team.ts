import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const TeamBlock: Block = {
  slug: 'teamBlock',
  interfaceName: 'TeamBlock',
  fields: [
    sectionHeader(),
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'teammembers',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('teammembers'),
      hooks: { beforeValidate: [sameTenantRelationship('teammembers')] },
      admin: { description: 'Leave empty to show every active team member.' },
    },
    { name: 'limit', type: 'number', min: 1, max: 24, defaultValue: 8 },
    blockSettings(),
  ],
}
