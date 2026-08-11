import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { seedEmailSettingsContent } from '../src/seed/emailSettings'

const payload = await getPayload({ config: configPromise })

try {
  const result = await seedEmailSettingsContent(payload)
  payload.logger.info({ result }, 'EmailSettings seed IDs')
} finally {
  await payload.db.destroy?.()
}
