import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { blockSettings } from './shared/blockSettings'

export const RichTextBlock: Block = {
  slug: 'richtextBlock',
  interfaceName: 'RichTextBlock',
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({}),
    },
    blockSettings(),
  ],
}
