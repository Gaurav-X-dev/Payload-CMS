import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { Pages } from '../src/collections/Pages.ts'

const migrationSource = readFileSync(
  'src/migrations/20260803_212125_native_page_status_stage_a.ts',
  'utf8',
)
const loaderSource = readFileSync('src/lib/site/gheeRoastContentCore.ts', 'utf8')
const mapperSource = readFileSync('src/themes/ghee-roast/mappers/cmsContent.ts', 'utf8')
const pageQuerySource = loaderSource.slice(
  loaderSource.indexOf('const publishedPageWhere'),
  loaderSource.indexOf("collection: 'site-settings'", loaderSource.indexOf('const publishedPageWhere')),
)

const pageFieldNames = Pages.fields.flatMap((field) => {
  if ('name' in field && typeof field.name === 'string') return [field.name]
  if (field.type !== 'tabs') return []
  return field.tabs.flatMap((tab) => tab.fields.flatMap((tabField) => {
    if ('name' in tabField && typeof tabField.name === 'string') return [tabField.name]
    if (tabField.type !== 'row') return []
    return tabField.fields.flatMap((rowField) =>
      'name' in rowField && typeof rowField.name === 'string' ? [rowField.name] : [])
  }))
})

test('Pages exposes native status in Admin and no custom status field', () => {
  assert.equal(pageFieldNames.includes('status'), false)
  assert.ok(Pages.admin?.defaultColumns?.includes('_status'))
  assert.equal(Pages.admin?.defaultColumns?.includes('status'), false)
})

test('public Page runtime uses only native _status', () => {
  assert.doesNotMatch(pageQuerySource, /\{\s*status:\s*\{\s*equals:\s*['"]published['"]/) 
  assert.doesNotMatch(pageQuerySource, /document\.status/)
  assert.doesNotMatch(mapperSource, /value\.status|page\.status/)
  assert.match(pageQuerySource, /_status:\s*\{\s*equals:\s*['"]published['"]/) 
})

test('Stage A migration is additive, backed up, and reversible', () => {
  const upSource = migrationSource.slice(
    migrationSource.indexOf('export async function up'),
    migrationSource.indexOf('export async function down'),
  )
  const downSource = migrationSource.slice(migrationSource.indexOf('export async function down'))

  assert.match(upSource, /CREATE TABLE "migration_20260803_212125_page_status_backup"/)
  assert.match(upSource, /INSERT INTO "migration_20260803_212125_page_status_backup"/)
  assert.match(upSource, /UPDATE "pages"/)
  assert.match(upSource, /UPDATE "_pages_v"/)
  assert.doesNotMatch(upSource, /\b(?:DROP|TRUNCATE|DELETE)\b/i)
  assert.match(downSource, /SET "_status" = CASE "backup"\."native_status"/)
  assert.match(downSource, /SET "version__status" = CASE "backup"\."native_status"/)
  assert.match(downSource, /Page native statuses were not restored exactly/)
  assert.match(downSource, /Page version native statuses were not restored exactly/)
})
