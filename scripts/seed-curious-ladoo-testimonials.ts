import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooTestimonialsContent } from '../src/seed/curiousLadooTestimonials'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooTestimonialsContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo Testimonials seed result')
} finally {
  await payload.db.destroy?.()
}
