import React from 'react'
import styles from './Spacer.module.css'

export const Spacer: React.FC<any> = (props) => {
  return (
    <div className={styles.spacer}>
      {/* Block Component: Spacer */}
      <h2>Spacer</h2>
    </div>
  )
}
