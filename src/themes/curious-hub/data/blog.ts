import type { PageMetadataData, PageHeroData, JournalArticleData } from '../types'

export const blogData = {
  metadata: {
    title: 'Insights & Journal — Curious Ladoo',
    description: 'Read F&B operational research, menu engineering reports, and restaurant design insights from the Curious Ladoo journal.'
  } as PageMetadataData,
  hero: {
    eyebrow: 'The Journal',
    title: 'Ideas, Reports & F&B Insights',
    subtitle: 'We document our findings in hospitality systems. Read our detailed reports on food cost control, portion metrics, and visual design parameters.',
    image: '/themes/curious-hub/images/team_about.png'
  },
  featured: {
    image: { src: '/themes/curious-hub/images/journal1.png', alt: 'Featured Article - Restaurant Systems vs Talent' },
    eyebrow: 'Featured Article · Operations',
    title: 'Why Systems Beat Talent Every Time in Restaurants',
    desc: 'Most independent restaurants fail not because of culinary shortcomings, but because of poor operational modeling. We dissect how documenting standard operating procedures (SOPs) creates consistency that chef changes can never disrupt.',
    link: 'Read report (8 min) →'
  },
  articles: [
    {
      image: { src: '/themes/curious-hub/images/journal2.png', alt: 'The Future of Dining in India — article cover' },
      tag: 'Culture · 6 min read',
      title: 'The Future of Dining in India',
      excerpt: 'Indian cuisine is having a global moment. How domestic hospitality brands can position themselves to lead the next decade.',
      date: 'May 2025',
      readTime: '6 min read' // using this field just to satisfy JournalArticleData if needed, though we will render tag
    },
    {
      image: { src: '/themes/curious-hub/images/journal3.png', alt: 'Designing Places People Remember — article cover' },
      tag: 'Design · 5 min read',
      title: 'Designing Places People Remember',
      excerpt: 'Physical design is a spatial strategy. We outline how furniture layouts, lighting warmth parameters, and acoustic controls shape guest retention and cover rotations.',
      date: 'April 2025',
      readTime: '5 min read'
    },
    {
      image: { src: '/themes/curious-hub/images/consulting.png', alt: 'SOP auditing process details' },
      tag: 'Operations · 7 min read',
      title: 'SOPs: The Secret to Multi-City Scaling',
      excerpt: 'How central supply agreements and precise step-by-step training manuals protect brand consistency when launching franchise outlets across multiple states.',
      date: 'March 2025',
      readTime: '7 min read'
    },
    {
      image: { src: '/themes/curious-hub/images/culinary_art.png', alt: 'Plated modern Indian dessert cost auditing' },
      tag: 'Engineering · 6 min read',
      title: 'Understanding Portion Control Metrics',
      excerpt: 'Standardizing recipes to the gram ensures cost controls. We showcase how portion costing software models protect profit margins from rising inflation.',
      date: 'February 2025',
      readTime: '6 min read'
    },
    {
      image: { src: '/themes/curious-hub/images/zuru_zuru.png', alt: 'Zuru Zuru Japanese food concept' },
      tag: 'Culture · 9 min read',
      title: 'Izakaya Culture Meets the Indian Palate',
      excerpt: 'A study of how Japanese comfort dining elements were re-contextualized with highball variations to match seasoning expectations in Mumbai and Delhi complexes.',
      date: 'January 2025',
      readTime: '9 min read'
    },
    {
      image: { src: '/themes/curious-hub/images/zquick.png', alt: 'Z-Quick QSR delivery dispatch systems' },
      tag: 'Operations · 8 min read',
      title: 'Optimizing Cloud Kitchen Dispatch Flows',
      excerpt: 'Thermal ventilation boxes, prep queue buffers, and dispatch algorithms — how delivery brands maintain restaurant-grade quality during traffic delays.',
      date: 'December 2024',
      readTime: '8 min read'
    }
  ] as JournalArticleData[],
  newsletter: {
    title: 'Receive F&B Operational Reports',
    desc: 'Join our mailing list to receive quarterly research insights, cost benchmarks, and F&B templates.',
    placeholder: 'Enter your business email',
    button: 'Subscribe →'
  }
} as const
