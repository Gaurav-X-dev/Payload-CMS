import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type {
  CuriousLadooBlogPreviewBlockData,
  CuriousLadooBrandsShowcaseBlockData,
  CuriousLadooCapabilityBlockData,
  CuriousLadooContentGridBlockData,
  CuriousLadooCTABlockData,
  CuriousLadooFAQBlockData,
  CuriousLadooHeroBlockData,
  CuriousLadooHomeBlockData,
  CuriousLadooHomeContent,
  CuriousLadooPipelineBlockData,
  CuriousLadooStatsBlockData,
  CuriousLadooStepsBlockData,
  CuriousLadooStoryBlockData,
  CuriousLadooTeamBlockData,
  CuriousLadooTestimonialsBlockData,
  CuriousLadooTickerBlockData,
} from '../mappers/dynamicTypes'
import { AnimatedCounter } from './AnimatedCounter'
import { FAQAccordion } from './FAQAccordion'
import { ScrollReveal } from './ScrollReveal'
import { Ticker } from './Ticker'
import { CuriousHubIcon } from '../iconRegistry'
import styles from './Theme.module.css'

const revealDelay = (index: number, mod = 5) => (index % mod) as 0 | 1 | 2 | 3 | 4

/** mailto:/tel:/http(s) links need a plain <a>; internal paths use <Link> for client-side nav. */
function SmartLink({ children, className, href, id }: { children: ReactNode; className?: string; href: string; id?: string }) {
  const isExternalStyle = /^(mailto:|tel:|https?:)/.test(href)
  if (isExternalStyle) {
    return <a className={className} href={href} id={id}>{children}</a>
  }
  return <Link className={className} href={href} id={id}>{children}</Link>
}

function HeroSection({ block }: { block: CuriousLadooHeroBlockData }) {
  if (!block.heading) return null
  return (
    <section aria-label="Hero" className={styles.heroSection} id="hero-theme-3">
      <div className={styles.t3Content}>
        <h1 className={styles.t3Headline}>
          {block.heading}
          <br />
          {block.highlightedHeading && (
            <span className={styles.t3Accent}>{block.highlightedHeading}</span>
          )}
        </h1>
        <svg
          aria-hidden="true"
          className={styles.t3UnderlineSvg}
          viewBox="0 0 220 14"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2,10 C25,6 55,12 85,8 C115,4 148,11 180,7 C195,5 210,9 218,7"
            fill="none"
            stroke="#111"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.5"
          />
        </svg>
        {block.description && <p className={styles.t3Body}>{block.description}</p>}
        <div className={styles.t3Actions}>
          {block.primaryCTA && (
            <Link className={styles.t3BtnDark} href={block.primaryCTA.url}>
              {block.primaryCTA.label.toUpperCase()} →
            </Link>
          )}
          {block.secondaryCTA && (
            <Link className={styles.t3BtnGhost} href={block.secondaryCTA.url}>
              {block.secondaryCTA.label.toUpperCase()} →
            </Link>
          )}
        </div>
      </div>
      <div className={styles.t3Visuals}>
        {block.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={block.image.alt}
            className={styles.t3CompositeImg}
            id="heroBg-t3"
            src={block.image.src}
          />
        )}
        <div aria-label="Japanese brand text" className={styles.t3JapaneseText}>
          <span>本物の体験</span>
          <span>長く残るブランド</span>
        </div>
      </div>
    </section>
  )
}

/** Simpler banner hero used by every non-Home page (About, Services, etc.) — matches Shared.tsx's InnerHero. */
function InnerHeroSection({ block }: { block: CuriousLadooHeroBlockData }) {
  if (!block.heading) return null
  return (
    <section className={styles.innerHero}>
      <div className={styles.innerHeroContent}>
        {block.eyebrow && <span className={styles.innerHeroEyebrow}>{block.eyebrow}</span>}
        <h1 className={styles.innerHeroTitle}>{block.heading}</h1>
        {block.description && <p className={styles.innerHeroBody}>{block.description}</p>}
      </div>
      {block.image && (
        <div className={styles.innerHeroImgWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={block.image.alt} src={block.image.src} />
        </div>
      )}
    </section>
  )
}

function TickerSection({ block }: { block: CuriousLadooTickerBlockData }) {
  if (block.items.length === 0) return null
  return <Ticker brands={block.items} />
}

function StoryPanelSection({ block }: { block: CuriousLadooStoryBlockData }) {
  const imageFirst = block.imagePosition === 'left'
  const textCol = (
    <div className={styles.aboutText}>
      {block.eyebrow && (
        <ScrollReveal>
          <p className={styles.sectionEyebrow}>{block.eyebrow}</p>
        </ScrollReveal>
      )}
      {block.title && (
        <ScrollReveal delay={1}>
          <h2 className={styles.sectionTitle}>
            {block.accentPhrase && block.title.endsWith(block.accentPhrase)
              ? (
                <>
                  {block.title.slice(0, block.title.length - block.accentPhrase.length)}
                  <em className={styles.italic}>{block.accentPhrase}</em>
                </>
              )
              : block.title}
          </h2>
        </ScrollReveal>
      )}
      {block.quote && (
        <ScrollReveal delay={2}>
          <div className={styles.brushDivider} />
          <blockquote className={styles.aboutQuote}>&ldquo;{block.quote}&rdquo;</blockquote>
        </ScrollReveal>
      )}
      {block.body && (
        <ScrollReveal delay={3}>
          <p className={styles.sectionBody}>{block.body}</p>
        </ScrollReveal>
      )}
      {block.cta && (
        <ScrollReveal delay={4}>
          <Link className={styles.aboutLink} href={block.cta.url}>
            {block.cta.label} <span>→</span>
          </Link>
        </ScrollReveal>
      )}
    </div>
  )
  const imageCol = (
    <ScrollReveal className={styles.aboutImageStack} delay={2}>
      {block.image && (
        <div className={styles.aboutImgMain}>
          <Image alt={block.image.alt} fill loading="lazy" src={block.image.src} style={{ objectFit: 'cover' }} />
        </div>
      )}
      {block.secondaryImage && (
        <div className={styles.aboutImgAccent}>
          <Image alt={block.secondaryImage.alt} fill loading="lazy" src={block.secondaryImage.src} style={{ objectFit: 'cover' }} />
        </div>
      )}
      {block.statBadge && (
        <div className={styles.aboutTag}>
          <span className={styles.aboutTagBig}>{block.statBadge.value}</span>
          {block.statBadge.label}
        </div>
      )}
    </ScrollReveal>
  )
  return (
    <section aria-label={block.eyebrow || 'Story'} className={styles.aboutSection} id="about">
      {imageFirst ? (
        <>
          {imageCol}
          {textCol}
        </>
      ) : (
        <>
          {textCol}
          {imageCol}
        </>
      )}
    </section>
  )
}

function StoryOverlaySection({ block }: { block: CuriousLadooStoryBlockData }) {
  if (!block.quote) return null
  return (
    <section aria-label="Visual story" className={styles.visualStorySection} id="visual-story">
      {block.image && (
        <div className={styles.visualStoryBg}>
          <Image alt={block.image.alt} fill loading="lazy" src={block.image.src} style={{ objectFit: 'cover' }} />
        </div>
      )}
      <div className={styles.visualStoryOverlay} />
      <div className={styles.visualStoryContent}>
        <div className={styles.visualStoryText}>
          <ScrollReveal>
            <blockquote className={styles.visualStoryQuote}>
              &ldquo;
              {block.quote.split('\n').map((line, i, arr) => (
                <span key={line}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
              &rdquo;
            </blockquote>
          </ScrollReveal>
          {block.attribution && (
            <ScrollReveal delay={1}>
              <p className={styles.visualStoryAttr}>{block.attribution}</p>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}

/** Simple two-column story used by inner pages (About) — no eyebrow/quote/cta/statBadge, supports multi-paragraph body. */
function StorySimpleSection({ block }: { block: CuriousLadooStoryBlockData }) {
  const imageFirst = block.imagePosition === 'left'
  const textCol = (
    <div>
      {block.title && (
        <ScrollReveal delay={1}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '1.5rem' }}>
            {block.title} {block.accentPhrase && <em className={styles.italic}>{block.accentPhrase}</em>}
          </h2>
        </ScrollReveal>
      )}
      {block.body && (
        <ScrollReveal delay={2}>
          <div className={styles.brushDivider} />
          {renderParagraphs(block.body, styles.sectionBody)}
        </ScrollReveal>
      )}
    </div>
  )
  const imageCol = block.image && (
    <ScrollReveal className={styles.aboutStoryImage} delay={imageFirst ? 0 : 1}>
      <Image alt={block.image.alt} height={600} loading="lazy" src={block.image.src} style={{ display: 'block', height: 'auto', width: '100%' }} width={800} />
    </ScrollReveal>
  )
  return (
    <section className={styles.innerSection} id="story">
      <div className={styles.aboutStoryGrid}>
        {imageFirst ? (
          <>
            {imageCol}
            {textCol}
          </>
        ) : (
          <>
            {textCol}
            {imageCol}
          </>
        )}
      </div>
    </section>
  )
}

function StorySection({ block }: { block: CuriousLadooStoryBlockData }) {
  if (block.layout === 'overlay') return <StoryOverlaySection block={block} />
  if (block.layout === 'simple') return <StorySimpleSection block={block} />
  return <StoryPanelSection block={block} />
}

/** Splits on blank lines into separate <p> tags — used where the source markup has distinct paragraphs. */
function renderParagraphs(text: string, className: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => <p className={className} key={paragraph}>{paragraph}</p>)
}

function withLineBreaks(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ))
}

function renderHeading(title: string, subtitle: string) {
  if (!title) return null
  if (subtitle && title.endsWith(subtitle)) {
    const lead = title.slice(0, title.length - subtitle.length)
    return (
      <>
        {withLineBreaks(lead)}
        <em className={styles.italic}>{subtitle}</em>
      </>
    )
  }
  return withLineBreaks(title)
}

function PillarsGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section aria-label="Our philosophy" className={styles.philosophySection} id="philosophy">
      <div aria-hidden="true" className={styles.philosophyBgText}>PHILOSOPHY</div>
      <div className={styles.philosophyHeader}>
        <div>
          {block.header.eyebrow && (
            <ScrollReveal>
              <p className={styles.sectionEyebrow} style={{ color: 'rgba(184,168,120,0.8)' }}>{block.header.eyebrow}</p>
            </ScrollReveal>
          )}
          <ScrollReveal delay={1}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
              {renderHeading(block.header.title, block.header.subtitle)}
            </h2>
          </ScrollReveal>
        </div>
        {block.header.description && (
          <div className={styles.philosophyHeaderRight}>
            <ScrollReveal delay={2}>
              <p className={`${styles.sectionBody} ${styles.sectionBodyLight}`}>{block.header.description}</p>
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <div className={styles.brushDivider} style={{ background: 'rgba(184,168,120,0.4)' }} />
            </ScrollReveal>
          </div>
        )}
      </div>
      <div className={styles.philosophyPillars}>
        {block.items.map((item, i) => (
          <ScrollReveal delay={revealDelay(i)} key={item.title}>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>{String(i + 1).padStart(2, '0')}</div>
              <CuriousHubIcon className={styles.pillarIcon} name={item.icon} />
              <div className={styles.pillarTitle}>{item.title}</div>
              <p className={styles.pillarDesc}>{item.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function ServicesGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section aria-label="Our services" className={styles.servicesSection} id="services">
      <div className={styles.servicesHeader}>
        <div>
          {block.header.eyebrow && (
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>{block.header.eyebrow}</p>
            </ScrollReveal>
          )}
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle}>{renderHeading(block.header.title, block.header.subtitle)}</h2>
          </ScrollReveal>
        </div>
        {block.header.description && (
          <div className={styles.servicesHeaderRight}>
            <ScrollReveal>
              <p className={styles.sectionBody}>{block.header.description}</p>
            </ScrollReveal>
          </div>
        )}
      </div>
      <div className={styles.servicesGrid}>
        {block.items.map((item, i) => (
          <ScrollReveal delay={revealDelay(i, 4)} key={item.title}>
            <article className={styles.serviceCard}>
              <div className={styles.serviceCardNum}>{String(i + 1).padStart(2, '0')}</div>
              <CuriousHubIcon className={styles.serviceCardIcon} name={item.icon} />
              <div className={styles.serviceCardTitle}>{item.title}</div>
              <p className={styles.serviceCardDesc}>{item.description}</p>
              {item.link && (
                <Link className={styles.serviceCardLink} href={item.link.url}>
                  {item.link.label} →
                </Link>
              )}
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function B2BGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section aria-label="B2B solutions and partnerships" className={styles.b2bSection} id="b2b">
      <div aria-hidden="true" className={styles.b2bBgAccent} />
      <div className={styles.b2bLayout}>
        <div className={styles.b2bLeft}>
          {block.header.eyebrow && (
            <ScrollReveal>
              <p className={styles.sectionEyebrow} style={{ color: 'rgba(184,168,120,0.8)' }}>{block.header.eyebrow}</p>
            </ScrollReveal>
          )}
          <ScrollReveal delay={1}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
              {renderHeading(block.header.title, block.header.subtitle)}
            </h2>
          </ScrollReveal>
          {block.header.description && (
            <ScrollReveal delay={2}>
              <div className={styles.brushDivider} style={{ background: 'rgba(184,168,120,0.3)' }} />
              <p className={`${styles.sectionBody} ${styles.sectionBodyLight}`}>{block.header.description}</p>
            </ScrollReveal>
          )}
        </div>
        <div className={styles.b2bCards}>
          {block.items.map((item, i) => (
            <ScrollReveal delay={revealDelay(i, 4)} key={item.title}>
              <article className={styles.b2bCard}>
                <CuriousHubIcon className={styles.b2bCardIcon} name={item.icon} />
                <div className={styles.b2bCardTitle}>{item.title}</div>
                <p className={styles.b2bCardDesc}>{item.description}</p>
                {item.link && (
                  <Link className={styles.b2bCardLink} href={item.link.url}>
                    {item.link.label} →
                  </Link>
                )}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function EdgeGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section aria-label="Our competitive edge" className={styles.ourEdgeSection} id="our-edge">
      {block.media && (
        <ScrollReveal className={styles.edgeImage}>
          <div className={styles.edgeImageInner}>
            <Image alt={block.media.alt} fill loading="lazy" src={block.media.src} style={{ objectFit: 'cover' }} />
          </div>
        </ScrollReveal>
      )}
      <div>
        {block.header.eyebrow && (
          <ScrollReveal>
            <p className={styles.sectionEyebrow}>{block.header.eyebrow}</p>
          </ScrollReveal>
        )}
        <div aria-hidden="true" className={styles.edgeBgText}>EDGE</div>
        <ScrollReveal delay={1}>
          <h2 className={styles.sectionTitle}>{renderHeading(block.header.title, block.header.subtitle)}</h2>
        </ScrollReveal>
        <div className={styles.edgePoints}>
          {block.items.map((item, i) => (
            <ScrollReveal delay={revealDelay(i, 4)} key={item.title}>
              <div className={styles.edgePoint}>
                <div className={styles.edgePointIcon}>{item.icon}</div>
                <div>
                  <div className={styles.edgePointTitle}>{item.title}</div>
                  <p className={styles.edgePointDesc}>{item.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function IndustriesGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section aria-label="Industries we serve" className={styles.industriesSection} id="industries">
      <div className={styles.industriesHeader}>
        {block.header.eyebrow && (
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>{block.header.eyebrow}</p>
          </ScrollReveal>
        )}
        <ScrollReveal delay={1}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
            {renderHeading(block.header.title, block.header.subtitle)}
          </h2>
        </ScrollReveal>
      </div>
      <div className={styles.industriesGrid}>
        {block.items.map((item, i) => (
          <ScrollReveal delay={revealDelay(i, 4)} key={item.title}>
            <div className={styles.industryItem}>
              <span className={styles.industryIcon}>{item.icon}</span>
              <div className={styles.industryName}>{item.title}</div>
              <p className={styles.industryDesc}>{item.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function PartnersGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section aria-label="Our partners" className={styles.partnersSection} id="partners">
      <div className={styles.partnersHeader}>
        {block.header.eyebrow && (
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>{block.header.eyebrow}</p>
          </ScrollReveal>
        )}
        <ScrollReveal delay={1}>
          <h2 className={styles.sectionTitle}>{renderHeading(block.header.title, block.header.subtitle)}</h2>
        </ScrollReveal>
      </div>
      <ScrollReveal className={styles.partnersGrid}>
        {block.items.map((item) => (
          <div className={styles.partnerItem} key={item.title}>{item.title}</div>
        ))}
      </ScrollReveal>
    </section>
  )
}

function GenericGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section aria-label={block.header.title || 'Content'} className={styles.industriesSection}>
      {block.header.title && (
        <div className={styles.industriesHeader}>
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>{block.header.title}</h2>
          </ScrollReveal>
        </div>
      )}
      <div className={styles.industriesGrid}>
        {block.items.map((item, i) => (
          <ScrollReveal delay={revealDelay(i, 4)} key={item.title}>
            <div className={styles.industryItem}>
              {item.icon && <span className={styles.industryIcon}>{item.icon}</span>}
              <div className={styles.industryName}>{item.title}</div>
              {item.description && <p className={styles.industryDesc}>{item.description}</p>}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function ValuesGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section className={styles.innerSection}>
      <ScrollReveal>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {renderHeading(block.header.title, block.header.subtitle)}
        </h2>
      </ScrollReveal>
      {block.header.description && (
        <ScrollReveal delay={1}>
          <p className={styles.sectionBody} style={{ margin: '0 auto 3rem', textAlign: 'center' }}>{block.header.description}</p>
        </ScrollReveal>
      )}
      <div className={styles.valuesGrid}>
        {block.items.map((item, i) => (
          <ScrollReveal delay={revealDelay(i)} key={item.title}>
            <div className={styles.valueCard}>
              <div className={styles.valueNum}>{String(i + 1).padStart(2, '0')}</div>
              <h3 className={styles.valueTitle}>{item.title}</h3>
              <p className={styles.sectionBody} style={{ fontSize: '0.9rem' }}>{item.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

const missionVisionSubheadStyle = { fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.8rem' } as const

function MissionVisionGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  const [missionItem, visionItem] = block.items
  const imageFirst = block.mediaPosition === 'left'
  const textCol = (
    <div>
      {block.header.eyebrow && (
        <ScrollReveal>
          <span className={styles.sectionEyebrow}>{block.header.eyebrow}</span>
        </ScrollReveal>
      )}
      <ScrollReveal delay={1}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>
          {renderHeading(block.header.title, block.header.subtitle)}
        </h2>
      </ScrollReveal>
      {missionItem && (
        <ScrollReveal delay={2}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={missionVisionSubheadStyle}>{missionItem.title}</h4>
            <p className={styles.sectionBody}>{missionItem.description}</p>
          </div>
        </ScrollReveal>
      )}
      {visionItem && (
        <ScrollReveal delay={3}>
          <div>
            <h4 style={missionVisionSubheadStyle}>{visionItem.title}</h4>
            <p className={styles.sectionBody}>{visionItem.description}</p>
          </div>
        </ScrollReveal>
      )}
    </div>
  )
  const imageCol = block.media && (
    <ScrollReveal className={styles.aboutStoryImage} delay={1}>
      <Image alt={block.media.alt} height={600} loading="lazy" src={block.media.src} style={{ display: 'block', height: 'auto', width: '100%' }} width={800} />
    </ScrollReveal>
  )
  return (
    <section className={`${styles.innerSection} ${styles.innerSectionAlt}`} id="philosophy">
      <div className={styles.aboutStoryGrid}>
        {imageFirst ? (<>{imageCol}{textCol}</>) : (<>{textCol}{imageCol}</>)}
      </div>
    </section>
  )
}

const benefitsCardHeadingStyle = { fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' } as const

function BenefitsGrid({ block }: { block: CuriousLadooContentGridBlockData }) {
  return (
    <section className={`${styles.innerSection} ${styles.innerSectionAlt}`}>
      <ScrollReveal>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {renderHeading(block.header.title, block.header.subtitle)}
        </h2>
      </ScrollReveal>
      {block.header.description && (
        <ScrollReveal delay={1}>
          <p className={styles.sectionBody} style={{ margin: '0 auto 4rem', textAlign: 'center' }}>{block.header.description}</p>
        </ScrollReveal>
      )}
      <div className={styles.valuesGrid}>
        {block.items.map((item, i) => (
          <ScrollReveal delay={revealDelay(i, 3)} key={item.title}>
            <div className={styles.valueCard} style={{ height: '100%' }}>
              <h4 style={benefitsCardHeadingStyle}>{item.title}</h4>
              <p className={styles.sectionBody} style={{ color: 'var(--ch-text)', fontSize: '0.9rem' }}>{item.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function ContentGridSection({ block }: { block: CuriousLadooContentGridBlockData }) {
  if (block.items.length === 0) return null
  switch (block.presentation) {
    case 'pillars': return <PillarsGrid block={block} />
    case 'services': return <ServicesGrid block={block} />
    case 'b2b': return <B2BGrid block={block} />
    case 'edge': return <EdgeGrid block={block} />
    case 'industries': return <IndustriesGrid block={block} />
    case 'partners': return <PartnersGrid block={block} />
    case 'values': return <ValuesGrid block={block} />
    case 'mission-vision': return <MissionVisionGrid block={block} />
    case 'benefits': return <BenefitsGrid block={block} />
    default: return <GenericGrid block={block} />
  }
}

function BrandsGrid({ block }: { block: CuriousLadooBrandsShowcaseBlockData }) {
  return (
    <section aria-label="Our restaurant brands" className={styles.brandsSection} id="brands">
      <div className={styles.brandsHeader}>
        <div>
          {block.header.eyebrow && (
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>{block.header.eyebrow}</p>
            </ScrollReveal>
          )}
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle}>{renderHeading(block.header.title, block.header.subtitle)}</h2>
          </ScrollReveal>
        </div>
        <ScrollReveal>
          <Link className={styles.aboutLink} href="/brands">View All Brands →</Link>
        </ScrollReveal>
      </div>
      <div className={styles.brandsGrid}>
        {block.brands.map((brand, i) =>
          brand.comingSoon ? (
            <ScrollReveal delay={revealDelay(i, 4)} key={brand.id}>
              <article className={`${styles.brandCard} ${styles.brandFuture}`}>
                <div className={styles.brandFutureIcon}>{brand.mark || '+'}</div>
                <div className={styles.brandCardName}>{brand.name}</div>
                <div className={styles.brandCardType} style={{ color: 'var(--ch-text-muted)' }}>{brand.category}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--ch-text-muted)', textAlign: 'center', padding: '0 1.5rem', lineHeight: 1.6 }}>
                  {brand.description}
                </p>
              </article>
            </ScrollReveal>
          ) : (
            <ScrollReveal delay={revealDelay(i, 4)} key={brand.id}>
              <article className={styles.brandCard}>
                <div className={styles.brandCardBg}>
                  {brand.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt={brand.image.alt} loading="lazy" src={brand.image.src} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  )}
                </div>
                <div className={styles.brandCardOverlay} />
                <div className={styles.brandCardContent}>
                  <span className={styles.brandCardMark}>{brand.mark}</span>
                  <div className={styles.brandCardName}>{brand.name}</div>
                  <div className={styles.brandCardType}>{brand.category}</div>
                  <p className={styles.brandCardDesc}>{brand.description}</p>
                  <Link className={styles.brandCardExplore} href={brand.href}>Explore Brand →</Link>
                </div>
              </article>
            </ScrollReveal>
          ),
        )}
      </div>
    </section>
  )
}

function BrandSpotlightGrid({ block }: { block: CuriousLadooBrandsShowcaseBlockData }) {
  return (
    <section className={styles.innerSection}>
      <div className={styles.brandSpotlightSection}>
        {block.brands.filter((brand) => !brand.comingSoon).map((brand, i) => {
          const reverse = i % 2 === 1
          const imageCol = (
            <ScrollReveal className={styles.brandSpotlightImg} delay={revealDelay(i, 2)}>
              {brand.image && (
                <Image alt={brand.image.alt} fill loading="lazy" src={brand.image.src} style={{ objectFit: 'cover' }} />
              )}
              {(brand.statValue || brand.statLabel) && (
                <div className={styles.brandSpotlightAccentBox}>
                  <div className={styles.stat}>{brand.statValue}</div>
                  <div style={{ color: 'var(--ch-accent)', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {brand.statLabel}
                  </div>
                </div>
              )}
            </ScrollReveal>
          )
          const contentCol = (
            <div className={styles.brandSpotlightContent}>
              <ScrollReveal delay={1}>
                {brand.category && <span className={styles.brandBadge}>{brand.category}</span>}
                <h3>{brand.name}</h3>
                <p className={styles.sectionBody}>{brand.fullDescription}</p>
              </ScrollReveal>
              <ScrollReveal delay={2}>
                {brand.quote && <p className={styles.brandTestimonialQuote}>{brand.quote}</p>}
                {brand.links.length > 0 && (
                  <div className={styles.footerSocial} style={{ justifyContent: 'flex-start', marginTop: '1.5rem' }}>
                    {brand.links.map((link) => (
                      <SmartLink className={styles.footerSocialLink} href={link.url} key={link.label}>{link.label}</SmartLink>
                    ))}
                  </div>
                )}
              </ScrollReveal>
            </div>
          )
          return (
            <div className={`${styles.brandSpotlightItem} ${reverse ? styles.reverse : ''}`} id={brand.slug || undefined} key={brand.id}>
              {reverse ? (<>{contentCol}{imageCol}</>) : (<>{imageCol}{contentCol}</>)}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function BrandsShowcaseSection({ block }: { block: CuriousLadooBrandsShowcaseBlockData }) {
  if (block.brands.length === 0) return null
  return block.presentation === 'spotlight' ? <BrandSpotlightGrid block={block} /> : <BrandsGrid block={block} />
}

function StepsNumbered({ block }: { block: CuriousLadooStepsBlockData }) {
  return (
    <section aria-label="Our process" className={styles.howWeWorkSection} id="how-we-work">
      <div className={styles.howHeader}>
        {block.header.eyebrow && (
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>{block.header.eyebrow}</p>
          </ScrollReveal>
        )}
        <ScrollReveal delay={1}>
          <h2 className={styles.sectionTitle}>{block.header.title}</h2>
        </ScrollReveal>
        {block.header.description && (
          <ScrollReveal delay={2}>
            <p className={styles.sectionBody} style={{ textAlign: 'center', margin: '1rem auto 0' }}>{block.header.description}</p>
          </ScrollReveal>
        )}
      </div>
      <div className={styles.processTimeline}>
        {block.steps.map((step, i) => (
          <ScrollReveal delay={revealDelay(i)} key={step.title}>
            <div className={styles.processStep}>
              <div className={styles.processStepNum}>{step.label}</div>
              <div className={styles.processStepTitle}>{step.title}</div>
              <p className={styles.processStepDesc}>{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function StepsTimeline({ block }: { block: CuriousLadooStepsBlockData }) {
  return (
    <section aria-label="Our journey timeline" className={styles.journeySection} id="journey">
      <div className={styles.journeyHeader}>
        {block.header.eyebrow && (
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center', color: 'rgba(184,168,120,0.8)' }}>{block.header.eyebrow}</p>
          </ScrollReveal>
        )}
        <ScrollReveal delay={1}>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`} style={{ textAlign: 'center' }}>
            {renderHeading(block.header.title, block.header.subtitle)}
          </h2>
        </ScrollReveal>
      </div>
      <div className={styles.journeyTimeline}>
        {block.steps.map((step, i) => (
          <ScrollReveal delay={revealDelay(i)} key={step.title}>
            <div className={styles.journeyMilestone}>
              <div className={styles.journeyYear}>{step.label}</div>
              <div className={styles.journeyEvent}>{step.title}</div>
              <p className={styles.journeyDesc}>{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function StepsSection({ block }: { block: CuriousLadooStepsBlockData }) {
  if (block.steps.length === 0) return null
  return block.layoutVariant === 'timeline' ? <StepsTimeline block={block} /> : <StepsNumbered block={block} />
}

function StatsSection({ block }: { block: CuriousLadooStatsBlockData }) {
  if (block.stats.length === 0) return null
  return (
    <section aria-label="Our achievements" className={styles.metricsSection} id="metrics">
      <div className={styles.metricsGrid}>
        {block.stats.map((stat) => (
          <div className={styles.metricItem} key={stat.label}>
            {stat.animatedTarget !== null
              ? <AnimatedCounter suffix={stat.animatedSuffix} target={stat.animatedTarget} />
              : <span className={styles.metricNumber}>{stat.value}</span>}
            <div className={styles.metricLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function TestimonialsSection({ block }: { block: CuriousLadooTestimonialsBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section aria-label="Client stories" className={styles.testimonialsSection} id="testimonials">
      <div className={styles.testimonialsHeader}>
        {block.header.eyebrow && (
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ color: 'rgba(184,168,120,0.8)' }}>{block.header.eyebrow}</p>
          </ScrollReveal>
        )}
        <ScrollReveal delay={1}>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
            {renderHeading(block.header.title, block.header.subtitle)}
          </h2>
        </ScrollReveal>
      </div>
      <div className={styles.testimonialsGrid}>
        {block.items.map((item, i) => (
          <ScrollReveal className={styles.hFull} delay={revealDelay(i, 3)} key={item.id}>
            <article className={styles.testimonialCard}>
              <span aria-hidden="true" className={styles.testimonialQuoteMark}>&ldquo;</span>
              <p className={styles.testimonialText}>{item.quote}</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.testimonialAvatar}>
                  {item.photo
                    ? <Image alt={item.photo.alt} height={48} src={item.photo.src} style={{ objectFit: 'cover' }} width={48} />
                    : item.initials}
                </div>
                <div>
                  <div className={styles.testimonialName}>{item.name}</div>
                  <div className={styles.testimonialRole}>{item.role}</div>
                </div>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function JournalSection({ block }: { block: CuriousLadooBlogPreviewBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section aria-label="Insights and journal" className={styles.journalSection} id="journal">
      <div className={styles.journalHeader}>
        <div>
          {block.header.eyebrow && (
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>{block.header.eyebrow}</p>
            </ScrollReveal>
          )}
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle}>{renderHeading(block.header.title, block.header.subtitle)}</h2>
          </ScrollReveal>
        </div>
        <ScrollReveal>
          <Link className={styles.aboutLink} href="/blog">Explore All Articles →</Link>
        </ScrollReveal>
      </div>
      <div className={styles.journalGrid}>
        {block.items.map((article, i) => (
          <ScrollReveal className={styles.hFull} delay={revealDelay(i, 3)} key={article.id}>
            <article className={styles.journalCard}>
              {article.image && (
                <div className={styles.journalCardImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={article.image.alt} loading="lazy" src={article.image.src} style={{ height: '100%', objectFit: 'cover', width: '100%' }} />
                </div>
              )}
              <div className={styles.journalCardBody}>
                {article.tag && <div className={styles.journalCardTag}>{article.tag}</div>}
                <h3 className={styles.journalCardTitle}>{article.title}</h3>
                <p className={styles.journalCardExcerpt}>{article.excerpt}</p>
                <div className={styles.journalCardMeta}>{article.date}</div>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function TeamSection({ block }: { block: CuriousLadooTeamBlockData }) {
  if (block.members.length === 0) return null
  return (
    <section aria-label="Our leadership team" className={styles.leadershipSection} id="leadership">
      <div className={styles.leadershipHeader}>
        {block.header.eyebrow && (
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>{block.header.eyebrow}</p>
          </ScrollReveal>
        )}
        <ScrollReveal delay={1}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
            {renderHeading(block.header.title, block.header.subtitle)}
          </h2>
        </ScrollReveal>
        {block.header.description && (
          <ScrollReveal delay={2}>
            <p className={styles.sectionBody} style={{ textAlign: 'center', marginTop: '1rem' }}>{block.header.description}</p>
          </ScrollReveal>
        )}
      </div>
      <div className={styles.leadershipGrid}>
        {block.members.map((member, i) => (
          <ScrollReveal delay={revealDelay(i, 3)} key={member.id}>
            <article className={styles.leaderCard}>
              {member.photo && (
                <div className={styles.leaderPhoto}>
                  <Image alt={member.photo.alt} fill loading="lazy" src={member.photo.src} style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div className={styles.leaderName}>{member.name}</div>
              <div className={styles.leaderRole}>{member.role}</div>
              <p className={styles.leaderBio}>{member.bio}</p>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function CTASection({ block, siteName }: { block: CuriousLadooCTABlockData; siteName: string }) {
  if (!block.header.title) return null
  const bgWord = (siteName.split(/\s+/)[0] || 'CURIOUS').toUpperCase()
  return (
    <section aria-label="Call to action" className={styles.ctaSection} id="cta">
      <div aria-hidden="true" className={styles.ctaBgText}>{bgWord}</div>
      {block.header.eyebrow && (
        <ScrollReveal>
          <p className={styles.ctaEyebrow}>{block.header.eyebrow}</p>
        </ScrollReveal>
      )}
      <ScrollReveal delay={1}>
        <h2 className={styles.ctaTitle}>{renderHeading(block.header.title, block.header.subtitle)}</h2>
      </ScrollReveal>
      {block.header.description && (
        <ScrollReveal delay={2}>
          <p className={styles.ctaBody}>{block.header.description}</p>
        </ScrollReveal>
      )}
      {(block.primaryCTA || block.secondaryCTA) && (
        <ScrollReveal delay={3}>
          <div className={styles.ctaButtons}>
            {block.primaryCTA && (
              <SmartLink className={styles.btnWhite} href={block.primaryCTA.url}>{block.primaryCTA.label} →</SmartLink>
            )}
            {block.secondaryCTA && (
              <SmartLink className={styles.btnOutlineWhite} href={block.secondaryCTA.url}>{block.secondaryCTA.label} ↗</SmartLink>
            )}
          </div>
        </ScrollReveal>
      )}
    </section>
  )
}

function CapabilitySection({ block }: { block: CuriousLadooCapabilityBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className={styles.innerSection}>
      <div className={styles.servicesOverviewIntro}>
        <div>
          <ScrollReveal>
            <h2 className={styles.sectionTitle}>{renderHeading(block.header.title, block.header.subtitle)}</h2>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <div className={styles.brushDivider} />
          </ScrollReveal>
        </div>
        {block.header.description && (
          <div>
            <ScrollReveal delay={2}>
              <p className={styles.sectionBody}>{block.header.description}</p>
            </ScrollReveal>
          </div>
        )}
      </div>
      <div className={styles.serviceDetailsWrap}>
        {block.items.map((item, i) => (
          <div className={`${styles.serviceDetailBlock} ${item.reverse ? styles.reverse : ''}`} id={item.anchorId || undefined} key={item.title}>
            {item.image && (
              <ScrollReveal className={styles.serviceDetailImageWrap} delay={revealDelay(i, 2)}>
                <Image alt={item.image.alt} fill loading="lazy" src={item.image.src} style={{ objectFit: 'cover' }} />
              </ScrollReveal>
            )}
            <div className={styles.serviceDetailContent}>
              <ScrollReveal delay={1}>
                {item.number && <span className={styles.sectionEyebrow}>{item.number}</span>}
                <h3>{item.title}</h3>
                <p className={styles.sectionBody} style={{ marginBottom: '1.5rem' }}>{item.description}</p>
              </ScrollReveal>
              {item.features.length > 0 && (
                <ScrollReveal delay={2}>
                  <div className={styles.serviceDetailFeatures}>
                    {item.features.map((feature) => (
                      <div className={styles.serviceFeatureItem} key={feature}>
                        <span>✓</span> {feature}
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              )}
              {item.link && (
                <ScrollReveal delay={3}>
                  <SmartLink className={styles.aboutLink} href={item.link.url}>{item.link.label}</SmartLink>
                </ScrollReveal>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function FAQSection({ block }: { block: CuriousLadooFAQBlockData }) {
  if (block.items.length === 0) return null
  return (
    <section className={styles.innerSection}>
      <ScrollReveal>
        <h2 className={styles.sectionTitle} style={{ marginBottom: block.header.description ? '1rem' : '4rem', textAlign: 'center' }}>
          {renderHeading(block.header.title, block.header.subtitle)}
        </h2>
      </ScrollReveal>
      {block.header.description && (
        <ScrollReveal delay={1}>
          <p className={styles.sectionBody} style={{ margin: '0 auto 4rem', textAlign: 'center' }}>{block.header.description}</p>
        </ScrollReveal>
      )}
      <FAQAccordion items={block.items} />
    </section>
  )
}

/** Narrative + bulleted list beside an optional decorative callout box — matches the Brands page's "Collaborations & Future Projects" section. */
function PipelineSection({ block }: { block: CuriousLadooPipelineBlockData }) {
  if (!block.header.title && block.items.length === 0) return null
  const spotlightFirst = block.spotlightPosition === 'left'
  const textCol = (
    <div>
      {block.header.eyebrow && (
        <ScrollReveal>
          <span className={styles.sectionEyebrow}>{block.header.eyebrow}</span>
        </ScrollReveal>
      )}
      <ScrollReveal delay={1}>
        <h2 className={styles.sectionTitle}>{renderHeading(block.header.title, block.header.subtitle)}</h2>
      </ScrollReveal>
      <ScrollReveal delay={2}>
        <div className={styles.brushDivider} />
        {block.header.description && (
          <p className={styles.sectionBody} style={{ marginBottom: '1.5rem' }}>{block.header.description}</p>
        )}
        {block.items.length > 0 && (
          <ul style={{ listStyle: 'none', marginBottom: '2rem', paddingLeft: 0 }}>
            {block.items.map((item, i) => (
              <li key={item.label} style={{ color: 'var(--ch-text)', fontSize: '1rem', marginBottom: i === 0 ? '1rem' : '0' }}>
                <strong>✦ {item.label}</strong> {item.description}
              </li>
            ))}
          </ul>
        )}
      </ScrollReveal>
      {block.link && (
        <ScrollReveal delay={3}>
          <SmartLink className={styles.aboutLink} href={block.link.url}>{block.link.label}</SmartLink>
        </ScrollReveal>
      )}
    </div>
  )
  const spotlightCol = block.spotlight && (
    <ScrollReveal
      className={styles.aboutStoryImage}
      delay={1}
      style={{ alignItems: 'center', background: 'var(--ch-surface-2)', border: '1px solid var(--ch-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      {block.spotlight.icon && <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>{block.spotlight.icon}</span>}
      {block.spotlight.title && (
        <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{block.spotlight.title}</h4>
      )}
      {block.spotlight.description && (
        <p className={styles.sectionBody} style={{ fontSize: '0.9rem', padding: '0 2rem', textAlign: 'center' }}>{block.spotlight.description}</p>
      )}
    </ScrollReveal>
  )
  return (
    <section className={`${styles.innerSection} ${styles.innerSectionAlt}`} id="future">
      <div className={styles.aboutStoryGrid}>
        {spotlightFirst ? (<>{spotlightCol}{textCol}</>) : (<>{textCol}{spotlightCol}</>)}
      </div>
    </section>
  )
}

function CMSHomeBlock({ block, pageType, siteName }: { block: CuriousLadooHomeBlockData; pageType: string; siteName: string }) {
  switch (block.type) {
    case 'hero': return pageType === 'home' ? <HeroSection block={block} /> : <InnerHeroSection block={block} />
    case 'ticker': return <TickerSection block={block} />
    case 'story': return <StorySection block={block} />
    case 'contentgrid': return <ContentGridSection block={block} />
    case 'brandsshowcase': return <BrandsShowcaseSection block={block} />
    case 'steps': return <StepsSection block={block} />
    case 'stats': return <StatsSection block={block} />
    case 'testimonials': return <TestimonialsSection block={block} />
    case 'capability': return <CapabilitySection block={block} />
    case 'faq': return <FAQSection block={block} />
    case 'pipeline': return <PipelineSection block={block} />
    case 'blogpreview': return <JournalSection block={block} />
    case 'team': return <TeamSection block={block} />
    case 'cta': return <CTASection block={block} siteName={siteName} />
    default: return null
  }
}

export function CMSHomePage({ content }: { content: CuriousLadooHomeContent }) {
  const page = content.page
  if (!page) return null
  return (
    <>
      {content.layout.map((block, index) => (
        <CMSHomeBlock block={block} key={`${block.type}-${index}`} pageType={page.pageType} siteName={content.site.name} />
      ))}
    </>
  )
}
