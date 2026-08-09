import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruGroupBPagesContent } from '../src/seed/zuruZuruGroupBPages'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruGroupBPagesContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru Group B pages seed result')
} finally {
  await payload.db.destroy?.()
}
