import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooHomeContent } from '../src/seed/curiousLadooHome'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooHomeContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo Home seed result')
} finally {
  await payload.db.destroy?.()
}
