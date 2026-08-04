import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__site_settings_v_version_hours_day" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
  CREATE TYPE "public"."enum__site_settings_v_version_socials_platform" AS ENUM('facebook', 'instagram', 'twitter', 'tiktok', 'youtube');
  CREATE TYPE "public"."enum__site_settings_v_version_feature_strip_icon_source" AS ENUM('built-in', 'custom-svg');
  CREATE TYPE "public"."enum__site_settings_v_version_feature_strip_icon" AS ENUM('arrow', 'bowl', 'briefcase', 'building', 'cake', 'calendar', 'caretDown', 'caretRight', 'check', 'chef', 'clock', 'coriander', 'delivery', 'diamond', 'event', 'facebook', 'fire', 'ghee', 'handcrafted', 'hands', 'heart', 'instagram', 'leaf', 'map', 'martini', 'medal', 'moped', 'pepper', 'phone', 'shield', 'spice', 'star', 'sun', 'utensils', 'wedding', 'youtube');
  CREATE TYPE "public"."enum__site_settings_v_version_price_range" AS ENUM('$', '$$', '$$$', '$$$$');
  CREATE TYPE "public"."enum__site_settings_v_version_reservation_settings_provider" AS ENUM('internal', 'opentable', 'resy');
  CREATE TYPE "public"."enum__site_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_nav_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__nav_v_blocks_link_type" AS ENUM('page', 'internal', 'external', 'anchor');
  CREATE TYPE "public"."enum__nav_v_blocks_link_visibility" AS ENUM('public', 'logged_in', 'logged_out');
  CREATE TYPE "public"."enum__nav_v_version_location" AS ENUM('header');
  CREATE TYPE "public"."enum__nav_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_site_settings_v_version_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "enum__site_settings_v_version_hours_day",
  	"open_time" varchar,
  	"close_time" varchar,
  	"is_closed" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_delivery_settings_delivery_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__site_settings_v_version_socials_platform",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_feature_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"icon_source" "enum__site_settings_v_version_feature_strip_icon_source" DEFAULT 'built-in',
  	"icon" "enum__site_settings_v_version_feature_strip_icon" DEFAULT 'spice',
  	"custom_s_v_g_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id_id" integer,
  	"version_business_name" varchar,
  	"version_legal_name" varchar,
  	"version_tax_id" varchar,
  	"version_tagline" varchar,
  	"version_site_description" varchar,
  	"version_contact_address" varchar,
  	"version_cuisine_type" varchar,
  	"version_price_range" "enum__site_settings_v_version_price_range",
  	"version_maps_url" varchar,
  	"version_maps_embed_code" varchar,
  	"version_whatsapp_number" varchar,
  	"version_delivery_settings_enable_delivery" boolean DEFAULT false,
  	"version_reservation_settings_provider" "enum__site_settings_v_version_reservation_settings_provider",
  	"version_reservation_settings_provider_url" varchar,
  	"version_google_analytics_id" varchar,
  	"version_facebook_pixel_id" varchar,
  	"version_custom_header_scripts" varchar,
  	"version_custom_footer_scripts" varchar,
  	"version_maintenance_mode" boolean DEFAULT false,
  	"version_show_announcement_bar" boolean DEFAULT false,
  	"version_announcement_text" varchar,
  	"version_newsletter_enabled" boolean DEFAULT true,
  	"version_newsletter_title" varchar DEFAULT 'Join The Flavour Club',
  	"version_newsletter_highlighted_word" varchar DEFAULT 'Flavour',
  	"version_newsletter_description" varchar,
  	"version_newsletter_placeholder" varchar DEFAULT 'Enter your email address',
  	"version_newsletter_button_label" varchar DEFAULT 'Subscribe',
  	"version_newsletter_privacy_text" varchar DEFAULT 'We respect your privacy. Unsubscribe anytime.',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__site_settings_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_nav_v_blocks_link_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_nav_v_blocks_link" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"type" "enum__nav_v_blocks_link_type" DEFAULT 'internal',
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0,
  	"page_id" integer,
  	"url" varchar,
  	"icon" varchar,
  	"badge" varchar,
  	"new_tab" boolean DEFAULT false,
  	"nofollow" boolean DEFAULT false,
  	"visibility" "enum__nav_v_blocks_link_visibility" DEFAULT 'public',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_nav_v_blocks_mega_menu_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_nav_v_blocks_mega_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_nav_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id_id" integer,
  	"version_internal_name" varchar DEFAULT 'Primary Header',
  	"version_location" "enum__nav_v_version_location" DEFAULT 'header',
  	"version_brand_name" varchar,
  	"version_logo_id" integer,
  	"version_cta_enabled" boolean DEFAULT true,
  	"version_cta_label" varchar DEFAULT 'Order online',
  	"version_cta_url" varchar DEFAULT '/menu',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__nav_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_nav_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "_footer_v_version_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_bottom_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id_id" integer,
  	"version_contact_heading" varchar DEFAULT 'Get In Touch',
  	"version_copyright" varchar DEFAULT '© {year} All rights reserved.',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "site_settings_hours" ALTER COLUMN "day" DROP NOT NULL;
  ALTER TABLE "site_settings_delivery_settings_delivery_urls" ALTER COLUMN "platform" DROP NOT NULL;
  ALTER TABLE "site_settings_delivery_settings_delivery_urls" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "sort_order" DROP NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "icon_source" DROP NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "description" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "tenant_id_id" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "business_name" DROP NOT NULL;
  ALTER TABLE "nav_blocks_link_children" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "nav_blocks_link_children" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "nav_blocks_link_children" ALTER COLUMN "sort_order" DROP NOT NULL;
  ALTER TABLE "nav_blocks_link" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "nav_blocks_link" ALTER COLUMN "sort_order" DROP NOT NULL;
  ALTER TABLE "nav_blocks_mega_menu" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "nav" ALTER COLUMN "tenant_id_id" DROP NOT NULL;
  ALTER TABLE "nav" ALTER COLUMN "internal_name" DROP NOT NULL;
  ALTER TABLE "nav" ALTER COLUMN "location" DROP NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "footer_bottom_links" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "footer_bottom_links" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "tenant_id_id" DROP NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "_status" "enum_site_settings_status" DEFAULT 'draft';
  ALTER TABLE "nav" ADD COLUMN "_status" "enum_nav_status" DEFAULT 'draft';
  ALTER TABLE "footer" ADD COLUMN "_status" "enum_footer_status" DEFAULT 'draft';
  ALTER TABLE "_site_settings_v_version_hours" ADD CONSTRAINT "_site_settings_v_version_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_delivery_settings_delivery_urls" ADD CONSTRAINT "_site_settings_v_version_delivery_settings_delivery_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_socials" ADD CONSTRAINT "_site_settings_v_version_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_feature_strip" ADD CONSTRAINT "_site_settings_v_version_feature_strip_custom_s_v_g_id_media_id_fk" FOREIGN KEY ("custom_s_v_g_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_feature_strip" ADD CONSTRAINT "_site_settings_v_version_feature_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_parent_id_site_settings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_tenant_id_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_nav_v_blocks_link_children" ADD CONSTRAINT "_nav_v_blocks_link_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_nav_v_blocks_link"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_nav_v_blocks_link" ADD CONSTRAINT "_nav_v_blocks_link_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_nav_v_blocks_link" ADD CONSTRAINT "_nav_v_blocks_link_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_nav_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_nav_v_blocks_mega_menu_columns" ADD CONSTRAINT "_nav_v_blocks_mega_menu_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_nav_v_blocks_mega_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_nav_v_blocks_mega_menu" ADD CONSTRAINT "_nav_v_blocks_mega_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_nav_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_nav_v" ADD CONSTRAINT "_nav_v_parent_id_nav_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."nav"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_nav_v" ADD CONSTRAINT "_nav_v_version_tenant_id_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_nav_v" ADD CONSTRAINT "_nav_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_nav_v_rels" ADD CONSTRAINT "_nav_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_nav_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_nav_v_rels" ADD CONSTRAINT "_nav_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns" ADD CONSTRAINT "_footer_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_bottom_links" ADD CONSTRAINT "_footer_v_version_bottom_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v" ADD CONSTRAINT "_footer_v_parent_id_footer_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v" ADD CONSTRAINT "_footer_v_version_tenant_id_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_site_settings_v_version_hours_order_idx" ON "_site_settings_v_version_hours" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_hours_parent_id_idx" ON "_site_settings_v_version_hours" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_delivery_settings_delivery_urls_order_idx" ON "_site_settings_v_version_delivery_settings_delivery_urls" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_delivery_settings_delivery_urls_parent_id_idx" ON "_site_settings_v_version_delivery_settings_delivery_urls" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_socials_order_idx" ON "_site_settings_v_version_socials" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_socials_parent_id_idx" ON "_site_settings_v_version_socials" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_feature_strip_order_idx" ON "_site_settings_v_version_feature_strip" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_feature_strip_parent_id_idx" ON "_site_settings_v_version_feature_strip" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_feature_strip_custom_s_v_g_idx" ON "_site_settings_v_version_feature_strip" USING btree ("custom_s_v_g_id");
  CREATE INDEX "_site_settings_v_parent_idx" ON "_site_settings_v" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_version_version_tenant_id_idx" ON "_site_settings_v" USING btree ("version_tenant_id_id");
  CREATE INDEX "_site_settings_v_version_version_updated_at_idx" ON "_site_settings_v" USING btree ("version_updated_at");
  CREATE INDEX "_site_settings_v_version_version_created_at_idx" ON "_site_settings_v" USING btree ("version_created_at");
  CREATE INDEX "_site_settings_v_version_version__status_idx" ON "_site_settings_v" USING btree ("version__status");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_latest_idx" ON "_site_settings_v" USING btree ("latest");
  CREATE INDEX "_nav_v_blocks_link_children_order_idx" ON "_nav_v_blocks_link_children" USING btree ("_order");
  CREATE INDEX "_nav_v_blocks_link_children_parent_id_idx" ON "_nav_v_blocks_link_children" USING btree ("_parent_id");
  CREATE INDEX "_nav_v_blocks_link_order_idx" ON "_nav_v_blocks_link" USING btree ("_order");
  CREATE INDEX "_nav_v_blocks_link_parent_id_idx" ON "_nav_v_blocks_link" USING btree ("_parent_id");
  CREATE INDEX "_nav_v_blocks_link_path_idx" ON "_nav_v_blocks_link" USING btree ("_path");
  CREATE INDEX "_nav_v_blocks_link_page_idx" ON "_nav_v_blocks_link" USING btree ("page_id");
  CREATE INDEX "_nav_v_blocks_mega_menu_columns_order_idx" ON "_nav_v_blocks_mega_menu_columns" USING btree ("_order");
  CREATE INDEX "_nav_v_blocks_mega_menu_columns_parent_id_idx" ON "_nav_v_blocks_mega_menu_columns" USING btree ("_parent_id");
  CREATE INDEX "_nav_v_blocks_mega_menu_order_idx" ON "_nav_v_blocks_mega_menu" USING btree ("_order");
  CREATE INDEX "_nav_v_blocks_mega_menu_parent_id_idx" ON "_nav_v_blocks_mega_menu" USING btree ("_parent_id");
  CREATE INDEX "_nav_v_blocks_mega_menu_path_idx" ON "_nav_v_blocks_mega_menu" USING btree ("_path");
  CREATE INDEX "_nav_v_parent_idx" ON "_nav_v" USING btree ("parent_id");
  CREATE INDEX "_nav_v_version_version_tenant_id_idx" ON "_nav_v" USING btree ("version_tenant_id_id");
  CREATE INDEX "_nav_v_version_version_logo_idx" ON "_nav_v" USING btree ("version_logo_id");
  CREATE INDEX "_nav_v_version_version_updated_at_idx" ON "_nav_v" USING btree ("version_updated_at");
  CREATE INDEX "_nav_v_version_version_created_at_idx" ON "_nav_v" USING btree ("version_created_at");
  CREATE INDEX "_nav_v_version_version__status_idx" ON "_nav_v" USING btree ("version__status");
  CREATE INDEX "_nav_v_created_at_idx" ON "_nav_v" USING btree ("created_at");
  CREATE INDEX "_nav_v_updated_at_idx" ON "_nav_v" USING btree ("updated_at");
  CREATE INDEX "_nav_v_latest_idx" ON "_nav_v" USING btree ("latest");
  CREATE INDEX "_nav_v_rels_order_idx" ON "_nav_v_rels" USING btree ("order");
  CREATE INDEX "_nav_v_rels_parent_idx" ON "_nav_v_rels" USING btree ("parent_id");
  CREATE INDEX "_nav_v_rels_path_idx" ON "_nav_v_rels" USING btree ("path");
  CREATE INDEX "_nav_v_rels_pages_id_idx" ON "_nav_v_rels" USING btree ("pages_id");
  CREATE INDEX "_footer_v_version_columns_links_order_idx" ON "_footer_v_version_columns_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_links_parent_id_idx" ON "_footer_v_version_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_order_idx" ON "_footer_v_version_columns" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_parent_id_idx" ON "_footer_v_version_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_bottom_links_order_idx" ON "_footer_v_version_bottom_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_bottom_links_parent_id_idx" ON "_footer_v_version_bottom_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_parent_idx" ON "_footer_v" USING btree ("parent_id");
  CREATE INDEX "_footer_v_version_version_tenant_id_idx" ON "_footer_v" USING btree ("version_tenant_id_id");
  CREATE INDEX "_footer_v_version_version_updated_at_idx" ON "_footer_v" USING btree ("version_updated_at");
  CREATE INDEX "_footer_v_version_version_created_at_idx" ON "_footer_v" USING btree ("version_created_at");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE INDEX "site_settings__status_idx" ON "site_settings" USING btree ("_status");
  CREATE INDEX "nav__status_idx" ON "nav" USING btree ("_status");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");
  
  -- Backfill existing globals to published so the frontend stays live
  UPDATE "site_settings" SET "_status" = 'published' WHERE "_status" IS NULL OR "_status" = 'draft';
  UPDATE "nav" SET "_status" = 'published' WHERE "_status" IS NULL OR "_status" = 'draft';
  UPDATE "footer" SET "_status" = 'published' WHERE "_status" IS NULL OR "_status" = 'draft';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "_site_settings_v_version_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_version_delivery_settings_delivery_urls" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_version_socials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_version_feature_strip" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_nav_v_blocks_link_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_nav_v_blocks_link" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_nav_v_blocks_mega_menu_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_nav_v_blocks_mega_menu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_nav_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_nav_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_bottom_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_site_settings_v_version_hours" CASCADE;
  DROP TABLE "_site_settings_v_version_delivery_settings_delivery_urls" CASCADE;
  DROP TABLE "_site_settings_v_version_socials" CASCADE;
  DROP TABLE "_site_settings_v_version_feature_strip" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_nav_v_blocks_link_children" CASCADE;
  DROP TABLE "_nav_v_blocks_link" CASCADE;
  DROP TABLE "_nav_v_blocks_mega_menu_columns" CASCADE;
  DROP TABLE "_nav_v_blocks_mega_menu" CASCADE;
  DROP TABLE "_nav_v" CASCADE;
  DROP TABLE "_nav_v_rels" CASCADE;
  DROP TABLE "_footer_v_version_columns_links" CASCADE;
  DROP TABLE "_footer_v_version_columns" CASCADE;
  DROP TABLE "_footer_v_version_bottom_links" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP INDEX "site_settings__status_idx";
  DROP INDEX "nav__status_idx";
  DROP INDEX "footer__status_idx";
  ALTER TABLE "site_settings_hours" ALTER COLUMN "day" SET NOT NULL;
  ALTER TABLE "site_settings_delivery_settings_delivery_urls" ALTER COLUMN "platform" SET NOT NULL;
  ALTER TABLE "site_settings_delivery_settings_delivery_urls" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "sort_order" SET NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "icon_source" SET NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "description" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "tenant_id_id" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "business_name" SET NOT NULL;
  ALTER TABLE "nav_blocks_link_children" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "nav_blocks_link_children" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "nav_blocks_link_children" ALTER COLUMN "sort_order" SET NOT NULL;
  ALTER TABLE "nav_blocks_link" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "nav_blocks_link" ALTER COLUMN "sort_order" SET NOT NULL;
  ALTER TABLE "nav_blocks_mega_menu" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "nav" ALTER COLUMN "tenant_id_id" SET NOT NULL;
  ALTER TABLE "nav" ALTER COLUMN "internal_name" SET NOT NULL;
  ALTER TABLE "nav" ALTER COLUMN "location" SET NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "footer_columns_links" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "footer_columns" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "footer_bottom_links" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "footer_bottom_links" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "footer" ALTER COLUMN "tenant_id_id" SET NOT NULL;
  ALTER TABLE "site_settings" DROP COLUMN "_status";
  ALTER TABLE "nav" DROP COLUMN "_status";
  ALTER TABLE "footer" DROP COLUMN "_status";
  DROP TYPE "public"."enum_site_settings_status";
  DROP TYPE "public"."enum__site_settings_v_version_hours_day";
  DROP TYPE "public"."enum__site_settings_v_version_socials_platform";
  DROP TYPE "public"."enum__site_settings_v_version_feature_strip_icon_source";
  DROP TYPE "public"."enum__site_settings_v_version_feature_strip_icon";
  DROP TYPE "public"."enum__site_settings_v_version_price_range";
  DROP TYPE "public"."enum__site_settings_v_version_reservation_settings_provider";
  DROP TYPE "public"."enum__site_settings_v_version_status";
  DROP TYPE "public"."enum_nav_status";
  DROP TYPE "public"."enum__nav_v_blocks_link_type";
  DROP TYPE "public"."enum__nav_v_blocks_link_visibility";
  DROP TYPE "public"."enum__nav_v_version_location";
  DROP TYPE "public"."enum__nav_v_version_status";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_status";`)
}
