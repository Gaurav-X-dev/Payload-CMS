import type { FooterColumnData, SocialLinkData } from '../types'

export const footerData = {
  columns: [
    {
      title: 'Company',
      links: [
        { href: '/about#story', label: 'Our Story' },
        { href: '/about#philosophy', label: 'Our Philosophy' },
        { href: '/about#journey', label: 'Our Journey' },
        { href: '/about#leadership', label: 'Leadership' },
        { href: '/careers', label: 'Careers' }
      ]
    },
    {
      title: 'Brands',
      links: [
        { href: '/brands#zuru', label: 'Zuru Zuru' },
        { href: '/brands#ghee', label: 'Ghee Roast' },
        { href: '/brands#quick', label: 'Z-Quick' },
        { href: '/brands#future', label: 'Future Brands' }
      ]
    },
    {
      title: 'Services',
      links: [
        { href: '/services#consulting', label: 'Consulting' },
        { href: '/services#menu', label: 'Menu Engineering' },
        { href: '/services#franchise', label: 'Franchise Dev' },
        { href: '/services#tech', label: 'Technology' },
        { href: '/services#training', label: 'Staff Training' }
      ]
    },
    {
      title: 'Partner',
      links: [
        { href: '/contact?interest=b2b', label: 'Investors' },
        { href: '/contact?interest=b2b', label: 'Franchise' },
        { href: '/contact?interest=b2b', label: 'Landlords' },
        { href: '/contact?interest=other', label: 'Suppliers' },
        { href: '/blog', label: 'Insights' }
      ]
    }
  ] as FooterColumnData[],
  social: [
    { ariaLabel: 'LinkedIn', href: '#', label: 'in' },
    { ariaLabel: 'Instagram', href: '#', label: 'ig' },
    { ariaLabel: 'YouTube', href: '#', label: 'yt' },
    { ariaLabel: 'Twitter/X', href: '#', label: '𝕏' }
  ] as SocialLinkData[],
  copyright: '© 2025 Curious Laddoos Pvt. Ltd. All rights reserved.'
} as const
