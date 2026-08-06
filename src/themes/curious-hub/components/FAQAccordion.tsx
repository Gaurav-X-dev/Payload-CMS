'use client'

import { useState } from 'react'
import styles from './Theme.module.css'

type FAQAccordionItemData = {
  answer: string
  id: number
  question: string
}

type FAQAccordionProps = {
  items: FAQAccordionItemData[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<null | number>(null)

  return (
    <div className={styles.faqWrapContainer}>
      {items.map((item, i) => {
        const isActive = openIndex === i
        return (
          <div className={`${styles.faqTabAccordion} ${isActive ? styles.faqTabAccordionActive : ''}`} key={item.id}>
            <div
              className={styles.faqTabHeader}
              onClick={() => setOpenIndex(isActive ? null : i)}
            >
              <h4>{item.question}</h4>
              <span className={styles.faqTabIcon}>+</span>
            </div>
            <div className={styles.faqTabContent}>
              <p>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
