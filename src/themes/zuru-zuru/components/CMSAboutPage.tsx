import { CMSPageHero, CMSSectionHeader, StorySimplePanel } from './CMSInnerPageShared'
import { Icon } from './Icon'
import { splitTitleMeta } from '../utils/foldedTitles'
import type {
  ZuruZuruContentGridBlockData,
  ZuruZuruPageBlockData,
  ZuruZuruStatsBlockData,
  ZuruZuruStepsBlockData,
} from '../mappers/dynamicTypes'

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
 * component's markup/classes (`zz-content-grid zz-grid-3` / `zz-content-card` / `zz-card-copy` /
 * `zz-card-meta`). The original pillars have a per-item meta subtitle (e.g. "(Hospitality from the
 * Heart)") with no matching field on any reusable block; it was folded into `title` as
 * "Title (meta)" at seed time (Milestone Z5) and is split back out via the same
 * `splitTitleMeta` helper `PlainCardGrid` uses (Franchise/Private Dining) — Milestone Z9.
 */
function PillarsCardGridSection({ block }: { block: ZuruZuruContentGridBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section><div className="zz-container">
      <CMSSectionHeader header={block.header} />
      <div className="zz-content-grid zz-grid-3">
        {block.items.map((item) => {
          const { meta, title } = splitTitleMeta(item.title)
          return (
            <article className="zz-content-card" key={item.title}>
              <div className="zz-card-copy">
                {item.icon && <Icon name={item.icon} size={38} weight="regular" />}
                {meta && <span className="zz-card-meta">{meta}</span>}
                <h3>{title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          )
        })}
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
    case 'story': return <StorySimplePanel block={block.data} />
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
