import type { FeatureData, FoodItemData, PageMetadataData, TestimonialData } from '../types'
import { imageRoot } from './site'

export const homeData = {
  metadata: {
    title: 'Very Good Ghee Roast | Authentic South Indian Cuisine',
    description: 'Real ingredients, rich flavours and pure ghee — authentic coastal cuisine delivered across Delhi and Gurugram.',
  } satisfies PageMetadataData,
  hero: {
    image: { alt: 'Signature chicken ghee roast', src: `${imageRoot}/hero_ghee_roast.png` },
  },
  featureStrip: [
    { icon: 'leaf', title: 'Authentic Recipes', description: 'Rooted in tradition. Made for today.' },
    { icon: 'ghee', title: 'Cooked In Ghee', description: 'Slow roasted in pure ghee for rich aroma.' },
    { icon: 'bowl', title: 'Freshly Made', description: 'Prepared in small batches. Always fresh.' },
    { icon: 'pepper', title: 'Bold & Spicy', description: 'Flavours that are bold, spicy and deeply satisfying.' },
    { icon: 'moped', title: 'Delivered Fast', description: 'Hot, hygienic and right at your doorstep.' },
  ] satisfies FeatureData[],
  introduction: {
    eyebrow: 'Welcome to Ghee Roast',
    title: 'Where Tradition Meets Luxury.',
    paragraphs: [
      'Since our inception, we have been on a relentless pursuit of culinary perfection. Our brand is built on a single, uncompromising promise: to serve food that speaks to the soul.',
      'By honoring age-old recipes from the Mangalorean coastal kitchen and employing modern culinary techniques, we have crafted an experience that is both deeply comforting and profoundly luxurious.',
    ],
    points: [
      '100% Pure Cow Ghee — No shortcuts, ever.',
      'Fresh spices hand-ground every single morning.',
      'Serving Delhi & Gurugram with love since 1995.',
    ],
    images: [
      { alt: 'Our signature kitchen', src: `${imageRoot}/hero_ghee_roast.png` },
      { alt: 'Premium hand-ground spices', src: `${imageRoot}/premium_spices.png` },
      { alt: 'Fresh quality ingredients', src: `${imageRoot}/quality_ingredients.png` },
    ],
  },
  specials: [
    {
      badge: 'Best Seller',
      category: 'chicken',
      description: 'Tender chicken marinated for 24 hours in Byadgi chili paste, slow-roasted in pure ghee until deeply caramelized.',
      image: { alt: 'Signature Chicken Ghee Roast', src: `${imageRoot}/hero_ghee_roast.png` },
      name: 'Signature Chicken Ghee Roast',
      price: '₹450',
    },
    {
      badge: "Chef's Pick",
      category: 'seafood',
      description: 'Fresh coastal tiger prawns tossed in our signature fiery red masala, perfectly balancing the natural sweetness of the sea.',
      image: { alt: 'Coastal Prawn Ghee Roast', src: `${imageRoot}/quality_ingredients.png` },
      name: 'Coastal Prawn Ghee Roast',
      price: '₹750',
    },
    {
      badge: '100% Veg',
      category: 'veg',
      description: 'Soft, fresh malai paneer cubes roasted to perfection in our iconic spicy and tangy ghee masala. A vegetarian delight.',
      image: { alt: 'Malai Paneer Ghee Roast', src: `${imageRoot}/premium_spices.png` },
      name: 'Malai Paneer Ghee Roast',
      price: '₹380',
    },
  ] satisfies FoodItemData[],
  process: [
    { icon: '1', title: 'Farm Fresh', description: 'Premium spices and ingredients sourced directly from certified farms in Kerala and Karnataka.' },
    { icon: '2', title: 'Hand Pounded', description: 'Spices are freshly ground every single morning using traditional stone grinding methods.' },
    { icon: '3', title: 'Slow Roasted', description: 'Cooked patiently in 100% pure cow ghee over low-to-medium heat for maximum depth of flavour.' },
    { icon: '4', title: 'Delivered Hot', description: 'Hygienically packed and dispatched within minutes so you receive it piping hot at your doorstep.' },
  ] satisfies FeatureData[],
  stats: [['2.5M+', 'Customers Served'], ['15+', 'Premium Locations'], ['12', 'Secret Spices'], ['25+', 'Years of Legacy']],
  testimonials: [
    { name: 'Arjun Mehta', attribution: 'Delhi, via Swiggy', quote: `"The chicken ghee roast is absolutely phenomenal. The depth of flavour from the ghee is unlike anything I've had in Delhi. This is now my weekly ritual."` },
    { name: 'Priya Sharma', attribution: 'Gurugram, via Zomato', quote: `"Ordered the prawn ghee roast for the first time and was completely blown away. The aroma, the spice balance — it's like getting coastal Mangalore right at home in Gurugram!"` },
    { name: 'Rohan Gupta', attribution: 'Delhi, corporate event', quote: '"We ordered VGGR for our corporate team lunch. Everyone was raving about it for days. The catering team was incredibly professional. Highly recommend to everyone!"' },
  ] satisfies TestimonialData[],
  gallery: [
    { alt: 'Signature ghee roast', src: `${imageRoot}/hero_ghee_roast.png` },
    { alt: 'Premium spices', src: `${imageRoot}/premium_spices.png` },
    { alt: 'Fresh ingredients', src: `${imageRoot}/quality_ingredients.png` },
    { alt: 'The original kitchen', src: `${imageRoot}/origin_kitchen.png` },
    { alt: 'Catering event', src: `${imageRoot}/catering_event.png` },
    { alt: 'Our founder chef', src: `${imageRoot}/founder_chef.png` },
  ],
}
