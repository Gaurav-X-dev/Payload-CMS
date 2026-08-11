import type { DashboardViewServerProps } from '@payloadcms/next/views'
import type { ClientCollectionConfig, ClientGlobalConfig } from 'payload'
import type { CSSProperties } from 'react'
import Link from 'next/link'

import { getDashboardData } from '../../lib/admin/dashboard/getDashboardData'
import type { DayBucket } from '../../lib/admin/dashboard/dateBuckets'
import type { APIStatus, StorageUsage } from '../../lib/admin/dashboard/getSystemHealth'
import {
  AdminBadge,
  AdminCard,
  AdminEmptyState,
  AdminPageHeader,
  AdminStatCard,
} from './AdminUI'
import styles from './EnterpriseDashboard.module.css'

type EntitySummary = {
  createHref?: string
  href: string
  label: string
  singularLabel: string
  slug: string
  supportsDrafts: boolean
  type: 'collection' | 'global'
}

type DashboardUser = {
  email?: string
  name?: string
  roles?: string[] | string
  tenants?: unknown[]
  username?: string
}

const formatIdentifier = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const resolveLabel = (label: unknown, fallback: string) =>
  typeof label === 'string' && label.trim() ? label : formatIdentifier(fallback)

const buildCollectionLabelMap = (
  collections: ClientCollectionConfig[],
): Map<string, unknown> =>
  new Map(collections.map((collection) => [collection.slug, collection.labels?.singular]))

const formatTimestamp = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = -1
  do {
    value /= 1024
    unitIndex += 1
  } while (value >= 1024 && unitIndex < units.length - 1)
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

const apiStatusTone = (status: APIStatus): 'danger' | 'success' | 'warning' => {
  if (status.state === 'operational') return 'success'
  if (status.state === 'degraded') return 'warning'
  return 'danger'
}

const apiStatusLabel = (status: APIStatus): string => {
  const latencySuffix = status.latencyMs !== null ? ` · ${status.latencyMs}ms` : ''
  if (status.state === 'operational') return `Operational${latencySuffix}`
  if (status.state === 'degraded') return `Degraded${latencySuffix}`
  return 'Unavailable'
}

const apiStatusDescription = (status: APIStatus): string =>
  status.state === 'unavailable'
    ? 'The most recent database query from this dashboard failed or could not run.'
    : 'Measured from a real database query already made to render this dashboard.'

const storageUsageDescription = (usage: StorageUsage): string => {
  const countLabel = `${usage.mediaCount} media file${usage.mediaCount === 1 ? '' : 's'}`
  return usage.totalBytes === null
    ? `${countLabel} · size unavailable`
    : `${countLabel} · ${formatBytes(usage.totalBytes)}`
}

const resolveWorkspaceName = (user: DashboardUser) => {
  const firstTenant = user.tenants?.[0]

  if (firstTenant && typeof firstTenant === 'object') {
    const tenant = firstTenant as Record<string, unknown>
    const label = tenant.name ?? tenant.title ?? tenant.label

    if (typeof label === 'string' && label.trim()) return label
  }

  return 'Current workspace'
}

const getInitials = (label: string) =>
  label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

const canCreate = (
  permissions: DashboardViewServerProps['permissions'],
  slug: string,
) => Boolean(permissions?.collections?.[slug]?.create)

const getEntities = ({
  adminRoute,
  collections,
  globals,
  permissions,
  visibleCollectionSlugs,
  visibleGlobalSlugs,
}: {
  adminRoute: string
  collections: ClientCollectionConfig[]
  globals: ClientGlobalConfig[]
  permissions: DashboardViewServerProps['permissions']
  visibleCollectionSlugs: Set<string>
  visibleGlobalSlugs: Set<string>
}): EntitySummary[] => {
  const collectionEntities = collections
    .filter((collection) => visibleCollectionSlugs.has(collection.slug))
    .map((collection): EntitySummary => {
      const href = `${adminRoute}/collections/${collection.slug}`
      const label = resolveLabel(collection.labels?.plural, collection.slug)

      return {
        createHref: canCreate(permissions, collection.slug)
          ? `${href}/create`
          : undefined,
        href,
        label,
        singularLabel: resolveLabel(collection.labels?.singular, collection.slug),
        slug: collection.slug,
        supportsDrafts: Boolean(collection.versions?.drafts),
        type: 'collection',
      }
    })

  const globalEntities = globals
    .filter((global) => visibleGlobalSlugs.has(global.slug))
    .map((global): EntitySummary => ({
      href: `${adminRoute}/globals/${global.slug}`,
      label: resolveLabel(global.label, global.slug),
      singularLabel: resolveLabel(global.label, global.slug),
      slug: global.slug,
      supportsDrafts: Boolean(global.versions?.drafts),
      type: 'global',
    }))

  return [...collectionEntities, ...globalEntities]
}

function SectionHeading({
  description,
  id,
  title,
}: {
  description: string
  id: string
  title: string
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <h2 className={styles.sectionTitle} id={id}>
          {title}
        </h2>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
    </div>
  )
}

function EmptyIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <path d="M5 7.5h14v11H5zM8 4.5h8M9 11h6M9 14.5h4" />
    </svg>
  )
}

function EntityIcon({ label }: { label: string }) {
  return (
    <span aria-hidden="true" className={styles.entityIcon}>
      {getInitials(label) || '•'}
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className={styles.arrowIcon} viewBox="0 0 20 20">
      <path d="M4 10h12m-5-5 5 5-5 5" />
    </svg>
  )
}

function TrendChart({
  caveat,
  countNoun,
  days,
  description,
  emptyMessage,
  hasAnyData,
  title,
  total,
}: {
  caveat?: string
  countNoun: string
  days: DayBucket[]
  description: string
  emptyMessage: string
  hasAnyData: boolean
  title: string
  total: number
}) {
  const maxCount = Math.max(1, ...days.map((day) => day.count))

  return (
    <AdminCard className={styles.chartCard} padding="large">
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
        </div>
        <AdminBadge tone={hasAnyData ? 'success' : 'neutral'}>
          {hasAnyData ? `${total} ${countNoun}` : 'No activity yet'}
        </AdminBadge>
      </div>
      {hasAnyData ? (
        <>
          <div
            aria-label={`${title}: ${days.map((day) => `${day.label} ${day.count}`).join(', ')}`}
            className={styles.chartPlaceholder}
            role="img"
          >
            <span className={`${styles.chartLine} ${styles.chartLineQuarter}`} />
            <span className={`${styles.chartLine} ${styles.chartLineHalf}`} />
            <span className={`${styles.chartLine} ${styles.chartLineThreeQuarters}`} />
            <span className={`${styles.chartLine} ${styles.chartLineEnd}`} />
            <div className={styles.chartBars}>
              {days.map((day) => (
                <span
                  className={styles.chartBar}
                  key={day.date}
                  style={{ '--chart-height': `${(day.count / maxCount) * 100}%` } as CSSProperties}
                  title={`${day.label}: ${day.count}`}
                />
              ))}
            </div>
          </div>
          <div aria-hidden="true" className={styles.chartBarLabels}>
            {days.map((day) => (
              <span key={day.date}>{day.label}</span>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.chartEmpty}>
          <p className={styles.cardDescription}>{emptyMessage}</p>
        </div>
      )}
      {caveat ? <p className={styles.chartCaveat}>{caveat}</p> : null}
    </AdminCard>
  )
}

type SystemCardTone = 'danger' | 'neutral' | 'success' | 'warning'

const SYSTEM_DOT_TONE_CLASS: Record<SystemCardTone, string> = {
  danger: styles.statusDotDanger,
  neutral: styles.statusDot,
  success: styles.statusDotSuccess,
  warning: styles.statusDotWarning,
}

function SystemCard({
  description,
  label,
  statusLabel,
  tone,
}: {
  description: string
  label: string
  statusLabel: string
  tone: SystemCardTone
}) {
  return (
    <AdminCard className={styles.systemCard}>
      <div className={styles.systemStatus}>
        <span aria-hidden="true" className={SYSTEM_DOT_TONE_CLASS[tone]} />
        <AdminBadge tone={tone}>{statusLabel}</AdminBadge>
      </div>
      <h3 className={styles.cardTitle}>{label}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </AdminCard>
  )
}

export async function EnterpriseDashboard({
  clientConfig,
  payload,
  permissions,
  user,
  visibleEntities,
}: DashboardViewServerProps) {
  const dashboardUser = (user ?? {}) as DashboardUser
  const adminRoute = clientConfig.routes.admin
  const visibleCollectionSlugs = new Set(visibleEntities?.collections ?? [])
  const dashboardData = await getDashboardData({
    payload,
    user,
    visibleCollectionSlugs,
  })
  const entities = getEntities({
    adminRoute,
    collections: clientConfig.collections,
    globals: clientConfig.globals,
    permissions,
    visibleCollectionSlugs,
    visibleGlobalSlugs: new Set(visibleEntities?.globals ?? []),
  })
  const collectionLabelBySlug = buildCollectionLabelMap(clientConfig.collections)
  const collections = entities.filter((entity) => entity.type === 'collection')
  const globals = entities.filter((entity) => entity.type === 'global')
  const createActions = collections
    .filter((entity) => entity.createHref)
    .slice(0, 6)
  const roles = Array.isArray(dashboardUser.roles)
    ? dashboardUser.roles
    : dashboardUser.roles
      ? [dashboardUser.roles]
      : []
  const userName =
    dashboardUser.name ?? dashboardUser.username ?? dashboardUser.email ?? 'there'
  const workspaceName = resolveWorkspaceName(dashboardUser)
  const tenantCount = dashboardUser.tenants?.length

  return (
    <main className={styles.dashboard}>
      <AdminPageHeader
        actions={
          <Link className={styles.primaryAction} href={`${adminRoute}/account`}>
            View account
            <ArrowIcon />
          </Link>
        }
        description="A permission-aware overview of your content, configuration, and workspace."
        eyebrow={workspaceName}
        title={`Welcome back, ${userName}`}
      />

      <section aria-labelledby="workspace-heading" className={styles.workspace}>
        <div className={styles.workspaceCopy}>
          <span className={styles.workspaceMark}>
            {getInitials(workspaceName) || 'W'}
          </span>
          <div>
            <h2 className={styles.workspaceTitle} id="workspace-heading">
              {workspaceName}
            </h2>
            <p className={styles.workspaceMeta}>
              {tenantCount === undefined
                ? 'Workspace context is managed by your session.'
                : `${tenantCount} workspace${tenantCount === 1 ? '' : 's'} available`}
            </p>
          </div>
        </div>
        <div aria-label="Assigned roles" className={styles.roleList}>
          {roles.length ? (
            roles.map((role) => (
              <AdminBadge key={role} tone="primary">
                {formatIdentifier(role)}
              </AdminBadge>
            ))
          ) : (
            <AdminBadge tone="neutral">Authenticated user</AdminBadge>
          )}
        </div>
      </section>

      <section aria-labelledby="overview-heading">
        <SectionHeading
          description="Live configuration totals based on the entities available to your account."
          id="overview-heading"
          title="Workspace overview"
        />
        <div className={styles.statsGrid}>
          <AdminStatCard
            description="Available to your account"
            label="Collections"
            value={collections.length}
          />
          <AdminStatCard
            description="Available to your account"
            label="Globals"
            value={globals.length}
          />
          <AdminStatCard
            description="Configured collections"
            label="Draft workflows"
            value={collections.filter((entity) => entity.supportsDrafts).length}
          />
          <AdminStatCard
            change="Configuration-based"
            changeTone="info"
            description="Collections and globals"
            label="Managed resources"
            value={entities.length}
          />
        </div>
      </section>

      <section aria-labelledby="actions-heading">
        <SectionHeading
          description="Create or open resources allowed by your current permissions."
          id="actions-heading"
          title="Quick actions"
        />
        {createActions.length ? (
          <div className={styles.quickActions}>
            {createActions.map((entity) => (
              <Link
                aria-label={`Create ${entity.singularLabel}`}
                className={styles.quickAction}
                href={entity.createHref ?? entity.href}
                key={entity.slug}
              >
                <EntityIcon label={entity.label} />
                <span className={styles.quickActionCopy}>
                  <strong>Create {entity.singularLabel}</strong>
                  <span>Open a new draft</span>
                </span>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            action={
              <Link className={styles.primaryAction} href={`${adminRoute}/account`}>
                Review account access
              </Link>
            }
            description="No create actions are available with your current permissions."
            icon={<EmptyIcon />}
            title="No quick actions available"
          />
        )}
      </section>

      <section aria-labelledby="collections-heading">
        <SectionHeading
          description="Every permission-visible collection appears here automatically."
          id="collections-heading"
          title="Collection overview"
        />
        {collections.length ? (
          <div className={styles.entityGrid}>
            {collections.map((collection) => (
              <AdminCard
                className={styles.entityCard}
                interactive
                key={collection.slug}
              >
                <div className={styles.entityHeader}>
                  <EntityIcon label={collection.label} />
                  <AdminBadge
                    dot
                    tone={collection.supportsDrafts ? 'warning' : 'success'}
                  >
                    {collection.supportsDrafts ? 'Draft enabled' : 'Active'}
                  </AdminBadge>
                </div>
                <div>
                  <h3 className={styles.entityTitle}>{collection.label}</h3>
                  <p className={styles.entitySlug}>{collection.slug}</p>
                </div>
                <dl className={styles.entityMeta}>
                  <div>
                    <dt>Documents</dt>
                    <dd>Available in collection</dd>
                  </div>
                  <div>
                    <dt>Latest update</dt>
                    <dd>Not connected</dd>
                  </div>
                </dl>
                <Link className={styles.entityLink} href={collection.href}>
                  Open collection
                  <ArrowIcon />
                </Link>
              </AdminCard>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            action={
              <Link className={styles.primaryAction} href={`${adminRoute}/account`}>
                Review account access
              </Link>
            }
            description="Collections will appear automatically when they are configured and available to your account."
            icon={<EmptyIcon />}
            title="No collections available"
          />
        )}
      </section>

      <section aria-labelledby="globals-heading">
        <SectionHeading
          description="Global configuration available in the current workspace."
          id="globals-heading"
          title="Global configuration"
        />
        {globals.length ? (
          <div className={styles.globalList}>
            {globals.map((global) => (
              <Link className={styles.globalItem} href={global.href} key={global.slug}>
                <EntityIcon label={global.label} />
                <span className={styles.globalCopy}>
                  <strong>{global.label}</strong>
                  <small>{global.slug}</small>
                </span>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            action={
              <Link className={styles.primaryAction} href={`${adminRoute}/account`}>
                Review account access
              </Link>
            }
            description="Globals will appear when configured and available to your account."
            icon={<EmptyIcon />}
            title="No globals available"
          />
        )}
      </section>

      <section aria-labelledby="insights-heading">
        <SectionHeading
          description="Real activity from your account's content over the last 7 days."
          id="insights-heading"
          title="Content insights"
        />
        <div className={styles.chartGrid}>
          <TrendChart
            countNoun="created"
            days={dashboardData.contentGrowth.days}
            description="Documents created across your visible collections, last 7 days."
            emptyMessage="No content was created in the last 7 days."
            hasAnyData={dashboardData.contentGrowth.hasAnyData}
            title="Content growth"
            total={dashboardData.contentGrowth.total}
          />
          <TrendChart
            caveat={dashboardData.publishingTrend.caveat || undefined}
            countNoun="published"
            days={dashboardData.publishingTrend.days}
            description="Documents genuinely marked published, last 7 days."
            emptyMessage="Nothing was published in the last 7 days."
            hasAnyData={dashboardData.publishingTrend.hasAnyData}
            title="Publishing trend"
            total={dashboardData.publishingTrend.total}
          />
        </div>
      </section>

      <div className={styles.lowerGrid}>
        <div className={styles.activityStack}>
          <section aria-labelledby="activity-heading">
            <SectionHeading
              description="Actor-attributed activity is not currently stored by this application."
              id="activity-heading"
              title="Recent activity"
            />
            <AdminEmptyState
              action={
                collections[0] ? (
                  <Link className={styles.primaryAction} href={collections[0].href}>
                    Open collections
                  </Link>
                ) : (
                  <Link className={styles.primaryAction} href={`${adminRoute}/account`}>
                    Review account access
                  </Link>
                )
              }
              description="This project does not track who created or changed each document (no createdBy/updatedBy on most content types, no audit log). Recent Updates below shows real update timestamps instead."
              icon={<EmptyIcon />}
              title="Activity tracking is not configured"
            />
          </section>

          <section aria-labelledby="updates-heading">
            <SectionHeading
              description="The most recently updated documents you have access to."
              id="updates-heading"
              title="Recent updates"
            />
            {dashboardData.recentUpdates.length ? (
              <div className={styles.updatesList}>
                {dashboardData.recentUpdates.map((update) => {
                  const collectionLabel = resolveLabel(
                    collectionLabelBySlug.get(update.collectionSlug),
                    update.collectionSlug,
                  )
                  return (
                    <Link
                      className={styles.updateItem}
                      href={`${adminRoute}/collections/${update.collectionSlug}/${update.docID}`}
                      key={`${update.collectionSlug}-${update.docID}`}
                    >
                      <span className={styles.updateCopy}>
                        <strong>{update.title}</strong>
                        <span>
                          {collectionLabel}
                          {update.status ? ` · ${formatIdentifier(update.status)}` : ''}
                          {' · '}
                          {formatTimestamp(update.updatedAt)}
                        </span>
                      </span>
                      <ArrowIcon />
                    </Link>
                  )
                })}
              </div>
            ) : (
              <AdminEmptyState
                action={
                  collections[0] ? (
                    <Link className={styles.primaryAction} href={collections[0].href}>
                      Browse content
                    </Link>
                  ) : (
                    <Link className={styles.primaryAction} href={`${adminRoute}/account`}>
                      Review account access
                    </Link>
                  )
                }
                description="No documents in your visible collections have been updated yet."
                icon={<EmptyIcon />}
                title="No updates to display"
              />
            )}
          </section>
        </div>

        <section aria-labelledby="system-heading">
          <SectionHeading
            description="Live operational status, checked on every dashboard load."
            id="system-heading"
            title="System overview"
          />
          <div className={styles.systemGrid}>
            <SystemCard
              description={apiStatusDescription(dashboardData.apiStatus)}
              label="API status"
              statusLabel={apiStatusLabel(dashboardData.apiStatus)}
              tone={apiStatusTone(dashboardData.apiStatus)}
            />
            <SystemCard
              description="No job/queue provider (e.g. BullMQ, Payload Jobs) is configured in this project."
              label="Background jobs"
              statusLabel="Not configured"
              tone="neutral"
            />
            <SystemCard
              description={storageUsageDescription(dashboardData.storageUsage)}
              label="Storage usage"
              statusLabel={dashboardData.storageUsage.provider === 's3' ? 'S3' : 'Local'}
              tone="neutral"
            />
          </div>
        </section>
      </div>
    </main>
  )
}
