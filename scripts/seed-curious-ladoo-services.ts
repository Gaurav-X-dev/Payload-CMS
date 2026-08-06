import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooServicesContent } from '../src/seed/curiousLadooServices'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooServicesContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo Services seed result')
} finally {
  await payload.db.destroy?.()
}
