import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react'

import styles from './AdminUI.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'small' | 'medium' | 'large'
type StatusTone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'danger'

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ')

export interface AdminButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  icon?: ReactNode
  isLoading?: boolean
  loadingLabel?: string
  size?: ButtonSize
  variant?: ButtonVariant
}

export function AdminButton({
  children,
  className,
  disabled = false,
  icon,
  isLoading = false,
  loadingLabel = 'Loading',
  size = 'medium',
  type = 'button',
  variant = 'primary',
  ...props
}: AdminButtonProps) {
  return (
    <button
      {...props}
      aria-busy={isLoading || undefined}
      className={classNames(
        styles.button,
        styles[`button_${variant}`],
        styles[`control_${size}`],
        className,
      )}
      disabled={disabled || isLoading}
      type={type}
    >
      {isLoading ? (
        <span aria-hidden="true" className={styles.spinner} />
      ) : icon ? (
        <span aria-hidden="true" className={styles.controlIcon}>
          {icon}
        </span>
      ) : null}
      <span>{isLoading ? loadingLabel : children}</span>
    </button>
  )
}

export interface AdminIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  icon: ReactNode
  label: string
  size?: ButtonSize
  variant?: 'secondary' | 'ghost' | 'danger'
}

export function AdminIconButton({
  className,
  icon,
  label,
  size = 'medium',
  title,
  type = 'button',
  variant = 'ghost',
  ...props
}: AdminIconButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      className={classNames(
        styles.iconButton,
        styles[`button_${variant}`],
        styles[`control_${size}`],
        className,
      )}
      title={title ?? label}
      type={type}
    >
      <span aria-hidden="true" className={styles.controlIcon}>
        {icon}
      </span>
    </button>
  )
}

export interface AdminBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  dot?: boolean
  tone?: StatusTone
}

export function AdminBadge({
  children,
  className,
  dot = false,
  tone = 'neutral',
  ...props
}: AdminBadgeProps) {
  return (
    <span
      {...props}
      className={classNames(styles.badge, styles[`tone_${tone}`], className)}
    >
      {dot ? <span aria-hidden="true" className={styles.badgeDot} /> : null}
      {children}
    </span>
  )
}

export interface AdminCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
}

export function AdminCard({
  children,
  className,
  interactive = false,
  padding = 'medium',
  ...props
}: AdminCardProps) {
  return (
    <div
      {...props}
      className={classNames(
        styles.card,
        styles[`cardPadding_${padding}`],
        interactive && styles.cardInteractive,
        className,
      )}
    >
      {children}
    </div>
  )
}

export interface AdminStatCardProps extends Omit<AdminCardProps, 'children'> {
  change?: string
  changeTone?: StatusTone
  description?: string
  icon?: ReactNode
  label: string
  value: ReactNode
}

export function AdminStatCard({
  change,
  changeTone = 'neutral',
  className,
  description,
  icon,
  label,
  value,
  ...props
}: AdminStatCardProps) {
  return (
    <AdminCard {...props} className={classNames(styles.statCard, className)}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        {icon ? (
          <span aria-hidden="true" className={styles.statIcon}>
            {icon}
          </span>
        ) : null}
      </div>
      <div className={styles.statValue}>{value}</div>
      {change || description ? (
        <div className={styles.statMeta}>
          {change ? <AdminBadge tone={changeTone}>{change}</AdminBadge> : null}
          {description ? <span>{description}</span> : null}
        </div>
      ) : null}
    </AdminCard>
  )
}

export interface AdminSearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  containerClassName?: string
  inputSize?: ButtonSize
  label: string
}

export function AdminSearchInput({
  className,
  containerClassName,
  disabled,
  inputSize = 'medium',
  label,
  placeholder = 'Search',
  ...props
}: AdminSearchInputProps) {
  return (
    <label
      className={classNames(
        styles.search,
        styles[`control_${inputSize}`],
        disabled && styles.searchDisabled,
        containerClassName,
      )}
    >
      <span className={styles.srOnly}>{label}</span>
      <svg
        aria-hidden="true"
        className={styles.searchIcon}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        {...props}
        className={classNames(styles.searchInput, className)}
        disabled={disabled}
        placeholder={placeholder}
        type="search"
      />
    </label>
  )
}

export interface AdminEmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode
  description?: string
  icon?: ReactNode
  title: string
}

export function AdminEmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: AdminEmptyStateProps) {
  return (
    <div {...props} className={classNames(styles.state, className)}>
      {icon ? (
        <span aria-hidden="true" className={styles.stateIcon}>
          {icon}
        </span>
      ) : null}
      <h3 className={styles.stateTitle}>{title}</h3>
      {description ? <p className={styles.stateDescription}>{description}</p> : null}
      {action ? <div className={styles.stateAction}>{action}</div> : null}
    </div>
  )
}

export interface AdminPageHeaderProps extends HTMLAttributes<HTMLElement> {
  actions?: ReactNode
  description?: string
  eyebrow?: string
  title: string
}

export function AdminPageHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
  ...props
}: AdminPageHeaderProps) {
  return (
    <header {...props} className={classNames(styles.pageHeader, className)}>
      <div className={styles.headerCopy}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h1 className={styles.pageTitle}>{title}</h1>
        {description ? <p className={styles.headerDescription}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.headerActions}>{actions}</div> : null}
    </header>
  )
}

export interface AdminSectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode
  description?: string
  title: string
}

export function AdminSectionHeader({
  action,
  className,
  description,
  title,
  ...props
}: AdminSectionHeaderProps) {
  return (
    <div {...props} className={classNames(styles.sectionHeader, className)}>
      <div className={styles.headerCopy}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      </div>
      {action ? <div className={styles.headerActions}>{action}</div> : null}
    </div>
  )
}

export interface AdminLoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
  lines?: number
  variant?:
    | 'actions'
    | 'card'
    | 'chart'
    | 'list'
    | 'stat'
    | 'table'
    | 'text'
    | 'timeline'
    | 'widget'
}

export function AdminLoadingSkeleton({
  className,
  label = 'Loading content',
  lines = 3,
  variant = 'text',
  ...props
}: AdminLoadingSkeletonProps) {
  const lineCount = Math.max(1, Math.min(lines, 8))

  return (
    <div
      {...props}
      aria-label={label}
      className={classNames(
        styles.skeleton,
        styles[`skeleton_${variant}`],
        className,
      )}
      role="status"
    >
      {variant === 'text' || variant === 'list' || variant === 'timeline'
        ? Array.from({ length: lineCount }, (_, index) => (
            <span
              aria-hidden="true"
              className={classNames(
                styles.skeletonLine,
                index === lineCount - 1 && styles.skeletonLineLast,
              )}
              key={index}
            />
          ))
        : variant === 'table' || variant === 'actions'
          ? Array.from({ length: lineCount }, (_, index) => (
              <span
                aria-hidden="true"
                className={styles.skeletonBlock}
                key={index}
              />
            ))
          : <span aria-hidden="true" className={styles.skeletonBlock} />}
    </div>
  )
}

export interface AdminErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode
  message?: string
  title?: string
}

export function AdminErrorState({
  action,
  className,
  message = 'Please try again or contact an administrator if the problem continues.',
  title = 'Unable to load this content',
  ...props
}: AdminErrorStateProps) {
  return (
    <div
      {...props}
      className={classNames(styles.state, styles.errorState, className)}
      role="alert"
    >
      <span aria-hidden="true" className={styles.errorIcon}>
        !
      </span>
      <h3 className={styles.stateTitle}>{title}</h3>
      <p className={styles.stateDescription}>{message}</p>
      {action ? <div className={styles.stateAction}>{action}</div> : null}
    </div>
  )
}
