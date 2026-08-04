import type { PageMetadataData, PageHeroData, FaqData } from '../types'

export const contactData = {
  metadata: {
    title: 'Contact Us — Curious Laddoos',
    description: 'Get in touch with Curious Laddoos. Partner with us for restaurant brands, hospitality consulting, franchise development, and systems scaling.'
  } as PageMetadataData,
  hero: {
    eyebrow: 'Connect',
    title: "Let's Build Hospitality That Endures",
    subtitle: 'Whether you have a retail space, a franchise inquiry, want to invest, or need menu engineering, our doors are open.',
    image: '/themes/curious-hub/images/t3_interior.png'
  },
  general: {
    title: 'General Inquiries',
    desc: 'For general partnerships, media requests, or job queries, write to us.',
    email: 'hello@curiousladdoos.com',
    phone: '+91 98765 43210'
  },
  hours: [
    { days: 'Monday — Friday', time: '09:00 AM — 06:00 PM' },
    { days: 'Saturday', time: '10:00 AM — 04:00 PM' },
    { days: 'Sunday', time: 'Closed' }
  ],
  locations: [
    { city: 'New Delhi (HQ)', address: 'First Floor, E-Block, Connaught Place, New Delhi, Delhi 110001' },
    { city: 'Mumbai', address: 'Level 4, The Capital, BKC, Mumbai, Maharashtra 400051' },
    { city: 'Tokyo', address: 'Roppongi Hills Mori Tower, Minato City, Tokyo 106-6108' }
  ],
  map: {
    eyebrow: 'Interactive Directory',
    title: 'Where We',
    italic: 'Operate.',
    desc: 'Click on a marker to view details about our global administrative and consulting workspaces.',
    markers: [
      { left: '65%', top: '52%', label: 'HQ — New Delhi Office' },
      { left: '62%', top: '58%', label: 'Mumbai Office' },
      { left: '78%', top: '38%', label: 'Tokyo Office' },
      { left: '54%', top: '56%', label: 'Dubai Office' }
    ]
  },
  faqs: {
    eyebrow: 'FAQs',
    title: 'Common',
    italic: 'Queries.',
    items: [
      { question: 'How do I partner with Curious Laddoos as a franchisee?', answer: 'We look for franchise partners with operational experience and strong alignment with our brand values. We provide comprehensive operational SOPs, supply chain pipelines, staff training programs, and regional marketing support. Fill out the contact form with the area of interest set to "B2B Solutions" to start.' },
      { question: 'What consulting services do you offer?', answer: 'Our consulting division covers menu engineering, commercial kitchen layouts, F&B brand concept creation, staff recruitment/training, operations auditing, and technology integration (POS/analytics). We work with individual restaurants as well as luxury hotel groups.' },
      { question: 'Are you looking for new retail spaces?', answer: 'Yes, we are actively looking for commercial spaces, high streets, and premium mall spots of 1,200 to 4,000 sq ft across tier-1 cities in India for our brands Zuru Zuru and Ghee Roast. Real estate partners are welcome to write to us directly at hello@curiousladdoos.com.' }
    ] as FaqData[]
  }
} as const
