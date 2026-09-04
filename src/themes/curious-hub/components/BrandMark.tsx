import styles from './Theme.module.css'

export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`${styles.brandMark} ${className}`.trim()}>
      CL
    </span>
  )
}
