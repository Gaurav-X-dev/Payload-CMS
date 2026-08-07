import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooContactContent } from '../src/seed/curiousLadooContact'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooContactContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo Contact seed result')
} finally {
  await payload.db.destroy?.()
}
