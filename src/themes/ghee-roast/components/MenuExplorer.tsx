'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { FoodItemData } from '../types'
import type { LinkData } from '../types'
import { Icon } from './Icon'
import { FoodCard } from './Shared'
import styles from './Theme.module.css'

export function MenuExplorer({
  categories,
  heading = 'Signature Menu',
  items,
  locations,
  orderLinks,
}: {
  categories: string[][]
  heading?: string
  items: FoodItemData[]
  locations: Array<{ description: string; id: string; locationID?: string; label: string }>
  orderLinks: LinkData[]
}) {
  const searchParams = useSearchParams()
  const [category, setCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const firstLocation = locations[0]
  if (!firstLocation) {
    return <section className={styles.menuSection}>
      <div className={styles.container}>
        <p className={styles.cmsEmpty}>Location details are being updated.</p>
      </div>
    </section>
  }
  const requestedLocation = searchParams.get('location')
  const location = selectedLocation
    ?? locations.find((item) => item.id === requestedLocation)?.id
    ?? firstLocation.id
  const activeLocation = locations.find((item) => item.id === location) ?? firstLocation
  const activeLocationID = activeLocation.locationID
  // Dishes with no `locationIDs` are served everywhere; otherwise the active location must be one
  // of the outlets it's scoped to. Prices resolve the same way: an active location with a
  // matching locationPricing row overrides the base price, otherwise the base price stands.
  const visibleItems = items
    .filter((item) => category === 'all' || item.category === category)
    .filter((item) => {
      if (!item.locationIDs?.length || !activeLocationID) return true
      return item.locationIDs.some((id) => String(id) === activeLocationID)
    })
    .map((item) => {
      if (!activeLocationID || !item.locationPricing?.length) return item
      const override = item.locationPricing.find((row) => String(row.locationID) === activeLocationID)
      return override ? { ...item, price: `₹${override.price.toLocaleString('en-IN')}` } : item
    })

  return (
    <>
      <div className={styles.locationBar}>
        <div className={styles.locationBarInner} role="group" aria-label="Choose location">
          <span><Icon name="map" weight="fill" />Choose Location:</span>
          {locations.map((item) => (
            <button aria-pressed={location === item.id} key={item.id} onClick={() => setSelectedLocation(item.id)} type="button">
              <Icon name="map" weight="fill" />{item.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.menuSection}>
        <div className={styles.container}>
          <div className={styles.menuLocationHeader}>
            <div>
              <span>{activeLocation.label} Location</span>
              <h2>{heading}</h2>
            </div>
            {orderLinks.length > 0 && <div>
              {orderLinks.map((item) => <a href={item.href} key={`${item.label}-${item.href}`} rel="noopener noreferrer" target="_blank">{item.label}</a>)}
            </div>}
          </div>
          {activeLocation.description && <p className={styles.locationDescription}>{activeLocation.description}</p>}
          <div className={styles.categoryTabs} role="group" aria-label="Filter menu by category">
            {categories.map(([value, label]) => (
              <button aria-pressed={category === value} key={value} onClick={() => setCategory(value)} type="button">
                {label}
              </button>
            ))}
          </div>
          {visibleItems.length > 0
            ? <div className={styles.menuList}>{visibleItems.map((item) => <FoodCard compact item={item} key={item.id ?? item.name} />)}</div>
            : <p className={styles.cmsEmpty}>No available items are published in this category.</p>}
        </div>
      </div>
    </>
  )
}
