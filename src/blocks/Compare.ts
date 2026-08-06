import type { Block } from 'payload'
import { blockSettings } from './shared/blockSettings'
import { mediaField } from './shared/mediaField'
import { sectionHeader } from './shared/sectionHeader'

const panelFields = (label: string) => [
  { name: 'badgeLabel', type: 'text' as const, maxLength: 60, admin: { placeholder: label } },
  mediaField(
    { name: 'media', admin: { description: 'Optional. If left empty, the placeholder text below is shown instead.' } },
    { required: false },
  ),
  { name: 'placeholderText', type: 'textarea' as const, maxLength: 200, admin: { description: 'Shown only when no image is set.' } },
]

/**
 * Slug kept short deliberately: "beforeafterBlock" pushed the nested
 * before-panel media enum name to 64 chars in the `_pages_v` versions table
 * (1 over Postgres's 63-char NAMEDATALEN limit) — same class of issue as
 * Milestone 6's capabilityBlock. "compareBlock" leaves headroom to spare.
 */
export const CompareBlock: Block = {
  slug: 'compareBlock',
  interfaceName: 'CompareBlock',
  labels: { singular: 'Before / After Comparison', plural: 'Before / After Comparisons' },
  admin: {
    group: 'Reusable Sections',
  },
  fields: [
    sectionHeader(),
    {
      name: 'before',
      type: 'group',
      fields: panelFields('Before'),
    },
    {
      name: 'after',
      type: 'group',
      fields: panelFields('After'),
    },
    blockSettings(),
  ],
}
