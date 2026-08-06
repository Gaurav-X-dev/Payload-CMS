import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooCareersContent } from '../src/seed/curiousLadooCareers'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooCareersContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo Careers seed result')
} finally {
  await payload.db.destroy?.()
}
