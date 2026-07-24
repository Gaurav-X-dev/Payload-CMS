import type { RichTextField } from 'payload'
import {
  BlocksFeature,
  lexicalEditor,
  HeadingFeature,
  ParagraphFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  AlignFeature,
  UnorderedListFeature,
  OrderedListFeature,
  LinkFeature,
  BlockquoteFeature,
} from '@payloadcms/richtext-lexical'

export const richTextField = (overrides?: Partial<RichTextField>): RichTextField => ({
  name: 'content',
  type: 'richText',
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }), // h1 explicitly omitted for SEO safety
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      AlignFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
      LinkFeature({
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: 'nofollow', type: 'checkbox', admin: { description: 'Add rel="nofollow"' } },
        ],
      }),
      BlockquoteFeature(),
    ],
  }),
  ...overrides,
})
