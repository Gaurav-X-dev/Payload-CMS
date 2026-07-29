import type { FeatureData, TimelineData } from '../types'
import { imageRoot } from './site'

export const aboutData = {
  metadata: {
    title: 'Our Story | Very Good Ghee Roast',
    description: "Discover the legacy behind Very Good Ghee Roast — from a humble 1995 kitchen in Kundapur to Delhi's most loved South Indian coastal dining experience.",
  },
  hero: {
    eyebrow: 'Our Story',
    title: 'A Legacy of Flavour',
    subtitle:
      'From a small coastal kitchen in Kundapur to the heart of Delhi — three decades of honest cooking, pure ghee, and flavours that stay with you long after the last bite.',
  },
  origin: {
    eyebrow: 'Where It All Began',
    title: 'Born in Kundapur, Raised on Pure Ghee',
    image: {
      alt: 'The original Kundapur kitchen where VGGR was born in 1995',
      src: `${imageRoot}/origin_kitchen.png`,
    },
    paragraphs: [
      'In 1995, in the sun-baked coastal town of Kundapur along the Karnataka shoreline, a small family kitchen began doing something quietly revolutionary: slow-roasting chicken in pure cow ghee with a hand-ground masala passed down across three generations. There were no shortcuts, no substitutes, and no compromises — only fire, patience, and flavour.',
      "What began as Sunday meals shared with neighbours and extended family gradually drew a loyal following. Word spread the way great food always does — not through advertisements, but through people who simply couldn't stop talking about it. The Kundapur Ghee Roast had found its audience, and that audience kept growing.",
      'By the early 2000s, the demand had outgrown the kitchen. It was time to share this taste with a wider world. The family packed their recipes, their values, and their cast-iron kadhai, and began the journey northward — all the way to Delhi.',
    ],
    quote: '"We didn\'t invent a recipe. We protected one." — The Founders',
  },
  timelineIntroduction:
    'Every great story has defining moments. Here are ours — the chapters that shaped VGGR into what it is today.',
  timeline: [
    ['1995', 'The First Kadhai', 'In Kundapur, Karnataka, the first batch of Ghee Roast was made in a family kitchen using hand-ground masala and pure cow ghee. Neighbours lined up. A legacy was unknowingly born.', 'origin_kitchen.png', '1995 Kitchen'],
    ['2005', 'First Restaurant Opens', 'The family opened the first formal VGGR outlet in Mangalore. Within the first month, the 40-seat restaurant was running a waiting list. The recipe travelled, and so did the reputation.', 'hero_ghee_roast.png', 'First Restaurant'],
    ['2010', 'Delhi Calling', "VGGR made the bold move to Delhi — bringing authentic Kundapur coastal flavours to North India for the first time. Skeptics doubted; customers didn't. The first Delhi outlet sold out on opening day.", 'quality_ingredients.png', 'Delhi Outlet'],
    ['2018', 'Expanding to Gurugram', "As Delhi's corporate crowd discovered VGGR, demand surged in the NCR. We opened our Gurugram chapter — tailoring the menu slightly for the city while never compromising on the soul of the dish.", 'catering_event.png', 'Gurugram Expansion'],
    ['2026', '2.5 Million Served & Counting', 'Today, VGGR serves over two and a half million customers, with 15+ locations across Delhi and Gurugram. The masala is still hand-ground. The ghee is still pure. The flavours still stay.', 'premium_spices.png', 'Present Day'],
  ].map(([year, title, description, file, alt]) => ({
    year,
    title,
    description,
    image: { alt, src: `${imageRoot}/${file}` },
  })) satisfies TimelineData[],
  founder: {
    badge: 'Head Chef & Founder',
    eyebrow: 'The Man Behind the Masala',
    title: 'Meet Our Founder',
    name: 'Chef Ramachandra Shetty',
    image: { alt: 'VGGR Head Chef and Founder', src: `${imageRoot}/founder_chef.png` },
    paragraphs: [
      "Chef Ramachandra Shetty was 22 years old when he first slow-roasted chicken in pure ghee in his mother's kitchen in Kundapur. He had no culinary school training, no Michelin-starred mentors — only a grandmother's masala recipe, a cast-iron kadhai, and an obsessive belief that good food must never take shortcuts.",
      "Over thirty years, Chef Shetty has built VGGR from a Sunday family ritual into one of Delhi's most revered South Indian dining destinations. He still visits every kitchen weekly, still insists on grinding the base masala by hand, and still personally approves every new menu addition.",
      "His philosophy is simple: If you can taste the shortcut, you've already failed. It's this uncompromising standard that has kept VGGR's flavour consistent from Kundapur to Connaught Place.",
    ],
    quote:
      '"Ghee roast is not a recipe. It is a relationship — between the cook, the fire, and the patience to let the masala bloom at its own pace. You cannot rush flavour. You can only earn it."',
    citation: '— Chef Ramachandra Shetty, Founder, VGGR',
  },
  valuesIntroduction:
    'Three pillars underpin everything we do — from the masala we grind each morning to the plate that arrives at your table.',
  values: [
    { icon: 'medal', title: 'Authenticity', description: "Our recipes have not changed in 30 years. We use the same masala blend, the same coastal spice ratios, and the same slow-roasting technique that made our grandmother's kitchen famous. No fusion, no reinvention — just the real thing." },
    { icon: 'star', title: 'Quality', description: "We source only the finest Byadgi chilies from Karnataka, pure cow ghee from local farms, and fresh produce from trusted vendors. Every ingredient is inspected daily. If it doesn't meet our standard, it doesn't enter our kitchen." },
    { icon: 'heart', title: 'Passion', description: "Behind every plate is a team that genuinely loves what they make. Our chefs are trained in the Kundapur tradition, not just a technique. They cook with the understanding that every meal is someone's cherished experience." },
  ] satisfies FeatureData[],
  stats: [['2.5M+', 'Happy Customers'], ['25+', 'Years of Heritage'], ['15+', 'Locations'], ['12', 'Secret Spices']],
}
