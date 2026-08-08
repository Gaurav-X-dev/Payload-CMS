import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruHomeContent } from '../src/seed/zuruZuruHome'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruHomeContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru Home seed result')
} finally {
  await payload.db.destroy?.()
}
