import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruGalleryPageContent } from '../src/seed/zuruZuruGalleryPage'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruGalleryPageContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru Gallery page seed result')
} finally {
  await payload.db.destroy?.()
}
