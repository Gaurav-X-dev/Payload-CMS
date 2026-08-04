import type { NavItemData } from '../types'

export const navigationData: NavItemData[] = [
  {
    href: '/',
    label: 'HOME',
  },
  {
    href: '/about',
    label: 'ABOUT',
    megaMenu: [
      { href: '/about#story', label: 'Our Story' },
      { href: '/about#journey', label: 'Our Journey' },
      { href: '/about#leadership', label: 'Leadership' },
      { href: '/about#philosophy', label: 'Our Philosophy' },
    ],
  },
  {
    href: '/services',
    label: 'SERVICES',
    megaMenu: [
      { href: '/services#brands', label: 'Restaurant Brands' },
      { href: '/services#consulting', label: 'Consulting' },
      { href: '/services#menu', label: 'Menu Engineering' },
      { href: '/services#b2b', label: 'B2B Solutions' },
      { href: '/services#tech', label: 'Technology' },
      { href: '/services#training', label: 'Staff Training' },
    ],
  },
  {
    href: '/brands',
    label: 'BRANDS',
    megaMenu: [
      { href: '/brands#zuru', label: 'Zuru Zuru — Japanese' },
      { href: '/brands#ghee', label: 'Ghee Roast — South Indian' },
      { href: '/brands#quick', label: 'Z-Quick — Delivery' },
      { href: '/brands#future', label: 'Future Brands' },
    ],
  },
  {
    href: '/how-we-work',
    label: 'HOW WE WORK',
  },
  {
    href: '/blog',
    label: 'INSIGHTS',
  },
  {
    href: '/contact',
    label: 'CONTACT',
  },
]
