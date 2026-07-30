import { getPayload } from 'payload'

import type { Config } from '../src/payload-types'
import config from '../src/payload.config'
import { shutdownPayload } from './lib/shutdownPayload'

process.env.DISABLE_PAYLOAD_HMR = 'true'
process.env.PAYLOAD_MIGRATING = 'true'

type CollectionSlug = keyof Config['collections']

const collections: CollectionSlug[] = [
  'users',
  'tenants',
  'media',
  'pages',
  'menu-categories',
  'menu-items',
  'testimonials',
  'teammembers',
  'events',
  'reservations',
  'blog-posts',
  'locations',
  'faqs',
  'contact-submissions',
  'gallery',
  'site-settings',
  'nav',
  'footer',
  'seo',
  'redirects',
  'rooms',
  'amenities',
  'packages',
]

const payload = await getPayload({
  config,
  disableOnInit: true,
})

try {
  const counts: Partial<Record<CollectionSlug, number>> = {}

  for (const collection of collections) {
    const result = await payload.find({
      collection,
      depth: 2,
      limit: 1,
      overrideAccess: true,
    })
    counts[collection] = result.totalDocs
  }

  console.log(JSON.stringify({
    collectionsRead: collections.length,
    counts,
    initialized: true,
  }))
} finally {
  const shutdown = await shutdownPayload(payload)
  console.log(JSON.stringify({
    shutdown: true,
    ...shutdown,
  }))
}
