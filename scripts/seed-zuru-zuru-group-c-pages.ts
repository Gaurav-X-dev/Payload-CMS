import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruGroupCPagesContent } from '../src/seed/zuruZuruGroupCPages'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruGroupCPagesContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru Group C pages seed result')
} finally {
  await payload.db.destroy?.()
}
