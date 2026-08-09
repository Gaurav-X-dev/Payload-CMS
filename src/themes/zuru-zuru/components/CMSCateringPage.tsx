import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { CMSPageHero, CMSSectionHeader } from './CMSInnerPageShared'
import { InquiryForm } from './InquiryForm'
import type {
  ZuruZuruCardGridBlockData,
  ZuruZuruContentGridBlockData,
  ZuruZuruPageBlockData,
  ZuruZuruRichTextBlockData,
} from '../mappers/dynamicTypes'

function CateredEventsSection({ block }: { block: ZuruZuruCardGridBlockData }) {
  if (block.cards.length === 0) return null
  return (
    <section><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <div className="zz-content-grid zz-grid-2">
        {block.cards.map((card) => (
          <article className="zz-content-card" key={card.title}>
            {card.image && (
              <div className="zz-card-image">
                <Image alt={card.title} fill sizes="(max-width: 768px) 100vw, 50vw" src={card.image.src} />
              </div>
            )}
            <div className="zz-card-copy">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function HowItWorksSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className="zz-section-dark"><div className="zz-container">
      <CMSSectionHeader dark header={block.header} />
      <div className="zz-content-grid zz-grid-4">
        {block.items.map((item) => (
          <article className="zz-content-card" key={item.title}>
            <div className="zz-card-copy">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function SampleMenu({ block }: { block: ZuruZuruRichTextBlockData }) {
  if (!block.content) return null
  return <RichText data={block.content as never} />
}

function BookingSection({ richText }: { richText?: ZuruZuruRichTextBlockData }) {
  return (
    <section><div className="zz-container zz-booking-grid">
      <div>{richText && <SampleMenu block={richText} />}</div>
      <div className="zz-form-panel">
        <h3>Book Catering</h3>
        <InquiryForm
          fields={[
            { label: 'Full Name', name: 'name' },
            { label: 'Company (Optional)', name: 'company' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Phone', name: 'phone', type: 'tel' },
            { label: 'Event Date', name: 'date', type: 'date' },
            { label: 'Est. Guest Count', name: 'guests', type: 'number' },
            { label: 'Event Location/Venue', name: 'venue' },
            { label: 'Event Details & Requests', name: 'details', type: 'textarea' },
          ]}
          formType="catering"
          submitLabel="Request Proposal"
          subject="Catering Request"
        />
      </div>
    </div></section>
  )
}

export function CMSCateringPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const cardGrid = blocks.find((block) => block.type === 'cardGrid')
  const contentGrid = blocks.find((block) => block.type === 'contentGrid')
  const richText = blocks.find((block) => block.type === 'richText')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {cardGrid?.type === 'cardGrid' && <CateredEventsSection block={cardGrid.data} />}
      {contentGrid?.type === 'contentGrid' && <HowItWorksSection block={contentGrid.data} />}
      <BookingSection richText={richText?.type === 'richText' ? richText.data : undefined} />
    </>
  )
}
