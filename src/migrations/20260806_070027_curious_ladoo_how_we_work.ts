import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_steps_block_steps_media_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum_pages_blocks_steps_block_steps_media_object_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_block_steps_media_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_block_steps_media_object_fit" AS ENUM('cover', 'contain');
  ALTER TYPE "public"."enum_pages_blocks_steps_block_layout_variant" ADD VALUE 'visual-timeline';
  ALTER TYPE "public"."enum__pages_v_blocks_steps_block_layout_variant" ADD VALUE 'visual-timeline';
  ALTER TABLE "pages_blocks_steps_block_steps" ADD COLUMN "media_item_id" integer;
  ALTER TABLE "pages_blocks_steps_block_steps" ADD COLUMN "media_alt_override" varchar;
  ALTER TABLE "pages_blocks_steps_block_steps" ADD COLUMN "media_caption" varchar;
  ALTER TABLE "pages_blocks_steps_block_steps" ADD COLUMN "media_aspect_ratio" "enum_pages_blocks_steps_block_steps_media_aspect_ratio" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_steps_block_steps" ADD COLUMN "media_object_fit" "enum_pages_blocks_steps_block_steps_media_object_fit" DEFAULT 'cover';
  ALTER TABLE "pages_blocks_steps_block_steps" ADD COLUMN "media_priority" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_steps_block_steps" ADD COLUMN "media_focal_point_x" numeric DEFAULT 50;
  ALTER TABLE "pages_blocks_steps_block_steps" ADD COLUMN "media_focal_point_y" numeric DEFAULT 50;
  ALTER TABLE "pages_blocks_pipeline_block" ADD COLUMN "spotlight_value" varchar;
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD COLUMN "media_item_id" integer;
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD COLUMN "media_alt_override" varchar;
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD COLUMN "media_caption" varchar;
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD COLUMN "media_aspect_ratio" "enum__pages_v_blocks_steps_block_steps_media_aspect_ratio" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD COLUMN "media_object_fit" "enum__pages_v_blocks_steps_block_steps_media_object_fit" DEFAULT 'cover';
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD COLUMN "media_priority" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD COLUMN "media_focal_point_x" numeric DEFAULT 50;
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD COLUMN "media_focal_point_y" numeric DEFAULT 50;
  ALTER TABLE "_pages_v_blocks_pipeline_block" ADD COLUMN "spotlight_value" varchar;
  ALTER TABLE "pages_blocks_steps_block_steps" ADD CONSTRAINT "pages_blocks_steps_block_steps_media_item_id_media_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD CONSTRAINT "_pages_v_blocks_steps_block_steps_media_item_id_media_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_steps_block_steps_media_media_item_idx" ON "pages_blocks_steps_block_steps" USING btree ("media_item_id");
  CREATE INDEX "_pages_v_blocks_steps_block_steps_media_media_item_idx" ON "_pages_v_blocks_steps_block_steps" USING btree ("media_item_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_steps_block_steps" DROP CONSTRAINT "pages_blocks_steps_block_steps_media_item_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP CONSTRAINT "_pages_v_blocks_steps_block_steps_media_item_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_steps_block" ALTER COLUMN "layout_variant" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_steps_block" ALTER COLUMN "layout_variant" SET DEFAULT 'numbered-steps'::text;
  DROP TYPE "public"."enum_pages_blocks_steps_block_layout_variant";
  CREATE TYPE "public"."enum_pages_blocks_steps_block_layout_variant" AS ENUM('numbered-steps', 'timeline');
  ALTER TABLE "pages_blocks_steps_block" ALTER COLUMN "layout_variant" SET DEFAULT 'numbered-steps'::"public"."enum_pages_blocks_steps_block_layout_variant";
  ALTER TABLE "pages_blocks_steps_block" ALTER COLUMN "layout_variant" SET DATA TYPE "public"."enum_pages_blocks_steps_block_layout_variant" USING "layout_variant"::"public"."enum_pages_blocks_steps_block_layout_variant";
  ALTER TABLE "_pages_v_blocks_steps_block" ALTER COLUMN "layout_variant" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_steps_block" ALTER COLUMN "layout_variant" SET DEFAULT 'numbered-steps'::text;
  DROP TYPE "public"."enum__pages_v_blocks_steps_block_layout_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_steps_block_layout_variant" AS ENUM('numbered-steps', 'timeline');
  ALTER TABLE "_pages_v_blocks_steps_block" ALTER COLUMN "layout_variant" SET DEFAULT 'numbered-steps'::"public"."enum__pages_v_blocks_steps_block_layout_variant";
  ALTER TABLE "_pages_v_blocks_steps_block" ALTER COLUMN "layout_variant" SET DATA TYPE "public"."enum__pages_v_blocks_steps_block_layout_variant" USING "layout_variant"::"public"."enum__pages_v_blocks_steps_block_layout_variant";
  DROP INDEX "pages_blocks_steps_block_steps_media_media_item_idx";
  DROP INDEX "_pages_v_blocks_steps_block_steps_media_media_item_idx";
  ALTER TABLE "pages_blocks_steps_block_steps" DROP COLUMN "media_item_id";
  ALTER TABLE "pages_blocks_steps_block_steps" DROP COLUMN "media_alt_override";
  ALTER TABLE "pages_blocks_steps_block_steps" DROP COLUMN "media_caption";
  ALTER TABLE "pages_blocks_steps_block_steps" DROP COLUMN "media_aspect_ratio";
  ALTER TABLE "pages_blocks_steps_block_steps" DROP COLUMN "media_object_fit";
  ALTER TABLE "pages_blocks_steps_block_steps" DROP COLUMN "media_priority";
  ALTER TABLE "pages_blocks_steps_block_steps" DROP COLUMN "media_focal_point_x";
  ALTER TABLE "pages_blocks_steps_block_steps" DROP COLUMN "media_focal_point_y";
  ALTER TABLE "pages_blocks_pipeline_block" DROP COLUMN "spotlight_value";
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP COLUMN "media_item_id";
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP COLUMN "media_alt_override";
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP COLUMN "media_caption";
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP COLUMN "media_aspect_ratio";
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP COLUMN "media_object_fit";
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP COLUMN "media_priority";
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP COLUMN "media_focal_point_x";
  ALTER TABLE "_pages_v_blocks_steps_block_steps" DROP COLUMN "media_focal_point_y";
  ALTER TABLE "_pages_v_blocks_pipeline_block" DROP COLUMN "spotlight_value";
  DROP TYPE "public"."enum_pages_blocks_steps_block_steps_media_aspect_ratio";
  DROP TYPE "public"."enum_pages_blocks_steps_block_steps_media_object_fit";
  DROP TYPE "public"."enum__pages_v_blocks_steps_block_steps_media_aspect_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_steps_block_steps_media_object_fit";`)
}
