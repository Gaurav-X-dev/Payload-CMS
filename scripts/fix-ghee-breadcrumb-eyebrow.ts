// Targeted, idempotent content fix: the 6 non-home Ghee Roast pages' heroBlock.eyebrow was
// seeded as "Home / <Page>" (e.g. "Home / Contact"), but PageHero (Shared.tsx) already
// prepends "Home /" itself — so the rendered breadcrumb doubled up as "Home / Home / Contact".
// This script corrects the live tenant's already-published page documents to the eyebrow
// wording the original static template used (src/themes/ghee-roast/data/*.ts hero.eyebrow),
// touching only the heroBlock.eyebrow field on the 6 known Ghee Roast inner pages. Idempotent —
// safe to re-run; it computes the same target eyebrow each time regardless of current value.
import { createLocalReq, getPayload } from 'payload'

import config from '../src/payload.config'
import type { Page } from '../src/payload-types'
import { validatePageLayout } from '../src/validation/pageLayout'
import { shutdownPayload } from './lib/shutdownPayload'

process.env.DISABLE_PAYLOAD_HMR = 'true'
process.env.PAYLOAD_MIGRATING = 'true'

const requireOne = <T>(label: string, docs: T[]): T => {
  if (docs.length !== 1) {
    throw new Error(`Expected exactly one ${label}; found ${docs.length}. No content was updated.`)
  }
  return docs[0]!
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}

// Matches src/themes/ghee-roast/data/*.ts hero.eyebrow exactly — the documented original
// template's breadcrumb wording (see M2 design-parity audit, Part R item 4).
const TARGET_EYEBROW_BY_SLUG: Record<string, string> = {
  about: 'Our Story',
  catering: 'Services',
  contact: 'Contact Us',
  delivery: 'Doorstep Dining',
  menu: 'Our Menu',
  quality: 'Quality Promise',
}

const payload = await getPayload({ config, disableOnInit: true })

try {
  const tenant = requireOne('active Ghee Roast tenant', (await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: { and: [{ slug: { equals: 'ghee-roast' } }, { isActive: { equals: true } }] },
  })).docs)
  const tenantID = tenant.id
  const superAdmin = requireOne('existing Super Admin', (await payload.find({
    collection: 'users',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: { roles: { contains: 'super_admin' } },
  })).docs)
  const trustedReq = await createLocalReq({ user: superAdmin }, payload)

  const [userCount, tenantCount] = await Promise.all([
    payload.count({ collection: 'users', overrideAccess: true }),
    payload.count({ collection: 'tenants', overrideAccess: true }),
  ])

  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: false,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { tenantId: { equals: tenantID } },
        { isHomePage: { equals: false } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  const results: Array<{ after: unknown; before: unknown; slug: string }> = []

  for (const page of pages.docs) {
    const slug = String(page.slug ?? '')
    const targetEyebrow = TARGET_EYEBROW_BY_SLUG[slug]
    if (!targetEyebrow) {
      console.log(`Skipping "${slug}" — no known target eyebrow mapping (not one of the 6 inner pages).`)
      continue
    }

    const layout = (page.layout ?? []).map((block) => asRecord(block))
    const heroIndex = layout.findIndex((block) => block.blockType === 'heroBlock')
    if (heroIndex === -1) {
      console.log(`Skipping "${slug}" — no heroBlock found in layout.`)
      continue
    }

    const before = layout[heroIndex]!.eyebrow
    if (before === targetEyebrow) {
      console.log(`"${slug}" already correct ("${targetEyebrow}") — no change needed.`)
      continue
    }

    const nextLayout = layout.map((block, index) =>
      index === heroIndex ? { ...block, eyebrow: targetEyebrow } : block,
    )
    const layoutValidation = validatePageLayout(nextLayout)
    if (layoutValidation !== true) {
      throw new Error(`"${slug}" layout validation failed after eyebrow fix: ${layoutValidation}`)
    }

    const updated = await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        layout: nextLayout as unknown as Page['layout'],
      },
      depth: 0,
      draft: false,
      overrideAccess: true,
      req: trustedReq,
    })
    const updatedHero = (updated.layout ?? []).find((block) => block.blockType === 'heroBlock')
    results.push({ after: (updatedHero as { eyebrow?: unknown } | undefined)?.eyebrow, before, slug })
  }

  const [afterUsers, afterTenants] = await Promise.all([
    payload.count({ collection: 'users', overrideAccess: true }),
    payload.count({ collection: 'tenants', overrideAccess: true }),
  ])
  if (afterUsers.totalDocs !== userCount.totalDocs || afterTenants.totalDocs !== tenantCount.totalDocs) {
    throw new Error('User or tenant counts changed unexpectedly — aborting without confirming success.')
  }

  console.log(JSON.stringify({ changed: results, tenant: { id: tenantID, slug: tenant.slug } }, null, 2))
} finally {
  await shutdownPayload(payload)
}
