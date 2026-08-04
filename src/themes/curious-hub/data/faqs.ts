import type { PageMetadataData, PageHeroData, FaqData } from '../types'

export const faqsData = {
  metadata: {
    title: 'FAQs | Curious Laddoos',
    description: 'Frequently asked questions about our services and process.'
  } as PageMetadataData,
  hero: {
    title: 'Frequently Asked Questions',
    subtitle: 'Find answers to common inquiries.',
    eyebrow: 'FAQs'
  } as PageHeroData,
  faqs: [
    { question: 'What services do you offer?', answer: 'We offer end-to-end hospitality consulting, including concept creation, menu development, operations management, and brand marketing.' },
    { question: 'Do you work with international clients?', answer: 'Yes, we have experience building and managing brands globally, tailoring our approach to local markets.' },
    { question: 'How long does a typical project take?', answer: 'The timeline varies depending on the scope. A full concept creation and launch usually takes 6 to 12 months.' },
    { question: 'Do you offer ongoing management?', answer: 'Absolutely. We provide operational management services to ensure your concept continues to thrive post-launch.' },
    { question: 'Can you help with funding or investment?', answer: 'While we are not a financial institution, we can assist in creating business plans and connecting you with our network of F&B investors.' }
  ] as FaqData[]
} as const
