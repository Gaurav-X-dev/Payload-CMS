import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import {
  developmentSeedEnvironmentFromProcess,
  seedDevelopmentContent,
  validateDevelopmentSeedEnvironment,
} from '../src/seed/development'

const environment = developmentSeedEnvironmentFromProcess()
validateDevelopmentSeedEnvironment(environment)
const payload = await getPayload({ config: configPromise })

try {
  const result = await seedDevelopmentContent(payload, environment)
  payload.logger.info({ result }, 'Development seed IDs')
} finally {
  await payload.db.destroy?.()
}
