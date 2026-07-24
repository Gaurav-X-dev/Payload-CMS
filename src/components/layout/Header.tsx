import React from 'react'
import styles from './Header.module.css'

export const Header: React.FC<any> = (props) => {
  return (
    <div className={styles.header}>
      {/* Layout Component: Header */}
      <h2>Header</h2>
    </div>
  )
}
