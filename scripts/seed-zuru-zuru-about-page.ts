import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruAboutPageContent } from '../src/seed/zuruZuruAboutPage'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruAboutPageContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru About page seed result')
} finally {
  await payload.db.destroy?.()
}
