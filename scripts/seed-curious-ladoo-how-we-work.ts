import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooHowWeWorkContent } from '../src/seed/curiousLadooHowWeWork'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooHowWeWorkContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo How We Work seed result')
} finally {
  await payload.db.destroy?.()
}
