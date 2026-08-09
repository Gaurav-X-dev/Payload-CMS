import Image from 'next/image'
import { CMSPageHero, CMSSectionHeader, PlainCardGrid, StorySimplePanel } from './CMSInnerPageShared'
import { InquiryForm } from './InquiryForm'
import type {
  ZuruZuruCardGridBlockData,
  ZuruZuruContentGridBlockData,
  ZuruZuruPageBlockData,
} from '../mappers/dynamicTypes'

/** Matches Catering's "Catered Events" card-grid treatment, but reads the real `columns` field cardgridBlock stores (Catering hardcodes 2; this page needs 3, the original's CardGrid default). */
function ExperiencesSection({ block }: { block: ZuruZuruCardGridBlockData }) {
  if (block.cards.length === 0) return null
  return (
    <section><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <div className={`zz-content-grid zz-grid-${block.columns}`}>
        {block.cards.map((card) => (
          <article className="zz-content-card" key={card.title}>
            {card.image && (
              <div className="zz-card-image">
                <Image alt={card.title} fill sizes="(max-width: 768px) 100vw, 33vw" src={card.image.src} />
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

/** The original's packages have no images (unlike Experiences above), and each tier's price has no matching field on any reusable block's items — folded into `title`, matching Franchise's identical "tier name + price" precedent. */
function PackagesSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className="zz-section-dark"><div className="zz-container">
      <CMSSectionHeader dark header={block.header} />
      <PlainCardGrid items={block.items} />
    </div></section>
  )
}

function ProposalFormSection() {
  return (
    <section className="zz-section-alt"><div className="zz-container zz-form-panel zz-form-narrow">
      <h2>Request a Proposal</h2>
      <InquiryForm
        fields={[
          { label: 'First Name', name: 'firstName' },
          { label: 'Last Name', name: 'lastName' },
          { label: 'Email Address', name: 'email', type: 'email' },
          { label: 'Phone Number', name: 'phone', type: 'tel' },
          { label: 'Event Type', name: 'event', options: ['Corporate Dinner', 'Birthday/Anniversary', 'Wedding Reception', 'Other'], placeholder: 'Select event type', type: 'select' },
          { label: 'Number of Guests', name: 'guests', type: 'number' },
          { label: 'Preferred Date', name: 'date', type: 'date' },
          { label: 'Additional Details', name: 'details', type: 'textarea' },
        ]}
        formType="private-dining"
        submitLabel="Submit Inquiry"
        subject="Private Dining"
      />
    </div></section>
  )
}

export function CMSPrivateDiningPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const intro = blocks.find((block) => block.type === 'story')
  const experiences = blocks.find((block) => block.type === 'cardGrid')
  const packages = blocks.find((block) => block.type === 'contentGrid')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {intro?.type === 'story' && <StorySimplePanel block={intro.data} />}
      {experiences?.type === 'cardGrid' && <ExperiencesSection block={experiences.data} />}
      {packages?.type === 'contentGrid' && <PackagesSection block={packages.data} />}
      <ProposalFormSection />
    </>
  )
}
