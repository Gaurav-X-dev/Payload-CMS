import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruSEOContent } from '../src/seed/zuruZuruSEO'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruSEOContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru SEO seed result')
} finally {
  await payload.db.destroy?.()
}
