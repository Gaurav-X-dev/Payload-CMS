import { CMSPageHero, CMSSectionHeader } from './CMSInnerPageShared'
import { Accordion } from './Interactive'
import type { ZuruZuruFAQBlockData, ZuruZuruPageBlockData } from '../mappers/dynamicTypes'

function FAQSection({ block }: { block: ZuruZuruFAQBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className="zz-section-alt"><div className="zz-container zz-form-narrow">
      <CMSSectionHeader header={block.header} />
      <Accordion items={block.items.map((item) => [item.question, item.answer] as [string, string])} />
    </div></section>
  )
}

export function CMSFAQPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const faq = blocks.find((block) => block.type === 'faq')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {faq?.type === 'faq' && <FAQSection block={faq.data} />}
    </>
  )
}
