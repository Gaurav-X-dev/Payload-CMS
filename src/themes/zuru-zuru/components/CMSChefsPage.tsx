import Image from 'next/image'
import { CMSPageHero } from './CMSInnerPageShared'
import { CTA } from './Shared'
import type {
  ZuruZuruCTABlockData,
  ZuruZuruPageBlockData,
  ZuruZuruStoryBlockData,
  ZuruZuruTeamBlockData,
} from '../mappers/dynamicTypes'

/** The original's body text has no dedicated "awards list" field on storyBlock, so a paragraph containing internal newlines (no blank line) is rendered as a `<ul className="zz-awards">` instead of a `<p>` — the same content-configuration convention used for other folded fields, applied here to preserve the bulleted list markup. */
function renderChefBody(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
      if (lines.length > 1) {
        return (
          <ul className="zz-awards" key={block}>
            {lines.map((line) => <li key={line}>{line}</li>)}
          </ul>
        )
      }
      return <p key={block}>{block}</p>
    })
}

/** Matches the Chefs page's Kenji Tanaka spotlight exactly (`zz-portrait` image + eyebrow/title/role/body/awards) — distinct from About's `StorySimpleSection`, which uses `zz-story-image` and has no role/awards content. */
function ChefSpotlightSection({ block }: { block: ZuruZuruStoryBlockData }) {
  if (!block.title) return null
  const imageFirst = block.imagePosition === 'left'
  const imageCol = block.image && (
    <div className="zz-portrait">
      <Image alt={block.imageAlt || block.title} fill sizes="(max-width:800px) 100vw,45vw" src={block.image.src} />
    </div>
  )
  const textCol = (
    <div>
      {block.eyebrow && <span className="zz-section-subtitle">{block.eyebrow}</span>}
      <h2>{block.title}</h2>
      {block.accentPhrase && <h3>{block.accentPhrase}</h3>}
      {renderChefBody(block.body)}
    </div>
  )
  return (
    <section><div className="zz-container zz-split-layout">
      {imageFirst ? <>{imageCol}{textCol}</> : <>{textCol}{imageCol}</>}
    </div></section>
  )
}

/** Matches the Chefs page's "The Culinary Masters" dark grid — a real `teamBlock`, so name/role/bio are genuine separate fields (unlike Careers' folded meta), reusing the `CardGrid` visual shape with photos. */
function MastersSection({ block }: { block: ZuruZuruTeamBlockData }) {
  if (block.members.length === 0) return null
  return (
    <section className="zz-section-dark"><div className="zz-container">
      <header className="zz-section-header zz-on-dark">
        {block.header.eyebrow && <span className="zz-section-subtitle">{block.header.eyebrow}</span>}
        <h2>{block.header.title}</h2>
        {block.header.description && <p>{block.header.description}</p>}
      </header>
      <div className="zz-content-grid zz-grid-2">
        {block.members.map((member) => (
          <article className="zz-content-card" key={member.id}>
            {member.photo && (
              <div className="zz-card-image">
                <Image alt={member.name} fill sizes="(max-width: 768px) 100vw, 50vw" src={member.photo.src} />
              </div>
            )}
            <div className="zz-card-copy">
              {member.role && <span className="zz-card-meta">{member.role}</span>}
              <h3>{member.name}</h3>
              <p>{member.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </div></section>
  )
}

/** Matches the plain `zz-quote-section` block — the same storyBlock type as the spotlight above, distinguished by `layout === 'overlay'` (the only variant that populates `quote`/`attribution` instead of `title`/`body`). */
function QuoteSection({ block }: { block: ZuruZuruStoryBlockData }) {
  if (!block.quote) return null
  return (
    <section className="zz-quote-section">
      <blockquote>
        {block.quote}
        {block.attribution && <cite>— {block.attribution}</cite>}
      </blockquote>
    </section>
  )
}

function ChefsCTASection({ block }: { block: ZuruZuruCTABlockData }) {
  if (!block.primaryCTA) return null
  return <CTA href={block.primaryCTA.url} label={block.primaryCTA.label} text={block.header.description} title={block.header.title} />
}

export function CMSChefsPage({ blocks }: { blocks: ZuruZuruPageBlockData[] }) {
  const hero = blocks.find((block) => block.type === 'hero')
  const stories = blocks.filter((block) => block.type === 'story')
  const spotlight = stories.find((block) => block.type === 'story' && block.data.layout !== 'overlay')
  const quote = stories.find((block) => block.type === 'story' && block.data.layout === 'overlay')
  const team = blocks.find((block) => block.type === 'team')
  const cta = blocks.find((block) => block.type === 'cta')

  return (
    <>
      {hero?.type === 'hero' && <CMSPageHero block={hero.data} />}
      {spotlight?.type === 'story' && <ChefSpotlightSection block={spotlight.data} />}
      {team?.type === 'team' && <MastersSection block={team.data} />}
      {quote?.type === 'story' && <QuoteSection block={quote.data} />}
      {cta?.type === 'cta' && <ChefsCTASection block={cta.data} />}
    </>
  )
}
