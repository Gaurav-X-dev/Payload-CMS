import Image from 'next/image'
import { CMSPageHero, CMSSectionHeader, PlainCardGrid } from './CMSInnerPageShared'
import { InquiryForm } from './InquiryForm'
import type {
  ZuruZuruContentGridBlockData,
  ZuruZuruEventsBlockData,
  ZuruZuruPageBlockData,
} from '../mappers/dynamicTypes'

/**
 * The Events collection has no "category" tag field (Music/Tasting/Exclusive/Culture in the
 * original), so the card meta line is derived from the event's actual `startsAt` date/time instead
 * of a category prefix — a disclosed simplification (see the Milestone Z7 report). Recurring
 * schedule text ("Every Friday, 8 PM") isn't representable either, since `startsAt` is a single
 * concrete date, so each event is seeded with one upcoming occurrence.
 */
function formatEventMeta(startsAt: string): string {
  const date = new Date(startsAt)
  if (Number.isNaN(date.getTime())) return ''
  const datePart = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata', year: 'numeric' }).format(date)
  const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true, minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(date)
  return `${datePart} · ${timePart}`
}

function UpcomingEventsSection({ block }: { block: ZuruZuruEventsBlockData }) {
  if (block.events.length === 0) return null
  return (
    <section><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <div className="zz-content-grid zz-grid-2">
        {block.events.map((event) => (
          <article className="zz-content-card" key={event.id}>
            {event.image && (
              <div className="zz-card-image">
                <Image alt={event.title} fill sizes="(max-width: 768px) 100vw, 50vw" src={event.image.src} />
              </div>
            )}
            <div className="zz-card-copy">
              <span className="zz-card-meta">{formatEventMeta(event.startsAt)}</span>
              <h3>{event.title}</h3>
              <p>{event.description || event.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function RegularExperiencesSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className="zz-section-dark"><div className="zz-container">
      <CMSSectionHeader dark header={block.header} />
      <PlainCardGrid items={block.items} />
    </div></section>
  )
}

function InquireSection() {
  return (
    <section className="zz-section-alt"><div className="zz-container zz-form-panel zz-form-narrow">
      <h2>Inquire About an Event</h2>
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
        formType="events"
        submitLabel="Submit Inquiry"
        subject="Event Inquiry"
      />
    </div></section>
  )
}

export function CMSEventsPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const events = blocks.find((block) => block.type === 'events')
  const regular = blocks.find((block) => block.type === 'contentGrid')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {events?.type === 'events' && <UpcomingEventsSection block={events.data} />}
      {regular?.type === 'contentGrid' && <RegularExperiencesSection block={regular.data} />}
      <InquireSection />
    </>
  )
}
