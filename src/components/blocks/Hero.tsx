import React from 'react'
import styles from './Hero.module.css'

export const Hero: React.FC<any> = (props) => {
  return (
    <div className={styles.hero}>
      {/* Block Component: Hero */}
      <h2>Hero</h2>
    </div>
  )
}
