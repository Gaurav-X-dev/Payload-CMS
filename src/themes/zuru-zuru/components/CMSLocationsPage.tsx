import { BenefitsPills, CMSPageHero, CMSSectionHeader } from './CMSInnerPageShared'
import { groupBusinessHours } from '../utils/formatHours'
import { splitLocationBadge } from '../utils/foldedTitles'
import type {
  ZuruZuruContentGridBlockData,
  ZuruZuruLocationData,
  ZuruZuruLocationsBlockData,
  ZuruZuruPageBlockData,
} from '../mappers/dynamicTypes'

/**
 * The Location collection also has no image relationship, so these cards render without photos —
 * a disclosed schema gap, see the Milestone Z7 report; approving a `Locations.image` field would
 * restore them. Hours are summarized via the existing `groupBusinessHours` utility (already used
 * by the Contact page's Visit Us section) rather than a new formatter.
 */
function LocationCard({ location }: { location: ZuruZuruLocationData }) {
  const hoursSummary = groupBusinessHours(location.hours).join(' · ') || 'Opening Soon'
  const description = [location.address, location.phone, hoursSummary].filter(Boolean).join(' · ')
  const { badge, name } = splitLocationBadge(location.title)
  return (
    <article className="zz-content-card">
      <div className="zz-card-copy">
        {badge && <span className="zz-card-meta">{badge}</span>}
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </article>
  )
}

function LocationsGridSection({ block }: { block: ZuruZuruLocationsBlockData }) {
  if (block.locations.length === 0) return null
  return (
    <section><div className="zz-container">
      <div className="zz-content-grid zz-grid-2">
        {block.locations.map((location) => <LocationCard key={location.id} location={location} />)}
      </div>
    </div></section>
  )
}

function AmenitiesSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className="zz-section-dark"><div className="zz-container">
      <CMSSectionHeader dark header={block.header} />
      <BenefitsPills labels={block.items.map((item) => item.title)} />
    </div></section>
  )
}

/** Purely decorative filler in the original (no dynamic data even in the static source) — kept as static markup rather than invented as a fake CMS-backed section. */
function MapPlaceholderSection() {
  return (
    <section><div className="zz-container zz-map-placeholder">
      <h3>Explore Our Map</h3>
      <p>Interactive maps and virtual tours available on our app.</p>
    </div></section>
  )
}

export function CMSLocationsPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const locations = blocks.find((block) => block.type === 'locations')
  const amenities = blocks.find((block) => block.type === 'contentGrid')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {locations?.type === 'locations' && <LocationsGridSection block={locations.data} />}
      {amenities?.type === 'contentGrid' && <AmenitiesSection block={amenities.data} />}
      <MapPlaceholderSection />
    </>
  )
}
