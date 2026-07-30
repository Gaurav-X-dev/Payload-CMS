import Image from 'next/image'
import { homeData } from '../data/home'
import { gheeRoastSiteData } from '../data/site'
import {
  ActionLink,
  FeatureGrid,
  FoodCard,
  Gallery,
  SectionHeading,
  Stats,
  TestimonialCard,
} from '../components/Shared'
import styles from '../components/Theme.module.css'
import { Icon } from '../components/Icon'
import { fallbackGheeRoastHero } from '../mappers/cmsContent'
import type { GheeRoastHeroData } from '../dynamicTypes'
import type { GheeRoastPageProps } from '../dynamicTypes'
import { CMSPage } from '../components/CMSPage'

export function HomePage({ content, hero = fallbackGheeRoastHero() }: GheeRoastPageProps & { hero?: GheeRoastHeroData }) {
  const orderLinks = content.site.orderLinks.length ? content.site.orderLinks : gheeRoastSiteData.orderLinks
  const specials = content.collections.menu.items.filter((item) => item.badge).slice(0, 3)
  const testimonials = content.collections.testimonials.length ? content.collections.testimonials : homeData.testimonials
  const gallery = content.collections.gallery.length ? content.collections.gallery : homeData.gallery
  const hasCMSBody = Boolean(content.page?.layout.some((block) => block.blockType !== 'heroBlock'))
  const heroSection = hero.enabled && <section className={styles.homeHero}>
    <div className={styles.heroCopy}>
      <h1>{hero.heading.split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}<em>{hero.highlightedHeading}</em></h1>
      <p>{hero.description}</p>
      {(hero.primaryCTA || hero.secondaryCTA) && <div className={styles.actions}>
        {hero.primaryCTA && <ActionLink href={hero.primaryCTA.href} label={hero.primaryCTA.label} />}
        {hero.secondaryCTA && <ActionLink href={hero.secondaryCTA.href} icon="moped" label={hero.secondaryCTA.label} variant="outline" />}
      </div>}
      {orderLinks.length > 0 && <div className={styles.heroApps}>
        {hero.orderPlatformsLabel && <span>{hero.orderPlatformsLabel}</span>}
        {orderLinks.map((item) => <a href={item.href} key={`${item.label}-${item.href}`}>{item.label}</a>)}
      </div>}
    </div>
    {hero.image && <div className={styles.heroDish}>
      <span className={styles.heroGlow} />
      <Image alt={hero.image.alt} fill priority sizes="(max-width: 900px) 80vw, 45vw" src={hero.image.src} unoptimized />
      {hero.stampText && <span className={styles.heroStamp}>
        <Icon name="heart" weight="fill" />
        <span>{hero.stampText.split('\n').map((line, index) => <span key={`${line}-${index}`}>{line}<br /></span>)}</span>
      </span>}
    </div>}
  </section>

  if (hasCMSBody) return <>{heroSection}<CMSPage content={content} includeHero={false} /></>

  return (
    <>
      {heroSection}

      <section className={styles.featureStrip}><FeatureGrid features={homeData.featureStrip} /></section>

      <section className={styles.section}>
        <div className={`${styles.container} ${styles.storyGrid}`}>
          <div className={styles.imageCollage}>
            {homeData.introduction.images.map((image) => (
              <Image alt={image.alt} height={500} key={image.src} src={image.src} width={600} />
            ))}
            <span className={styles.legacyBadge}><strong>25+</strong> Years of<br />Tradition</span>
          </div>
          <div>
            <SectionHeading eyebrow={homeData.introduction.eyebrow} title={homeData.introduction.title} />
            {homeData.introduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <ul className={styles.checkList}>
              {homeData.introduction.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <ActionLink href="/about" label="Read Our Full Story" />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <SectionHeading center eyebrow="Chef's Recommendations" text="Experience the crown jewels of our menu, slow-roasted to absolute perfection." title="Today's Signature Specials" />
          <div className={styles.foodGrid}>
            {(specials.length ? specials : homeData.specials).map((item) => <FoodCard item={item} key={String('id' in item ? item.id ?? item.name : item.name)} />)}
          </div>
          <div className={styles.centerAction}><ActionLink href="/menu" label="View Complete Menu" /></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className={`${styles.container} ${styles.twoColumn}`}>
          <Image alt="Pure cow ghee and fresh ingredients" height={640} src="/themes/ghee-roast/images/quality_ingredients.png" width={700} />
          <div>
            <h2 className={styles.whyHeading}>Why We Cook<br />Only In <span>Pure Ghee</span></h2>
            <p>Ghee isn&apos;t just an ingredient — it&apos;s the soul of our cooking. Used for millennia in traditional Indian kitchens, pure cow ghee is the secret that makes our food taste, smell, and feel unlike anything else.</p>
            <ul className={`${styles.checkList} ${styles.whyList}`}>
              <li><Icon name="fire" weight="fill" /><span><strong>Superior Flavor:</strong> Ghee&apos;s high smoke point brings out deep, nutty caramelized flavors that no other oil can replicate.</span></li>
              <li><Icon name="heart" weight="fill" /><span><strong>Rich in Nutrients:</strong> Packed with fat-soluble vitamins A, D, E, and K — ghee nourishes as it delights.</span></li>
              <li><Icon name="leaf" weight="fill" /><span><strong>Zero Shortcuts:</strong> We source only 100% pure cow ghee and use it fresh in every single dish, every single day.</span></li>
              <li><Icon name="diamond" weight="fill" /><span><strong>Aroma That Lingers:</strong> The intoxicating fragrance of ghee-roasted spices is the reason our flavours truly <em>stay</em> with you.</span></li>
            </ul>
            <ActionLink href="/quality" label="Our Quality Promise" variant="accent" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading center eyebrow="The GR Promise" text="Every dish goes through a rigorous 4-step journey to ensure it arrives perfect, every single time." title="From Farm To Your Table" />
          <FeatureGrid features={homeData.process} />
        </div>
      </section>

      <section className={styles.statsSection}><Stats items={homeData.stats} /></section>

      <section className={`${styles.section} ${styles.testimonialsSection}`}>
        <div className={styles.container}>
          <SectionHeading center eyebrow="What Our Guests Say" light text="Don't just take our word for it — here's what our loyal customers say about the experience." title="Real People. Real Flavours." />
          <div className={styles.testimonialGrid}>
            {testimonials.map((item) => <TestimonialCard key={String('id' in item ? item.id ?? item.name : item.name)} testimonial={item} />)}
          </div>
        </div>
      </section>

      <section className={styles.splitPromos}>
        <article>
          <span>Doorstep Dining</span><h2>Fast &amp; Reliable Delivery</h2>
          <p>Craving our signature dishes at home? We ensure your food arrives piping hot, hygienically packed, and bursting with flavour. Available across Delhi &amp; Gurugram.</p>
          <ActionLink href="/delivery" label="View Delivery Zones" variant="split" />
        </article>
        <article>
          <span>Events &amp; Parties</span><h2>Premium Event Catering</h2>
          <p>Make your special moments unforgettable. From weddings to corporate galas, we provide a luxury culinary experience your guests will talk about for years.</p>
          <ul className={styles.promoList}>
            <li><Icon name="check" weight="fill" />Custom Menu Packages</li>
            <li><Icon name="check" weight="fill" />Live Ghee Roast Cooking Stations</li>
            <li><Icon name="check" weight="fill" />Professional Service &amp; Hygiene Standards</li>
          </ul>
          <ActionLink href="/catering" label="Book Catering" variant="split" />
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading center eyebrow="Visual Feast" title="The Restaurant Experience" />
          <Gallery images={gallery} />
        </div>
      </section>
    </>
  )
}
