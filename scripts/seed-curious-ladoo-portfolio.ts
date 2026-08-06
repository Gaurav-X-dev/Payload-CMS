import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooPortfolioContent } from '../src/seed/curiousLadooPortfolio'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooPortfolioContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo Portfolio seed result')
} finally {
  await payload.db.destroy?.()
}
