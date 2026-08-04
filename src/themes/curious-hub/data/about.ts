import type { PageMetadataData, PageHeroData, LeaderData, JourneyMilestoneData } from '../types'

export const aboutData = {
  metadata: {
    title: 'About Us — Curious Laddoos',
    description: 'Learn about Curious Laddoos, our team, our values, and our journey building category-defining hospitality brands in India.'
  } as PageMetadataData,
  hero: {
    eyebrow: 'Our Story',
    title: 'Crafting Experiences, Systemizing Success',
    subtitle: 'We are a different kind of hospitality company — building restaurant brands with operational clarity, visual conviction, and a culture of care.'
  } as PageHeroData,
  story: {
    title: 'Hospitality Built on',
    italic: 'Conviction.',
    p1: 'Founded in New Delhi in 2020, Curious Laddoos began with a singular premise: that the restaurant business is not just an art, but a discipline of systems. While great food brings guests in, it is premium design and airtight operational processes that bring them back.',
    p2: 'Today, we own and operate prominent restaurant brands, run delivery operations, build cloud kitchen architectures, and advise other major hospitality entities across South Asia. We build with curiosity, design with meaning, and manage with mathematical rigor.'
  },
  mission: {
    eyebrow: 'Directives',
    title: 'Mission &',
    italic: 'Vision.',
    missionTitle: 'Our Mission',
    missionDesc: 'To elevate the hospitality ecosystem by designing dining experiences that evoke deep emotion and backing them with technology-led operational models that scale effortlessly.',
    visionTitle: 'Our Vision',
    visionDesc: "To be South Asia's premier hospitality incubator, establishing restaurant brands that define their culinary categories and sets a new global benchmark for operational excellence."
  },
  values: {
    title: 'Our Core',
    italic: 'Values.',
    desc: 'The principles that shape our work, from menu engineering to board meetings.',
    items: [
      {
        number: '01',
        title: 'Question assumptions',
        description: 'We remain curious. We analyze demography, context, and operational viability before drawing a single sketch.'
      },
      {
        number: '02',
        title: 'Design experiences',
        description: 'Design is not decoration. It governs consumer flow, employee efficiency, and sensory memory. Experience is everything.'
      },
      {
        number: '03',
        title: 'Build systems',
        description: 'We document standard operating procedures for everything. Scaling is impossible without repeatable, reliable systems.'
      }
    ]
  },
  leadership: {
    title: 'Our',
    italic: 'Leadership.',
    desc: 'Curious minds. Deliberate builders. Hospitality obsessives.',
    items: [
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
    ] as LeaderData[]
  },
  journey: {
    title: 'Our',
    italic: 'Milestones.',
    items: [
      { year: '2020', event: 'Conceived', description: 'Established in New Delhi with a team of three consultants and one vision.' },
      { year: '2021', event: 'Zuru Zuru Opens', description: 'Our flagship Japanese Izakaya brand opens, setting new standards for comfort dining.' },
      { year: '2022', event: 'Ghee Roast Launches', description: 'Coastal South Indian food celebrated in a premium design layout, leading to rapid expansion.' },
      { year: '2023', event: 'Consulting Expansion', description: 'Curious Laddoos Consulting official launch. Built infrastructure for 20+ partner brands.' },
      { year: '2025+', event: 'Scalability', description: 'Expanding to 5 additional cities, launching delivery systems and technology platforms.' }
    ] as JourneyMilestoneData[]
  },
  cta: {
    bgText: 'CURIOUS',
    eyebrow: 'Work with Us',
    title: "Let's Build Something<br/>that",
    italic: 'Endures.',
    body: "If you share our obsession with design and systems, let's explore synergies together.",
    buttons: [
      { href: '/contact', label: 'Contact Our Team →', type: 'btnWhite' },
      { href: '/services', label: 'Explore Services ↗', type: 'btnOutlineWhite' }
    ]
  }
} as const
