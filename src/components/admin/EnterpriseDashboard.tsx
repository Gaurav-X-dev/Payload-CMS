import type { DashboardViewServerProps } from '@payloadcms/next/views'
import type { ClientCollectionConfig, ClientGlobalConfig } from 'payload'
import type { CSSProperties } from 'react'
import Link from 'next/link'

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

function ChartPlaceholder({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <AdminCard className={styles.chartCard} padding="large">
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardDescription}>{description}</p>
        </div>
        <AdminBadge tone="neutral">Ready for data</AdminBadge>
      </div>
      <div
        aria-label={`${title} chart placeholder`}
        className={styles.chartPlaceholder}
        role="img"
      >
        <span className={`${styles.chartLine} ${styles.chartLineQuarter}`} />
        <span className={`${styles.chartLine} ${styles.chartLineHalf}`} />
        <span className={`${styles.chartLine} ${styles.chartLineThreeQuarters}`} />
        <span className={`${styles.chartLine} ${styles.chartLineEnd}`} />
        <div className={styles.chartBars}>
          {[42, 64, 48, 78, 58, 86, 70].map((height, index) => (
            <span
              className={styles.chartBar}
              key={index}
              style={{ '--chart-height': `${height}%` } as CSSProperties}
            />
          ))}
        </div>
        <span className={styles.srOnly}>
          Connect an analytics source to display this chart.
        </span>
      </div>
    </AdminCard>
  )
}

function SystemCard({
  description,
  label,
}: {
  description: string
  label: string
}) {
  return (
    <AdminCard className={styles.systemCard}>
      <div className={styles.systemStatus}>
        <span aria-hidden="true" className={styles.statusDot} />
        <AdminBadge tone="neutral">Not connected</AdminBadge>
      </div>
      <h3 className={styles.cardTitle}>{label}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </AdminCard>
  )
}

export function EnterpriseDashboard({
  clientConfig,
  permissions,
  user,
  visibleEntities,
}: DashboardViewServerProps) {
  const dashboardUser = (user ?? {}) as DashboardUser
  const adminRoute = clientConfig.routes.admin
  const entities = getEntities({
    adminRoute,
    collections: clientConfig.collections,
    globals: clientConfig.globals,
    permissions,
    visibleCollectionSlugs: new Set(visibleEntities?.collections ?? []),
    visibleGlobalSlugs: new Set(visibleEntities?.globals ?? []),
  })
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
          description="Presentation-ready containers for future analytics integrations."
          id="insights-heading"
          title="Content insights"
        />
        <div className={styles.chartGrid}>
          <ChartPlaceholder
            description="Track documents created and updated over time."
            title="Content growth"
          />
          <ChartPlaceholder
            description="Visualize publishing cadence across collections."
            title="Publishing trend"
          />
        </div>
      </section>

      <div className={styles.lowerGrid}>
        <div className={styles.activityStack}>
          <section aria-labelledby="activity-heading">
            <SectionHeading
              description="A timeline slot for future audit and activity integrations."
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
              description="Content creation, updates, uploads, user activity, and system events will appear here when an activity source is connected."
              icon={<EmptyIcon />}
              title="No activity source connected"
            />
          </section>

          <section aria-labelledby="updates-heading">
            <SectionHeading
              description="A presentation slot for recently changed resources."
              id="updates-heading"
              title="Recent updates"
            />
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
              description="Updated content will appear when a permission-aware activity source is connected."
              icon={<EmptyIcon />}
              title="No updates to display"
            />
          </section>
        </div>

        <section aria-labelledby="system-heading">
          <SectionHeading
            description="Integration-ready operational status surfaces."
            id="system-heading"
            title="System overview"
          />
          <div className={styles.systemGrid}>
            <SystemCard
              description="Connect monitoring to display availability and latency."
              label="API status"
            />
            <SystemCard
              description="Connect a queue provider to display job activity."
              label="Background jobs"
            />
            <SystemCard
              description="Connect storage metrics to display current usage."
              label="Storage usage"
            />
          </div>
        </section>
      </div>
    </main>
  )
}
