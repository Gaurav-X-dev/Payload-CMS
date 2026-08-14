import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_faq_block_presentation" AS ENUM('tabs', 'plusminus');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_block_presentation" AS ENUM('tabs', 'plusminus');
  ALTER TABLE "pages_blocks_faq_block" ADD COLUMN "presentation" "enum_pages_blocks_faq_block_presentation" DEFAULT 'tabs';
  ALTER TABLE "pages_blocks_faq_block" ADD COLUMN "featured_only" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_faq_block" ADD COLUMN "presentation" "enum__pages_v_blocks_faq_block_presentation" DEFAULT 'tabs';
  ALTER TABLE "_pages_v_blocks_faq_block" ADD COLUMN "featured_only" boolean DEFAULT false;
  ALTER TABLE "faqs" ADD COLUMN "is_featured" boolean DEFAULT false;
  CREATE INDEX "faqs_is_featured_idx" ON "faqs" USING btree ("is_featured");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "faqs_is_featured_idx";
  ALTER TABLE "pages_blocks_faq_block" DROP COLUMN "presentation";
  ALTER TABLE "pages_blocks_faq_block" DROP COLUMN "featured_only";
  ALTER TABLE "_pages_v_blocks_faq_block" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_faq_block" DROP COLUMN "featured_only";
  ALTER TABLE "faqs" DROP COLUMN "is_featured";
  DROP TYPE "public"."enum_pages_blocks_faq_block_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_faq_block_presentation";`)
}
