import Image from 'next/image'
import Link from 'next/link'
import { GalleryLightbox, MenuBrowser } from '../components/Interactive'
import { CardGrid, CTA, PageHero, SectionHeader } from '../components/Shared'
import { Icon } from '../components/Icon'
import { image } from '../data/site'
import { menuItems } from '../data/menu'

const cuisine = [
  ['Sushi & Sashimi', 'Premium seafood, sliced and rolled with uncompromising precision.', 'hero_sushi.png'],
  ['Ramen', 'Deep, slow-simmered broths with handcrafted noodles and traditional toppings.', 'hero_ramen.png'],
  ['Tempura', 'Feather-light batter and pristine ingredients fried to golden perfection.', 'gyoza_tempura.png'],
  ['Yakitori', 'Binchotan-grilled skewers lacquered with our house tare.', 'chef.png'],
  ['Desserts', 'Elegant Japanese sweets with matcha, yuzu, sesame, and seasonal fruit.', 'interior.png'],
  ['Cocktails & Sake', 'Curated pours and Japanese-inspired drinks for every dish.', 'hero_sushi.png'],
].map(([title, description, asset]) => ({ description, image: asset, title }))

const diningExperiences = [
  ['Private Dining', 'Exclusive rooms for intimate gatherings', 'hero_sushi.png'],
  ['Open Kitchen', 'Watch our chefs craft your meal', 'hero_sushi.png'],
  ['Tatami Seating', 'Traditional Japanese floor seating', 'hero_ramen.png'],
  ['Family Dining', 'Warm spaces for shared moments', 'hero_ramen.png'],
  ['Romantic Evening', 'Candlelit dinners for two', 'hero_ramen.png'],
  ['Corporate Events', 'Premium spaces for business dining', 'chef.png'],
].map(([title, description, asset]) => ({ title, description, image: asset }))

const services = [
  ['Dine In', 'Experience our full menu in an elegant setting with warm Japanese hospitality.'],
  ['Take Away', 'Your favourite dishes, carefully packed to enjoy at home.'],
  ['Home Delivery', 'Premium delivery via Zomato & Swiggy within 10km radius.'],
  ['Private Dining', 'Exclusive rooms for intimate celebrations and VIP gatherings.'],
  ['Corporate Catering', 'Customized menus for corporate events and team celebrations.'],
  ['Birthday Events', 'Make birthdays unforgettable with our special event packages.'],
  ['Wedding Catering', 'Elegant Japanese cuisine for your most special day.'],
  ['Online Reservation', 'Book your table instantly through our website, 24/7.'],
].map(([title, description]) => ({ title, description }))

const reasons = [
  ['Fresh Ingredients', 'Daily sourced from trusted farms and fish markets across India and Japan.'],
  ['Imported from Japan', 'Premium soy, miso, dashi, nori, and sake — direct from Japanese suppliers.'],
  ['Master Chefs', 'Our team of Japanese-trained chefs bring 100+ years of combined experience.'],
  ['Traditional Recipes', 'Authentic techniques passed down through generations of Japanese artisans.'],
  ['Premium Hospitality', 'The art of Omotenashi — heartfelt Japanese hospitality at every table.'],
  ['Luxury Interiors', 'Designed by Tokyo-based architects to evoke authentic Japanese ambiance.'],
  ['Organic Vegetables', 'Partnered with organic farms for the freshest, chemical-free produce.'],
  ['Fresh Seafood', 'Sashimi-grade fish delivered daily from premium coastal markets.'],
].map(([title, description]) => ({ title, description }))

const seasons = [
  ['Spring · 春', 'Cherry blossom-inspired dishes with light, floral flavours and seasonal fish.', 'hero_sushi.png'],
  ['Summer · 夏', 'Refreshing cold noodles, grilled seafood, and crisp yuzu cocktails.', 'hero_sushi.png'],
  ['Autumn · 秋', 'Rich mushroom hotpots, roasted root vegetables, warm sake selections.', 'interior.png'],
  ['Winter · 冬', 'Hearty nabe stews, rich Tonkotsu specials, and warming whisky flights.', 'interior.png'],
].map(([title, description, asset]) => ({ title, description, image: asset }))

export function HomePage() {
  const features = [
    { icon: 'bowl', title: 'Izakaya Culture', description: 'Casual. Vibrant. Unapologetically authentic Japanese dining.' },
    { icon: 'leaf', title: 'Japanese Soul', description: 'Thoughtful ingredients. Honest flavours. Daily prepared.' },
    { icon: 'users', title: 'Sharing is Caring', description: 'Small plates. Big experiences. Made for communal joy.' },
    { icon: 'fish', title: 'No Sushi. Just Us.', description: 'We do a few things. And we do them exceptionally right.' },
  ]
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
    <section className="zz-features-section"><div className="zz-container"><div className="zz-features-row">{features.map((feature) => <article className="zz-feature-block" key={feature.title}><Icon className="zz-feature-icon" name={feature.icon} weight="regular" /><div><h4>{feature.title}</h4><p>{feature.description}</p></div></article>)}</div></div></section>
    <section><div className="zz-container"><SectionHeader eyebrow="What We Serve" title="Explore Our Cuisine 料理を探る" text="From the delicate art of sushi to the warming depths of our 48-hour broth, every dish is a celebration of Japanese culinary tradition." /><CardGrid cards={cuisine} /></div></section>
    <section className="zz-section-alt"><div className="zz-container zz-split-layout"><div className="zz-story-image"><Image alt="Zuru Zuru dining room" fill sizes="(max-width: 800px) 100vw, 50vw" src={image('interior.png')} /></div><div><span className="zz-section-subtitle">Our Story</span><h2 className="zz-heading-section">A Journey Through Japanese Culinary Heritage</h2><p>Born from a deep respect for the lively izakayas of Tokyo, Zuru Zuru brings authentic Japanese dining to New Delhi. Our chefs honour time-tested techniques while creating a warm, energetic space where every meal is meant to be shared.</p><p>From broth simmered through the night to fish sliced at the precise moment of service, our kitchen is guided by patience, discipline, and joy.</p><Link className="zz-btn zz-btn-link" href="/about">Discover Our Story</Link></div></div></section>
    <section><div className="zz-container"><SectionHeader eyebrow="Chef's Selection" title="Signature Dishes 看板料理" /><CardGrid cards={cuisine.slice(0, 3)} /></div></section>
    <section><div className="zz-container"><SectionHeader eyebrow="Ambiance" title="The Dining Experience 食事体験" text="From intimate tatami rooms to our vibrant open kitchen, every space tells a story of Japanese elegance." /><CardGrid cards={diningExperiences} /></div></section>
    <section className="zz-section-alt"><div className="zz-container"><SectionHeader eyebrow="What We Offer" title="Our Services サービス" /><CardGrid cards={services} columns={4} /></div></section>
    <section><div className="zz-container"><SectionHeader eyebrow="The Zuru Zuru Difference" title="Why Choose Us 私たちの約束" /><CardGrid cards={reasons} columns={4} /></div></section>
    <section className="zz-section-alt"><div className="zz-container"><SectionHeader eyebrow="Limited Edition" title="Seasonal Collections 季節のメニュー" text="Inspired by the changing seasons of Japan, our limited-edition menus celebrate nature's finest offerings." /><CardGrid cards={seasons} columns={4} /></div></section>
    <section className="zz-section-dark"><div className="zz-container"><SectionHeader dark eyebrow="Guest Voices" title="What Our Guests Say お客様の声" /><div className="zz-testimonials"><blockquote>“The Tonkotsu Black at Zuru Zuru is quite simply the best ramen I&apos;ve ever had outside of Japan. The depth of flavour in that 48-hour broth is extraordinary. This is not just a restaurant — it&apos;s a destination.”<cite>— Rahul Sharma, Food Critic, Times of India</cite></blockquote></div></div></section>
    <section><div className="zz-container"><SectionHeader eyebrow="Find Us" title="Visit Zuru Zuru アクセス" /><div className="zz-visit-grid"><div><h4>Address</h4><p>23 Shahpur Jat, Siri Fort<br />New Delhi 110049, India</p><h4>Opening Hours</h4><p>Monday – Thursday: 12:00 PM – 10:30 PM<br />Friday – Saturday: 12:00 PM – 11:30 PM<br />Sunday: 12:00 PM – 10:00 PM</p></div><div><h4>Parking</h4><p>Complimentary valet parking available for all dine-in guests.</p><h4>Contact</h4><p>+91 11 4052 7373<br />hello@zuruzuru.in</p><Link className="zz-btn zz-btn-primary" href="/locations">All Locations</Link></div></div></div></section>
  </>
}

export function AboutPage() {
  const pillars = [
    { title: 'Omotenashi', meta: '(Hospitality from the Heart)', description: 'More than just service, Omotenashi is the anticipation of your needs before they arise. We welcome you not as a customer, but as an honored guest in our home, ensuring your comfort is our utmost priority.' },
    { title: 'Kodawari', meta: '(Relentless Devotion)', description: 'Our uncompromising dedication to our craft. From simmering our tonkotsu broth for 24 hours to sourcing the freshest seasonal ingredients, Kodawari represents our pursuit of perfection in every detail.' },
    { title: 'Shokunin', meta: '(Artisan Spirit)', description: 'The spirit of the craftsman. Our chefs spend decades refining a single technique, taking immense pride in their work to elevate simple ingredients into extraordinary, memorable culinary experiences.' },
  ]
  const timeline = [
    ['2015','The Founding','Chef Kenji Tanaka opens the first intimate 20-seat Zuru Zuru Izakaya, introducing authentic Tokyo-style ramen and yakitori.'],
    ['2018','The Second Branch','Due to overwhelming demand, we expand our footprint, opening our flagship location with a dedicated robatayaki grill and sake lounge.'],
    ['2021','Culinary Excellence Award','Recognized globally by critics, Zuru Zuru receives the prestigious Asian Dining Award for Best Casual Japanese Restaurant.'],
    ['2024','A New Era','Launching our exclusive Omakase dining experience and importing rare, artisanal sakes from boutique breweries across Japan.'],
  ]
  return <><PageHero background="gyoza_tempura.png" eyebrow="Home / Our Story" title="Our Story" text="A journey rooted in Tokyo, shaped by tradition, and shared in New Delhi." /><section className="zz-section-alt"><div className="zz-container zz-split-layout"><div className="zz-story-image"><Image alt="The roots of Zuru Zuru" fill sizes="(max-width:800px) 100vw,50vw" src={image('interior.png')} /></div><div><span className="zz-section-subtitle">Our Roots</span><h2>A Journey Begun in Tokyo</h2><p>Founded in 2015 by Chef Kenji Tanaka, Zuru Zuru Izakaya was born out of a profound passion for the spirited dining culture of Tokyo&apos;s alleyways. After spending 15 years mastering the intricate arts of Japanese cuisine in prestigious traditional kitchens, Chef Tanaka envisioned a space where uncompromising quality met a relaxed, communal atmosphere.</p><p>At Zuru Zuru, every bowl of ramen and every perfectly grilled skewer tells the story of a chef who believes that great food is an experience meant to be shared, loudly and joyfully.</p></div></div></section><section className="zz-section-dark"><div className="zz-container"><div className="zz-grid-2 zz-mission-grid"><article><Icon name="heart" /><h3>Our Mission</h3><p>To bring the authentic spirit of Tokyo&apos;s alleyway izakayas to our patrons by delivering unpretentious, flavor-packed dishes crafted with the finest ingredients and an unwavering dedication to tradition.</p></article><article><Icon name="star" /><h3>Our Vision</h3><p>To be recognized as Asia&apos;s most celebrated izakaya brand, redefining casual Japanese dining through continuous innovation, authentic hospitality, and a relentless pursuit of culinary excellence.</p></article></div></div></section><section><div className="zz-container"><SectionHeader eyebrow="The Core Pillars" title="Japanese Philosophy" text="The guiding principles that shape every interaction and every dish at Zuru Zuru Izakaya." /><CardGrid cards={pillars} /></div></section><section className="zz-section-dark"><div className="zz-container"><SectionHeader dark eyebrow="Our Evolution" title="The Zuru Zuru Story" /><div className="zz-timeline">{timeline.map(([year,title,text],index)=><article className={index%2 ? 'zz-right' : 'zz-left'} key={year}><div><strong>{year}</strong><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section><section><div className="zz-container"><SectionHeader eyebrow="By The Numbers" title="Our Achievements" /><div className="zz-stats"><div><strong>1.2M+</strong><span>Bowls of Ramen Served</span></div><div><strong>3</strong><span>Locations Globally</span></div><div><strong>15+</strong><span>Culinary Awards</span></div></div></div></section></>
}

export function MenuPage() { return <><PageHero background="chef.png" title="Our Menu" text="Authentic Japanese dishes prepared with premium ingredients, traditional technique, and uncompromising care." /><MenuBrowser items={menuItems} /></> }

export function GalleryPage() { return <><PageHero background="interior.png" title="Our Gallery" text="A glimpse into our food, spaces, chefs, and unforgettable events." /><section className="zz-gallery-section"><GalleryLightbox /></section></> }

export function ChefsPage() {
  const masters = [
    { title: 'Akira Mori', meta: 'Chef de Cuisine', image: 'chef.png', description: 'With an exceptional palate and a background in French-Japanese fusion, Chef Akira orchestrates the bustling kitchen with precision.' },
    { title: 'Haruka Suzuki', meta: 'Sushi Master', image: 'hero_sushi.png', description: 'Trained in Ginza for 12 years, Chef Haruka possesses an encyclopedic knowledge of seafood and delicate knife work.' },
    { title: 'Daiki Ito', meta: 'Ramen Master', image: 'hero_ramen.png', description: 'Chef Daiki is the guardian of our broths, meticulously tending the stockpots to achieve richness and depth.' },
    { title: 'Yumi Yamada', meta: 'Pastry Chef', image: 'gyoza_tempura.png', description: 'Chef Yumi blends matcha, yuzu, and black sesame with classic European pastry techniques.' },
  ]
  return <><PageHero background="interior.png" eyebrow="Home / Chefs" title="Meet Our Chefs" text="Masters of their craft, united by discipline, respect, and a love of Japanese cuisine." /><section><div className="zz-container zz-split-layout"><div className="zz-portrait"><Image alt="Executive Chef Kenji Tanaka" fill sizes="(max-width:800px) 100vw,45vw" src={image('chef.png')} /></div><div><span className="zz-section-subtitle">The Visionary</span><h2>Kenji Tanaka</h2><h3>Executive Chef &amp; Founder</h3><p>Born and raised in Osaka, the kitchen of Japan, Chef Kenji Tanaka&apos;s culinary journey began at the age of 16 in his family&apos;s humble udon shop. His insatiable curiosity led him to Tokyo, where he spent over a decade honing his skills under Michelin-starred sushi masters and yakitori veterans.</p><p>At Zuru Zuru, he has curated a menu that acts as a love letter to the vibrant, chaotic, and utterly delicious alleyway eateries of his youth.</p><ul className="zz-awards"><li>James Beard Foundation Award Nominee, 2023</li><li>Best Japanese Chef in Asia - Culinary Excellence Awards</li><li>Featured in “Masters of Fire: The Global Robatayaki”</li></ul></div></div></section><section className="zz-section-dark"><div className="zz-container"><SectionHeader dark eyebrow="Masters of the Craft" title="The Culinary Masters" text="Each master brings decades of specialized experience to ensure perfection across our diverse menu." /><CardGrid cards={masters} columns={2} /></div></section><section className="zz-quote-section"><blockquote>“Great food is not born from complex recipes, but from a profound respect for the ingredients and the unrelenting discipline to execute simple techniques flawlessly, every single day.”<cite>— Chef Kenji Tanaka</cite></blockquote></section><CTA title="Taste the Dedication" text="Experience the culmination of years of mastery, passion, and tradition crafted by our exceptional culinary team." label="Dine with Our Chefs" /></>
}
