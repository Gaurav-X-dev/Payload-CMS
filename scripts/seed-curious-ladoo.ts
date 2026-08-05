import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooContent } from '../src/seed/curiousLadoo'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo seed IDs')
} finally {
  await payload.db.destroy?.()
}
