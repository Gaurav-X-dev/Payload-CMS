'use client'

import { useState } from 'react'
import { ScrollReveal } from './ScrollReveal'
import styles from './Theme.module.css'

type FAQAccordionItemData = {
  answer: string
  id: number
  question: string
}

type FAQAccordionProps = {
  items: FAQAccordionItemData[]
  presentation?: 'plusminus' | 'tabs'
}

function FAQPlusMinusAccordion({ items }: { items: FAQAccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<null | number>(null)

  return (
    <div className={styles.faqWrap}>
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <ScrollReveal delay={(i % 4) as 0 | 1 | 2 | 3 | 4} key={item.id}>
            <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
              <button
                aria-controls={`faq-answer-${item.id}`}
                aria-expanded={isOpen}
                className={styles.faqQuestion}
                id={`faq-btn-${item.id}`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                type="button"
              >
                <span>{item.question}</span>
                <span className={styles.faqIcon} aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              <div
                aria-labelledby={`faq-btn-${item.id}`}
                className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}
                id={`faq-answer-${item.id}`}
                role="region"
              >
                <p>{item.answer}</p>
              </div>
            </div>
          </ScrollReveal>
        )
      })}
    </div>
  )
}

function FAQTabAccordion({ items }: { items: FAQAccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<null | number>(null)

  return (
    <div className={styles.faqWrapContainer}>
      {items.map((item, i) => {
        const isActive = openIndex === i
        return (
          <ScrollReveal delay={(i % 3) as 0 | 1 | 2} key={item.id}>
            <div className={`${styles.faqTabAccordion} ${isActive ? styles.faqTabAccordionActive : ''}`}>
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
          </ScrollReveal>
        )
      })}
    </div>
  )
}

export function FAQAccordion({ items, presentation = 'tabs' }: FAQAccordionProps) {
  return presentation === 'plusminus'
    ? <FAQPlusMinusAccordion items={items} />
    : <FAQTabAccordion items={items} />
}
