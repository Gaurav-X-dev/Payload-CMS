import type { ContentPageData, FeatureData } from '../types'
import { imageRoot } from './site'

export const cateringData = {
  metadata: {
    title: 'Luxury Catering | Very Good Ghee Roast',
    description: 'Authentic live stations, curated menus and premium service for events of every size.',
  },
  hero: {
    eyebrow: 'Services',
    title: 'Luxury Catering',
    subtitle:
      'Transform special occasions into unforgettable culinary experiences with authentic coastal delicacies.',
  },
  occasions: [
    { icon: 'wedding', title: 'Weddings & Receptions', description: 'Grand setups with live ghee roast stations.' },
    { icon: 'briefcase', title: 'Corporate Events', description: 'Premium boxed meals or polished buffet setups.' },
    { icon: 'cake', title: 'Birthday Parties', description: 'Custom menus designed to delight every age.' },
    { icon: 'martini', title: 'Private Dinners', description: 'Intimate gatherings served with exquisite detail.' },
  ] satisfies FeatureData[],
  experience: {
    eyebrow: 'The Experience',
    title: 'A Culinary Experience Like No Other',
    image: { alt: 'Ghee Roast catering presentation', src: `${imageRoot}/hero_ghee_roast.png` },
    features: [
      { icon: '1', title: 'Custom Menu Curation', description: 'Design a menu with our head chef around your event and guests.' },
      { icon: '2', title: 'Live Cooking Stations', description: 'Fresh ghee roast counters create aroma, theatre and flavour.' },
      { icon: '3', title: 'Professional Service', description: 'Hospitality staff manage setup, service and cleanup.' },
      { icon: '4', title: 'Flexible Capacity', description: 'From an intimate table of 20 to a wedding of 2,000.' },
    ] satisfies FeatureData[],
  },
  stats: [['500+', 'Events Catered'], ['98%', 'Client Satisfaction'], ['20+', 'Years Experience']],
  gallery: [
    { alt: 'Premium catering setup', src: `${imageRoot}/quality_ingredients.png` },
    { alt: 'Ghee roast presentation', src: `${imageRoot}/hero_ghee_roast.png` },
    { alt: 'Freshly ground spices', src: `${imageRoot}/premium_spices.png` },
    { alt: 'Live cooking station', src: `${imageRoot}/origin_kitchen.png` },
  ],
} satisfies ContentPageData & Record<string, unknown>
