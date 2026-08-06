import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedCuriousLadooBrandsContent } from '../src/seed/curiousLadooBrands'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedCuriousLadooBrandsContent(payload)
  payload.logger.info({ result }, 'Curious Ladoo Brands seed result')
} finally {
  await payload.db.destroy?.()
}
