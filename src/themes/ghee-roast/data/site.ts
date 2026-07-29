import type { LinkData } from '../types'

const imageRoot = '/themes/ghee-roast/images'

export const gheeRoastSiteData = {
  announcement: 'Authentic coastal flavours · Slow-roasted in pure ghee',
  contact: {
    address: 'Delivery Kitchen · Delhi & Gurugram, India',
    hours: ['1 PM – 10 PM', 'Tuesdays Closed'],
    phone: '+91 99102 13465',
  },
  description:
    'South Indian inspired food, and an original saucy Ghee Roast! A premium delivery kitchen bringing authentic coastal flavors right to your doorstep in Delhi & Gurugram.',
  logo: {
    alt: 'Very Good Ghee Roast',
    src: `${imageRoot}/logo.jpg`,
  },
  newsletter: {
    description:
      'Subscribe to our newsletter for exclusive offers, secret recipes, early access to new dishes, and VIP event invitations. No spam — only the good stuff.',
    title: 'Join The Flavour Club',
  },
  orderLinks: [
    { href: 'https://www.swiggy.com/', label: 'Order on Swiggy' },
    { href: 'https://www.zomato.com/', label: 'Order on Zomato' },
  ] satisfies LinkData[],
  siteName: 'Very Good Ghee Roast',
  tagline: 'Flavours that stay.',
}

export { imageRoot }
