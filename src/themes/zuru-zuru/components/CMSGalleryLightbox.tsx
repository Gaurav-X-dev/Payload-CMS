'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Icon } from './Icon'
import type { ZuruZuruGalleryItemData } from '../mappers/dynamicTypes'

/**
 * Matches the original `GalleryLightbox`'s markup/classes and behavior exactly
 * (`zz-gallery-filters` / `zz-gallery-grid` / `zz-gallery-item` / `zz-lightbox` + prev/next/close),
 * including its one quirk: `active` indexes into the FULL unfiltered item list, so the lightbox's
 * prev/next buttons cycle through every image, not just the currently filtered subset — exactly
 * what the original does, preserved rather than "fixed".
 */
const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Food', value: 'food' },
  // The original's "Interior" filter has no matching Gallery.category value of its own — it maps
  // to the existing 'ambiance' option (already semantically equivalent), so no schema addition was
  // needed for it, unlike 'chefs' which had no reasonable existing match (see the Milestone Z7 report).
  { label: 'Interior', value: 'ambiance' },
  { label: 'Chefs', value: 'chefs' },
  { label: 'Events', value: 'events' },
]

export function CMSGalleryLightbox({ items }: { items: ZuruZuruGalleryItemData[] }) {
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState<number | null>(null)
  const visible = items.map((item, index) => ({ ...item, index })).filter((item) => filter === 'all' || item.category === filter)

  return (
    <>
      <div className="zz-gallery-filters">
        {FILTERS.map(({ label, value }) => (
          <button className={filter === value ? 'zz-active' : ''} key={value} onClick={() => setFilter(value)} type="button">
            {label}
          </button>
        ))}
      </div>
      <div className="zz-gallery-grid">
        {visible.map((item) => (
          <button className="zz-gallery-item" key={item.id} onClick={() => setActive(item.index)} type="button">
            <Image alt={item.image.alt || `Zuru Zuru gallery ${item.index + 1}`} fill sizes="(max-width: 700px) 100vw, 33vw" src={item.image.src} />
            <span><Icon name="search" /></span>
          </button>
        ))}
      </div>
      {active !== null && items[active] && (
        <div aria-modal="true" className="zz-lightbox" role="dialog">
          <button aria-label="Close lightbox" className="zz-lightbox-close" onClick={() => setActive(null)} type="button">×</button>
          <button aria-label="Previous image" className="zz-lightbox-prev" onClick={() => setActive((active - 1 + items.length) % items.length)} type="button">←</button>
          <Image alt={items[active].image.alt || `Zuru Zuru gallery ${active + 1}`} height={900} src={items[active].image.src} width={900} />
          <button aria-label="Next image" className="zz-lightbox-next" onClick={() => setActive((active + 1) % items.length)} type="button">→</button>
        </div>
      )}
    </>
  )
}
