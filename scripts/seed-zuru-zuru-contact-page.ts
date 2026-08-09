import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruContactPageContent } from '../src/seed/zuruZuruContactPage'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruContactPageContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru Contact page seed result')
} finally {
  await payload.db.destroy?.()
}
