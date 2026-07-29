import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '../components/Icon'
import { image } from '../data/site'

const categories = [
  ['Sushi & Sashimi', 'Pristine cuts, exquisite presentation', 'hero_ramen.png', true],
  ['Ramen', '48-hour simmered broths', 'interior.png', false],
  ['Tempura', 'Light, crispy perfection', 'interior.png', false],
  ['Yakitori', 'Charcoal-grilled skewers', 'hero_sushi.png', false],
  ['Desserts', 'Sweet Japanese artistry', 'hero_sushi.png', false],
  ['Cocktails & Sake', 'Curated Japanese spirits & mixology', 'gyoza_tempura.png', true],
] as const

const dishes = [
  ['Toro Tartare', '$24', 'Premium fatty tuna, quail egg yolk, scallions, caviar, served with crispy nori chips and wasabi cream.', 'hero_sushi.png', "Chef's Choice", 'chef', '320 cal', 1],
  ['Tonkotsu Black', '$18', '48-hour pork bone broth, black garlic oil, chashu belly, ajitama egg, wood ear mushrooms, bamboo shoots.', 'chef.png', 'Best Seller', 'popular', '680 cal', 2],
  ['Dragon Roll', '$22', 'Shrimp tempura, avocado, unagi eel, tobiko, eel sauce — our signature showstopper roll.', 'gyoza_tempura.png', 'New', 'new', '450 cal', 1],
  ['Wagyu Yakitori', '$32', 'A5 Wagyu beef skewers, charcoal-grilled with tare sauce, served with pickled ginger and shiso leaf.', 'chef.png', "Chef's Choice", 'chef', '520 cal', 1],
  ['Matcha Tiramisu', '$14', 'Uji matcha mascarpone layers, white chocolate shavings, dusted with ceremonial-grade matcha powder.', 'chef.png', 'Popular', 'popular', '380 cal', 0],
  ['Yuzu Highball', '$16', 'Suntory whisky, fresh yuzu citrus, sparkling soda, garnished with shiso leaf and a twist of yuzu zest.', 'gyoza_tempura.png', 'New', 'new', '180 cal', 0],
] as const

const experiences = [
  ['Private Dining', 'Exclusive rooms for intimate gatherings', 'hero_sushi.png'],
  ['Open Kitchen', 'Watch our chefs craft your meal', 'hero_sushi.png'],
  ['Tatami Seating', 'Traditional Japanese floor seating', 'hero_ramen.png'],
  ['Family Dining', 'Warm spaces for shared moments', 'hero_ramen.png'],
  ['Romantic Evening', 'Candlelit dinners for two', 'hero_ramen.png'],
  ['Corporate Events', 'Premium spaces for business dining', 'chef.png'],
] as const

const services = [
  ['food', 'Dine In', 'Experience our full menu in an elegant setting with warm Japanese hospitality.'],
  ['briefcase', 'Take Away', 'Your favourite dishes, carefully packed to enjoy at home.'],
  ['moped', 'Home Delivery', 'Premium delivery via Zomato & Swiggy within 10km radius.'],
  ['star', 'Private Dining', 'Exclusive rooms for intimate celebrations and VIP gatherings.'],
  ['briefcase', 'Corporate Catering', 'Customized menus for corporate events and team celebrations.'],
  ['heart', 'Birthday Events', 'Make birthdays unforgettable with our special event packages.'],
  ['heart', 'Wedding Catering', 'Elegant Japanese cuisine for your most special day.'],
  ['calendar', 'Online Reservation', 'Book your table instantly through our website, 24/7.'],
] as const

const reasons = [
  ['leaf', 'Fresh Ingredients', 'Daily sourced from trusted farms and fish markets across India and Japan.'],
  ['flag', 'Imported from Japan', 'Premium soy, miso, dashi, nori, and sake — direct from Japanese suppliers.'],
  ['food', 'Master Chefs', 'Our team of Japanese-trained chefs bring 100+ years of combined experience.'],
  ['medal', 'Traditional Recipes', 'Authentic techniques passed down through generations of Japanese artisans.'],
  ['star', 'Premium Hospitality', 'The art of Omotenashi — heartfelt Japanese hospitality at every table.'],
  ['map', 'Luxury Interiors', 'Designed by Tokyo-based architects to evoke authentic Japanese ambiance.'],
  ['leaf', 'Organic Vegetables', 'Partnered with organic farms for the freshest, chemical-free produce.'],
  ['fish', 'Fresh Seafood', 'Sashimi-grade fish delivered daily from premium coastal markets.'],
] as const

const seasons = [
  ['Spring · 春', 'Sakura', 'Cherry blossom-inspired dishes with light, floral flavours and seasonal fish.', 'hero_sushi.png'],
  ['Summer · 夏', 'Natsu', 'Refreshing cold noodles, grilled seafood, and crisp yuzu cocktails.', 'hero_sushi.png'],
  ['Autumn · 秋', 'Aki', 'Rich mushroom hotpots, roasted root vegetables, warm sake selections.', 'interior.png'],
  ['Winter · 冬', 'Fuyu', 'Hearty nabe stews, rich Tonkotsu specials, and warming whisky flights.', 'interior.png'],
] as const

function SectionHeader({ eyebrow, japanese, text, title }: { eyebrow: string, japanese: string, text?: string, title: string }) {
  return <div className="zz-section-header">
    <div className="zz-section-subtitle zz-centered">{eyebrow}</div>
    <h2>{title} <span className="zz-jp-text">{japanese}</span></h2>
    {text && <p>{text}</p>}
  </div>
}

export function HomePage() {
  const features = [
    ['bowl', 'Izakaya Culture', 'Casual. Vibrant. Unapologetically authentic Japanese dining.'],
    ['leaf', 'Japanese Soul', 'Thoughtful ingredients. Honest flavours. Daily prepared.'],
    ['users', 'Sharing is Caring', 'Small plates. Big experiences. Made for communal joy.'],
    ['fish', 'No Sushi. Just Us.', 'We do a few things. And we do them exceptionally right.'],
  ] as const

  return <>
    <section className="zz-home-hero">
      <div className="zz-container zz-hero-inner">
        <div className="zz-hero-left">
          <h1 className="zz-hero-heading">Good Food.<br />Good Times.<br /><em>Always.</em></h1>
          <p className="zz-hero-subtitle">A Japanese Izakaya experience in the heart of Shahpur Jat, New Delhi.</p>
          <div className="zz-hero-cta"><Link className="zz-btn zz-btn-primary" href="/menu"><span>Explore Menu</span></Link><Link className="zz-btn zz-btn-outline" href="/reservation"><span>Reserve a Table</span></Link></div>
        </div>
        <div className="zz-hero-visual">
          <span className="zz-brush-circle" />
          <Image alt="Premium Tonkotsu Ramen Bowl" className="zz-chef-image" height={420} priority src={image('chef.png')} width={420} />
          <span className="zz-chopsticks"><i /><i /></span>
          <span className="zz-jp-decoration">良い食事<br />いつも</span>
          <span className="zz-jp-stamp"><span>印</span></span>
        </div>
      </div>
      <span className="zz-scroll-label">Scroll</span>
    </section>

    <section className="zz-features-section"><div className="zz-container"><div className="zz-features-row">{features.map(([icon, title, description]) => <article className="zz-feature-block" key={title}><Icon className="zz-feature-icon" name={icon} weight="regular" /><div><h4>{title}</h4><p>{description}</p></div></article>)}</div></div></section>

    <section><div className="zz-container">
      <SectionHeader eyebrow="What We Serve" japanese="料理を探る" title="Explore Our Cuisine" text="From the delicate art of sushi to the warming depths of our 48-hour broth, every dish is a celebration of Japanese culinary tradition." />
      <div className="zz-home-categories">{categories.map(([title, description, asset, wide]) => <article className={`zz-home-category ${wide ? 'zz-wide' : ''}`} key={title}><Image alt={title} fill sizes={wide ? '(max-width: 768px) 92vw, 46vw' : '(max-width: 768px) 92vw, 23vw'} src={image(asset)} /><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
    </div></section>

    <section className="zz-section-alt"><div className="zz-container zz-home-story">
      <div className="zz-home-story-image"><Image alt="Zuru Zuru Interior" height={680} sizes="(max-width: 992px) 92vw, 46vw" src={image('gyoza_tempura.png')} width={760} /></div>
      <div><span className="zz-section-subtitle">Our Story</span><h2>A Journey Through Japanese Culinary Heritage</h2><p className="zz-story-lead">Founded in 2015 by Chef Kenji Tanaka, Zuru Zuru was born from a simple belief — that great food should bring people together. After 15 years mastering his craft in Tokyo&apos;s finest kitchens, Chef Kenji brought the authentic spirit of Japan&apos;s izakayas to New Delhi.</p><p className="zz-story-muted">Every dish, from our 48-hour simmered Tonkotsu broth to our hand-rolled gyoza, tells a story of dedication, precision, and an unwavering commitment to the Japanese philosophy of <em>Omotenashi</em> — hospitality from the heart.</p><div className="zz-story-japanese">おもてなし</div><Link className="zz-btn zz-btn-outline" href="/about"><span>Read Our Full Story</span></Link></div>
    </div></section>

    <section><div className="zz-container">
      <SectionHeader eyebrow="Chef's Selection" japanese="看板料理" title="Signature Dishes" text="Hand-selected by our Executive Chef — the finest creations that define the Zuru Zuru experience." />
      <div className="zz-home-dishes">{dishes.map(([name, price, description, asset, badge, badgeType, calories, heat]) => <article className="zz-home-dish" key={name}><div className="zz-home-dish-image"><Image alt={name} fill sizes="(max-width: 768px) 92vw, 30vw" src={image(asset)} /><span className={`zz-dish-badge zz-${badgeType}`}>{badge}</span></div><div className="zz-home-dish-body"><div className="zz-home-dish-meta"><h3>{name}</h3><strong>{price}</strong></div><p>{description}</p><div className="zz-home-dish-info"><span>♨ {calories}</span><span className="zz-spicy-level">{[0, 1, 2].map((dot) => <i className={dot < heat ? 'zz-active' : ''} key={dot} />)}</span></div></div></article>)}</div>
      <div className="zz-home-center"><Link className="zz-btn zz-btn-outline" href="/menu"><span>View Full Menu</span></Link></div>
    </div></section>

    <section><div className="zz-container">
      <SectionHeader eyebrow="Ambiance" japanese="食事体験" title="The Dining Experience" text="From intimate tatami rooms to our vibrant open kitchen, every space tells a story of Japanese elegance." />
      <div className="zz-home-experiences">{experiences.map(([title, description, asset]) => <article key={title}><Image alt={title} fill sizes="(max-width: 768px) 92vw, 30vw" src={image(asset)} /><div><h4>{title}</h4><p>{description}</p></div></article>)}</div>
    </div></section>

    <section className="zz-section-alt"><div className="zz-container">
      <SectionHeader eyebrow="What We Offer" japanese="サービス" title="Our Services" />
      <div className="zz-home-services">{services.map(([icon, title, description]) => <article key={title}><Icon name={icon} size={44} weight="thin" /><h4>{title}</h4><p>{description}</p></article>)}</div>
    </div></section>

    <section><div className="zz-container">
      <SectionHeader eyebrow="The Zuru Zuru Difference" japanese="私たちの約束" title="Why Choose Us" />
      <div className="zz-home-reasons">{reasons.map(([icon, title, description]) => <article key={title}><span><Icon name={icon} size={30} weight="regular" /></span><div><h4>{title}</h4><p>{description}</p></div></article>)}</div>
    </div></section>

    <section className="zz-section-alt"><div className="zz-container">
      <SectionHeader eyebrow="Limited Edition" japanese="季節のメニュー" title="Seasonal Collections" text="Inspired by the changing seasons of Japan, our limited-edition menus celebrate nature's finest offerings." />
      <div className="zz-home-seasons">{seasons.map(([title, name, description, asset]) => <article key={title}><div className="zz-home-season-image"><Image alt={title} fill sizes="(max-width: 768px) 92vw, 23vw" src={image(asset)} /></div><div className="zz-home-season-body"><h4>{title} <small>{name}</small></h4><p>{description}</p><Link href="/menu">View Collection</Link></div></article>)}</div>
    </div></section>

    <section className="zz-section-dark zz-home-testimonial"><div className="zz-container">
      <SectionHeader eyebrow="Guest Voices" japanese="お客様の声" title="What Our Guests Say" />
      <div className="zz-home-testimonial-wrap"><div className="zz-home-stars">★ ★ ★ ★ ★</div><blockquote>The Tonkotsu Black at Zuru Zuru is quite simply the best ramen I&apos;ve ever had outside of Japan. The depth of flavour in that 48-hour broth is extraordinary. This is not just a restaurant — it&apos;s a destination.</blockquote><div className="zz-home-author"><Image alt="Rahul Sharma" height={64} src={image('gyoza_tempura.png')} width={64} /><div><strong>Rahul Sharma</strong><span>Food Critic, Times of India</span></div></div></div>
    </div></section>

    <section><div className="zz-container">
      <SectionHeader eyebrow="Find Us" japanese="アクセス" title="Visit Zuru Zuru" />
      <div className="zz-home-location"><div className="zz-home-map"><Icon name="map" size={48} /><p>Google Maps Integration<br />23 Shahpur Jat, New Delhi</p></div><div className="zz-home-location-info"><h4>Address</h4><p>23, Shahpur Jat<br />Siri Fort, New Delhi 110049<br />India</p><h4>Opening Hours</h4><ul><li>Monday – Thursday: 12:00 PM – 10:30 PM</li><li>Friday – Saturday: 12:00 PM – 11:30 PM</li><li>Sunday: 12:00 PM – 10:00 PM</li></ul><h4>Parking</h4><p>Complimentary valet parking available for all dine-in guests. Street parking also available nearby.</p><h4>Contact</h4><p>☎ +91 11 4052 7373<br />✉ hello@zuruzuru.in</p><Link className="zz-btn zz-btn-outline" href="/locations"><span>All Locations</span></Link></div></div>
    </div></section>
  </>
}
