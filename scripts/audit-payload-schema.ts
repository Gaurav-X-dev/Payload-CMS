import type { PostgresAdapter } from '@payloadcms/db-postgres'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { shutdownPayload } from './lib/shutdownPayload'

process.env.DISABLE_PAYLOAD_HMR = 'true'
process.env.PAYLOAD_MIGRATING = 'true'

const offline = process.argv.includes('offline')
const outputPath = path.resolve(process.cwd(), 'backups', 'schema-audit',
  offline ? 'current-config.json' : 'live-to-current.json')

const payload = await getPayload({
  config,
  disableDBConnect: offline,
  disableOnInit: true,
})
const adapter = payload.db as unknown as PostgresAdapter
const pool = offline ? null : adapter.pool

try {
  const { generateDrizzleJson, pushSchema } = adapter.requireDrizzleKit()
  const result = offline
    ? {
        hasDataLoss: false,
        statementsToExecute: [],
        warnings: [],
        snapshot: await generateDrizzleJson(adapter.schema),
      }
    : {
        ...await pushSchema(
          adapter.schema,
          adapter.drizzle,
          adapter.schemaName ? [adapter.schemaName] : undefined,
          adapter.tablesFilter,
          adapter.extensions.postgis ? ['postgis'] : undefined,
        ),
        snapshot: null,
      }

  const statements = result.statementsToExecute ?? []
  const report = {
    generatedAt: new Date().toISOString(),
    hasDataLoss: result.hasDataLoss,
    snapshot: result.snapshot,
    statementCount: statements.length,
    statements,
    warnings: result.warnings,
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(JSON.stringify({
    hasDataLoss: report.hasDataLoss,
    outputPath,
    statementCount: report.statementCount,
    warningCount: report.warnings.length,
  }))
} finally {
  if (pool) {
    await shutdownPayload(payload)
  } else {
    await payload.destroy()
  }
}
