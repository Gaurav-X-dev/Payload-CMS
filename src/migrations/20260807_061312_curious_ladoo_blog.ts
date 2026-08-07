import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_blogpreview_block_presentation" AS ENUM('preview', 'index');
  CREATE TYPE "public"."enum__pages_v_blocks_blogpreview_block_presentation" AS ENUM('preview', 'index');
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "presentation" "enum_pages_blocks_blogpreview_block_presentation" DEFAULT 'preview';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "presentation" "enum__pages_v_blocks_blogpreview_block_presentation" DEFAULT 'preview';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "presentation";
  DROP TYPE "public"."enum_pages_blocks_blogpreview_block_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_blogpreview_block_presentation";`)
}
