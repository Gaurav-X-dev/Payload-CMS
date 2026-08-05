import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_contentgrid_block_presentation" ADD VALUE 'values';
  ALTER TYPE "public"."enum_pages_blocks_contentgrid_block_presentation" ADD VALUE 'mission-vision';
  ALTER TYPE "public"."enum_pages_blocks_story_block_layout" ADD VALUE 'simple';
  ALTER TYPE "public"."enum__pages_v_blocks_contentgrid_block_presentation" ADD VALUE 'values';
  ALTER TYPE "public"."enum__pages_v_blocks_contentgrid_block_presentation" ADD VALUE 'mission-vision';
  ALTER TYPE "public"."enum__pages_v_blocks_story_block_layout" ADD VALUE 'simple';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_contentgrid_block" ALTER COLUMN "presentation" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_contentgrid_block" ALTER COLUMN "presentation" SET DEFAULT 'grid'::text;
  DROP TYPE "public"."enum_pages_blocks_contentgrid_block_presentation";
  CREATE TYPE "public"."enum_pages_blocks_contentgrid_block_presentation" AS ENUM('grid', 'pillars', 'edge', 'industries', 'b2b', 'services', 'partners');
  ALTER TABLE "pages_blocks_contentgrid_block" ALTER COLUMN "presentation" SET DEFAULT 'grid'::"public"."enum_pages_blocks_contentgrid_block_presentation";
  ALTER TABLE "pages_blocks_contentgrid_block" ALTER COLUMN "presentation" SET DATA TYPE "public"."enum_pages_blocks_contentgrid_block_presentation" USING "presentation"::"public"."enum_pages_blocks_contentgrid_block_presentation";
  ALTER TABLE "pages_blocks_story_block" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_story_block" ALTER COLUMN "layout" SET DEFAULT 'panel'::text;
  DROP TYPE "public"."enum_pages_blocks_story_block_layout";
  CREATE TYPE "public"."enum_pages_blocks_story_block_layout" AS ENUM('panel', 'overlay');
  ALTER TABLE "pages_blocks_story_block" ALTER COLUMN "layout" SET DEFAULT 'panel'::"public"."enum_pages_blocks_story_block_layout";
  ALTER TABLE "pages_blocks_story_block" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_blocks_story_block_layout" USING "layout"::"public"."enum_pages_blocks_story_block_layout";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ALTER COLUMN "presentation" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ALTER COLUMN "presentation" SET DEFAULT 'grid'::text;
  DROP TYPE "public"."enum__pages_v_blocks_contentgrid_block_presentation";
  CREATE TYPE "public"."enum__pages_v_blocks_contentgrid_block_presentation" AS ENUM('grid', 'pillars', 'edge', 'industries', 'b2b', 'services', 'partners');
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ALTER COLUMN "presentation" SET DEFAULT 'grid'::"public"."enum__pages_v_blocks_contentgrid_block_presentation";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ALTER COLUMN "presentation" SET DATA TYPE "public"."enum__pages_v_blocks_contentgrid_block_presentation" USING "presentation"::"public"."enum__pages_v_blocks_contentgrid_block_presentation";
  ALTER TABLE "_pages_v_blocks_story_block" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_story_block" ALTER COLUMN "layout" SET DEFAULT 'panel'::text;
  DROP TYPE "public"."enum__pages_v_blocks_story_block_layout";
  CREATE TYPE "public"."enum__pages_v_blocks_story_block_layout" AS ENUM('panel', 'overlay');
  ALTER TABLE "_pages_v_blocks_story_block" ALTER COLUMN "layout" SET DEFAULT 'panel'::"public"."enum__pages_v_blocks_story_block_layout";
  ALTER TABLE "_pages_v_blocks_story_block" ALTER COLUMN "layout" SET DATA TYPE "public"."enum__pages_v_blocks_story_block_layout" USING "layout"::"public"."enum__pages_v_blocks_story_block_layout";`)
}
