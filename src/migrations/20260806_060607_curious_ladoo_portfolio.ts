import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_compare_block_before_media_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum_pages_blocks_compare_block_before_media_object_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_pages_blocks_compare_block_after_media_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum_pages_blocks_compare_block_after_media_object_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_blocks_compare_block_before_media_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum__pages_v_blocks_compare_block_before_media_object_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_blocks_compare_block_after_media_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum__pages_v_blocks_compare_block_after_media_object_fit" AS ENUM('cover', 'contain');
  CREATE TABLE "page_portfolioshowcase_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_portfolioshowcase_block" (
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
  	"limit" numeric DEFAULT 12,
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
  
  CREATE TABLE "page_compare_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_compare_block" (
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
  	"before_badge_label" varchar,
  	"before_media_item_id" integer,
  	"before_media_alt_override" varchar,
  	"before_media_caption" varchar,
  	"before_media_aspect_ratio" "enum_pages_blocks_compare_block_before_media_aspect_ratio" DEFAULT 'auto',
  	"before_media_object_fit" "enum_pages_blocks_compare_block_before_media_object_fit" DEFAULT 'cover',
  	"before_media_priority" boolean DEFAULT false,
  	"before_media_focal_point_x" numeric DEFAULT 50,
  	"before_media_focal_point_y" numeric DEFAULT 50,
  	"before_placeholder_text" varchar,
  	"after_badge_label" varchar,
  	"after_media_item_id" integer,
  	"after_media_alt_override" varchar,
  	"after_media_caption" varchar,
  	"after_media_aspect_ratio" "enum_pages_blocks_compare_block_after_media_aspect_ratio" DEFAULT 'auto',
  	"after_media_object_fit" "enum_pages_blocks_compare_block_after_media_object_fit" DEFAULT 'cover',
  	"after_media_priority" boolean DEFAULT false,
  	"after_media_focal_point_x" numeric DEFAULT 50,
  	"after_media_focal_point_y" numeric DEFAULT 50,
  	"after_placeholder_text" varchar,
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
  
  CREATE TABLE "_page_portfolioshowcase_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_portfolioshowcase_block" (
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
  	"limit" numeric DEFAULT 12,
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
  
  CREATE TABLE "_page_compare_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_compare_block" (
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
  	"before_badge_label" varchar,
  	"before_media_item_id" integer,
  	"before_media_alt_override" varchar,
  	"before_media_caption" varchar,
  	"before_media_aspect_ratio" "enum__pages_v_blocks_compare_block_before_media_aspect_ratio" DEFAULT 'auto',
  	"before_media_object_fit" "enum__pages_v_blocks_compare_block_before_media_object_fit" DEFAULT 'cover',
  	"before_media_priority" boolean DEFAULT false,
  	"before_media_focal_point_x" numeric DEFAULT 50,
  	"before_media_focal_point_y" numeric DEFAULT 50,
  	"before_placeholder_text" varchar,
  	"after_badge_label" varchar,
  	"after_media_item_id" integer,
  	"after_media_alt_override" varchar,
  	"after_media_caption" varchar,
  	"after_media_aspect_ratio" "enum__pages_v_blocks_compare_block_after_media_aspect_ratio" DEFAULT 'auto',
  	"after_media_object_fit" "enum__pages_v_blocks_compare_block_after_media_object_fit" DEFAULT 'cover',
  	"after_media_priority" boolean DEFAULT false,
  	"after_media_focal_point_x" numeric DEFAULT 50,
  	"after_media_focal_point_y" numeric DEFAULT 50,
  	"after_placeholder_text" varchar,
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
  
  CREATE TABLE "portfolio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"category" varchar,
  	"year" varchar,
  	"description" varchar,
  	"cover_image_id" integer,
  	"brand_id" integer,
  	"enable_c_t_a" boolean DEFAULT false,
  	"cta_type" "cms_link_kind" DEFAULT 'reference',
  	"cta_label" varchar,
  	"cta_reference_id" integer,
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"cta_nofollow" boolean DEFAULT false,
  	"cta_disabled" boolean DEFAULT false,
  	"cta_button_style" "cms_link_style" DEFAULT 'primary',
  	"cta_button_size" "cms_link_size" DEFAULT 'medium',
  	"cta_icon_id" integer,
  	"cta_icon_position" "cms_link_icon_pos" DEFAULT 'left',
  	"cta_analytics_tracking_id" varchar,
  	"cta_aria_label" varchar,
  	"enabled" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "portfolio_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "portfolio_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "portfolio_id" integer;
  ALTER TABLE "page_portfolioshowcase_vis" ADD CONSTRAINT "page_portfolioshowcase_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_portfolioshowcase_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portfolioshowcase_block" ADD CONSTRAINT "pages_blocks_portfolioshowcase_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_portfolioshowcase_block" ADD CONSTRAINT "pages_blocks_portfolioshowcase_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_compare_vis" ADD CONSTRAINT "page_compare_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_compare_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_compare_block" ADD CONSTRAINT "pages_blocks_compare_block_before_media_item_id_media_id_fk" FOREIGN KEY ("before_media_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_compare_block" ADD CONSTRAINT "pages_blocks_compare_block_after_media_item_id_media_id_fk" FOREIGN KEY ("after_media_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_compare_block" ADD CONSTRAINT "pages_blocks_compare_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_compare_block" ADD CONSTRAINT "pages_blocks_compare_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_portfolioshowcase_vis_v" ADD CONSTRAINT "_page_portfolioshowcase_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_portfolioshowcase_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portfolioshowcase_block" ADD CONSTRAINT "_pages_v_blocks_portfolioshowcase_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portfolioshowcase_block" ADD CONSTRAINT "_pages_v_blocks_portfolioshowcase_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_compare_vis_v" ADD CONSTRAINT "_page_compare_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_compare_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_compare_block" ADD CONSTRAINT "_pages_v_blocks_compare_block_before_media_item_id_media_id_fk" FOREIGN KEY ("before_media_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_compare_block" ADD CONSTRAINT "_pages_v_blocks_compare_block_after_media_item_id_media_id_fk" FOREIGN KEY ("after_media_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_compare_block" ADD CONSTRAINT "_pages_v_blocks_compare_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_compare_block" ADD CONSTRAINT "_pages_v_blocks_compare_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_tenant_id_id_tenants_id_fk" FOREIGN KEY ("tenant_id_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_cta_reference_id_pages_id_fk" FOREIGN KEY ("cta_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_cta_icon_id_media_id_fk" FOREIGN KEY ("cta_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_portfolioshowcase_vis_order_idx" ON "page_portfolioshowcase_vis" USING btree ("order");
  CREATE INDEX "page_portfolioshowcase_vis_parent_idx" ON "page_portfolioshowcase_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_portfolioshowcase_block_order_idx" ON "pages_blocks_portfolioshowcase_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_portfolioshowcase_block_parent_id_idx" ON "pages_blocks_portfolioshowcase_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portfolioshowcase_block_path_idx" ON "pages_blocks_portfolioshowcase_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_portfolioshowcase_block_settings_settings_b_idx" ON "pages_blocks_portfolioshowcase_block" USING btree ("settings_background_image_id");
  CREATE INDEX "page_compare_vis_order_idx" ON "page_compare_vis" USING btree ("order");
  CREATE INDEX "page_compare_vis_parent_idx" ON "page_compare_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_compare_block_order_idx" ON "pages_blocks_compare_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_compare_block_parent_id_idx" ON "pages_blocks_compare_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_compare_block_path_idx" ON "pages_blocks_compare_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_compare_block_before_media_before_media_ite_idx" ON "pages_blocks_compare_block" USING btree ("before_media_item_id");
  CREATE INDEX "pages_blocks_compare_block_after_media_after_media_item_idx" ON "pages_blocks_compare_block" USING btree ("after_media_item_id");
  CREATE INDEX "pages_blocks_compare_block_settings_settings_background__idx" ON "pages_blocks_compare_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_page_portfolioshowcase_vis_v_order_idx" ON "_page_portfolioshowcase_vis_v" USING btree ("order");
  CREATE INDEX "_page_portfolioshowcase_vis_v_parent_idx" ON "_page_portfolioshowcase_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_portfolioshowcase_block_order_idx" ON "_pages_v_blocks_portfolioshowcase_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_portfolioshowcase_block_parent_id_idx" ON "_pages_v_blocks_portfolioshowcase_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_portfolioshowcase_block_path_idx" ON "_pages_v_blocks_portfolioshowcase_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_portfolioshowcase_block_settings_setting_idx" ON "_pages_v_blocks_portfolioshowcase_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_page_compare_vis_v_order_idx" ON "_page_compare_vis_v" USING btree ("order");
  CREATE INDEX "_page_compare_vis_v_parent_idx" ON "_page_compare_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_compare_block_order_idx" ON "_pages_v_blocks_compare_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_compare_block_parent_id_idx" ON "_pages_v_blocks_compare_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_compare_block_path_idx" ON "_pages_v_blocks_compare_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_compare_block_before_media_before_media__idx" ON "_pages_v_blocks_compare_block" USING btree ("before_media_item_id");
  CREATE INDEX "_pages_v_blocks_compare_block_after_media_after_media_it_idx" ON "_pages_v_blocks_compare_block" USING btree ("after_media_item_id");
  CREATE INDEX "_pages_v_blocks_compare_block_settings_settings_backgrou_idx" ON "_pages_v_blocks_compare_block" USING btree ("settings_background_image_id");
  CREATE INDEX "portfolio_tenant_id_idx" ON "portfolio" USING btree ("tenant_id_id");
  CREATE INDEX "portfolio_slug_idx" ON "portfolio" USING btree ("slug");
  CREATE INDEX "portfolio_cover_image_idx" ON "portfolio" USING btree ("cover_image_id");
  CREATE INDEX "portfolio_brand_idx" ON "portfolio" USING btree ("brand_id");
  CREATE INDEX "portfolio_cta_cta_reference_idx" ON "portfolio" USING btree ("cta_reference_id");
  CREATE INDEX "portfolio_cta_cta_icon_idx" ON "portfolio" USING btree ("cta_icon_id");
  CREATE INDEX "portfolio_enabled_idx" ON "portfolio" USING btree ("enabled");
  CREATE INDEX "portfolio_featured_idx" ON "portfolio" USING btree ("featured");
  CREATE INDEX "portfolio_updated_at_idx" ON "portfolio" USING btree ("updated_at");
  CREATE INDEX "portfolio_created_at_idx" ON "portfolio" USING btree ("created_at");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_portfolio_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_portfolio_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_portfolio_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_portfolio_id_idx" ON "pages_rels" USING btree ("portfolio_id");
  CREATE INDEX "_pages_v_rels_portfolio_id_idx" ON "_pages_v_rels" USING btree ("portfolio_id");
  CREATE INDEX "payload_locked_documents_rels_portfolio_id_idx" ON "payload_locked_documents_rels" USING btree ("portfolio_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_portfolioshowcase_vis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_portfolioshowcase_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_compare_vis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_compare_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_portfolioshowcase_vis_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_portfolioshowcase_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_compare_vis_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_compare_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "portfolio" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_portfolioshowcase_vis" CASCADE;
  DROP TABLE "pages_blocks_portfolioshowcase_block" CASCADE;
  DROP TABLE "page_compare_vis" CASCADE;
  DROP TABLE "pages_blocks_compare_block" CASCADE;
  DROP TABLE "_page_portfolioshowcase_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_portfolioshowcase_block" CASCADE;
  DROP TABLE "_page_compare_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_compare_block" CASCADE;
  DROP TABLE "portfolio" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_portfolio_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_portfolio_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_portfolio_fk";
  
  DROP INDEX "pages_rels_portfolio_id_idx";
  DROP INDEX "_pages_v_rels_portfolio_id_idx";
  DROP INDEX "payload_locked_documents_rels_portfolio_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "portfolio_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "portfolio_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "portfolio_id";
  DROP TYPE "public"."enum_pages_blocks_compare_block_before_media_aspect_ratio";
  DROP TYPE "public"."enum_pages_blocks_compare_block_before_media_object_fit";
  DROP TYPE "public"."enum_pages_blocks_compare_block_after_media_aspect_ratio";
  DROP TYPE "public"."enum_pages_blocks_compare_block_after_media_object_fit";
  DROP TYPE "public"."enum__pages_v_blocks_compare_block_before_media_aspect_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_compare_block_before_media_object_fit";
  DROP TYPE "public"."enum__pages_v_blocks_compare_block_after_media_aspect_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_compare_block_after_media_object_fit";`)
}
