import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedZuruZuruShellContent } from '../src/seed/zuruZuruShell'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedZuruZuruShellContent(payload)
  payload.logger.info({ result }, 'Zuru Zuru shell seed result')
} finally {
  await payload.db.destroy?.()
}
