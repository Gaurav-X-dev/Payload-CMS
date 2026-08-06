import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_brandsshowcase_block_presentation" AS ENUM('grid', 'spotlight');
  CREATE TYPE "public"."enum_pages_blocks_pipeline_block_spotlight_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_brandsshowcase_block_presentation" AS ENUM('grid', 'spotlight');
  CREATE TYPE "public"."enum__pages_v_blocks_pipeline_block_spotlight_position" AS ENUM('left', 'right');
  CREATE TABLE "pages_blocks_pipeline_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "page_pipeline_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_pipeline_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_header_eyebrow" varchar,
  	"section_header_title" varchar,
  	"section_header_heading_tag" "cms_section_tag" DEFAULT 'h2',
  	"section_header_subtitle" varchar,
  	"section_header_description" varchar,
  	"section_header_alignment" "cms_section_align" DEFAULT 'left',
  	"section_header_max_width" "cms_section_width" DEFAULT 'standard',
  	"enable_link" boolean DEFAULT false,
  	"link_type" "cms_link_kind" DEFAULT 'reference',
  	"link_label" varchar,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_nofollow" boolean DEFAULT false,
  	"link_disabled" boolean DEFAULT false,
  	"link_button_style" "cms_link_style" DEFAULT 'primary',
  	"link_button_size" "cms_link_size" DEFAULT 'medium',
  	"link_icon_id" integer,
  	"link_icon_position" "cms_link_icon_pos" DEFAULT 'left',
  	"link_analytics_tracking_id" varchar,
  	"link_aria_label" varchar,
  	"spotlight_enabled" boolean DEFAULT false,
  	"spotlight_icon" varchar,
  	"spotlight_title" varchar,
  	"spotlight_description" varchar,
  	"spotlight_position" "enum_pages_blocks_pipeline_block_spotlight_position" DEFAULT 'right',
  	"settings_background_color" "cms_block_bg" DEFAULT 'transparent',
  	"settings_container_width" "cms_block_width" DEFAULT 'standard',
  	"settings_background_image_id" integer,
  	"settings_overlay_opacity" numeric,
  	"settings_padding_top" "cms_block_pt" DEFAULT 'medium',
  	"settings_padding_bottom" "cms_block_pb" DEFAULT 'medium',
  	"settings_animation" "cms_block_anim" DEFAULT 'none',
  	"settings_custom_classes" varchar,
  	"settings_html_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pipeline_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_pipeline_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_pipeline_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"section_header_eyebrow" varchar,
  	"section_header_title" varchar,
  	"section_header_heading_tag" "cms_section_tag" DEFAULT 'h2',
  	"section_header_subtitle" varchar,
  	"section_header_description" varchar,
  	"section_header_alignment" "cms_section_align" DEFAULT 'left',
  	"section_header_max_width" "cms_section_width" DEFAULT 'standard',
  	"enable_link" boolean DEFAULT false,
  	"link_type" "cms_link_kind" DEFAULT 'reference',
  	"link_label" varchar,
  	"link_reference_id" integer,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"link_nofollow" boolean DEFAULT false,
  	"link_disabled" boolean DEFAULT false,
  	"link_button_style" "cms_link_style" DEFAULT 'primary',
  	"link_button_size" "cms_link_size" DEFAULT 'medium',
  	"link_icon_id" integer,
  	"link_icon_position" "cms_link_icon_pos" DEFAULT 'left',
  	"link_analytics_tracking_id" varchar,
  	"link_aria_label" varchar,
  	"spotlight_enabled" boolean DEFAULT false,
  	"spotlight_icon" varchar,
  	"spotlight_title" varchar,
  	"spotlight_description" varchar,
  	"spotlight_position" "enum__pages_v_blocks_pipeline_block_spotlight_position" DEFAULT 'right',
  	"settings_background_color" "cms_block_bg" DEFAULT 'transparent',
  	"settings_container_width" "cms_block_width" DEFAULT 'standard',
  	"settings_background_image_id" integer,
  	"settings_overlay_opacity" numeric,
  	"settings_padding_top" "cms_block_pt" DEFAULT 'medium',
  	"settings_padding_bottom" "cms_block_pb" DEFAULT 'medium',
  	"settings_animation" "cms_block_anim" DEFAULT 'none',
  	"settings_custom_classes" varchar,
  	"settings_html_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_brandsshowcase_block" ADD COLUMN "presentation" "enum_pages_blocks_brandsshowcase_block_presentation" DEFAULT 'grid';
  ALTER TABLE "_pages_v_blocks_brandsshowcase_block" ADD COLUMN "presentation" "enum__pages_v_blocks_brandsshowcase_block_presentation" DEFAULT 'grid';
  ALTER TABLE "pages_blocks_pipeline_block_items" ADD CONSTRAINT "pages_blocks_pipeline_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pipeline_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_pipeline_vis" ADD CONSTRAINT "page_pipeline_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_pipeline_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pipeline_block" ADD CONSTRAINT "pages_blocks_pipeline_block_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_pipeline_block" ADD CONSTRAINT "pages_blocks_pipeline_block_link_icon_id_media_id_fk" FOREIGN KEY ("link_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_pipeline_block" ADD CONSTRAINT "pages_blocks_pipeline_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_pipeline_block" ADD CONSTRAINT "pages_blocks_pipeline_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pipeline_block_items" ADD CONSTRAINT "_pages_v_blocks_pipeline_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pipeline_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_pipeline_vis_v" ADD CONSTRAINT "_page_pipeline_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_pipeline_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pipeline_block" ADD CONSTRAINT "_pages_v_blocks_pipeline_block_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pipeline_block" ADD CONSTRAINT "_pages_v_blocks_pipeline_block_link_icon_id_media_id_fk" FOREIGN KEY ("link_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pipeline_block" ADD CONSTRAINT "_pages_v_blocks_pipeline_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pipeline_block" ADD CONSTRAINT "_pages_v_blocks_pipeline_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_pipeline_block_items_order_idx" ON "pages_blocks_pipeline_block_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_pipeline_block_items_parent_id_idx" ON "pages_blocks_pipeline_block_items" USING btree ("_parent_id");
  CREATE INDEX "page_pipeline_vis_order_idx" ON "page_pipeline_vis" USING btree ("order");
  CREATE INDEX "page_pipeline_vis_parent_idx" ON "page_pipeline_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_pipeline_block_order_idx" ON "pages_blocks_pipeline_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_pipeline_block_parent_id_idx" ON "pages_blocks_pipeline_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pipeline_block_path_idx" ON "pages_blocks_pipeline_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_pipeline_block_link_link_reference_idx" ON "pages_blocks_pipeline_block" USING btree ("link_reference_id");
  CREATE INDEX "pages_blocks_pipeline_block_link_link_icon_idx" ON "pages_blocks_pipeline_block" USING btree ("link_icon_id");
  CREATE INDEX "pages_blocks_pipeline_block_settings_settings_background_idx" ON "pages_blocks_pipeline_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_pages_v_blocks_pipeline_block_items_order_idx" ON "_pages_v_blocks_pipeline_block_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pipeline_block_items_parent_id_idx" ON "_pages_v_blocks_pipeline_block_items" USING btree ("_parent_id");
  CREATE INDEX "_page_pipeline_vis_v_order_idx" ON "_page_pipeline_vis_v" USING btree ("order");
  CREATE INDEX "_page_pipeline_vis_v_parent_idx" ON "_page_pipeline_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_pipeline_block_order_idx" ON "_pages_v_blocks_pipeline_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pipeline_block_parent_id_idx" ON "_pages_v_blocks_pipeline_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pipeline_block_path_idx" ON "_pages_v_blocks_pipeline_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pipeline_block_link_link_reference_idx" ON "_pages_v_blocks_pipeline_block" USING btree ("link_reference_id");
  CREATE INDEX "_pages_v_blocks_pipeline_block_link_link_icon_idx" ON "_pages_v_blocks_pipeline_block" USING btree ("link_icon_id");
  CREATE INDEX "_pages_v_blocks_pipeline_block_settings_settings_backgro_idx" ON "_pages_v_blocks_pipeline_block" USING btree ("settings_background_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_pipeline_block_items" CASCADE;
  DROP TABLE "page_pipeline_vis" CASCADE;
  DROP TABLE "pages_blocks_pipeline_block" CASCADE;
  DROP TABLE "_pages_v_blocks_pipeline_block_items" CASCADE;
  DROP TABLE "_page_pipeline_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_pipeline_block" CASCADE;
  ALTER TABLE "pages_blocks_brandsshowcase_block" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_brandsshowcase_block" DROP COLUMN "presentation";
  DROP TYPE "public"."enum_pages_blocks_brandsshowcase_block_presentation";
  DROP TYPE "public"."enum_pages_blocks_pipeline_block_spotlight_position";
  DROP TYPE "public"."enum__pages_v_blocks_brandsshowcase_block_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_pipeline_block_spotlight_position";`)
}
