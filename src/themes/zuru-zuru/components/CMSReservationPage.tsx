import { ReservationForm } from './ReservationForm'
import type { ZuruZuruContentGridBlockData, ZuruZuruPageBlockData } from '../mappers/dynamicTypes'

/**
 * The original has no PageHero on this route at all — just the reservation panel itself — so
 * "Book a Table" / its subtext are hardcoded here rather than CMS-driven, matching the same
 * precedent every other specialized-form page uses for its form-section heading (Careers' "Apply
 * Now", Catering's "Book Catering", ...). The "Details" aside (Phone Reservations / Large Parties
 * & Events / Cancellation Policy / Location) reuses `contentgridBlock` purely as a title+description
 * data source — this page renders it as a stacked h4/p list instead of a card grid, the same
 * reuse-the-data/vary-the-presentation approach Careers and Franchise already established.
 */
function DetailsAside({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <aside>
      <h3>Details</h3>
      {block.items.map((item) => (
        <div key={item.title}>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
        </div>
      ))}
    </aside>
  )
}

export function CMSReservationPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const details = blocks.find((block) => block.type === 'contentGrid')

  return (
    <section className="zz-reservation-page"><div className="zz-container zz-reservation-grid">
      <div className="zz-reservation-form">
        <h2>Book a Table</h2>
        <p>Join us for an unforgettable dining experience.</p>
        <ReservationForm />
      </div>
      {details?.type === 'contentGrid' && <DetailsAside block={details.data} />}
    </div></section>
  )
}
