import React from 'react'
import styles from './Card.module.css'

export const Card: React.FC<any> = (props) => {
  return (
    <div className={styles.card}>
      {/* UI Component: Card */}
      <h2>Card</h2>
    </div>
  )
}
