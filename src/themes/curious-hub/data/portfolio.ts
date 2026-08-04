import type { PageMetadataData, PageHeroData, PortfolioItemData } from '../types'

export const portfolioData = {
  metadata: {
    title: 'Portfolio & Cases — Curious Laddoos',
    description: 'View the portfolio and case studies of Curious Laddoos, showcasing restaurant designs, engineered menus, and turnaround operations.'
  } as PageMetadataData,
  hero: {
    title: 'Case Studies &\nTurnkey Launches',
    subtitle: 'Explore how we combine menu cost modeling, sensory spatial design, and airtight operations to launch enduring F&B businesses.',
    eyebrow: 'Our Archives'
  } as PageHeroData,
  items: [
    { title: 'Zuru Zuru BKC, Mumbai', description: 'Turnkey launch of a 1,800 sq ft Japanese Izakaya. We executed demographic white space research, kitchen ventilation engineering, and full staff recruitment.', year: '2024', tags: ['Turnkey Operations'], image: { src: '/themes/curious-hub/images/zuru_zuru.png', alt: 'Zuru Zuru BKC Mumbai restaurant design' } },
    { title: 'Ghee Roast CP, New Delhi', description: 'Visual and spatial design celebrating South Indian architectural heritage. Custom carved wooden pillars, warm lighting arrays, and 80-cover layout optimization.', year: '2023', tags: ['Restaurant Design'], image: { src: '/themes/curious-hub/images/ghee_roast.png', alt: 'Ghee Roast Connaught Place Delhi interior design' } },
    { title: 'Modern Indian Fine Dining Audit', description: 'Data-driven menu cost analysis for a leading Goa boutique resort. Portion size standardization and ingredient supply re-routing reduced food cost by 6.2%.', year: '2023', tags: ['Menu Engineering'], image: { src: '/themes/curious-hub/images/culinary_art.png', alt: 'Plated modern Indian dish - menu engineering project' } },
    { title: 'Z-Quick Hub, Gurugram', description: 'Launch of a multi-brand cloud kitchen system. Custom order dispatch monitors and temperature controlled packaging reduced preparation delays by 22%.', year: '2023', tags: ['Turnkey Operations'], image: { src: '/themes/curious-hub/images/zquick.png', alt: 'Z-Quick cloud kitchen deployment' } },
    { title: 'The Coastal Table Redesign', description: 'Full brand architecture turnaround. Analyzed menu item popularity parameters to design a streamlined menu sheet, boosting dinner beverage sales by 35%.', year: '2022', tags: ['Menu Engineering'], image: { src: '/themes/curious-hub/images/consulting.png', alt: 'Coastal Table restaurant menu auditing' } },
    { title: 'Minimalist Roastery Mockup', description: 'Spatial blueprints and material selection lists for a luxury corporate lobby roastery, emphasizing natural woods, light concrete, and open bar counters.', year: '2022', tags: ['Restaurant Design'], image: { src: '/themes/curious-hub/images/visual_story.png', alt: 'Mockup of modern minimalistic coffee roastery interior' } }
  ] as PortfolioItemData[]
} as const
