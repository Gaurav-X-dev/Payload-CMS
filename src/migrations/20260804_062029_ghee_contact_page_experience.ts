import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_form_block_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_blocks_form_block_image_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_pages_blocks_form_block_form_card_style" AS ENUM('elevated', 'bordered', 'flat');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_block_source" AS ENUM('block', 'site-settings');
  CREATE TYPE "public"."enum__pages_v_blocks_form_block_image_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_form_block_image_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_blocks_form_block_form_card_style" AS ENUM('elevated', 'bordered', 'flat');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_block_source" AS ENUM('block', 'site-settings');
  CREATE TYPE "public"."enum_site_settings_socials_icon" AS ENUM('platform', 'instagram', 'facebook', 'youtube', 'twitter', 'linkedin', 'whatsapp', 'link');
  CREATE TYPE "public"."enum__site_settings_v_version_socials_icon" AS ENUM('platform', 'instagram', 'facebook', 'youtube', 'twitter', 'linkedin', 'whatsapp', 'link');
  ALTER TYPE "public"."enum_site_settings_socials_platform" ADD VALUE 'linkedin';
  ALTER TYPE "public"."enum_site_settings_socials_platform" ADD VALUE 'whatsapp';
  ALTER TYPE "public"."enum_site_settings_socials_platform" ADD VALUE 'other';
  ALTER TYPE "public"."enum__site_settings_v_version_socials_platform" ADD VALUE 'linkedin';
  ALTER TYPE "public"."enum__site_settings_v_version_socials_platform" ADD VALUE 'whatsapp';
  ALTER TYPE "public"."enum__site_settings_v_version_socials_platform" ADD VALUE 'other';
  CREATE TABLE "pages_blocks_form_block_subject_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "page_social_links_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_social_links_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"section_header_eyebrow" varchar,
  	"section_header_title" varchar,
  	"section_header_heading_tag" "cms_section_tag" DEFAULT 'h2',
  	"section_header_subtitle" varchar,
  	"section_header_description" varchar,
  	"section_header_alignment" "cms_section_align" DEFAULT 'left',
  	"section_header_max_width" "cms_section_width" DEFAULT 'standard',
  	"show_handles" boolean DEFAULT true,
  	"show_descriptions" boolean DEFAULT true,
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
  
  CREATE TABLE "_pages_v_blocks_form_block_subject_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_social_links_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_social_links_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"section_header_eyebrow" varchar,
  	"section_header_title" varchar,
  	"section_header_heading_tag" "cms_section_tag" DEFAULT 'h2',
  	"section_header_subtitle" varchar,
  	"section_header_description" varchar,
  	"section_header_alignment" "cms_section_align" DEFAULT 'left',
  	"section_header_max_width" "cms_section_width" DEFAULT 'standard',
  	"show_handles" boolean DEFAULT true,
  	"show_descriptions" boolean DEFAULT true,
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
  
  CREATE TABLE "locations_delivery_zones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"zone" varchar NOT NULL
  );
  
  CREATE TABLE "locations_business_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" varchar NOT NULL,
  	"open_time" varchar,
  	"close_time" varchar,
  	"is_closed" boolean DEFAULT false
  );
  
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "enabled" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "error_message" varchar DEFAULT 'We could not submit the form. Please check your details or contact the restaurant directly.';
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "side_image_id" integer;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "image_alt" varchar;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "image_position" "enum_pages_blocks_form_block_image_position" DEFAULT 'right';
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "image_fit" "enum_pages_blocks_form_block_image_fit" DEFAULT 'cover';
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "form_card_style" "enum_pages_blocks_form_block_form_card_style" DEFAULT 'elevated';
  ALTER TABLE "pages_blocks_newsletter_block" ADD COLUMN "enabled" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_newsletter_block" ADD COLUMN "source" "enum_pages_blocks_newsletter_block_source" DEFAULT 'block';
  ALTER TABLE "pages_blocks_newsletter_block" ADD COLUMN "highlighted_word" varchar;
  ALTER TABLE "pages_blocks_newsletter_block" ADD COLUMN "success_message" varchar DEFAULT 'Thank you for joining the list.';
  ALTER TABLE "pages_blocks_newsletter_block" ADD COLUMN "error_message" varchar DEFAULT 'We could not save your signup. Please try again later.';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "enabled" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "error_message" varchar DEFAULT 'We could not submit the form. Please check your details or contact the restaurant directly.';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "side_image_id" integer;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "image_alt" varchar;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "image_position" "enum__pages_v_blocks_form_block_image_position" DEFAULT 'right';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "image_fit" "enum__pages_v_blocks_form_block_image_fit" DEFAULT 'cover';
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "form_card_style" "enum__pages_v_blocks_form_block_form_card_style" DEFAULT 'elevated';
  ALTER TABLE "_pages_v_blocks_newsletter_block" ADD COLUMN "enabled" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_newsletter_block" ADD COLUMN "source" "enum__pages_v_blocks_newsletter_block_source" DEFAULT 'block';
  ALTER TABLE "_pages_v_blocks_newsletter_block" ADD COLUMN "highlighted_word" varchar;
  ALTER TABLE "_pages_v_blocks_newsletter_block" ADD COLUMN "success_message" varchar DEFAULT 'Thank you for joining the list.';
  ALTER TABLE "_pages_v_blocks_newsletter_block" ADD COLUMN "error_message" varchar DEFAULT 'We could not save your signup. Please try again later.';
  ALTER TABLE "locations" ADD COLUMN "state" varchar;
  ALTER TABLE "locations" ADD COLUMN "postal_code" varchar;
  ALTER TABLE "locations" ADD COLUMN "country" varchar DEFAULT 'India';
  ALTER TABLE "locations" ADD COLUMN "latitude" numeric;
  ALTER TABLE "locations" ADD COLUMN "longitude" numeric;
  ALTER TABLE "locations" ADD COLUMN "map_button_label" varchar DEFAULT 'Find on Map';
  ALTER TABLE "locations" ADD COLUMN "is_primary" boolean DEFAULT false;
  ALTER TABLE "locations" ADD COLUMN "show_on_contact" boolean DEFAULT true;
  ALTER TABLE "locations" ADD COLUMN "show_in_footer" boolean DEFAULT false;
  ALTER TABLE "locations" ADD COLUMN "show_on_home" boolean DEFAULT false;
  ALTER TABLE "contact_submissions" ADD COLUMN "subject" varchar;
  ALTER TABLE "site_settings_socials" ADD COLUMN "enabled" boolean DEFAULT true;
  ALTER TABLE "site_settings_socials" ADD COLUMN "icon" "enum_site_settings_socials_icon" DEFAULT 'platform';
  ALTER TABLE "site_settings_socials" ADD COLUMN "sort_order" numeric DEFAULT 0;
  ALTER TABLE "site_settings_socials" ADD COLUMN "display_label" varchar;
  ALTER TABLE "site_settings_socials" ADD COLUMN "handle" varchar;
  ALTER TABLE "site_settings_socials" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "site_settings_socials" ADD COLUMN "description" varchar;
  ALTER TABLE "site_settings_socials" ADD COLUMN "open_in_new_tab" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "newsletter_success_message" varchar DEFAULT 'Thank you for joining the list.';
  ALTER TABLE "site_settings" ADD COLUMN "newsletter_error_message" varchar DEFAULT 'We could not save your signup. Please try again later.';
  ALTER TABLE "_site_settings_v_version_socials" ADD COLUMN "enabled" boolean DEFAULT true;
  ALTER TABLE "_site_settings_v_version_socials" ADD COLUMN "icon" "enum__site_settings_v_version_socials_icon" DEFAULT 'platform';
  ALTER TABLE "_site_settings_v_version_socials" ADD COLUMN "sort_order" numeric DEFAULT 0;
  ALTER TABLE "_site_settings_v_version_socials" ADD COLUMN "display_label" varchar;
  ALTER TABLE "_site_settings_v_version_socials" ADD COLUMN "handle" varchar;
  ALTER TABLE "_site_settings_v_version_socials" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "_site_settings_v_version_socials" ADD COLUMN "description" varchar;
  ALTER TABLE "_site_settings_v_version_socials" ADD COLUMN "open_in_new_tab" boolean DEFAULT true;
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_newsletter_success_message" varchar DEFAULT 'Thank you for joining the list.';
  ALTER TABLE "_site_settings_v" ADD COLUMN "version_newsletter_error_message" varchar DEFAULT 'We could not save your signup. Please try again later.';
  ALTER TABLE "pages_blocks_form_block_subject_options" ADD CONSTRAINT "pages_blocks_form_block_subject_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_form_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_social_links_vis" ADD CONSTRAINT "page_social_links_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_social_links_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_social_links_block" ADD CONSTRAINT "pages_blocks_social_links_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_social_links_block" ADD CONSTRAINT "pages_blocks_social_links_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block_subject_options" ADD CONSTRAINT "_pages_v_blocks_form_block_subject_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_form_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_social_links_vis_v" ADD CONSTRAINT "_page_social_links_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_social_links_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_social_links_block" ADD CONSTRAINT "_pages_v_blocks_social_links_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_social_links_block" ADD CONSTRAINT "_pages_v_blocks_social_links_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_delivery_zones" ADD CONSTRAINT "locations_delivery_zones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "locations_business_hours" ADD CONSTRAINT "locations_business_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_form_block_subject_options_order_idx" ON "pages_blocks_form_block_subject_options" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_subject_options_parent_id_idx" ON "pages_blocks_form_block_subject_options" USING btree ("_parent_id");
  CREATE INDEX "page_social_links_vis_order_idx" ON "page_social_links_vis" USING btree ("order");
  CREATE INDEX "page_social_links_vis_parent_idx" ON "page_social_links_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_social_links_block_order_idx" ON "pages_blocks_social_links_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_social_links_block_parent_id_idx" ON "pages_blocks_social_links_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_social_links_block_path_idx" ON "pages_blocks_social_links_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_social_links_block_settings_settings_backgr_idx" ON "pages_blocks_social_links_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_pages_v_blocks_form_block_subject_options_order_idx" ON "_pages_v_blocks_form_block_subject_options" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_subject_options_parent_id_idx" ON "_pages_v_blocks_form_block_subject_options" USING btree ("_parent_id");
  CREATE INDEX "_page_social_links_vis_v_order_idx" ON "_page_social_links_vis_v" USING btree ("order");
  CREATE INDEX "_page_social_links_vis_v_parent_idx" ON "_page_social_links_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_social_links_block_order_idx" ON "_pages_v_blocks_social_links_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_social_links_block_parent_id_idx" ON "_pages_v_blocks_social_links_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_social_links_block_path_idx" ON "_pages_v_blocks_social_links_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_social_links_block_settings_settings_bac_idx" ON "_pages_v_blocks_social_links_block" USING btree ("settings_background_image_id");
  CREATE INDEX "locations_delivery_zones_order_idx" ON "locations_delivery_zones" USING btree ("_order");
  CREATE INDEX "locations_delivery_zones_parent_id_idx" ON "locations_delivery_zones" USING btree ("_parent_id");
  CREATE INDEX "locations_business_hours_order_idx" ON "locations_business_hours" USING btree ("_order");
  CREATE INDEX "locations_business_hours_parent_id_idx" ON "locations_business_hours" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_side_image_id_media_id_fk" FOREIGN KEY ("side_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_side_image_id_media_id_fk" FOREIGN KEY ("side_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_form_block_side_image_idx" ON "pages_blocks_form_block" USING btree ("side_image_id");
  CREATE INDEX "_pages_v_blocks_form_block_side_image_idx" ON "_pages_v_blocks_form_block" USING btree ("side_image_id");
  CREATE INDEX "locations_is_primary_idx" ON "locations" USING btree ("is_primary");
  CREATE INDEX "locations_show_on_contact_idx" ON "locations" USING btree ("show_on_contact");
  CREATE UNIQUE INDEX "locations_one_primary_per_tenant_idx" ON "locations" USING btree ("tenant_id_id") WHERE "is_primary" IS TRUE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_form_block_subject_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_social_links_vis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_social_links_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_form_block_subject_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_social_links_vis_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_social_links_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "locations_delivery_zones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "locations_business_hours" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_form_block_subject_options" CASCADE;
  DROP TABLE "page_social_links_vis" CASCADE;
  DROP TABLE "pages_blocks_social_links_block" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block_subject_options" CASCADE;
  DROP TABLE "_page_social_links_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_social_links_block" CASCADE;
  DROP TABLE "locations_delivery_zones" CASCADE;
  DROP TABLE "locations_business_hours" CASCADE;
  ALTER TABLE "pages_blocks_form_block" DROP CONSTRAINT "pages_blocks_form_block_side_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_form_block" DROP CONSTRAINT "_pages_v_blocks_form_block_side_image_id_media_id_fk";
  
  DROP INDEX "pages_blocks_form_block_side_image_idx";
  DROP INDEX "_pages_v_blocks_form_block_side_image_idx";
  DROP INDEX "locations_is_primary_idx";
  DROP INDEX "locations_show_on_contact_idx";
  DROP INDEX "locations_one_primary_per_tenant_idx";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "enabled";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "error_message";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "side_image_id";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "image_alt";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "image_position";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "image_fit";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "form_card_style";
  ALTER TABLE "pages_blocks_newsletter_block" DROP COLUMN "enabled";
  ALTER TABLE "pages_blocks_newsletter_block" DROP COLUMN "source";
  ALTER TABLE "pages_blocks_newsletter_block" DROP COLUMN "highlighted_word";
  ALTER TABLE "pages_blocks_newsletter_block" DROP COLUMN "success_message";
  ALTER TABLE "pages_blocks_newsletter_block" DROP COLUMN "error_message";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "enabled";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "error_message";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "side_image_id";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "image_alt";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "image_position";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "image_fit";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "form_card_style";
  ALTER TABLE "_pages_v_blocks_newsletter_block" DROP COLUMN "enabled";
  ALTER TABLE "_pages_v_blocks_newsletter_block" DROP COLUMN "source";
  ALTER TABLE "_pages_v_blocks_newsletter_block" DROP COLUMN "highlighted_word";
  ALTER TABLE "_pages_v_blocks_newsletter_block" DROP COLUMN "success_message";
  ALTER TABLE "_pages_v_blocks_newsletter_block" DROP COLUMN "error_message";
  ALTER TABLE "locations" DROP COLUMN "state";
  ALTER TABLE "locations" DROP COLUMN "postal_code";
  ALTER TABLE "locations" DROP COLUMN "country";
  ALTER TABLE "locations" DROP COLUMN "latitude";
  ALTER TABLE "locations" DROP COLUMN "longitude";
  ALTER TABLE "locations" DROP COLUMN "map_button_label";
  ALTER TABLE "locations" DROP COLUMN "is_primary";
  ALTER TABLE "locations" DROP COLUMN "show_on_contact";
  ALTER TABLE "locations" DROP COLUMN "show_in_footer";
  ALTER TABLE "locations" DROP COLUMN "show_on_home";
  ALTER TABLE "contact_submissions" DROP COLUMN "subject";
  ALTER TABLE "site_settings_socials" DROP COLUMN "enabled";
  ALTER TABLE "site_settings_socials" DROP COLUMN "icon";
  ALTER TABLE "site_settings_socials" DROP COLUMN "sort_order";
  ALTER TABLE "site_settings_socials" DROP COLUMN "display_label";
  ALTER TABLE "site_settings_socials" DROP COLUMN "handle";
  ALTER TABLE "site_settings_socials" DROP COLUMN "cta_label";
  ALTER TABLE "site_settings_socials" DROP COLUMN "description";
  ALTER TABLE "site_settings_socials" DROP COLUMN "open_in_new_tab";
  ALTER TABLE "site_settings" DROP COLUMN "newsletter_success_message";
  ALTER TABLE "site_settings" DROP COLUMN "newsletter_error_message";
  ALTER TABLE "_site_settings_v_version_socials" DROP COLUMN "enabled";
  ALTER TABLE "_site_settings_v_version_socials" DROP COLUMN "icon";
  ALTER TABLE "_site_settings_v_version_socials" DROP COLUMN "sort_order";
  ALTER TABLE "_site_settings_v_version_socials" DROP COLUMN "display_label";
  ALTER TABLE "_site_settings_v_version_socials" DROP COLUMN "handle";
  ALTER TABLE "_site_settings_v_version_socials" DROP COLUMN "cta_label";
  ALTER TABLE "_site_settings_v_version_socials" DROP COLUMN "description";
  ALTER TABLE "_site_settings_v_version_socials" DROP COLUMN "open_in_new_tab";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_newsletter_success_message";
  ALTER TABLE "_site_settings_v" DROP COLUMN "version_newsletter_error_message";
  DROP TYPE "public"."enum_pages_blocks_form_block_image_position";
  DROP TYPE "public"."enum_pages_blocks_form_block_image_fit";
  DROP TYPE "public"."enum_pages_blocks_form_block_form_card_style";
  DROP TYPE "public"."enum_pages_blocks_newsletter_block_source";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_image_fit";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_form_card_style";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_block_source";
  DROP TYPE "public"."enum_site_settings_socials_icon";
  DROP TYPE "public"."enum__site_settings_v_version_socials_icon";`)
}
