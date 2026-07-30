import type { CollectionSlug, Payload } from 'payload'

export type ResetOptions = {
  confirm: boolean
  dryRun?: boolean
  includeMedia?: boolean
  nodeEnv?: string
  preserveEmails?: string[]
}

type StoredRecord = {
  id: number | string
  email?: string | null
  tenantId?: number | string | { id: number | string } | null
}

type ResetPlanEntry = {
  collection: CollectionSlug
  documents: StoredRecord[]
}

export const tenantContentResetOrder: readonly CollectionSlug[] = [
  'contact-submissions',
  'reservations',
  'redirects',
  'seo',
  'gallery',
  'faqs',
  'events',
  'blog-posts',
  'testimonials',
  'nav',
  'footer',
  'pages',
  'menu-items',
  'menu-categories',
  'teammembers',
  'packages',
  'rooms',
  'amenities',
  'locations',
  'site-settings',
]

export function assertDevelopmentResetAllowed({
  confirm,
  nodeEnv = process.env.NODE_ENV,
}: Pick<ResetOptions, 'confirm' | 'nodeEnv'>): void {
  if (nodeEnv === 'production') {
    throw new Error('Development reset is disabled when NODE_ENV=production.')
  }
  if (!confirm) {
    throw new Error('Development reset requires the explicit --confirm flag.')
  }
}

const listDocuments = async (
  payload: Payload,
  collection: CollectionSlug,
): Promise<StoredRecord[]> => {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 10_000,
    overrideAccess: true,
    pagination: false,
  })
  return result.docs as StoredRecord[]
}

const deleteDocuments = async (
  payload: Payload,
  entry: ResetPlanEntry,
): Promise<number> => {
  for (const document of entry.documents) {
    await payload.delete({
      id: document.id,
      collection: entry.collection,
      context: { developmentReset: true },
      overrideAccess: true,
    })
  }
  return entry.documents.length
}

export async function resetDevelopmentData(
  payload: Payload,
  options: ResetOptions,
): Promise<Record<string, number>> {
  assertDevelopmentResetAllowed(options)

  const preservedEmails = new Set(
    (options.preserveEmails ?? [])
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )

  const [contentEntries, mediaDocuments, tenantDocuments, allUserDocuments] = await Promise.all([
    Promise.all(
      tenantContentResetOrder.map(async (collection): Promise<ResetPlanEntry> => ({
        collection,
        documents: await listDocuments(payload, collection),
      })),
    ),
    listDocuments(payload, 'media'),
    listDocuments(payload, 'tenants'),
    listDocuments(payload, 'users'),
  ])

  const userDocuments = allUserDocuments.filter(
    (document) => !document.email || !preservedEmails.has(document.email.toLowerCase()),
  )
  const deletionPlan: ResetPlanEntry[] = [
    ...contentEntries,
    ...(options.includeMedia
      ? [{ collection: 'media' as const, documents: mediaDocuments }]
      : []),
    { collection: 'tenants', documents: tenantDocuments },
    { collection: 'users', documents: userDocuments },
  ]

  for (const entry of deletionPlan) {
    payload.logger.info(
      { collection: entry.collection, count: entry.documents.length },
      'Development reset planned deletion',
    )
  }
  if (!options.includeMedia) {
    payload.logger.info(
      { collection: 'media', count: mediaDocuments.length },
      'Media records and files will be retained; tenant and user relationships will be detached',
    )
  }

  const summary = Object.fromEntries(
    deletionPlan.map((entry) => [entry.collection, entry.documents.length]),
  )
  if (!options.includeMedia) summary.media = 0

  if (options.dryRun) {
    payload.logger.info({ summary }, 'Development reset dry run complete; no records were changed.')
    return summary
  }

  for (const entry of contentEntries) {
    summary[entry.collection] = await deleteDocuments(payload, entry)
  }

  if (options.includeMedia) {
    summary.media = await deleteDocuments(payload, {
      collection: 'media',
      documents: mediaDocuments,
    })
  } else {
    for (const document of mediaDocuments) {
      await payload.update({
        id: document.id,
        collection: 'media',
        context: { developmentReset: true },
        data: {
          tenantId: null,
          uploadedBy: null,
          updatedBy: null,
        },
        overrideAccess: true,
      })
    }
  }

  for (const document of allUserDocuments) {
    await payload.update({
      id: document.id,
      collection: 'users',
      context: { developmentReset: true },
      data: {
        createdBy: null,
        tenants: [],
        updatedBy: null,
      },
      overrideAccess: true,
    })
  }

  for (const document of tenantDocuments) {
    await payload.update({
      id: document.id,
      collection: 'tenants',
      context: { developmentReset: true },
      data: {
        branding: {
          favicon: null,
          logo: null,
        },
        createdBy: null,
        parentTenant: null,
        updatedBy: null,
      },
      overrideAccess: true,
    })
  }

  summary.tenants = await deleteDocuments(payload, {
    collection: 'tenants',
    documents: tenantDocuments,
  })
  summary.users = await deleteDocuments(payload, {
    collection: 'users',
    documents: userDocuments,
  })

  payload.logger.info({ summary }, 'Development reset complete.')
  return summary
}
