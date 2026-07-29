import type { ContentPageData, FoodItemData } from '../types'
import { imageRoot } from './site'

const menuItems: FoodItemData[] = [
  ['Signature Chicken Ghee Roast', '₹ 450', 'chicken', 'Our flagship dish. Tender chicken marinated for 24 hours in Byadgi chili paste, slow-roasted in pure ghee until deeply caramelized.', 'hero_ghee_roast.png', "Chef's Pick"],
  ['Kundapur Mutton Ghee Roast', '₹ 650', 'mutton', 'Premium tender mutton cuts bone-in, slow-cooked for 4 hours to achieve a melt-in-the-mouth texture with rich ghee aromas.', 'quality_ingredients.png', 'Best Seller'],
  ['Mangalorean Prawn Ghee Roast', '₹ 750', 'seafood', 'Fresh coastal tiger prawns tossed in our signature fiery red masala, perfectly balancing the natural sweetness of the seafood.', 'hero_ghee_roast.png', ''],
  ['Anjal (Seer Fish) Ghee Roast', '₹ 850', 'seafood', 'Premium Seer fish slices coated in our vibrant red ghee roast masala and pan-fried to a crisp, golden exterior.', 'quality_ingredients.png', ''],
  ['Malai Paneer Ghee Roast', '₹ 380', 'veg', 'Soft, fresh malai paneer cubes roasted to perfection in our iconic spicy and tangy ghee masala. A vegetarian delight.', 'premium_spices.png', '100% Veg'],
  ['Mushroom Ghee Roast', '₹ 350', 'veg', 'Earthy button mushrooms infused with our rich, spicy Kundapur masala. An absolute must-try for vegetarians and mushroom lovers.', 'quality_ingredients.png', ''],
  ['Ghee Roast Chicken Biryani', '₹ 550', 'biryani', 'Long grain Basmati rice layered with our signature chicken ghee roast and dum-cooked to aromatic perfection. A crowd favourite.', 'hero_ghee_roast.png', 'Recommended'],
  ['Mutton Ghee Roast Biryani', '₹ 750', 'biryani', 'Rich Kundapur-style mutton ghee roast layered with fragrant Basmati rice, slow-cooked to deliver deep, complex flavors.', 'premium_spices.png', ''],
  ['Tender Coconut Payasam', '₹ 250', 'dessert', 'A cooling, sweet coastal delicacy made with fresh tender coconut milk, jaggery, and a hint of cardamom. The perfect finish.', 'hero_ghee_roast.png', ''],
  ['Ghee Rice Kheer', '₹ 220', 'dessert', 'Traditional rice pudding cooked slowly in pure ghee and milk, sweetened with sugar, garnished with cashews and saffron.', 'premium_spices.png', ''],
].map(([name, price, category, description, file, badge]) => ({
  name,
  price,
  category,
  description,
  badge: badge || undefined,
  image: { alt: name, src: `${imageRoot}/${file}` },
  meta: category === 'chicken' ? ['High Spice', '25 Min', '650 kcal'] : undefined,
}))

export const menuData = {
  metadata: {
    title: 'Our Menu | Very Good Ghee Roast',
    description: 'Explore signature chicken, mutton, seafood, vegetarian, biryani and dessert dishes.',
  },
  hero: {
    eyebrow: 'Our Menu',
    title: 'The Royal Menu',
    subtitle: 'Every dish is a masterpiece — slow-roasted in pure cow ghee with our secret 12-spice masala blend. Available in Delhi & Gurugram.',
  },
  categories: [
    ['all', 'All Items'],
    ['chicken', 'Signature Chicken'],
    ['mutton', 'Mutton'],
    ['seafood', 'Coastal Seafood'],
    ['veg', 'Pure Veg'],
    ['biryani', 'Biryani'],
    ['dessert', 'Desserts'],
  ],
  locations: [
    { id: 'delhi', label: 'Delhi', description: '' },
    { id: 'gurugram', label: 'Gurugram', description: 'Our Gurugram kitchen presents the same authentic flavours — dish name, description, and price.' },
  ],
  items: menuItems,
} satisfies ContentPageData & Record<string, unknown>
