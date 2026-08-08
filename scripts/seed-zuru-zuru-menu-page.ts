import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruMenuPageContent } from '../src/seed/zuruZuruMenuPage'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruMenuPageContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru Menu page seed result')
} finally {
  await payload.db.destroy?.()
}
