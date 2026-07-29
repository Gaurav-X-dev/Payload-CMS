'use client'

import { useEffect, useState } from 'react'
import type { FoodItemData } from '../types'
import { Icon } from './Icon'
import { FoodCard } from './Shared'
import styles from './Theme.module.css'

const gurugramDescriptions: Record<string, string> = {
  'Signature Chicken Ghee Roast': 'Tender chicken in Byadgi chili paste, slow-roasted in pure ghee until deeply caramelized.',
  'Kundapur Mutton Ghee Roast': 'Bone-in mutton slow-cooked 4 hours for melt-in-the-mouth texture with rich ghee aromas.',
  'Mangalorean Prawn Ghee Roast': 'Tiger prawns in fiery red masala, balancing the natural sweetness of fresh coastal seafood.',
  'Anjal (Seer Fish) Ghee Roast': 'Premium Seer fish coated in vibrant red masala, pan-fried to a crisp golden exterior.',
  'Malai Paneer Ghee Roast': 'Soft paneer cubes roasted in our iconic spicy and tangy ghee masala. A vegetarian delight.',
  'Mushroom Ghee Roast': 'Earthy button mushrooms in rich spicy Kundapur masala. A must-try for vegetarians.',
  'Ghee Roast Chicken Biryani': 'Basmati rice layered with signature chicken ghee roast, dum-cooked to aromatic perfection.',
  'Mutton Ghee Roast Biryani': 'Rich Kundapur mutton ghee roast layered with fragrant Basmati, slow-cooked to perfection.',
  'Tender Coconut Payasam': 'Fresh tender coconut milk, jaggery, and cardamom. The perfect sweet coastal finish.',
  'Ghee Rice Kheer': 'Traditional rice pudding in pure ghee and milk, sweetened and garnished with cashews and saffron.',
}

export function MenuExplorer({
  categories,
  items,
  locations,
}: {
  categories: string[][]
  items: FoodItemData[]
  locations: Array<{ description: string; id: string; label: string }>
}) {
  const [category, setCategory] = useState('all')
  const [location, setLocation] = useState(locations[0].id)
  const activeLocation = locations.find((item) => item.id === location) ?? locations[0]
  const visibleItems = category === 'all' ? items : items.filter((item) => item.category === category)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('location') === 'gurugram') setLocation('gurugram')
  }, [])

  return (
    <>
      <div className={styles.locationBar}>
        <div className={styles.locationBarInner} role="group" aria-label="Choose location">
          <span><Icon name="map" weight="fill" />Choose Location:</span>
          {locations.map((item) => (
            <button aria-pressed={location === item.id} key={item.id} onClick={() => setLocation(item.id)} type="button">
              <Icon name="map" weight="fill" />{item.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.menuSection}>
        <div className={styles.container}>
          <div className={styles.menuLocationHeader}>
            <div>
              <span>{location === 'delhi' ? 'Delhi Location' : 'Gurugram Location'}</span>
              <h2>Signature Menu</h2>
            </div>
            <div>
              <a className={styles.swiggyButton} href="https://www.swiggy.com/">Swiggy</a>
              <a className={styles.zomatoButton} href="https://www.zomato.com/">Zomato</a>
            </div>
          </div>
          {activeLocation.description && <p className={styles.locationDescription}>{activeLocation.description}</p>}
          <div className={styles.categoryTabs} role="group" aria-label="Filter menu by category">
            {categories.map(([value, label]) => (
              <button aria-pressed={category === value} key={value} onClick={() => setCategory(value)} type="button">
                {label}
              </button>
            ))}
          </div>
          {location === 'gurugram' ? (
            <div className={styles.textMenuList}>
              {visibleItems.map((item) => (
                <article key={item.name}>
                  <div><h3>{item.name}</h3><span aria-hidden="true" /><strong>{item.price}</strong></div>
                  <p>{gurugramDescriptions[item.name]}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.menuList}>
              {visibleItems.map((item) => <FoodCard compact item={item} key={item.name} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
