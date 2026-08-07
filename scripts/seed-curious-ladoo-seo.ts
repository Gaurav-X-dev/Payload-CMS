import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooSeoContent } from '../src/seed/curiousLadooSeo'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooSeoContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo SEO seed result')
} finally {
  await payload.db.destroy?.()
}
