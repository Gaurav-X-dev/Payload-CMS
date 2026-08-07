import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooFaqsContent } from '../src/seed/curiousLadooFaqs'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooFaqsContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo FAQs seed result')
} finally {
  await payload.db.destroy?.()
}
