'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { CuriousLadooPortfolioItemData } from '../mappers/dynamicTypes'
import { ScrollReveal } from './ScrollReveal'
import { SmartLink } from './CMSHomePage'
import styles from './Theme.module.css'

const FILTERS = ['all', 'Restaurant Design', 'Menu Engineering', 'Turnkey Operations'] as const
const FILTER_LABELS: Record<(typeof FILTERS)[number], string> = {
  all: 'All Projects',
  'Restaurant Design': 'Restaurant Design',
  'Menu Engineering': 'Menu Engineering',
  'Turnkey Operations': 'Turnkey Operations',
}

type PortfolioFilterGridProps = {
  items: CuriousLadooPortfolioItemData[]
}

export function PortfolioFilterGrid({ items }: PortfolioFilterGridProps) {
  const [filter, setFilter] = useState<string>('all')
  const filteredItems = filter === 'all' ? items : items.filter((item) => item.category === filter)

  return (
    <>
      <ScrollReveal>
        <div className={styles.portfolioFilterContainer}>
          {FILTERS.map((value) => (
            <button
              className={`${styles.portfolioFilterBtn} ${filter === value ? styles.portfolioFilterBtnActive : ''}`}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {FILTER_LABELS[value]}
            </button>
          ))}
        </div>
      </ScrollReveal>

      <div className={styles.portfolioGridCustom} id="portfolioGrid">
        {filteredItems.map((item, i) => (
          <ScrollReveal delay={(i % 3) as 0 | 1 | 2 | 3 | 4} key={`${filter}-${item.id}`}>
            <div className={styles.portfolioItemCard}>
              <div className={styles.portfolioItemImg}>
                {item.image && (
                  <Image alt={item.image.alt} fill loading={i < 3 ? 'eager' : 'lazy'} src={item.image.src} style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div className={styles.portfolioItemBody}>
                {item.category && <span className={styles.portfolioItemCat}>{item.category}</span>}
                <h3 className={styles.portfolioItemTitle}>{item.title}</h3>
                <p className={styles.portfolioItemDesc}>{item.description}</p>
                <SmartLink className={styles.portfolioItemLink} href={item.link?.url ?? '/contact'} rel="noopener noreferrer" target="_blank">
                  {item.link?.label ?? 'Inquire on case'} &rarr;
                </SmartLink>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </>
  )
}
