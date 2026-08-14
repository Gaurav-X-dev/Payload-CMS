import type { PageMetadataData, PageHeroData } from '../types'

export const brandsData = {
  metadata: {
    title: 'Our Brands — Curious Ladoo',
    description: 'Explore restaurant brands by Curious Ladoo, including Zuru Zuru Japanese Izakaya, Ghee Roast South Indian Cuisine, and Z-Quick premium delivery.'
  } as PageMetadataData,
  hero: {
    eyebrow: 'Our Portfolio',
    title: 'Distinct Identities, Unified Excellence',
    subtitle: 'We build dining concepts that celebrate heritage and convenience, each running on customized operational systems designed for consistency and scale.',
    image: '/themes/curious-hub/images/visual_story.png'
  },
  brands: [
    {
      id: 'zuru',
      badge: 'Japanese Izakaya',
      title: 'Zuru Zuru',
      desc: 'Comfort food. Reliably good times. Zuru Zuru is our interpretation of a traditional Japanese izakaya. We celebrate artisanal ramens, charcoal robata skewers, and highball culture, re-engineered carefully for the urban Indian consumer.',
      quote: '"The detail in Zuru Zuru\'s branding — from the custom ceramics to the lighting flow — creates an immersive dining pocket that immediately builds repeat guests."',
      statValue: '3 Cities',
      statLabel: 'Active Rollout',
      image: { src: '/themes/curious-hub/images/zuru_zuru.png', alt: 'Zuru Zuru Japanese Izakaya interior concept' },
      links: [
        { label: 'ig', url: '#' },
        { label: 'web', url: '#' }
      ],
      reverse: false
    },
    {
      id: 'ghee',
      badge: 'South Indian Coastal',
      title: 'Ghee Roast',
      desc: 'Coastal flavours. Bold and soulful. Ghee Roast brings the heritage cuisines of Mangalore, Kerala, and Tamil Nadu into a contemporary editorial dining environment. We pair traditional clay-pot slow cooking with modern beverage systems.',
      quote: '"We saw a 45% increase in lunch table turnovers after implementing the menu engineering SOPs crafted for Ghee Roast by the CL group."',
      statValue: '4.8 ★',
      statLabel: 'Customer Rating',
      image: { src: '/themes/curious-hub/images/ghee_roast.png', alt: 'Ghee Roast South Indian coastal restaurant design' },
      links: [
        { label: 'ig', url: '#' },
        { label: 'web', url: '#' }
      ],
      reverse: true
    },
    {
      id: 'quick',
      badge: 'Quick Service & Delivery',
      title: 'Z-Quick',
      desc: 'Great taste, engineered fast. Z-Quick is our high-efficiency cloud kitchen concept, serving premium wraps, rice bowls, and sides. Designed for high density urban sectors, it runs on custom dispatch algorithms that ensure food arrives hot and crisp.',
      quote: '"Z-Quick is a masterclass in packaging engineering. The heat-vented containers ensure delivery food stays restaurant-grade."',
      statValue: '18 Min',
      statLabel: 'Avg Delivery Time',
      image: { src: '/themes/curious-hub/images/zquick.png', alt: 'Z-Quick premium delivery and QSR packaging design' },
      links: [
        { label: 'ig', url: '#' },
        { label: 'web', url: '#' }
      ],
      reverse: false
    }
  ],
  future: {
    id: 'future',
    eyebrow: 'Pipelines',
    title: 'What We Are',
    italic: 'Incubating.',
    desc: 'Curious Ladoo is constantly researching new F&B segments. In the coming year, we are launching two new concepts:',
    list: [
      { text: 'Project Roastery (Q1 2026):', desc: 'An artisanal coffee roastery concept combined with sourdough bakery operations, systemized for business complexes.' },
      { text: 'Project Botanical (Q3 2026):', desc: 'A high-end cocktail lounge emphasizing native Indian botanicals, local distillates, and cold-pressed infusion bars.' }
    ],
    link: { label: 'Partner on Concepts →', href: '/contact?interest=brand' },
    imageBox: {
      icon: '☕',
      title: 'Project Roastery',
      desc: 'Minimal styling, high-efficiency pour-overs, and custom sourdough profiles launching in corporate high-streets.'
    }
  },
  cta: {
    bgText: 'CURIOUS',
    eyebrow: 'Licensing & Franchising',
    title: "Bring Our Brands to<br/>",
    italic: 'Your Market.',
    body: 'We provide complete operational manual binders, supply agreements, visual templates, and tech licensing for our brands.',
    buttons: [
      { href: '/contact?interest=b2b', label: 'Franchise Inquiry →', type: 'btnWhite' },
      { href: '/services', label: 'Explore Services ↗', type: 'btnOutlineWhite' }
    ]
  }
} as const
