import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooBlogContent } from '../src/seed/curiousLadooBlog'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooBlogContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo Blog seed result')
} finally {
  await payload.db.destroy?.()
}
