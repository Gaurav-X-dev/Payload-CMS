import type { ContentPageData, FeatureData } from '../types'

export const deliveryData = {
  metadata: {
    title: 'Delivery | Very Good Ghee Roast',
    description: 'Hot, hygienically packed Ghee Roast delivery across Delhi and Gurugram.',
  },
  hero: {
    eyebrow: 'Doorstep Dining',
    title: 'Hot. Fresh. At Your Door.',
    subtitle: 'Premium ghee roast delivered piping hot, hygienically packed and bursting with flavour.',
  },
  platforms: [
    { name: 'Swiggy', description: 'Superfast delivery across zones', href: 'https://www.swiggy.com/' },
    { name: 'Zomato', description: 'Live tracking and seamless ordering', href: 'https://www.zomato.com/' },
  ],
  steps: [
    { icon: '1', title: 'Browse & Select', description: 'Choose favourites from our menu on Swiggy or Zomato.' },
    { icon: '2', title: 'We Prepare Fresh', description: 'Your order is cooked only after it is placed.' },
    { icon: '3', title: 'Delivered Hot', description: 'Insulated packaging protects aroma and temperature.' },
  ] satisfies FeatureData[],
  zones: [
    { title: 'Delhi Kitchen', description: 'South Delhi, Central Delhi and surrounding delivery zones.' },
    { title: 'Gurugram Kitchen', description: 'Central Gurugram and surrounding delivery zones.' },
  ],
  promises: [
    { icon: 'fire', title: 'Piping Hot', description: 'Insulated, food-safe packaging.' },
    { icon: 'shield', title: 'Hygienic', description: 'Sealed immediately after cooking.' },
    { icon: 'clock', title: 'Made to Order', description: 'No reheating and no warming trays.' },
    { icon: 'heart', title: 'Full Flavour', description: 'The same kitchen recipe, delivered.' },
  ] satisfies FeatureData[],
  faqs: [
    ['Can I track my order?', 'Yes. Swiggy and Zomato provide real-time tracking after dispatch.'],
    ['What if my food arrives cold?', 'Our insulated packaging is designed to retain heat; delivery-partner support can resolve rare transit issues.'],
    ['Do you offer contactless delivery?', 'Select “Leave at door” or contactless delivery during platform checkout.'],
  ],
} satisfies ContentPageData & Record<string, unknown>
