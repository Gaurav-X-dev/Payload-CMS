import type {
  PageMetadataData, PageHeroData, PhilosophyPillarData, ServiceCardData,
  BrandCardData, B2BCardData, ProcessStepData, EdgePointData, MetricData,
  IndustryItemData, TestimonialData, JournalArticleData, LeaderData,
  JourneyMilestoneData, TickerBrandData
} from '../types'

export const homeData = {
  metadata: {
    title: 'Curious Laddoos — We Build Hospitality That Lasts',
    description: 'Curious Laddoos is a premium hospitality group building restaurant brands, consulting services, cloud kitchens, and hospitality systems across India.'
  } as PageMetadataData,

  hero: {
    title: "We question. We design. We build what's next.",
    subtitle: 'A hospitality company for a different kind of future. We build restaurant brands with curiosity, systems and soul.',
    eyebrow: 'Welcome to Curious Laddoos'
  } as PageHeroData,

  aboutSection: 'Curious Laddoos is a multi-service hospitality group based in New Delhi. We own and operate restaurant brands, provide B2B consulting, design menus, build cloud kitchens, and help other hospitality businesses scale through systems, technology, and training.',

  philosophyPillars: [
    { title: 'Question', description: 'Curiosity drives better ideas. We question assumptions before we design solutions.', number: '01', icon: 'circle-plus' },
    { title: 'Design', description: 'Intentional design creates meaning. Experience first — always. Spaces that shape behaviour.', number: '02', icon: 'grid' },
    { title: 'Build', description: 'Systems bring clarity. People bring life. We build processes that create consistency at scale.', number: '03', icon: 'chart' },
    { title: 'People', description: "Culture builds what strategy can't. We invest in people at every level of the hospitality ecosystem.", number: '04', icon: 'person' },
    { title: 'Care', description: 'Hospitality is at our core — always. Every brand we build is rooted in genuine human care.', number: '05', icon: 'star' }
  ] as PhilosophyPillarData[],

  servicesPreview: [
    { title: 'Restaurant Brands', description: 'We create and operate distinct restaurant brands with unique identities, menus, and guest experiences.', icon: 'building', href: '/services', number: '01' },
    { title: 'Delivery Services', description: 'Premium delivery operations with efficient cloud kitchen infrastructure and logistics management.', icon: 'clock', href: '/services', number: '02' },
    { title: 'Cloud Kitchen', description: 'Delivery-first kitchen models designed for maximum efficiency, scalability, and brand consistency.', icon: 'grid-table', href: '/services', number: '03' },
    { title: 'Hospitality Consulting', description: 'Strategic consulting for restaurant launches, turnarounds, SOP development, and growth planning.', icon: 'growth', href: '/services', number: '04' },
    { title: 'Menu Engineering', description: 'Data-driven menu design that balances profitability, guest preference, and culinary excellence.', icon: 'menu-grid', href: '/services', number: '05' },
    { title: 'Restaurant Design', description: 'Interior concepts and spatial planning that create environments guests return to again and again.', icon: 'diamond', href: '/services', number: '06' },
    { title: 'Brand Strategy', description: 'Full brand architecture — from naming and identity to positioning, tone of voice, and visual language.', icon: 'checkmark-circle', href: '/services', number: '07' },
    { title: 'Operations Management', description: 'SOPs, training frameworks, quality control systems, and ongoing operational support for teams.', icon: 'document', href: '/services', number: '08' },
    { title: 'Franchise Development', description: 'Complete franchise systems — model development, documentation, partner selection, and launch support.', icon: 'arrow-loop', href: '/services', number: '09' },
    { title: 'Kitchen Planning', description: 'Commercial kitchen design, equipment planning, workflow optimization, and compliance guidance.', icon: 'four-squares', href: '/services', number: '10' },
    { title: 'Technology Solutions', description: 'POS systems, inventory management, analytics dashboards, and digital ordering integrations.', icon: 'screen', href: '/services', number: '11' },
    { title: 'Staff Training', description: 'Comprehensive training programs for FOH, BOH, management, and hospitality service standards.', icon: 'network', href: '/services', number: '12' },
    { title: 'Investment Partnerships', description: 'Strategic investment in promising hospitality concepts — from seed to scale with full operational support.', icon: 'star-4', href: '/services', number: '13' },
    { title: 'Managed Services', description: 'End-to-end restaurant management for operators who want professional systems without the overhead.', icon: 'monitor', href: '/services', number: '14' },
    { title: 'New Brand Development', description: 'Full-cycle concept creation — market research, naming, identity, menu, design, and launch strategy.', icon: 'circle-cross', href: '/services', number: '15' }
  ] as ServiceCardData[],

  brandsGrid: [
    {
      name: 'Zuru Zuru',
      type: 'Japanese Izakaya',
      description: 'Comfort food. Reliably good times. A Japanese izakaya experience built for the Indian palate.',
      mark: '九小',
      href: '/brands',
      image: { src: '/themes/curious-hub/images/zuru_zuru.png', alt: 'Zuru Zuru — Japanese Izakaya restaurant' }
    },
    {
      name: 'Ghee Roast',
      type: 'South Indian Cuisine',
      description: 'Coastal flavours. Bold and soulful. South Indian cuisine celebrated with modern design and pride.',
      mark: '✦',
      markStyle: '1.5rem',
      href: '/brands',
      image: { src: '/themes/curious-hub/images/ghee_roast.png', alt: 'Ghee Roast — South Indian coastal restaurant' }
    },
    {
      name: 'Z-Quick',
      type: 'Quick Service & Delivery',
      description: "Great taste. Made fast. Made for now. Premium delivery-first brand built for the modern urban consumer.",
      mark: '⬡⬡',
      href: '/brands',
      image: { src: '/themes/curious-hub/images/zquick.png', alt: 'Z-Quick — Premium delivery brand' }
    },
    {
      name: 'Future Brands',
      type: "What's Next",
      description: "More experiences coming soon. We're always building what's next in hospitality.",
      mark: '+',
      href: '/brands'
    }
  ] as BrandCardData[],

  b2bCards: [
    {
      title: 'Investors',
      description: 'Strategic investment in our brands and new concepts. We co-create with partners who bring capital and conviction.',
      icon: 'star',
      href: 'mailto:hello@curiousladdoos.com',
      link: 'Build With Us'
    },
    {
      title: 'Franchise Partners',
      description: 'Grow with proven brands. Our franchise model comes with full systems, training, and ongoing operational support.',
      icon: 'checkmark-circle',
      href: 'mailto:hello@curiousladdoos.com',
      link: 'Grow With Us'
    },
    {
      title: 'Landlords & Spaces',
      description: "We're looking for premium locations across India. Retail spaces, high streets, and mixed-use developments.",
      icon: 'grid-table',
      href: 'mailto:hello@curiousladdoos.com',
      link: 'Partner With Us'
    },
    {
      title: 'Suppliers & Vendors',
      description: 'Quality ingredients, equipment, and services — we work with suppliers who share our commitment to excellence.',
      icon: 'building',
      href: 'mailto:hello@curiousladdoos.com',
      link: 'Work With Us'
    }
  ] as B2BCardData[],

  processSteps: [
    { title: 'Discover', description: 'Deep dive into market, location, competition, and consumer insight. Curiosity first.', number: 1 },
    { title: 'Concept', description: 'Brand identity, menu direction, interior language, and guest experience story.', number: 2 },
    { title: 'Build', description: 'Kitchen planning, team recruitment, SOP development, technology setup, and design execution.', number: 3 },
    { title: 'Launch', description: 'Soft launch, feedback integration, team training, media strategy, and community building.', number: 4 },
    { title: 'Scale', description: 'Franchise development, multi-city expansion, brand licensing, and investor partnerships.', number: 5 }
  ] as ProcessStepData[],

  edgePoints: [
    { title: 'Systems-First Thinking', description: 'We build processes before aesthetics. Every brand is backed by SOPs, training, and technology.', icon: '◈' },
    { title: 'Design-Led Experience', description: 'Every touchpoint is intentionally designed — from signage to staff uniforms to plate presentation.', icon: '✦' },
    { title: 'Future-Ready Infrastructure', description: 'Our technology and systems are built to scale across cities, formats, and new service categories.', icon: '∞' },
    { title: 'Human at the Core', description: 'Behind every system is a culture of care. Our people are our most important brand asset.', icon: '◯' }
  ] as EdgePointData[],

  metrics: [
    { label: 'Hospitality Services', target: 15, suffix: '+' },
    { label: 'Restaurant Brands', target: 3, suffix: '' },
    { label: 'B2B Partners', target: 50, suffix: '+' },
    { label: 'Cities Active', target: 5, suffix: '+' }
  ] as MetricData[],

  industries: [
    { name: 'Full Service Restaurants', description: 'Dine-in experiences with rich brand identities', icon: '🍜' },
    { name: 'Cloud Kitchens', description: 'Delivery-first, multi-brand ghost kitchens', icon: '📦' },
    { name: 'Hotels & Resorts', description: 'F&B consulting for hospitality properties', icon: '🏨' },
    { name: 'Corporate Catering', description: 'Office and institutional dining solutions', icon: '🏢' },
    { name: 'QSR & Fast Casual', description: 'Quick service formats with brand premium', icon: '🚀' },
    { name: 'Events & Pop-ups', description: 'Temporary hospitality experiences and venues', icon: '🎪' },
    { name: 'F&B Investors', description: 'Strategic advisory for F&B investment portfolios', icon: '📊' },
    { name: 'Real Estate & Malls', description: 'F&B zone planning for commercial properties', icon: '🏗️' }
  ] as IndustryItemData[],

  testimonials: [
    {
      author: 'Rajiv Kumar',
      role: 'Founder, Makhani House',
      company: 'Founder, Makhani House',
      quote: "Curious Laddoos didn't just design our restaurant — they built us a business. The systems they put in place made scaling to three locations feel effortless.",
      avatar: 'RK'
    },
    {
      author: 'Sunita Patel',
      role: 'Director, The Coastal Table',
      company: 'Director, The Coastal Table',
      quote: 'Their menu engineering approach transformed our profitability without compromising what guests loved. Revenue up 40% in six months post-redesign.',
      avatar: 'SP'
    },
    {
      author: 'Arjun Mehta',
      role: 'Franchise Partner, Zuru Zuru',
      company: 'Franchise Partner, Zuru Zuru',
      quote: 'As a franchise partner, the support from CL has been exceptional. Their systems are airtight, and their team genuinely cares about your success.',
      avatar: 'AM'
    }
  ] as TestimonialData[],

  journalArticles: [
    {
      title: 'Why Systems Beat Talent Every Time in Restaurants',
      excerpt: 'Most restaurants fail not because of bad food, but because of bad processes. Here\'s how systemizing your operations builds a business that outlasts any one chef.',
      date: 'June 2025',
      readTime: '8 min read',
      tag: 'Operations · 8 min read',
      image: { src: '/themes/curious-hub/images/journal1.png', alt: 'Why Systems Beat Talent Every Time — article cover' }
    },
    {
      title: 'The Future of Dining in India',
      excerpt: 'Indian cuisine is having a global moment. How domestic hospitality brands can position themselves to lead the next decade.',
      date: 'May 2025',
      readTime: '6 min read',
      tag: 'Culture · 6 min read',
      image: { src: '/themes/curious-hub/images/journal2.png', alt: 'The Future of Dining in India — article cover' }
    },
    {
      title: 'Designing Places People Remember',
      excerpt: "Great restaurant design isn't about aesthetics alone. It's about engineering emotion, memory, and the desire to return.",
      date: 'April 2025',
      readTime: '5 min read',
      tag: 'Design · 5 min read',
      image: { src: '/themes/curious-hub/images/journal3.png', alt: 'Designing Places People Remember — article cover' }
    }
  ] as JournalArticleData[],

  leadershipTeam: [
    {
      name: 'Arjun Rao',
      role: 'Founder & CEO',
      bio: '15 years in hospitality across India and Southeast Asia. Serial brand builder. Passionate about systems that outlast founders.',
      image: { src: '/themes/curious-hub/images/leader_arjun.png', alt: 'Arjun Rao, Founder & CEO' }
    },
    {
      name: 'Priya Malhotra',
      role: 'Chief Brand Officer',
      bio: 'Brand strategist with deep roots in luxury hospitality. Led identity projects for over 30 F&B brands across South Asia.',
      image: { src: '/themes/curious-hub/images/leader_priya.png', alt: 'Priya Malhotra, Chief Brand Officer' }
    },
    {
      name: 'Siddharth Kumar',
      role: 'Head of Operations',
      bio: 'Operations specialist with a systems-first mindset. Built SOPs used by 20+ restaurant brands across 8 cities.',
      image: { src: '/themes/curious-hub/images/leader_siddharth.png', alt: 'Siddharth Kumar, Head of Operations' }
    }
  ] as LeaderData[],

  journeyMilestones: [
    { year: '2020', event: 'Founded', description: 'Curious Laddoos established with a single restaurant consulting project and a big vision.' },
    { year: '2021', event: 'Zuru Zuru Launched', description: 'Our first restaurant brand opens in New Delhi to immediate critical acclaim.' },
    { year: '2022', event: 'Ghee Roast Opens', description: 'South Indian brand launches; franchise enquiries begin within 60 days of opening.' },
    { year: '2023', event: 'B2B Division', description: 'CL Consulting officially launched. 20+ clients in Year 1. Z-Quick delivery brand goes live.' },
    { year: '2025+', event: 'Scale & Expand', description: 'Multi-city franchise rollout, 5+ new brands in development, technology platform launch.' }
  ] as JourneyMilestoneData[],

  partners: [
    { name: 'Zuru Zuru', description: '', icon: '' },
    { name: 'Ghee Roast', description: '', icon: '' },
    { name: 'Z-Quick', description: '', icon: '' },
    { name: 'NRAI', description: '', icon: '' },
    { name: 'India Food Forum', description: '', icon: '' },
    { name: 'Swiggy', description: '', icon: '' },
    { name: 'Zomato', description: '', icon: '' },
    { name: 'Future Brands', description: '', icon: '' }
  ] as TickerBrandData[],

  cta: {
    title: 'Ready to Build Something Remarkable?',
    subtitle: "Whether you're an investor, franchise partner, aspiring restaurateur, or a hospitality brand looking to scale — we'd love to hear from you.",
    buttonLabel: 'hello@curiousladdoos.com →',
    buttonHref: 'mailto:hello@curiousladdoos.com'
  }
} as const
