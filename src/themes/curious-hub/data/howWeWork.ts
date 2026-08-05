import type { PageMetadataData, PageHeroData } from '../types'

export const howWeWorkData = {
  metadata: {
    title: 'How We Work — Curious Ladoo',
    description: 'Learn about the five-step F&B development process of Curious Ladoo: Discover, Concept, Build, Launch, and Scale.'
  } as PageMetadataData,
  hero: {
    eyebrow: 'Our Methodology',
    title: 'From Curiosity to Scale: Our F&B Development Roadmap',
    subtitle: "Every brand we design is built on a structured, repeatable five-stage workflow. Here's how we transform blank slates into category-defining culinary icons.",
    image: '/themes/curious-hub/images/t3_interior.png'
  },
  timeline: [
    {
      num: '01',
      title: 'Discovery & Feasibility',
      desc: 'Every project begins with questions. We execute exhaustive demographic analysis, study supply chain constraints, analyze adjacent market competitors, and establish a clear financial model before defining the food concept.',
      image: { src: '/themes/curious-hub/images/team_about.png', alt: 'Discover phase - F&B demography and feasibility research' }
    },
    {
      num: '02',
      title: 'Concept & Brand Design',
      desc: 'Once we establish financial feasibility, our creative division develops the brand narrative. This includes defining the exact culinary profile, visual identities, interior design layouts, signage, and customer service story.',
      image: { src: '/themes/curious-hub/images/zuru_zuru.png', alt: 'Concept phase - brand identity and interior architecture' }
    },
    {
      num: '03',
      title: 'Kitchen Build & SOP Binders',
      desc: 'Our CAD planners layout commercial kitchen spaces to optimize thermal efficiency and worker safety. Concurrently, our operations division documents comprehensive standard operating procedure (SOP) manuals and binds recipe cards.',
      image: { src: '/themes/curious-hub/images/kitchen_ops.png', alt: 'Build phase - kitchen architecture layouts and SOP documentation' }
    },
    {
      num: '04',
      title: 'Operational Launch',
      desc: 'We execute structured soft-launch phases, integrating real-time dining customer feedback to refine seasoning levels, timing loops, and POS processes. Only when these variables are locked do we execute public marketing pushes.',
      image: { src: '/themes/curious-hub/images/ghee_roast.png', alt: 'Launch phase - restaurant soft launch and operations locking' }
    },
    {
      num: '05',
      title: 'Systemized Scale',
      desc: 'With locked operations, we scale concepts. We implement supply chain networks, draft detailed licensing frameworks, select certified franchise partners, and establish remote audit checkpoints to maintain brand consistency.',
      image: { src: '/themes/curious-hub/images/consulting.png', alt: 'Scale phase - franchise licensing models and multi-city supply lines' }
    }
  ],
  lifecycle: {
    eyebrow: 'Project Lifecycle',
    title: 'Speed to',
    italic: 'Market.',
    p1: 'From initial demographic mapping to the final grand launch, our development lifecycle typically takes 16 to 22 weeks. By integrating design, licensing, menu engineering, and compliance under one holding team, we reduce traditional market entry times by 30%.',
    p2: 'We maintain active project dashboards for our licensing partners, ensuring full transparency across contractor timelines, kitchen certifications, and recipe locking.',
    statBox: {
      value: '16 Wks',
      title: 'Average Concept Launch',
      desc: 'From feasibility validation to serving the first dish.'
    }
  },
  cta: {
    bgText: 'CURIOUS',
    eyebrow: 'Partner with Us',
    title: "Have a Space or a Brand Idea?<br/>",
    italic: "Let's Co-Create.",
    body: 'If you are a landlord, investor, or culinary entrepreneur, contact our development division to discuss concepts.',
    buttons: [
      { href: '/contact?interest=brand', label: 'Pitch a Project →', type: 'btnWhite' },
      { href: '/about', label: 'Our Philosophy ↗', type: 'btnOutlineWhite' }
    ]
  }
} as const
