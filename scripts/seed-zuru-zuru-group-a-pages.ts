import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruGroupAPagesContent } from '../src/seed/zuruZuruGroupAPages'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruGroupAPagesContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru Group A pages seed result')
} finally {
  await payload.db.destroy?.()
}
