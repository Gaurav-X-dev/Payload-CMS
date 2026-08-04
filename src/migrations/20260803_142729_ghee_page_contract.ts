import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_featurestrip_block_source" AS ENUM('manual', 'site-settings');
  CREATE TYPE "public"."enum_pages_blocks_featurestrip_block_presentation" AS ENUM('cards', 'ghee-home-brand');
  CREATE TYPE "public"."gr_story_img_pos" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_steps_block_presentation" AS ENUM('cards', 'ghee-home-process');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_block_presentation" AS ENUM('cards', 'ghee-home-dark');
  CREATE TYPE "public"."enum_pages_blocks_stats_block_presentation" AS ENUM('cards', 'ghee-home-strip');
  CREATE TYPE "public"."cms_page_type" AS ENUM('home', 'about', 'menu', 'quality', 'delivery', 'catering', 'contact', 'gallery', 'locations', 'faq', 'reservation', 'blog-index', 'generic', 'legal');
  CREATE TYPE "public"."enum__pages_v_blocks_featurestrip_block_source" AS ENUM('manual', 'site-settings');
  CREATE TYPE "public"."enum__pages_v_blocks_featurestrip_block_presentation" AS ENUM('cards', 'ghee-home-brand');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_block_presentation" AS ENUM('cards', 'ghee-home-process');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_block_presentation" AS ENUM('cards', 'ghee-home-dark');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_block_presentation" AS ENUM('cards', 'ghee-home-strip');
  CREATE TABLE "pages_blocks_ghee_home_story_block_bullet_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "page_ghee_home_story_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_ghee_home_story_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"highlighted_heading" varchar,
  	"description" varchar,
  	"images_primary_image_id" integer,
  	"images_primary_image_alt" varchar,
  	"images_secondary_image_id" integer,
  	"images_tertiary_image_id" integer,
  	"images_secondary_image_alt" varchar,
  	"images_tertiary_image_alt" varchar,
  	"images_image_position" "gr_story_img_pos" DEFAULT 'left',
  	"experience_badge_enabled" boolean DEFAULT true,
  	"experience_badge_number" varchar,
  	"experience_badge_label" varchar,
  	"cta_enabled" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_url" varchar,
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
  
  CREATE TABLE "pages_blocks_ghee_home_quality_block_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "page_ghee_home_quality_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_ghee_home_quality_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"highlighted_heading" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"image_alt" varchar,
  	"cta_enabled" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_url" varchar,
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
  
  CREATE TABLE "pages_blocks_ghee_home_promos_block_promos_bullet_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_ghee_home_promos_block_promos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"cta_enabled" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_url" varchar
  );
  
  CREATE TABLE "page_ghee_home_promos_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_ghee_home_promos_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Home promotions',
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
  
  CREATE TABLE "_pages_v_blocks_ghee_home_story_block_bullet_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_ghee_home_story_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_ghee_home_story_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"highlighted_heading" varchar,
  	"description" varchar,
  	"images_primary_image_id" integer,
  	"images_primary_image_alt" varchar,
  	"images_secondary_image_id" integer,
  	"images_tertiary_image_id" integer,
  	"images_secondary_image_alt" varchar,
  	"images_tertiary_image_alt" varchar,
  	"images_image_position" "gr_story_img_pos" DEFAULT 'left',
  	"experience_badge_enabled" boolean DEFAULT true,
  	"experience_badge_number" varchar,
  	"experience_badge_label" varchar,
  	"cta_enabled" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_url" varchar,
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
  
  CREATE TABLE "_pages_v_blocks_ghee_home_quality_block_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_ghee_home_quality_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_ghee_home_quality_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"highlighted_heading" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"image_alt" varchar,
  	"cta_enabled" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_url" varchar,
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
  
  CREATE TABLE "_pages_v_blocks_ghee_home_promos_block_promos_bullet_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_ghee_home_promos_block_promos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"cta_enabled" boolean DEFAULT true,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_ghee_home_promos_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_ghee_home_promos_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Home promotions',
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
  
  ALTER TABLE "pages_blocks_featurestrip_block" ADD COLUMN "source" "enum_pages_blocks_featurestrip_block_source" DEFAULT 'manual';
  ALTER TABLE "pages_blocks_featurestrip_block" ADD COLUMN "presentation" "enum_pages_blocks_featurestrip_block_presentation" DEFAULT 'cards';
  ALTER TABLE "pages_blocks_steps_block" ADD COLUMN "presentation" "enum_pages_blocks_steps_block_presentation" DEFAULT 'cards';
  ALTER TABLE "pages_blocks_testimonials_block" ADD COLUMN "presentation" "enum_pages_blocks_testimonials_block_presentation" DEFAULT 'cards';
  ALTER TABLE "pages_blocks_stats_block" ADD COLUMN "presentation" "enum_pages_blocks_stats_block_presentation" DEFAULT 'cards';
  ALTER TABLE "pages" ADD COLUMN "page_type" "cms_page_type" DEFAULT 'generic';
  ALTER TABLE "_pages_v_blocks_featurestrip_block" ADD COLUMN "source" "enum__pages_v_blocks_featurestrip_block_source" DEFAULT 'manual';
  ALTER TABLE "_pages_v_blocks_featurestrip_block" ADD COLUMN "presentation" "enum__pages_v_blocks_featurestrip_block_presentation" DEFAULT 'cards';
  ALTER TABLE "_pages_v_blocks_steps_block" ADD COLUMN "presentation" "enum__pages_v_blocks_steps_block_presentation" DEFAULT 'cards';
  ALTER TABLE "_pages_v_blocks_testimonials_block" ADD COLUMN "presentation" "enum__pages_v_blocks_testimonials_block_presentation" DEFAULT 'cards';
  ALTER TABLE "_pages_v_blocks_stats_block" ADD COLUMN "presentation" "enum__pages_v_blocks_stats_block_presentation" DEFAULT 'cards';
  ALTER TABLE "_pages_v" ADD COLUMN "version_page_type" "cms_page_type" DEFAULT 'generic';
  UPDATE "pages" SET "page_type" = 'home' WHERE "is_home_page" = true;
  UPDATE "_pages_v" SET "version_page_type" = 'home' WHERE "version_is_home_page" = true;
  ALTER TABLE "pages_blocks_ghee_home_story_block_bullet_points" ADD CONSTRAINT "pages_blocks_ghee_home_story_block_bullet_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_ghee_home_story_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_ghee_home_story_vis" ADD CONSTRAINT "page_ghee_home_story_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_ghee_home_story_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_story_block" ADD CONSTRAINT "pages_blocks_ghee_home_story_block_images_primary_image_id_media_id_fk" FOREIGN KEY ("images_primary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_story_block" ADD CONSTRAINT "pages_blocks_ghee_home_story_block_images_secondary_image_id_media_id_fk" FOREIGN KEY ("images_secondary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_story_block" ADD CONSTRAINT "pages_blocks_ghee_home_story_block_images_tertiary_image_id_media_id_fk" FOREIGN KEY ("images_tertiary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_story_block" ADD CONSTRAINT "pages_blocks_ghee_home_story_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_story_block" ADD CONSTRAINT "pages_blocks_ghee_home_story_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_quality_block_points" ADD CONSTRAINT "pages_blocks_ghee_home_quality_block_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_ghee_home_quality_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_ghee_home_quality_vis" ADD CONSTRAINT "page_ghee_home_quality_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_ghee_home_quality_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_quality_block" ADD CONSTRAINT "pages_blocks_ghee_home_quality_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_quality_block" ADD CONSTRAINT "pages_blocks_ghee_home_quality_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_quality_block" ADD CONSTRAINT "pages_blocks_ghee_home_quality_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_promos_block_promos_bullet_points" ADD CONSTRAINT "pages_blocks_ghee_home_promos_block_promos_bullet_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_ghee_home_promos_block_promos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_promos_block_promos" ADD CONSTRAINT "pages_blocks_ghee_home_promos_block_promos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_ghee_home_promos_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_ghee_home_promos_vis" ADD CONSTRAINT "page_ghee_home_promos_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_ghee_home_promos_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_promos_block" ADD CONSTRAINT "pages_blocks_ghee_home_promos_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_ghee_home_promos_block" ADD CONSTRAINT "pages_blocks_ghee_home_promos_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_story_block_bullet_points" ADD CONSTRAINT "_pages_v_blocks_ghee_home_story_block_bullet_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_ghee_home_story_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_ghee_home_story_vis_v" ADD CONSTRAINT "_page_ghee_home_story_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_ghee_home_story_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_story_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_story_block_images_primary_image_id_media_id_fk" FOREIGN KEY ("images_primary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_story_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_story_block_images_secondary_image_id_media_id_fk" FOREIGN KEY ("images_secondary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_story_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_story_block_images_tertiary_image_id_media_id_fk" FOREIGN KEY ("images_tertiary_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_story_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_story_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_story_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_story_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_quality_block_points" ADD CONSTRAINT "_pages_v_blocks_ghee_home_quality_block_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_ghee_home_quality_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_ghee_home_quality_vis_v" ADD CONSTRAINT "_page_ghee_home_quality_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_ghee_home_quality_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_quality_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_quality_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_quality_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_quality_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_quality_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_quality_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_promos_block_promos_bullet_points" ADD CONSTRAINT "_pages_v_blocks_ghee_home_promos_block_promos_bullet_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_ghee_home_promos_block_promos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_promos_block_promos" ADD CONSTRAINT "_pages_v_blocks_ghee_home_promos_block_promos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_ghee_home_promos_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_ghee_home_promos_vis_v" ADD CONSTRAINT "_page_ghee_home_promos_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_ghee_home_promos_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_promos_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_promos_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ghee_home_promos_block" ADD CONSTRAINT "_pages_v_blocks_ghee_home_promos_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_ghee_home_story_block_bullet_points_order_idx" ON "pages_blocks_ghee_home_story_block_bullet_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_ghee_home_story_block_bullet_points_parent_id_idx" ON "pages_blocks_ghee_home_story_block_bullet_points" USING btree ("_parent_id");
  CREATE INDEX "page_ghee_home_story_vis_order_idx" ON "page_ghee_home_story_vis" USING btree ("order");
  CREATE INDEX "page_ghee_home_story_vis_parent_idx" ON "page_ghee_home_story_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_ghee_home_story_block_order_idx" ON "pages_blocks_ghee_home_story_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_ghee_home_story_block_parent_id_idx" ON "pages_blocks_ghee_home_story_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_ghee_home_story_block_path_idx" ON "pages_blocks_ghee_home_story_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_ghee_home_story_block_images_images_primary_idx" ON "pages_blocks_ghee_home_story_block" USING btree ("images_primary_image_id");
  CREATE INDEX "pages_blocks_ghee_home_story_block_images_images_seconda_idx" ON "pages_blocks_ghee_home_story_block" USING btree ("images_secondary_image_id");
  CREATE INDEX "pages_blocks_ghee_home_story_block_images_images_tertiar_idx" ON "pages_blocks_ghee_home_story_block" USING btree ("images_tertiary_image_id");
  CREATE INDEX "pages_blocks_ghee_home_story_block_settings_settings_bac_idx" ON "pages_blocks_ghee_home_story_block" USING btree ("settings_background_image_id");
  CREATE INDEX "pages_blocks_ghee_home_quality_block_points_order_idx" ON "pages_blocks_ghee_home_quality_block_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_ghee_home_quality_block_points_parent_id_idx" ON "pages_blocks_ghee_home_quality_block_points" USING btree ("_parent_id");
  CREATE INDEX "page_ghee_home_quality_vis_order_idx" ON "page_ghee_home_quality_vis" USING btree ("order");
  CREATE INDEX "page_ghee_home_quality_vis_parent_idx" ON "page_ghee_home_quality_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_ghee_home_quality_block_order_idx" ON "pages_blocks_ghee_home_quality_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_ghee_home_quality_block_parent_id_idx" ON "pages_blocks_ghee_home_quality_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_ghee_home_quality_block_path_idx" ON "pages_blocks_ghee_home_quality_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_ghee_home_quality_block_image_idx" ON "pages_blocks_ghee_home_quality_block" USING btree ("image_id");
  CREATE INDEX "pages_blocks_ghee_home_quality_block_settings_settings_b_idx" ON "pages_blocks_ghee_home_quality_block" USING btree ("settings_background_image_id");
  CREATE INDEX "pages_blocks_ghee_home_promos_block_promos_bullet_points_order_idx" ON "pages_blocks_ghee_home_promos_block_promos_bullet_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_ghee_home_promos_block_promos_bullet_points_parent_id_idx" ON "pages_blocks_ghee_home_promos_block_promos_bullet_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_ghee_home_promos_block_promos_order_idx" ON "pages_blocks_ghee_home_promos_block_promos" USING btree ("_order");
  CREATE INDEX "pages_blocks_ghee_home_promos_block_promos_parent_id_idx" ON "pages_blocks_ghee_home_promos_block_promos" USING btree ("_parent_id");
  CREATE INDEX "page_ghee_home_promos_vis_order_idx" ON "page_ghee_home_promos_vis" USING btree ("order");
  CREATE INDEX "page_ghee_home_promos_vis_parent_idx" ON "page_ghee_home_promos_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_ghee_home_promos_block_order_idx" ON "pages_blocks_ghee_home_promos_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_ghee_home_promos_block_parent_id_idx" ON "pages_blocks_ghee_home_promos_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_ghee_home_promos_block_path_idx" ON "pages_blocks_ghee_home_promos_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_ghee_home_promos_block_settings_settings_ba_idx" ON "pages_blocks_ghee_home_promos_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_bullet_points_order_idx" ON "_pages_v_blocks_ghee_home_story_block_bullet_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_bullet_points_parent_id_idx" ON "_pages_v_blocks_ghee_home_story_block_bullet_points" USING btree ("_parent_id");
  CREATE INDEX "_page_ghee_home_story_vis_v_order_idx" ON "_page_ghee_home_story_vis_v" USING btree ("order");
  CREATE INDEX "_page_ghee_home_story_vis_v_parent_idx" ON "_page_ghee_home_story_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_order_idx" ON "_pages_v_blocks_ghee_home_story_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_parent_id_idx" ON "_pages_v_blocks_ghee_home_story_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_path_idx" ON "_pages_v_blocks_ghee_home_story_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_images_images_prim_idx" ON "_pages_v_blocks_ghee_home_story_block" USING btree ("images_primary_image_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_images_images_seco_idx" ON "_pages_v_blocks_ghee_home_story_block" USING btree ("images_secondary_image_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_images_images_tert_idx" ON "_pages_v_blocks_ghee_home_story_block" USING btree ("images_tertiary_image_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_story_block_settings_settings__idx" ON "_pages_v_blocks_ghee_home_story_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_quality_block_points_order_idx" ON "_pages_v_blocks_ghee_home_quality_block_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ghee_home_quality_block_points_parent_id_idx" ON "_pages_v_blocks_ghee_home_quality_block_points" USING btree ("_parent_id");
  CREATE INDEX "_page_ghee_home_quality_vis_v_order_idx" ON "_page_ghee_home_quality_vis_v" USING btree ("order");
  CREATE INDEX "_page_ghee_home_quality_vis_v_parent_idx" ON "_page_ghee_home_quality_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_quality_block_order_idx" ON "_pages_v_blocks_ghee_home_quality_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ghee_home_quality_block_parent_id_idx" ON "_pages_v_blocks_ghee_home_quality_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_quality_block_path_idx" ON "_pages_v_blocks_ghee_home_quality_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_ghee_home_quality_block_image_idx" ON "_pages_v_blocks_ghee_home_quality_block" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_quality_block_settings_setting_idx" ON "_pages_v_blocks_ghee_home_quality_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_promos_block_promos_bullet_points_order_idx" ON "_pages_v_blocks_ghee_home_promos_block_promos_bullet_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ghee_home_promos_block_promos_bullet_points_parent_id_idx" ON "_pages_v_blocks_ghee_home_promos_block_promos_bullet_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_promos_block_promos_order_idx" ON "_pages_v_blocks_ghee_home_promos_block_promos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ghee_home_promos_block_promos_parent_id_idx" ON "_pages_v_blocks_ghee_home_promos_block_promos" USING btree ("_parent_id");
  CREATE INDEX "_page_ghee_home_promos_vis_v_order_idx" ON "_page_ghee_home_promos_vis_v" USING btree ("order");
  CREATE INDEX "_page_ghee_home_promos_vis_v_parent_idx" ON "_page_ghee_home_promos_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_promos_block_order_idx" ON "_pages_v_blocks_ghee_home_promos_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ghee_home_promos_block_parent_id_idx" ON "_pages_v_blocks_ghee_home_promos_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_ghee_home_promos_block_path_idx" ON "_pages_v_blocks_ghee_home_promos_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_ghee_home_promos_block_settings_settings_idx" ON "_pages_v_blocks_ghee_home_promos_block" USING btree ("settings_background_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_ghee_home_story_block_bullet_points" CASCADE;
  DROP TABLE "page_ghee_home_story_vis" CASCADE;
  DROP TABLE "pages_blocks_ghee_home_story_block" CASCADE;
  DROP TABLE "pages_blocks_ghee_home_quality_block_points" CASCADE;
  DROP TABLE "page_ghee_home_quality_vis" CASCADE;
  DROP TABLE "pages_blocks_ghee_home_quality_block" CASCADE;
  DROP TABLE "pages_blocks_ghee_home_promos_block_promos_bullet_points" CASCADE;
  DROP TABLE "pages_blocks_ghee_home_promos_block_promos" CASCADE;
  DROP TABLE "page_ghee_home_promos_vis" CASCADE;
  DROP TABLE "pages_blocks_ghee_home_promos_block" CASCADE;
  DROP TABLE "_pages_v_blocks_ghee_home_story_block_bullet_points" CASCADE;
  DROP TABLE "_page_ghee_home_story_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_ghee_home_story_block" CASCADE;
  DROP TABLE "_pages_v_blocks_ghee_home_quality_block_points" CASCADE;
  DROP TABLE "_page_ghee_home_quality_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_ghee_home_quality_block" CASCADE;
  DROP TABLE "_pages_v_blocks_ghee_home_promos_block_promos_bullet_points" CASCADE;
  DROP TABLE "_pages_v_blocks_ghee_home_promos_block_promos" CASCADE;
  DROP TABLE "_page_ghee_home_promos_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_ghee_home_promos_block" CASCADE;
  ALTER TABLE "pages_blocks_featurestrip_block" DROP COLUMN "source";
  ALTER TABLE "pages_blocks_featurestrip_block" DROP COLUMN "presentation";
  ALTER TABLE "pages_blocks_steps_block" DROP COLUMN "presentation";
  ALTER TABLE "pages_blocks_testimonials_block" DROP COLUMN "presentation";
  ALTER TABLE "pages_blocks_stats_block" DROP COLUMN "presentation";
  ALTER TABLE "pages" DROP COLUMN "page_type";
  ALTER TABLE "_pages_v_blocks_featurestrip_block" DROP COLUMN "source";
  ALTER TABLE "_pages_v_blocks_featurestrip_block" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_steps_block" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_testimonials_block" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_stats_block" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v" DROP COLUMN "version_page_type";
  DROP TYPE "public"."enum_pages_blocks_featurestrip_block_source";
  DROP TYPE "public"."enum_pages_blocks_featurestrip_block_presentation";
  DROP TYPE "public"."gr_story_img_pos";
  DROP TYPE "public"."enum_pages_blocks_steps_block_presentation";
  DROP TYPE "public"."enum_pages_blocks_testimonials_block_presentation";
  DROP TYPE "public"."enum_pages_blocks_stats_block_presentation";
  DROP TYPE "public"."cms_page_type";
  DROP TYPE "public"."enum__pages_v_blocks_featurestrip_block_source";
  DROP TYPE "public"."enum__pages_v_blocks_featurestrip_block_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_steps_block_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_block_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_stats_block_presentation";`)
}
