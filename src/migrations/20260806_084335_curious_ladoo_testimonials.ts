import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta_block" ADD COLUMN "bg_text" varchar;
  ALTER TABLE "_pages_v_blocks_cta_block" ADD COLUMN "bg_text" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_cta_block" DROP COLUMN "bg_text";
  ALTER TABLE "_pages_v_blocks_cta_block" DROP COLUMN "bg_text";`)
}
