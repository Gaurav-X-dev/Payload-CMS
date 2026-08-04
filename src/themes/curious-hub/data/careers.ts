import type { PageMetadataData, PageHeroData, CareerData } from '../types'

export const careersData = {
  metadata: {
    title: 'Careers | Curious Laddoos',
    description: 'Join our team of passionate hospitality professionals.'
  } as PageMetadataData,
  hero: {
    title: 'Join Our Team',
    subtitle: 'We are always looking for talented individuals.',
    eyebrow: 'Careers'
  } as PageHeroData,
  values: [
    'Passion for Food',
    'Creative Problem Solving',
    'Collaborative Spirit',
    'Commitment to Excellence'
  ],
  positions: [
    { title: 'Executive Chef', department: 'Culinary', location: 'New Delhi, India', type: 'Full-time', description: 'Lead culinary development for new concepts.' },
    { title: 'Marketing Manager', department: 'Marketing', location: 'Mumbai, India', type: 'Full-time', description: 'Drive brand awareness and customer acquisition.' },
    { title: 'Restaurant Manager', department: 'Operations', location: 'Dubai, UAE', type: 'Full-time', description: 'Oversee daily operations of our flagship location.' },
    { title: 'Graphic Designer', department: 'Design', location: 'Remote', type: 'Contract', description: 'Create visual assets for our brand portfolio.' }
  ] as CareerData[]
} as const
