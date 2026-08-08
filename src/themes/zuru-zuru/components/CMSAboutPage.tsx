import Image from 'next/image'
import { CMSPageHero, CMSSectionHeader } from './CMSInnerPageShared'
import { Icon } from './Icon'
import type {
  ZuruZuruContentGridBlockData,
  ZuruZuruPageBlockData,
  ZuruZuruStatsBlockData,
  ZuruZuruStepsBlockData,
  ZuruZuruStoryBlockData,
} from '../mappers/dynamicTypes'

/** Matches the About page's "Our Roots" section — a simple two-column story panel, no CTA/quote/stat-badge. */
function StorySimpleSection({ block }: { block: ZuruZuruStoryBlockData }) {
  if (!block.title) return null
  const imageFirst = block.imagePosition === 'left'
  const textCol = (
    <div>
      {block.eyebrow && <span className="zz-section-subtitle">{block.eyebrow}</span>}
      <h2>{block.title}</h2>
      {block.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </div>
  )
  const imageCol = block.image && (
    <div className="zz-story-image">
      <Image alt={block.imageAlt || block.title} fill sizes="(max-width:800px) 100vw,50vw" src={block.image.src} />
    </div>
  )
  return (
    <section className="zz-section-alt"><div className="zz-container zz-split-layout">
      {imageFirst ? <>{imageCol}{textCol}</> : <>{textCol}{imageCol}</>}
    </div></section>
  )
}

/** Matches the About page's Mission & Vision section exactly: a dark 2-column icon-card grid (no shared CardGrid component involved in the original markup). */
function MissionVisionSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className={block.dark ? 'zz-section-dark' : undefined}><div className="zz-container">
      <div className="zz-grid-2 zz-mission-grid">
        {block.items.map((item) => (
          <article key={item.title}>
            {item.icon && <Icon name={item.icon} />}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </div></section>
  )
}

/**
 * Matches the About page's "Japanese Philosophy" section, which uses the shared `CardGrid`
 * component's markup/classes (`zz-content-grid zz-grid-3` / `zz-content-card` / `zz-card-copy`).
 * The original pillars have a per-item meta subtitle (e.g. "(Hospitality from the Heart)") with no
 * matching field on any reusable block; it's folded into `title`, matching the established
 * precedent (Home's Seasonal Collections, the Menu page's Japanese dish names) — see the
 * Milestone Z5 report.
 */
function PillarsCardGridSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <div className="zz-content-grid zz-grid-3">
        {block.items.map((item) => (
          <article className="zz-content-card" key={item.title}>
            <div className="zz-card-copy">
              {item.icon && <Icon name={item.icon} size={38} weight="regular" />}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function ContentGridSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  return block.presentation === 'mission-vision'
    ? <MissionVisionSection block={block} />
    : <PillarsCardGridSection block={block} />
}

/** Matches the About page's "The Zuru Zuru Story" timeline exactly: alternating left/right by position — a pure rendering rule (index % 2), not a stored field. */
function TimelineSection({ block }: { block: ZuruZuruStepsBlockData }) {
  if (block.steps.length === 0) return null
  return (
    <section className={block.dark ? 'zz-section-dark' : undefined}><div className="zz-container">
      <CMSSectionHeader dark={block.dark} header={block.header} />
      <div className="zz-timeline">
        {block.steps.map((step, index) => (
          <article className={index % 2 ? 'zz-right' : 'zz-left'} key={step.label || step.title}>
            <div>
              <strong>{step.label}</strong>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

function StatsSection({ block }: { block: ZuruZuruStatsBlockData }) {
  if (block.stats.length === 0) return null
  return (
    <section className={block.dark ? 'zz-section-dark' : undefined}><div className="zz-container">
      <CMSSectionHeader dark={block.dark} header={block.header} />
      <div className="zz-stats">
        {block.stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div></section>
  )
}

function CMSAboutPageSection({ block }: { block: ZuruZuruPageBlockData }) {
  switch (block.type) {
    case 'hero': return <CMSPageHero block={block.data} />
    case 'story': return <StorySimpleSection block={block.data} />
    case 'contentGrid': return <ContentGridSection block={block.data} />
    case 'steps': return <TimelineSection block={block.data} />
    case 'stats': return <StatsSection block={block.data} />
    default: return null
  }
}

export function CMSAboutPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  return (
    <>
      {blocks.map((block, i) => <CMSAboutPageSection block={block} key={i} />)}
    </>
  )
}
