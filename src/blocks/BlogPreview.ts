import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { sectionHeader } from './shared/sectionHeader'
import {
  sameTenantRelationship,
  tenantRelationshipFilter,
} from '../hooks/sameTenantRelationship'

export const BlogPreviewBlock: Block = {
  slug: 'blogpreviewBlock',
  interfaceName: 'BlogPreviewBlock',
  fields: [
    // Deprecated: superseded by sectionHeader below. Kept (hidden) so this migration only adds
    // columns rather than dropping+adding in the same table, which avoids Payload's interactive
    // "created or renamed?" migration prompt. Never populated going forward.
    { name: 'title', type: 'text', admin: { hidden: true } },
    { name: 'subtitle', type: 'text', admin: { hidden: true } },
    sectionHeader({ admin: { description: 'Optional heading displayed above the blog preview grid.' } }),
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'collection',
      options: [
        { label: 'Blog Posts collection', value: 'collection' },
        { label: 'Manual selection', value: 'manual' },
      ],
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'blog-posts',
      hasMany: true,
      filterOptions: tenantRelationshipFilter('blog-posts'),
      hooks: { beforeValidate: [sameTenantRelationship('blog-posts')] },
      admin: { condition: (_, siblingData) => siblingData?.source === 'manual' },
    },
    {
      name: 'featuredOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: { condition: (_, siblingData) => siblingData?.source === 'collection' },
    },
    { name: 'limit', type: 'number', min: 1, max: 12, defaultValue: 3 },
    blockSettings(),
  ],
}
