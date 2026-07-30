import type { Payload } from 'payload'
import {
  developmentSeedEnvironmentFromProcess,
  seedDevelopmentContent,
} from './development'

/**
 * Backwards-compatible seed entry point.
 *
 * Credentials are read exclusively from the documented SEED_* environment
 * variables. The implementation is idempotent and never logs passwords.
 */
export const seed = async (payload: Payload): Promise<void> => {
  await seedDevelopmentContent(payload, developmentSeedEnvironmentFromProcess())
}
