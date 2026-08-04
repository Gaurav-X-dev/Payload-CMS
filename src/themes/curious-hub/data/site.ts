import type { SocialLinkData, ContactInfoData } from '../types'

export const curiousHubSiteData = {
  name: 'Curious Laddoos',
  tagline: 'Building Hospitality Brands',
  description: 'Curious Laddoos is a hospitality agency dedicated to creating, scaling, and managing unique F&B brands globally. We specialize in bringing culinary visions to life.',
  email: 'hello@curiousladdoos.com',
  address: 'New Delhi, India',
  contact: {
    address: '123 Culinary Hub, New Delhi, India 110001',
    email: 'hello@curiousladdoos.com',
    phone: '+91 98765 43210',
  } as ContactInfoData,
  social: [
    { ariaLabel: 'Instagram', href: 'https://instagram.com/curiousladdoos', label: 'Instagram' },
    { ariaLabel: 'LinkedIn', href: 'https://linkedin.com/company/curiousladdoos', label: 'LinkedIn' },
    { ariaLabel: 'Twitter', href: 'https://twitter.com/curiousladdoos', label: 'Twitter' },
  ] as SocialLinkData[],
  copyright: '© 2025 Curious Laddoos Pvt. Ltd. All rights reserved.',
} as const
