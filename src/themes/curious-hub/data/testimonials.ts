import type { PageMetadataData, PageHeroData, TestimonialData } from '../types'

export const testimonialsData = {
  metadata: {
    title: 'Testimonials | Curious Ladoo',
    description: 'Hear from our clients and partners.'
  } as PageMetadataData,
  hero: {
    title: 'Client Stories',
    subtitle: 'What people say about working with us.',
    eyebrow: 'Testimonials'
  } as PageHeroData,
  testimonials: [
    { author: 'John Doe', role: 'CEO', company: 'Food Group', quote: 'Curious Ladoo transformed our business. Their strategic insights were invaluable.', avatar: '/themes/curious-hub/images/avatar-1.jpg' },
    { author: 'Jane Smith', role: 'Founder', company: 'Cafe Co', quote: 'Their creative approach is unmatched. They brought our vision to life perfectly.', avatar: '/themes/curious-hub/images/avatar-2.jpg' },
    { author: 'Mike Johnson', role: 'Investor', company: 'Capital Partners', quote: 'A reliable partner for F&B investments. Highly recommend their operational expertise.', avatar: '/themes/curious-hub/images/avatar-3.jpg' },
    { author: 'Sarah Williams', role: 'Operations Director', company: 'Hospitality Inc', quote: 'The training programs they implemented drastically improved our service quality.', avatar: '/themes/curious-hub/images/avatar-4.jpg' }
  ] as TestimonialData[]
} as const
