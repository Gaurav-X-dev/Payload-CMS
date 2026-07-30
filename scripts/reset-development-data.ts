import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import {
  assertDevelopmentResetAllowed,
  resetDevelopmentData,
} from '../src/seed/resetDevelopmentData'

const args = process.argv.slice(2)
const preserveEmails = args
  .filter((argument) => argument.startsWith('--preserve-email='))
  .map((argument) => argument.slice('--preserve-email='.length))

assertDevelopmentResetAllowed({
  confirm: args.includes('--confirm'),
  nodeEnv: process.env.NODE_ENV,
})

const payload = await getPayload({ config: configPromise })

try {
  const summary = await resetDevelopmentData(payload, {
    confirm: args.includes('--confirm'),
    dryRun: args.includes('--dry-run'),
    includeMedia: args.includes('--include-media'),
    nodeEnv: process.env.NODE_ENV,
    preserveEmails,
  })
  payload.logger.info({ summary }, 'Deleted record summary')
} finally {
  await payload.db.destroy?.()
}
