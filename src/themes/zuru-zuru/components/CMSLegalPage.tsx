import { RichText } from '@payloadcms/richtext-lexical/react'
import { CMSPageHero } from './CMSInnerPageShared'
import type { ZuruZuruPageBlockData, ZuruZuruRichTextBlockData } from '../mappers/dynamicTypes'

/**
 * "Last Updated: July 16, 2026" is decorative boilerplate in the original static page (an
 * arbitrary placeholder date, not tied to real edit history) — kept static here rather than wired
 * to the Page's own `updatedAt` timestamp, since threading page-level metadata through the
 * block-data pipeline for one decorative line isn't warranted. See the Milestone Z7 report.
 */
function LegalContentSection({ block }: { block: ZuruZuruRichTextBlockData }) {
  if (!block.content) return null
  return (
    <section className="zz-legal-container">
      <article className="zz-legal-content">
        <em>Last Updated: July 16, 2026</em>
        <RichText data={block.content as never} />
      </article>
    </section>
  )
}

export function CMSLegalPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const richText = blocks.find((block) => block.type === 'richText')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {richText?.type === 'richText' && <LegalContentSection block={richText.data} />}
    </>
  )
}
