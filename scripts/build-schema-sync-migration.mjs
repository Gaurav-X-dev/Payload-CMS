import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const auditRoot = path.resolve(root, 'backups', 'schema-audit')
const migrationRoot = path.resolve(root, 'src', 'migrations')
const liveDiff = JSON.parse(
  await readFile(path.join(auditRoot, 'live-to-current.json'), 'utf8'),
)
const catalogDiff = JSON.parse(
  await readFile(path.join(auditRoot, 'catalog-diff.json'), 'utf8'),
)
const expected = JSON.parse(
  await readFile(path.join(auditRoot, 'current-config.json'), 'utf8'),
).snapshot

const quote = (value) => `"${String(value).replaceAll('"', '""')}"`
const qualified = (value) => `${quote('public')}.${quote(value)}`
const array = (value) => Array.isArray(value) ? value : []
const normalizeAction = (value) => value === 'no action' ? 'no action' : value

const isLegacyMockStatement = (statement) =>
  statement.includes('blocks_mock_block')

const isLegacyHeroConstraintRename = (statement) =>
  statement.includes('ALTER TABLE "_pages_v_blocks_hero_block"')
  && (
    statement.includes('desktop_background_image_id_media_id')
    || statement.includes('mobile_background_image_id_media_id')
  )

const upStatements = liveDiff.statements.filter((statement) =>
  !isLegacyMockStatement(statement)
  && !isLegacyHeroConstraintRename(statement))

const unsafeUp = upStatements.filter((statement) =>
  /^\s*(DROP TABLE|DROP TYPE|DROP INDEX|TRUNCATE|DELETE FROM)/i.test(statement)
  || /^\s*ALTER TABLE .* DROP COLUMN/i.test(statement))

if (unsafeUp.length) {
  throw new Error(`Refusing destructive up migration:\n${unsafeUp.join('\n')}`)
}

const count = (pattern) =>
  upStatements.filter((statement) => pattern.test(statement)).length

const expectedCounts = {
  addColumn: catalogDiff.missingColumns.length,
  addConstraint: catalogDiff.missingForeignKeys.length,
  createIndex: catalogDiff.missingIndexes.length,
  createTable: catalogDiff.missingTables.length,
  createType: catalogDiff.missingEnums.length,
}
const actualCounts = {
  addColumn: count(/\bADD COLUMN\b/i),
  addConstraint: count(/\bADD CONSTRAINT\b/i),
  createIndex: count(/^CREATE (?:UNIQUE )?INDEX\b/i),
  createTable: count(/^CREATE TABLE\b/i),
  createType: count(/^CREATE TYPE\b/i),
}

if (JSON.stringify(actualCounts) !== JSON.stringify(expectedCounts)) {
  throw new Error(
    `Migration/audit count mismatch: ${JSON.stringify({ actualCounts, expectedCounts })}`,
  )
}

const expectedForeignKeys = new Map()
for (const table of Object.values(expected.tables)) {
  for (const foreignKey of Object.values(table.foreignKeys ?? {})) {
    const signature = [
      foreignKey.tableFrom,
      array(foreignKey.columnsFrom).join(','),
      foreignKey.tableTo,
      array(foreignKey.columnsTo).join(','),
      normalizeAction(foreignKey.onDelete),
      normalizeAction(foreignKey.onUpdate),
    ].join('|')
    expectedForeignKeys.set(signature, foreignKey)
  }
}

const downStatements = []

for (const signature of [...catalogDiff.missingForeignKeys].reverse()) {
  const foreignKey = expectedForeignKeys.get(signature)
  if (!foreignKey) {
    throw new Error(`Missing expected foreign key metadata for ${signature}`)
  }
  downStatements.push(
    `ALTER TABLE ${qualified(foreignKey.tableFrom)} DROP CONSTRAINT IF EXISTS ${quote(foreignKey.name)};`,
  )
}

for (const key of [...catalogDiff.missingIndexes].reverse()) {
  const separator = key.indexOf('.')
  const indexName = key.slice(separator + 1)
  downStatements.push(`DROP INDEX IF EXISTS ${qualified(indexName)};`)
}

for (const column of [...catalogDiff.missingColumns].reverse()) {
  downStatements.push(
    `ALTER TABLE ${qualified(column.table)} DROP COLUMN IF EXISTS ${quote(column.column)};`,
  )
}

for (const difference of [...catalogDiff.columnDifferences].reverse()) {
  const notNull = difference.differences.notNull
  if (notNull && notNull.actual === false) {
    downStatements.push(
      `ALTER TABLE ${qualified(difference.table)} ALTER COLUMN ${quote(difference.column)} DROP NOT NULL;`,
    )
  }

  const type = difference.differences.type
  if (type) {
    downStatements.push(
      `ALTER TABLE ${qualified(difference.table)} ALTER COLUMN ${quote(difference.column)} DROP DEFAULT;`,
      `ALTER TABLE ${qualified(difference.table)} ALTER COLUMN ${quote(difference.column)} SET DATA TYPE ${qualified(type.actual)} USING ${quote(difference.column)}::text::${qualified(type.actual)};`,
    )
    if (difference.actualDefault) {
      downStatements.push(
        `ALTER TABLE ${qualified(difference.table)} ALTER COLUMN ${quote(difference.column)} SET DEFAULT ${difference.actualDefault};`,
      )
    }
  }
}

for (const tableName of [...catalogDiff.missingTables].reverse()) {
  downStatements.push(`DROP TABLE IF EXISTS ${qualified(tableName)};`)
}

for (const enumName of [...catalogDiff.missingEnums].reverse()) {
  downStatements.push(`DROP TYPE IF EXISTS ${qualified(enumName)};`)
}

const migrationFiles = (await readdir(migrationRoot))
  .filter((file) => file.endsWith('_ghee_schema_sync.ts'))

if (migrationFiles.length !== 1) {
  throw new Error(`Expected one Ghee schema migration, found ${migrationFiles.length}`)
}

const migrationPath = path.join(migrationRoot, migrationFiles[0])
const source = `import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

/**
 * Synchronizes the existing dev-pushed schema with the current Payload config.
 *
 * The two legacy mock-block tables are intentionally retained. The forward
 * migration contains no table, column, enum, or index drops.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql\`
${upStatements.map((statement) => `    ${statement}`).join('\n')}
  \`)
}

/**
 * Reverses only objects introduced or changed by this migration.
 * Run down only before storing content in the newly introduced schema.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql\`
${downStatements.map((statement) => `    ${statement}`).join('\n')}
  \`)
}
`

await writeFile(migrationPath, source, 'utf8')
console.log(JSON.stringify({
  actualCounts,
  downStatementCount: downStatements.length,
  migrationPath,
  upStatementCount: upStatements.length,
}))
