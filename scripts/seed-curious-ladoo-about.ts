import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooAboutContent } from '../src/seed/curiousLadooAbout'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooAboutContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo About seed result')
} finally {
  await payload.db.destroy?.()
}
