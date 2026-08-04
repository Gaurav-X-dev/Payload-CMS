import Image from 'next/image'
import Link from 'next/link'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { ScrollReveal } from '../components/ScrollReveal'
import { Ticker } from '../components/Ticker'
import { homeData } from '../data/home'
import type { TickerBrandData } from '../types'

const TICKER_BRANDS: TickerBrandData[] = [
  { icon: '◈', name: 'Cloud Kitchen', description: 'Delivery-first · Systems that scale.' },
  { icon: '九小', name: 'Zuru Zuru', description: 'Japanese Izakaya · Comfort food. Good times.' },
  { icon: '✦', iconStyle: '1.4rem', name: 'Ghee Roast', description: 'South Indian Cuisine · Coastal flavours. Bold & soulful.' },
  { icon: '⬡⬡', name: 'Z-Quick', description: 'Quick service · Great taste. Made for now.' },
  { icon: '+', name: 'Future Brands', description: "What's next · More experiences coming soon." },
  { icon: 'CL', iconStyle: '0.9rem', name: 'Consulting', description: 'Strategy · Brand · Operations' },
]
import styles from '../components/Theme.module.css'

export function HomePage() {
  return (
    <>
      {/* HERO */}
      <section aria-label="Hero" className={styles.heroSection} id="hero-theme-3">
        <div className={styles.t3Content}>
          <h1 className={styles.t3Headline}>
            We question. We design.
            <br />
            <span className={styles.t3Accent}>We build what&apos;s next.</span>
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
          <p className={styles.t3Body}>
            A hospitality company for a different kind of future. We build restaurant brands with
            curiosity, systems and soul.
          </p>
          <div className={styles.t3Actions}>
            <Link className={styles.t3BtnDark} href="#services">
              EXPLORE OUR WORK →
            </Link>
            <Link className={styles.t3BtnGhost} href="#cta">
              LET&apos;S COLLABORATE →
            </Link>
          </div>
        </div>
        <div className={styles.t3Visuals}>
          {/* Native img tag ensures object-fit: cover; object-position: left top renders the full right graphic panel */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Restaurant Interior with Editorial Design Elements"
            className={styles.t3CompositeImg}
            id="heroBg-t3"
            src="/themes/curious-hub/images/t3_composite.jpg"
          />
          <div aria-label="Japanese brand text" className={styles.t3JapaneseText}>
            <span>本物の体験</span>
            <span>長く残るブランド</span>
          </div>
        </div>
      </section>

      {/* BRANDS TICKER */}
      <Ticker brands={TICKER_BRANDS} />

      {/* ABOUT SECTION */}
      <section aria-label="About Curious Laddoos" className={styles.aboutSection} id="about">
        <div className={styles.aboutText}>
          <ScrollReveal>
            <p className={styles.sectionEyebrow}>Hospitality Reimagined</p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle}>
              We don&apos;t just
              <br />
              open restaurants.
              <br />
              We <em className={styles.italic}>build systems.</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <div className={styles.brushDivider} />
            <blockquote className={styles.aboutQuote}>
              &ldquo;Curious by nature. Deliberate by design. Enduring by systems.&rdquo;
            </blockquote>
          </ScrollReveal>
          <ScrollReveal delay={3}>
            <p className={styles.sectionBody}>
              Curious Laddoos is a multi-service hospitality group based in New Delhi. We own and
              operate restaurant brands, provide B2B consulting, design menus, build cloud kitchens,
              and help other hospitality businesses scale through systems, technology, and training.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={4}>
            <Link className={styles.aboutLink} href="#services">
              Explore All Services <span>→</span>
            </Link>
          </ScrollReveal>
        </div>
        <ScrollReveal className={styles.aboutImageStack} delay={2}>
          <div className={styles.aboutImgMain}>
            <Image
              alt="Premium restaurant interior by Curious Laddoos"
              fill
              loading="lazy"
              src="/themes/curious-hub/images/hero.png"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={styles.aboutImgAccent}>
            <Image
              alt="Kitchen systems and operations"
              fill
              loading="lazy"
              src="/themes/curious-hub/images/journal1.png"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={styles.aboutTag}>
            <span className={styles.aboutTagBig}>15+</span>
            Hospitality
            <br />
            Services
          </div>
        </ScrollReveal>
      </section>

      {/* PHILOSOPHY */}
      <section aria-label="Our philosophy" className={styles.philosophySection} id="philosophy">
        <div aria-hidden="true" className={styles.philosophyBgText}>
          PHILOSOPHY
        </div>
        <div className={styles.philosophyHeader}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow} style={{ color: 'rgba(184,168,120,0.8)' }}>
                Our Philosophy
              </p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
                How We
                <br />
                <em style={{ color: 'var(--ch-accent)' }}>Think.</em>
              </h2>
            </ScrollReveal>
          </div>
          <div className={styles.philosophyHeaderRight}>
            <ScrollReveal delay={2}>
              <p className={`${styles.sectionBody} ${styles.sectionBodyLight}`}>
                We build at the intersection of curiosity, creativity, and conviction. Thoughtful
                systems. Human experiences. Enduring brands.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <div className={styles.brushDivider} style={{ background: 'rgba(184,168,120,0.4)' }} />
            </ScrollReveal>
          </div>
        </div>
        <div className={styles.philosophyPillars}>
          {/* 01 — Question */}
          <ScrollReveal delay={0}>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>01</div>
              <svg aria-hidden="true" className={styles.pillarIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20"/>
                <path d="M24 14v20M14 24h20"/>
              </svg>
              <div className={styles.pillarTitle}>Question</div>
              <p className={styles.pillarDesc}>Curiosity drives better ideas. We question assumptions before we design solutions.</p>
            </div>
          </ScrollReveal>
          {/* 02 — Design */}
          <ScrollReveal delay={1}>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>02</div>
              <svg aria-hidden="true" className={styles.pillarIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48">
                <rect height="32" rx="2" width="32" x="8" y="8"/>
                <path d="M8 20h32M20 8v32"/>
              </svg>
              <div className={styles.pillarTitle}>Design</div>
              <p className={styles.pillarDesc}>Intentional design creates meaning. Experience first — always. Spaces that shape behaviour.</p>
            </div>
          </ScrollReveal>
          {/* 03 — Build */}
          <ScrollReveal delay={2}>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>03</div>
              <svg aria-hidden="true" className={styles.pillarIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48">
                <path d="M8 40l10-16 8 8 8-24 6 32"/>
              </svg>
              <div className={styles.pillarTitle}>Build</div>
              <p className={styles.pillarDesc}>Systems bring clarity. People bring life. We build processes that create consistency at scale.</p>
            </div>
          </ScrollReveal>
          {/* 04 — People */}
          <ScrollReveal delay={3}>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>04</div>
              <svg aria-hidden="true" className={styles.pillarIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48">
                <circle cx="24" cy="20" r="8"/>
                <path d="M8 40c0-8.84 7.16-16 16-16s16 7.16 16 16"/>
              </svg>
              <div className={styles.pillarTitle}>People</div>
              <p className={styles.pillarDesc}>Culture builds what strategy can&apos;t. We invest in people at every level of the hospitality ecosystem.</p>
            </div>
          </ScrollReveal>
          {/* 05 — Care */}
          <ScrollReveal delay={4}>
            <div className={styles.pillar}>
              <div className={styles.pillarNum}>05</div>
              <svg aria-hidden="true" className={styles.pillarIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48">
                <path d="M24 4l4 12h12l-10 8 4 12-10-8-10 8 4-12L8 16h12z"/>
              </svg>
              <div className={styles.pillarTitle}>Care</div>
              <p className={styles.pillarDesc}>Hospitality is at our core — always. Every brand we build is rooted in genuine human care.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SERVICES */}
      <section aria-label="Our services" className={styles.servicesSection} id="services">
        <div className={styles.servicesHeader}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>What We Offer</p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                15 Services.
                <br />
                <em className={styles.italic}>One Vision.</em>
              </h2>
            </ScrollReveal>
          </div>
          <div className={styles.servicesHeaderRight}>
            <ScrollReveal>
              <p className={styles.sectionBody}>
                From concept to operations, from brand strategy to kitchen planning — our services
                are built for the future of hospitality in India and beyond.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <Link className={styles.aboutLink} href="#cta">
                Partner With Us →
              </Link>
            </ScrollReveal>
          </div>
        </div>
        <div className={styles.servicesGrid}>
          {/* 01 — Restaurant Brands */}
          <ScrollReveal delay={0}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>01</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><path d="M4 36V10l16-6 16 6v26"/><rect height="16" rx="1" width="12" x="14" y="20"/></svg>
            <div className={styles.serviceCardTitle}>Restaurant Brands</div>
            <p className={styles.serviceCardDesc}>We create and operate distinct restaurant brands with unique identities, menus, and guest experiences.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 02 — Delivery Services */}
          <ScrollReveal delay={1}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>02</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16"/><path d="M20 4v16l10 6"/></svg>
            <div className={styles.serviceCardTitle}>Delivery Services</div>
            <p className={styles.serviceCardDesc}>Premium delivery operations with efficient cloud kitchen infrastructure and logistics management.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 03 — Cloud Kitchen */}
          <ScrollReveal delay={2}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>03</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><rect height="24" rx="2" width="32" x="4" y="8"/><path d="M4 16h32M14 8v24"/></svg>
            <div className={styles.serviceCardTitle}>Cloud Kitchen</div>
            <p className={styles.serviceCardDesc}>Delivery-first kitchen models designed for maximum efficiency, scalability, and brand consistency.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 04 — Hospitality Consulting */}
          <ScrollReveal delay={3}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>04</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><path d="M8 32l6-6 6 6 12-16"/><circle cx="32" cy="12" r="4"/></svg>
            <div className={styles.serviceCardTitle}>Hospitality Consulting</div>
            <p className={styles.serviceCardDesc}>Strategic consulting for restaurant launches, turnarounds, SOP development, and growth planning.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 05 — Menu Engineering */}
          <ScrollReveal delay={0}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>05</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><rect height="28" rx="2" width="28" x="6" y="6"/><path d="M6 18h28M18 6v28"/></svg>
            <div className={styles.serviceCardTitle}>Menu Engineering</div>
            <p className={styles.serviceCardDesc}>Data-driven menu design that balances profitability, guest preference, and culinary excellence.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 06 — Restaurant Design */}
          <ScrollReveal delay={1}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>06</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><path d="M4 20h32M20 4l10 16-10 16-10-16z"/></svg>
            <div className={styles.serviceCardTitle}>Restaurant Design</div>
            <p className={styles.serviceCardDesc}>Interior concepts and spatial planning that create environments guests return to again and again.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 07 — Brand Strategy */}
          <ScrollReveal delay={2}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>07</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16"/><path d="M12 20l6 6 10-12"/></svg>
            <div className={styles.serviceCardTitle}>Brand Strategy</div>
            <p className={styles.serviceCardDesc}>Full brand architecture — from naming and identity to positioning, tone of voice, and visual language.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 08 — Operations Management */}
          <ScrollReveal delay={3}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>08</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><path d="M8 8h24v24H8z"/><path d="M14 16h12M14 20h8M14 24h10"/></svg>
            <div className={styles.serviceCardTitle}>Operations Management</div>
            <p className={styles.serviceCardDesc}>SOPs, training frameworks, quality control systems, and ongoing operational support for teams.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 09 — Franchise Development */}
          <ScrollReveal delay={0}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>09</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><path d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16"/><path d="M28 4l8 8-8 8"/></svg>
            <div className={styles.serviceCardTitle}>Franchise Development</div>
            <p className={styles.serviceCardDesc}>Complete franchise systems — model development, documentation, partner selection, and launch support.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 10 — Kitchen Planning */}
          <ScrollReveal delay={1}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>10</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><rect height="14" rx="1" width="14" x="4" y="4"/><rect height="14" rx="1" width="14" x="22" y="4"/><rect height="14" rx="1" width="14" x="4" y="22"/><rect height="14" rx="1" width="14" x="22" y="22"/></svg>
            <div className={styles.serviceCardTitle}>Kitchen Planning</div>
            <p className={styles.serviceCardDesc}>Commercial kitchen design, equipment planning, workflow optimization, and compliance guidance.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 11 — Technology Solutions */}
          <ScrollReveal delay={2}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>11</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><rect height="24" rx="2" width="32" x="4" y="8"/><path d="M16 20l-6 4V16l6 4zm4 0h8"/></svg>
            <div className={styles.serviceCardTitle}>Technology Solutions</div>
            <p className={styles.serviceCardDesc}>POS systems, inventory management, analytics dashboards, and digital ordering integrations.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 12 — Staff Training */}
          <ScrollReveal delay={3}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>12</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><circle cx="14" cy="20" r="8"/><circle cx="28" cy="14" r="6"/><circle cx="28" cy="28" r="5"/><path d="M21 16l5-2M21 24l5 2"/></svg>
            <div className={styles.serviceCardTitle}>Staff Training</div>
            <p className={styles.serviceCardDesc}>Comprehensive training programs for FOH, BOH, management, and hospitality service standards.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 13 — Investment Partnerships */}
          <ScrollReveal delay={0}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>13</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><path d="M20 4l4 8 8 2-6 6 2 8-8-4-8 4 2-8-6-6 8-2z"/></svg>
            <div className={styles.serviceCardTitle}>Investment Partnerships</div>
            <p className={styles.serviceCardDesc}>Strategic investment in promising hospitality concepts — from seed to scale with full operational support.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 14 — Managed Services */}
          <ScrollReveal delay={1}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>14</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><path d="M8 12h24v16H8z"/><path d="M12 28l4 4M28 28l-4 4"/></svg>
            <div className={styles.serviceCardTitle}>Managed Services</div>
            <p className={styles.serviceCardDesc}>End-to-end restaurant management for operators who want professional systems without the overhead.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
          {/* 15 — New Brand Development */}
          <ScrollReveal delay={2}><article className={styles.serviceCard}>
            <div className={styles.serviceCardNum}>15</div>
            <svg aria-hidden="true" className={styles.serviceCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 40 40"><path d="M20 4v32M4 20h32"/><circle cx="20" cy="20" r="8"/></svg>
            <div className={styles.serviceCardTitle}>New Brand Development</div>
            <p className={styles.serviceCardDesc}>Full-cycle concept creation — market research, naming, identity, menu, design, and launch strategy.</p>
            <Link className={styles.serviceCardLink} href="/services">Explore →</Link>
          </article></ScrollReveal>
        </div>
      </section>

      {/* BRANDS */}
      <section aria-label="Our restaurant brands" className={styles.brandsSection} id="brands">
        <div className={styles.brandsHeader}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>Restaurant Brands</p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                Distinct Identities.
                <br />
                <em className={styles.italic}>Shared Principles.</em>
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal>
            <Link className={styles.aboutLink} href="/brands">
              View All Brands →
            </Link>
          </ScrollReveal>
        </div>
        <div className={styles.brandsGrid}>
          {/* Zuru Zuru */}
          <ScrollReveal delay={0}>
            <article className={styles.brandCard}>
              <div className={styles.brandCardBg}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Zuru Zuru — Japanese Izakaya restaurant" loading="lazy" src="/themes/curious-hub/images/zuru_zuru.png" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
              <div className={styles.brandCardOverlay} />
              <div className={styles.brandCardContent}>
                <span className={styles.brandCardMark}>九小</span>
                <div className={styles.brandCardName}>Zuru Zuru</div>
                <div className={styles.brandCardType}>Japanese Izakaya</div>
                <p className={styles.brandCardDesc}>Comfort food. Reliably good times. A Japanese izakaya experience built for the Indian palate.</p>
                <Link className={styles.brandCardExplore} href="/brands" id="brand-zuruzuru-link">Explore Brand →</Link>
              </div>
            </article>
          </ScrollReveal>
          {/* Ghee Roast */}
          <ScrollReveal delay={1}>
            <article className={styles.brandCard}>
              <div className={styles.brandCardBg}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Ghee Roast — South Indian coastal restaurant" loading="lazy" src="/themes/curious-hub/images/ghee_roast.png" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
              <div className={styles.brandCardOverlay} />
              <div className={styles.brandCardContent}>
                <span className={styles.brandCardMark} style={{ fontSize: '1.5rem' }}>✦</span>
                <div className={styles.brandCardName}>Ghee Roast</div>
                <div className={styles.brandCardType}>South Indian Cuisine</div>
                <p className={styles.brandCardDesc}>Coastal flavours. Bold and soulful. South Indian cuisine celebrated with modern design and pride.</p>
                <Link className={styles.brandCardExplore} href="/brands" id="brand-ghee-link">Explore Brand →</Link>
              </div>
            </article>
          </ScrollReveal>
          {/* Z-Quick */}
          <ScrollReveal delay={2}>
            <article className={styles.brandCard}>
              <div className={styles.brandCardBg}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Z-Quick — Premium delivery brand" loading="lazy" src="/themes/curious-hub/images/zquick.png" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
              <div className={styles.brandCardOverlay} />
              <div className={styles.brandCardContent}>
                <span className={styles.brandCardMark}>⬡⬡</span>
                <div className={styles.brandCardName}>Z-Quick</div>
                <div className={styles.brandCardType}>Quick Service &amp; Delivery</div>
                <p className={styles.brandCardDesc}>Great taste. Made fast. Made for now. Premium delivery-first brand built for the modern urban consumer.</p>
                <Link className={styles.brandCardExplore} href="/brands" id="brand-zquick-link">Explore Brand →</Link>
              </div>
            </article>
          </ScrollReveal>
          {/* Future Brands */}
          <ScrollReveal delay={3}>
            <article className={`${styles.brandCard} ${styles.brandFuture}`}>
              <div className={styles.brandFutureIcon}>+</div>
              <div className={styles.brandCardName}>Future Brands</div>
              <div className={styles.brandCardType} style={{ color: 'var(--ch-text-muted)' }}>What&apos;s Next</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--ch-text-muted)', textAlign: 'center', padding: '0 1.5rem', lineHeight: 1.6 }}>
                More experiences coming soon. We&apos;re always building what&apos;s next in hospitality.
              </p>
            </article>
          </ScrollReveal>
        </div>
      </section>

      {/* B2B */}
      <section aria-label="B2B solutions and partnerships" className={styles.b2bSection} id="b2b">
        <div aria-hidden="true" className={styles.b2bBgAccent} />
        <div className={styles.b2bLayout}>
          <div className={styles.b2bLeft}>
            <ScrollReveal>
              <p className={styles.sectionEyebrow} style={{ color: 'rgba(184,168,120,0.8)' }}>
                Partner With Us
              </p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
                B2B
                <br />
                <em style={{ color: 'var(--ch-accent)' }}>Solutions.</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className={styles.brushDivider} style={{ background: 'rgba(184,168,120,0.3)' }} />
              <p className={`${styles.sectionBody} ${styles.sectionBodyLight}`}>
                We&apos;re always open to conversations with investors, franchise partners,
                landlords, and suppliers who share our vision for the future of hospitality.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <a
                className={styles.aboutLink}
                href="mailto:hello@curiousladdoos.com"
                style={{ color: 'var(--ch-accent)' }}
              >
                hello@curiousladdoos.com →
              </a>
            </ScrollReveal>
          </div>
          <div className={styles.b2bCards}>
            {/* Investors */}
            <ScrollReveal delay={0}>
              <article className={styles.b2bCard}>
                <svg aria-hidden="true" className={styles.b2bCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 44 44">
                  <path d="M22 4l5 10 11 2.5-8 8 2 11-10-5.5-10 5.5 2-11-8-8 11-2.5z"/>
                </svg>
                <div className={styles.b2bCardTitle}>Investors</div>
                <p className={styles.b2bCardDesc}>Strategic investment in our brands and new concepts. We co-create with partners who bring capital and conviction.</p>
                <a className={styles.b2bCardLink} href="mailto:hello@curiousladdoos.com" id="b2b-investors-link">Build With Us →</a>
              </article>
            </ScrollReveal>
            {/* Franchise Partners */}
            <ScrollReveal delay={1}>
              <article className={styles.b2bCard}>
                <svg aria-hidden="true" className={styles.b2bCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18"/>
                  <path d="M14 22l6 6 10-12"/>
                </svg>
                <div className={styles.b2bCardTitle}>Franchise Partners</div>
                <p className={styles.b2bCardDesc}>Grow with proven brands. Our franchise model comes with full systems, training, and ongoing operational support.</p>
                <a className={styles.b2bCardLink} href="mailto:hello@curiousladdoos.com" id="b2b-franchise-link">Grow With Us →</a>
              </article>
            </ScrollReveal>
            {/* Landlords & Spaces */}
            <ScrollReveal delay={2}>
              <article className={styles.b2bCard}>
                <svg aria-hidden="true" className={styles.b2bCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 44 44">
                  <rect height="28" rx="2" width="36" x="4" y="8"/>
                  <path d="M4 18h36M16 8v28"/>
                </svg>
                <div className={styles.b2bCardTitle}>Landlords &amp; Spaces</div>
                <p className={styles.b2bCardDesc}>We&apos;re looking for premium locations across India. Retail spaces, high streets, and mixed-use developments.</p>
                <a className={styles.b2bCardLink} href="mailto:hello@curiousladdoos.com" id="b2b-landlords-link">Partner With Us →</a>
              </article>
            </ScrollReveal>
            {/* Suppliers & Vendors */}
            <ScrollReveal delay={3}>
              <article className={styles.b2bCard}>
                <svg aria-hidden="true" className={styles.b2bCardIcon} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 44 44">
                  <path d="M6 36V16L22 6l16 10v20"/>
                  <rect height="14" rx="1" width="16" x="14" y="22"/>
                </svg>
                <div className={styles.b2bCardTitle}>Suppliers &amp; Vendors</div>
                <p className={styles.b2bCardDesc}>Quality ingredients, equipment, and services — we work with suppliers who share our commitment to excellence.</p>
                <a className={styles.b2bCardLink} href="mailto:hello@curiousladdoos.com" id="b2b-suppliers-link">Work With Us →</a>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section aria-label="Our process" className={styles.howWeWorkSection} id="how-we-work">
        <div className={styles.howHeader}>
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>
              Our Process
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle}>How We Build</h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className={styles.sectionBody} style={{ textAlign: 'center', margin: '1rem auto 0' }}>
              Every successful hospitality brand is built on a repeatable, intentional process.
              Here&apos;s ours.
            </p>
          </ScrollReveal>
        </div>
        <div className={styles.processTimeline}>
          {homeData.processSteps.map((step, i) => (
            <ScrollReveal delay={(i % 5) as 0 | 1 | 2 | 3 | 4} key={step.title}>
              <div className={styles.processStep}>
                <div className={styles.processStepNum}>{step.number}</div>
                <div className={styles.processStepTitle}>{step.title}</div>
                <p className={styles.processStepDesc}>{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* OUR EDGE */}
      <section aria-label="Our competitive edge" className={styles.ourEdgeSection} id="our-edge">
        <ScrollReveal className={styles.edgeImage}>
          <div className={styles.edgeImageInner}>
            <Image
              alt="Curious Laddoos team in strategic consulting"
              fill
              loading="lazy"
              src="/themes/curious-hub/images/consulting.png"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </ScrollReveal>
        <div>
          <ScrollReveal>
            <p className={styles.sectionEyebrow}>Why Choose Us</p>
          </ScrollReveal>
          <div aria-hidden="true" className={styles.edgeBgText}>EDGE</div>
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle}>
              Our
              <br />
              <em className={styles.italic}>Difference.</em>
            </h2>
          </ScrollReveal>
          <div className={styles.edgePoints}>
            {homeData.edgePoints.map((pt, i) => (
              <ScrollReveal delay={(i % 4) as 0 | 1 | 2 | 3 | 4} key={pt.title}>
                <div className={styles.edgePoint}>
                  <div className={styles.edgePointIcon}>{pt.icon}</div>
                  <div>
                    <div className={styles.edgePointTitle}>{pt.title}</div>
                    <p className={styles.edgePointDesc}>{pt.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section aria-label="Our achievements" className={styles.metricsSection} id="metrics">
        <div className={styles.metricsGrid}>
          {homeData.metrics.map((m, i) => (
            <div className={styles.metricItem} key={m.label}>
              <AnimatedCounter suffix={m.suffix} target={m.target} />
              <div className={styles.metricLabel}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VISUAL STORY */}
      <section aria-label="Visual story" className={styles.visualStorySection} id="visual-story">
        <div className={styles.visualStoryBg}>
          <Image
            alt="Cinematic restaurant atmosphere — Curious Laddoos"
            fill
            loading="lazy"
            src="/themes/curious-hub/images/visual_story.png"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className={styles.visualStoryOverlay} />
        <div className={styles.visualStoryContent}>
          <div className={styles.visualStoryText}>
            <ScrollReveal>
              <blockquote className={styles.visualStoryQuote}>
                &ldquo;We don&apos;t just run restaurants.
                <br />
                We build hospitality businesses.&rdquo;
              </blockquote>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <p className={styles.visualStoryAttr}>— CL Philosophy</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section aria-label="Industries we serve" className={styles.industriesSection} id="industries">
        <div className={styles.industriesHeader}>
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>
              Scope of Work
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
              Industries We <em className={styles.italic}>Serve.</em>
            </h2>
          </ScrollReveal>
        </div>
        <div className={styles.industriesGrid}>
          {homeData.industries.map((ind, i) => (
            <ScrollReveal delay={(i % 4) as 0 | 1 | 2 | 3 | 4} key={ind.name}>
              <div className={styles.industryItem}>
                <span className={styles.industryIcon}>{ind.icon}</span>
                <div className={styles.industryName}>{ind.name}</div>
                <p className={styles.industryDesc}>{ind.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section aria-label="Client stories" className={styles.testimonialsSection} id="testimonials">
        <div className={styles.testimonialsHeader}>
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ color: 'rgba(184,168,120,0.8)' }}>
              Client Stories
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
              Voices That
              <br />
              <em style={{ color: 'var(--ch-accent)', fontStyle: 'italic' }}>Trust Us.</em>
            </h2>
          </ScrollReveal>
        </div>
        <div className={styles.testimonialsGrid}>
          {homeData.testimonials.map((t, i) => (
            <ScrollReveal className={styles.hFull} delay={(i % 3) as 0 | 1 | 2 | 3 | 4} key={t.author}>
              <article className={styles.testimonialCard}>
                <span aria-hidden="true" className={styles.testimonialQuoteMark}>&ldquo;</span>
                <p className={styles.testimonialText}>{t.quote}</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.author}</div>
                    <div className={styles.testimonialRole}>{t.role ?? t.company}</div>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* JOURNAL */}
      <section aria-label="Insights and journal" className={styles.journalSection} id="journal">
        <div className={styles.journalHeader}>
          <div>
            <ScrollReveal>
              <p className={styles.sectionEyebrow}>From Our Journal</p>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className={styles.sectionTitle}>
                Ideas &amp; <em className={styles.italic}>Insights.</em>
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal>
            <Link className={styles.aboutLink} href="/blog">
              Explore All Articles →
            </Link>
          </ScrollReveal>
        </div>
        <div className={styles.journalGrid}>
          {homeData.journalArticles.map((article, i) => (
            <ScrollReveal className={styles.hFull} delay={(i % 3) as 0 | 1 | 2 | 3 | 4} key={article.title}>
              <article className={styles.journalCard}>
                <div className={styles.journalCardImage}>
                  <img
                    alt={article.image.alt}
                    loading="lazy"
                    src={article.image.src}
                    style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                  />
                </div>
                <div className={styles.journalCardBody}>
                  <div className={styles.journalCardTag}>{article.tag}</div>
                  <h3 className={styles.journalCardTitle}>{article.title}</h3>
                  <p className={styles.journalCardExcerpt}>{article.excerpt}</p>
                  <div className={styles.journalCardMeta}>{article.date}</div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* LEADERSHIP */}
      <section aria-label="Our leadership team" className={styles.leadershipSection} id="leadership">
        <div className={styles.leadershipHeader}>
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>
              The People
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
              Meet Our <em className={styles.italic}>Leaders.</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className={styles.sectionBody} style={{ textAlign: 'center', marginTop: '1rem' }}>
              Curious minds. Deliberate builders. Hospitality obsessives.
            </p>
          </ScrollReveal>
        </div>
        <div className={styles.leadershipGrid}>
          {homeData.leadershipTeam.map((leader, i) => (
            <ScrollReveal delay={(i % 3) as 0 | 1 | 2 | 3 | 4} key={leader.name}>
              <article className={styles.leaderCard}>
                <div className={styles.leaderPhoto}>
                  <Image
                    alt={leader.image.alt}
                    fill
                    loading="lazy"
                    src={leader.image.src}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.leaderName}>{leader.name}</div>
                <div className={styles.leaderRole}>{leader.role}</div>
                <p className={styles.leaderBio}>{leader.bio}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* JOURNEY */}
      <section aria-label="Our journey timeline" className={styles.journeySection} id="journey">
        <div className={styles.journeyHeader}>
          <ScrollReveal>
            <p
              className={styles.sectionEyebrow}
              style={{ justifyContent: 'center', color: 'rgba(184,168,120,0.8)' }}
            >
              Our Journey
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2
              className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}
              style={{ textAlign: 'center' }}
            >
              From Curious
              <br />
              to <em style={{ color: 'var(--ch-accent)', fontStyle: 'italic' }}>Category-Defining.</em>
            </h2>
          </ScrollReveal>
        </div>
        <div className={styles.journeyTimeline}>
          {homeData.journeyMilestones.map((m, i) => (
            <ScrollReveal delay={(i % 5) as 0 | 1 | 2 | 3 | 4} key={m.year}>
              <div className={styles.journeyMilestone}>
                <div className={styles.journeyYear}>{m.year}</div>
                <div className={styles.journeyEvent}>{m.event}</div>
                <p className={styles.journeyDesc}>{m.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section aria-label="Our partners" className={styles.partnersSection} id="partners">
        <div className={styles.partnersHeader}>
          <ScrollReveal>
            <p className={styles.sectionEyebrow} style={{ justifyContent: 'center' }}>
              Partners &amp; Collaborators
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className={styles.sectionTitle}>
              Built With <em className={styles.italic}>Great People.</em>
            </h2>
          </ScrollReveal>
        </div>
        <ScrollReveal className={styles.partnersGrid}>
          {homeData.partners.map((p) => (
            <div className={styles.partnerItem} key={p.name}>
              {p.name}
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section aria-label="Call to action" className={styles.ctaSection} id="cta">
        <div aria-hidden="true" className={styles.ctaBgText}>
          CURIOUS
        </div>
        <ScrollReveal>
          <p className={styles.ctaEyebrow}>Let&apos;s Build Together</p>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <h2 className={styles.ctaTitle}>
            Ready to Build
            <br />
            Something <em className={styles.italic}>Remarkable?</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <p className={styles.ctaBody}>
            Whether you&apos;re an investor, franchise partner, aspiring restaurateur, or a
            hospitality brand looking to scale — we&apos;d love to hear from you.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={3}>
          <div className={styles.ctaButtons}>
            <a className={styles.btnWhite} href="mailto:hello@curiousladdoos.com" id="cta-email-btn">
              hello@curiousladdoos.com →
            </a>
            <Link className={styles.btnOutlineWhite} href="/how-we-work" id="cta-process-btn">
              Our Process ↗
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
