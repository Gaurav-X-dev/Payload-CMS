import type { PageMetadataData, PageHeroData, FaqData } from '../types'

export const servicesData = {
  metadata: {
    title: 'Services — Curious Laddoos',
    description: 'Discover the 15 hospitality services offered by Curious Laddoos, including menu engineering, restaurant consulting, brand creation, and staff training.'
  } as PageMetadataData,
  hero: {
    eyebrow: 'Our Services',
    title: '15 Core Capabilities, One Integrated Philosophy',
    subtitle: 'We build restaurant brands from concept to execution. We engineer menus for profit, optimize kitchens for speed, and implement technologies that scale.',
    image: '/themes/curious-hub/images/banner_services.png'
  },
  overview: {
    title: 'End-to-End',
    italic: 'Sustenance.',
    desc: "A restaurant's success is governed by variables that must work in absolute harmony. Our 15 specialized F&B services ensure that whether you are launching a new concept, systemizing a kitchen, or scaling globally, you are doing so with proven methodologies."
  },
  blocks: [
    {
      id: 'brands',
      number: '01',
      title: 'Restaurant Brands & Incubation',
      desc: 'We conceptualize, launch, and operate premium dining brands. From identifying regional demographic white spaces to crafting distinct menu structures and training culinary directors, we deliver turnkey operations.',
      features: ['Demographic mapping', 'Brand identity design', 'Turnkey launch operations', 'Concept feasibility tests'],
      link: { label: 'Explore Brands →', href: '/brands' },
      image: { src: '/themes/curious-hub/images/zuru_zuru.png', alt: 'Hospitality brand design - Zuru Zuru restaurant setup' },
      reverse: false
    },
    {
      id: 'consulting',
      number: '02',
      title: 'Hospitality Consulting & Advisory',
      desc: 'Our consulting division audits operational bottlenecks, optimizes F&B operations, designs kitchen workflows, and builds standard operating procedures (SOPs) that help hotels and independent operators scale efficiently.',
      features: ['Workflow architecture', 'Standard operating procedures', 'Operations auditing', 'Kitchen flow design'],
      link: { label: 'Get Consulted →', href: '/contact?interest=consulting' },
      image: { src: '/themes/curious-hub/images/consulting.png', alt: 'Hospitality consulting services by Curious Laddoos' },
      reverse: true
    },
    {
      id: 'menu',
      number: '03',
      title: 'Menu Engineering & Design',
      desc: 'We combine culinary artistry with mathematical analysis. We engineer recipes, optimize food cost parameters, train chefs on precise portioning, and design physical and digital menus to maximize gross profits.',
      features: ['Recipe cost engineering', 'Ingredient supply chains', 'Visual menu architecture', 'Portion size optimization'],
      link: { label: 'View Case Studies →', href: '/portfolio' },
      image: { src: '/themes/curious-hub/images/journal1.png', alt: 'Menu engineering and dish cost optimization' },
      reverse: false
    },
    {
      id: 'tech',
      number: '04',
      title: 'F&B Technology & Systems',
      desc: 'We implement advanced technology solutions, integrating POS architectures, real-time inventory tracking, AI-based demand forecasting, and automated supply chains to reduce wastage and increase bottom lines.',
      features: ['POS system integrations', 'Inventory automation', 'Supply chain analytics', 'Kitchen display setups'],
      link: { label: 'How We Integrate →', href: '/how-we-work' },
      image: { src: '/themes/curious-hub/images/kitchen_ops.png', alt: 'Technology integrations in commercial kitchen operations' },
      reverse: true
    }
  ],
  advantage: {
    title: 'Our Systems',
    italic: 'Advantage.',
    desc: 'Why major hospitality names trust Curious Laddoos to build their workflows.',
    items: [
      { title: 'PORTION CONTROL SYSTEMS', desc: 'Our digital SOP binders outline recipe portioning to the gram. This ensures taste consistency across cities while controlling food cost variance to within 1%.' },
      { title: 'COMMERCIAL COMPLIANCE', desc: 'We handle full regulatory audits, including food safety inspections, municipal licensing, pollution controls, and structural approvals for kitchens.' },
      { title: 'STAFF RETENTION MODELS', desc: 'We structure structured training programs and clear career advancement ladders that reduce standard FOH and BOH attrition levels by 30%.' }
    ]
  },
  faqs: {
    title: 'Frequently Asked',
    italic: 'Questions.',
    items: [
      { question: 'How do you charge for menu engineering?', answer: "We work on a fixed-fee model for recipe development, coupled with a performance incentive based on food-cost reductions achieved during the first 6 months post-implementation. This guarantees that our incentives align directly with your brand's profitability." },
      { question: 'Can you design commercial cloud kitchens?', answer: 'Yes. We have specialized CAD planners who design multi-brand kitchen workspaces to optimize thermal exhaustion, chef movement, storage space, and order pickup areas. This design language improves order preparation times by up to 20%.' },
      { question: 'What cities do you consult in?', answer: 'Our consulting team operates pan-India, with active projects in Delhi NCR, Mumbai, Bengaluru, Goa, and Hyderabad. We also consult for selected international hospitality concepts in Dubai and Tokyo.' }
    ] as FaqData[]
  },
  cta: {
    bgText: 'CURIOUS',
    eyebrow: 'Partner with Us',
    title: "Ready to Optimize Your<br/>",
    italic: 'F&B Operations?',
    body: 'Reach out to our brand consultants to arrange a comprehensive operational audit or concept review.',
    buttons: [
      { href: '/contact?interest=consulting', label: 'Book an Audit →', type: 'btnWhite' },
      { href: '/how-we-work', label: 'Our Workflow ↗', type: 'btnOutlineWhite' }
    ]
  }
} as const
