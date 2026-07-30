import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import pg from 'pg'

const { Client } = pg
const root = process.cwd()
const expectedPath = path.resolve(root, 'backups', 'schema-audit', 'current-config.json')
const outputPath = process.env.SCHEMA_DIFF_OUTPUT
  ? path.resolve(root, process.env.SCHEMA_DIFF_OUTPUT)
  : path.resolve(root, 'backups', 'schema-audit', 'catalog-diff.json')
const expectedReport = JSON.parse(await readFile(expectedPath, 'utf8'))
const expected = expectedReport.snapshot

if (!expected?.tables || !expected?.enums) {
  throw new Error(`Expected schema snapshot is missing from ${expectedPath}`)
}

const normalizeType = (value) => String(value)
  .replace(/^character varying$/, 'varchar')
  .replace(/^double precision$/, 'double precision')
  .replace(/\s+/g, ' ')
  .trim()

const normalizeAction = (value) => value === 'no action' ? 'no action' : value
const array = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
    return []
  }
  if (value === '{}') return []
  return value.slice(1, -1).split(',').map((item) => item.replace(/^"|"$/g, ''))
}
const sorted = (values) => [...values].sort((left, right) => left.localeCompare(right))

const expectedTables = new Map(
  Object.values(expected.tables).map((table) => [table.name, table]),
)
const expectedEnums = new Map(
  Object.values(expected.enums).map((entry) => [entry.name, entry]),
)

const client = new Client({ connectionString: process.env.DATABASE_URI })

try {
  await client.connect()
  await client.query('BEGIN TRANSACTION READ ONLY')

  const liveTables = new Set((await client.query(`
    SELECT c.relname AS name
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  `)).rows.map((row) => row.name))

  const liveColumns = (await client.query(`
    SELECT
      table_class.relname AS table_name,
      attribute.attname AS column_name,
      pg_catalog.format_type(attribute.atttypid, attribute.atttypmod) AS data_type,
      attribute.attnotnull AS not_null,
      pg_catalog.pg_get_expr(default_value.adbin, default_value.adrelid) AS column_default
    FROM pg_catalog.pg_attribute attribute
    JOIN pg_catalog.pg_class table_class ON table_class.oid = attribute.attrelid
    JOIN pg_catalog.pg_namespace namespace ON namespace.oid = table_class.relnamespace
    LEFT JOIN pg_catalog.pg_attrdef default_value
      ON default_value.adrelid = attribute.attrelid
      AND default_value.adnum = attribute.attnum
    WHERE
      namespace.nspname = 'public'
      AND table_class.relkind = 'r'
      AND attribute.attnum > 0
      AND NOT attribute.attisdropped
    ORDER BY table_class.relname, attribute.attnum
  `)).rows

  const liveEnums = (await client.query(`
    SELECT enum_type.typname AS name, enum_value.enumlabel AS value
    FROM pg_catalog.pg_type enum_type
    JOIN pg_catalog.pg_enum enum_value ON enum_value.enumtypid = enum_type.oid
    JOIN pg_catalog.pg_namespace namespace ON namespace.oid = enum_type.typnamespace
    WHERE namespace.nspname = 'public'
    ORDER BY enum_type.typname, enum_value.enumsortorder
  `)).rows

  const liveIndexes = (await client.query(`
    SELECT tablename AS table_name, indexname AS name, indexdef AS definition
    FROM pg_catalog.pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `)).rows

  const liveForeignKeys = (await client.query(`
    SELECT
      constraint_value.conname AS name,
      source_table.relname AS table_name,
      target_table.relname AS target_table,
      ARRAY(
        SELECT source_attribute.attname
        FROM unnest(constraint_value.conkey) WITH ORDINALITY AS source_key(attnum, position)
        JOIN pg_catalog.pg_attribute source_attribute
          ON source_attribute.attrelid = constraint_value.conrelid
          AND source_attribute.attnum = source_key.attnum
        ORDER BY source_key.position
      ) AS columns,
      ARRAY(
        SELECT target_attribute.attname
        FROM unnest(constraint_value.confkey) WITH ORDINALITY AS target_key(attnum, position)
        JOIN pg_catalog.pg_attribute target_attribute
          ON target_attribute.attrelid = constraint_value.confrelid
          AND target_attribute.attnum = target_key.attnum
        ORDER BY target_key.position
      ) AS target_columns,
      CASE constraint_value.confdeltype
        WHEN 'a' THEN 'no action'
        WHEN 'r' THEN 'restrict'
        WHEN 'c' THEN 'cascade'
        WHEN 'n' THEN 'set null'
        WHEN 'd' THEN 'set default'
      END AS on_delete,
      CASE constraint_value.confupdtype
        WHEN 'a' THEN 'no action'
        WHEN 'r' THEN 'restrict'
        WHEN 'c' THEN 'cascade'
        WHEN 'n' THEN 'set null'
        WHEN 'd' THEN 'set default'
      END AS on_update
    FROM pg_catalog.pg_constraint constraint_value
    JOIN pg_catalog.pg_class source_table ON source_table.oid = constraint_value.conrelid
    JOIN pg_catalog.pg_class target_table ON target_table.oid = constraint_value.confrelid
    JOIN pg_catalog.pg_namespace namespace ON namespace.oid = source_table.relnamespace
    WHERE namespace.nspname = 'public' AND constraint_value.contype = 'f'
    ORDER BY source_table.relname, constraint_value.conname
  `)).rows

  const liveUniqueConstraints = (await client.query(`
    SELECT
      constraint_value.conname AS name,
      source_table.relname AS table_name,
      ARRAY(
        SELECT source_attribute.attname
        FROM unnest(constraint_value.conkey) WITH ORDINALITY AS source_key(attnum, position)
        JOIN pg_catalog.pg_attribute source_attribute
          ON source_attribute.attrelid = constraint_value.conrelid
          AND source_attribute.attnum = source_key.attnum
        ORDER BY source_key.position
      ) AS columns
    FROM pg_catalog.pg_constraint constraint_value
    JOIN pg_catalog.pg_class source_table ON source_table.oid = constraint_value.conrelid
    JOIN pg_catalog.pg_namespace namespace ON namespace.oid = source_table.relnamespace
    WHERE namespace.nspname = 'public' AND constraint_value.contype = 'u'
    ORDER BY source_table.relname, constraint_value.conname
  `)).rows

  const liveColumnsByTable = new Map()
  for (const column of liveColumns) {
    const columns = liveColumnsByTable.get(column.table_name) ?? new Map()
    columns.set(column.column_name, column)
    liveColumnsByTable.set(column.table_name, columns)
  }

  const missingTables = sorted(
    [...expectedTables.keys()].filter((name) => !liveTables.has(name)),
  )
  const extraTables = sorted(
    [...liveTables].filter((name) => !expectedTables.has(name)),
  )

  const missingColumns = []
  const extraColumns = []
  const columnDifferences = []

  for (const [tableName, table] of expectedTables) {
    if (!liveTables.has(tableName)) continue
    const expectedColumns = new Map(
      Object.values(table.columns).map((column) => [column.name, column]),
    )
    const actualColumns = liveColumnsByTable.get(tableName) ?? new Map()

    for (const [columnName, column] of expectedColumns) {
      const actual = actualColumns.get(columnName)
      if (!actual) {
        missingColumns.push({
          column: columnName,
          default: column.default ?? null,
          notNull: column.notNull,
          table: tableName,
          type: column.type,
        })
        continue
      }

      const serialMatches = column.type === 'serial'
        && actual.data_type === 'integer'
        && String(actual.column_default).includes('nextval(')
      const expectedType = normalizeType(column.type)
      const actualType = normalizeType(actual.data_type)
      const differences = {}

      if (!serialMatches && expectedType !== actualType) {
        differences.type = { actual: actual.data_type, expected: column.type }
      }
      if (Boolean(column.notNull) !== Boolean(actual.not_null)) {
        differences.notNull = { actual: actual.not_null, expected: column.notNull }
      }
      if (Object.keys(differences).length) {
        columnDifferences.push({
          actualDefault: actual.column_default,
          column: columnName,
          differences,
          expectedDefault: column.default ?? null,
          table: tableName,
        })
      }
    }

    for (const [columnName, column] of actualColumns) {
      if (!expectedColumns.has(columnName)) {
        extraColumns.push({
          column: columnName,
          default: column.column_default,
          notNull: column.not_null,
          table: tableName,
          type: column.data_type,
        })
      }
    }
  }

  const liveEnumValues = new Map()
  for (const entry of liveEnums) {
    const values = liveEnumValues.get(entry.name) ?? []
    values.push(entry.value)
    liveEnumValues.set(entry.name, values)
  }

  const missingEnums = sorted(
    [...expectedEnums.keys()].filter((name) => !liveEnumValues.has(name)),
  )
  const extraEnums = sorted(
    [...liveEnumValues.keys()].filter((name) => !expectedEnums.has(name)),
  )
  const enumDifferences = []
  for (const [name, entry] of expectedEnums) {
    const actual = liveEnumValues.get(name)
    if (actual && JSON.stringify(actual) !== JSON.stringify(entry.values)) {
      enumDifferences.push({ actual, expected: entry.values, name })
    }
  }

  const expectedIndexes = new Map()
  const expectedForeignKeys = new Map()
  const expectedUniqueConstraints = new Map()
  for (const table of expectedTables.values()) {
    for (const index of Object.values(table.indexes ?? {})) {
      expectedIndexes.set(`${table.name}.${index.name}`, {
        ...index,
        table: table.name,
      })
    }
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
    for (const constraint of Object.values(table.uniqueConstraints ?? {})) {
      expectedUniqueConstraints.set(
        `${table.name}|${array(constraint.columns).join(',')}`,
        { ...constraint, table: table.name },
      )
    }
  }

  const liveIndexNames = new Set(
    liveIndexes
      .filter((index) => !index.name.endsWith('_pkey'))
      .map((index) => `${index.table_name}.${index.name}`),
  )
  const missingIndexes = sorted(
    [...expectedIndexes.keys()].filter((name) => !liveIndexNames.has(name)),
  )
  const extraIndexes = sorted(
    [...liveIndexNames].filter((name) => !expectedIndexes.has(name)),
  )

  const liveForeignKeySignatures = new Set(liveForeignKeys.map((foreignKey) => [
    foreignKey.table_name,
    array(foreignKey.columns).join(','),
    foreignKey.target_table,
    array(foreignKey.target_columns).join(','),
    normalizeAction(foreignKey.on_delete),
    normalizeAction(foreignKey.on_update),
  ].join('|')))
  const missingForeignKeys = sorted(
    [...expectedForeignKeys.keys()]
      .filter((signature) => !liveForeignKeySignatures.has(signature)),
  )
  const extraForeignKeys = sorted(
    [...liveForeignKeySignatures]
      .filter((signature) => !expectedForeignKeys.has(signature)),
  )

  const liveUniqueSignatures = new Set(liveUniqueConstraints.map((constraint) =>
    `${constraint.table_name}|${array(constraint.columns).join(',')}`))
  const missingUniqueConstraints = sorted(
    [...expectedUniqueConstraints.keys()]
      .filter((signature) => !liveUniqueSignatures.has(signature)),
  )
  const extraUniqueConstraints = sorted(
    [...liveUniqueSignatures]
      .filter((signature) => !expectedUniqueConstraints.has(signature)),
  )

  const report = {
    columnDifferences,
    enumDifferences,
    expected: {
      enumCount: expectedEnums.size,
      tableCount: expectedTables.size,
    },
    extraColumns,
    extraEnums,
    extraForeignKeys,
    extraIndexes,
    extraTables,
    extraUniqueConstraints,
    generatedAt: new Date().toISOString(),
    live: {
      columnCount: liveColumns.length,
      enumCount: liveEnumValues.size,
      foreignKeyCount: liveForeignKeys.length,
      indexCount: liveIndexes.length,
      tableCount: liveTables.size,
      uniqueConstraintCount: liveUniqueConstraints.length,
    },
    missingColumns,
    missingEnums,
    missingForeignKeys,
    missingIndexes,
    missingTables,
    missingUniqueConstraints,
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify({
    columnDifferenceCount: columnDifferences.length,
    extraColumnCount: extraColumns.length,
    extraEnumCount: extraEnums.length,
    extraTableCount: extraTables.length,
    missingColumnCount: missingColumns.length,
    missingEnumCount: missingEnums.length,
    missingForeignKeyCount: missingForeignKeys.length,
    missingIndexCount: missingIndexes.length,
    missingTableCount: missingTables.length,
    outputPath,
  }))

  await client.query('ROLLBACK')
} finally {
  await client.end()
}
