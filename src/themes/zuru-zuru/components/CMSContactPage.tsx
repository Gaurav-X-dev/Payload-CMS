import { CMSPageHero, CMSSectionHeader } from './CMSInnerPageShared'
import { ContactForm } from './ContactForm'
import { Accordion } from './Interactive'
import { formatHoursSummary } from '../utils/formatHours'
import type {
  ZuruZuruFAQBlockData,
  ZuruZuruFormBlockData,
  ZuruZuruLocationsBlockData,
  ZuruZuruPageBlockData,
  ZuruZuruSiteData,
} from '../mappers/dynamicTypes'

/**
 * Matches the original Contact page's dark 3-column info grid exactly. Sourced entirely from the
 * global shell (SiteSettings/Tenant contact data, already CMS-driven since Milestone Z2) rather
 * than a dedicated Page block — this section has no page-specific configurable content beyond
 * what the shell already provides. The original's specific meal-service-window hours text
 * ("Lunch & Dinner" / "Tempura, Gyoza & Cold Ramen") has no representable field (Locations'
 * day-based hours array is already used for two other, incompatible schedules); this card shows
 * the same uniform hours summary the header/footer/announcement bar already use — a disclosed
 * simplification, see the Milestone Z6 report.
 */
function InfoGridSection({ site }: { site: ZuruZuruSiteData }) {
  const hoursSummary = formatHoursSummary(site.hours)
  return (
    <section className="zz-section-dark"><div className="zz-container">
      <div className="zz-info-grid">
        <article><h3>Location</h3><p>{site.address}</p></article>
        {hoursSummary && <article><h3>Opening Hours</h3><p>{hoursSummary}</p></article>}
        {(site.phone || site.email) && (
          <article>
            <h3>Contact</h3>
            <p>
              {site.phone}
              {site.phone && site.email && <br />}
              {site.email}
            </p>
          </article>
        )}
      </div>
    </div></section>
  )
}

function ContactFormColumn({ block }: { block: ZuruZuruFormBlockData }) {
  return (
    <div>
      {block.headerTitle && <h2>{block.headerTitle}</h2>}
      {block.headerDescription && <p>{block.headerDescription}</p>}
      <ContactForm block={block} />
    </div>
  )
}

/** Matches the original Contact page's live Google Maps iframe embed exactly (a real, functional embed — distinct from the Home page's Visit Us section, which uses a static decorative placeholder because that's what its own original design has). */
function MapEmbedColumn({ block }: { block: ZuruZuruLocationsBlockData }) {
  if (!block.showMap || !block.location?.mapsEmbedUrl) return null
  const title = block.location.city ? `Zuru Zuru location in ${block.location.city}` : 'Zuru Zuru location'
  return (
    <iframe
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={block.location.mapsEmbedUrl}
      title={title}
    />
  )
}

function FAQSection({ block }: { block: ZuruZuruFAQBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className="zz-section-alt"><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <Accordion items={block.items.map((item) => [item.question, item.answer] as [string, string])} />
    </div></section>
  )
}

export function CMSContactPage({ blocks, site }: { blocks: ZuruZuruPageBlockData[]; site: ZuruZuruSiteData }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const form = blocks.find((block) => block.type === 'form')
  const locations = blocks.find((block) => block.type === 'locations')
  const faq = blocks.find((block) => block.type === 'faq')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      <InfoGridSection site={site} />
      {(form || locations) && (
        <section><div className="zz-container zz-contact-grid">
          {form?.type === 'form' && <ContactFormColumn block={form.data} />}
          {locations?.type === 'locations' && <MapEmbedColumn block={locations.data} />}
        </div></section>
      )}
      {faq?.type === 'faq' && <FAQSection block={faq.data} />}
    </>
  )
}
