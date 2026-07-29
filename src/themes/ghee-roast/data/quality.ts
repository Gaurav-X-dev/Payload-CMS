import type { ContentPageData, FeatureData } from '../types'

export const qualityData = {
  metadata: {
    title: 'Quality Promise | Very Good Ghee Roast',
    description: 'The ingredients, process and six promises behind our zero-shortcut quality standard.',
  },
  hero: {
    eyebrow: 'Quality Promise',
    title: 'Quality Without Compromise',
    subtitle:
      'Every ingredient, every step, every plate—held to the standard that has defined us for three decades.',
  },
  philosophy: {
    title: 'The Standard We Set For Ourselves Is Yours',
    quote: 'Would we serve this to our own family?',
    paragraphs: [
      'Quality is not a marketing claim; it is a daily practice from morning masala grinding to the final dispatch check.',
      'If the answer is anything less than a confident yes, it does not leave our kitchen.',
    ],
    points: [
      'Hand-sourced ingredients from named farms and regions',
      'No preservatives, stabilisers, or shelf-life extenders',
      'Every batch of pure cow ghee tested before use',
      'Daily FSSAI-compliant hygiene audits',
      'The same masala formula since 1995, ground fresh every morning',
    ],
  },
  ingredients: [
    { icon: 'pepper', title: 'Byadgi Chilies', description: 'Haveri-grown chillies provide crimson colour, fruitiness and gentle heat.' },
    { icon: 'ghee', title: 'Pure Cow Ghee', description: 'Traditionally churned cultured-butter ghee from trusted partner farms.' },
    { icon: 'coriander', title: 'Fresh Coriander', description: 'Oil-rich Rajasthan seeds and same-day fresh leaves.' },
  ] satisfies FeatureData[],
  comparison: [
    ['Smoke Point', '485°F / 252°C—ideal for roasting', 'Lower and unstable at high heat'],
    ['Flavour Profile', 'Rich, nutty and spice-enhancing', 'Neutral'],
    ['Trans Fats', 'None', 'Present in many'],
    ['Spice Blooming', 'Superior extraction', 'Limited'],
    ['Tradition', 'Authentic to Kundapur cooking', 'Not traditional'],
  ],
  process: [
    ['6:00 AM', 'Morning Grinding', 'Byadgi chilli, coriander, cumin, pepper and nine spices are stone-ground fresh.'],
    ['8:00 AM', 'Fresh Marination', 'Fresh proteins marinate in the morning-ground paste for at least two hours.'],
    ['10:00 AM', 'Slow Roasting', 'Cast-iron roasting with pure ghee added in measured stages takes 35–45 minutes.'],
    ['From 1 PM', 'Hot Dispatch', 'Orders are packed immediately—never held or reheated.'],
  ],
  pledges: [
    { icon: 'check', title: 'No Preservatives', description: 'Zero artificial preservatives, MSG or synthetic enhancers.' },
    { icon: 'spice', title: 'No Artificial Colors', description: 'The colour comes entirely from Byadgi chillies.' },
    { icon: 'shield', title: 'Hygiene Certified', description: 'Daily internal and quarterly third-party checks.' },
    { icon: 'sun', title: 'Fresh Daily', description: 'New masala, marination and batches every morning.' },
    { icon: 'ghee', title: '100% Pure Ghee', description: 'Every received batch is purity tested.' },
    { icon: 'hands', title: 'Handcrafted', description: 'Core grinding, marination and roasting remain human-led.' },
  ] satisfies FeatureData[],
} satisfies ContentPageData & Record<string, unknown>
