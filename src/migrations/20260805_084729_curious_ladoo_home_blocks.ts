import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_contentgrid_block_presentation" AS ENUM('grid', 'pillars', 'edge', 'industries', 'b2b', 'services', 'partners');
  CREATE TYPE "public"."enum_pages_blocks_contentgrid_block_media_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum_pages_blocks_contentgrid_block_media_object_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_pages_blocks_contentgrid_block_media_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_steps_block_layout_variant" AS ENUM('numbered-steps', 'timeline');
  CREATE TYPE "public"."enum_pages_blocks_blogpreview_block_source" AS ENUM('collection', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_story_block_layout" AS ENUM('panel', 'overlay');
  CREATE TYPE "public"."enum_pages_blocks_story_block_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_contentgrid_block_presentation" AS ENUM('grid', 'pillars', 'edge', 'industries', 'b2b', 'services', 'partners');
  CREATE TYPE "public"."enum__pages_v_blocks_contentgrid_block_media_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
  CREATE TYPE "public"."enum__pages_v_blocks_contentgrid_block_media_object_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_blocks_contentgrid_block_media_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_steps_block_layout_variant" AS ENUM('numbered-steps', 'timeline');
  CREATE TYPE "public"."enum__pages_v_blocks_blogpreview_block_source" AS ENUM('collection', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_story_block_layout" AS ENUM('panel', 'overlay');
  CREATE TYPE "public"."enum__pages_v_blocks_story_block_image_position" AS ENUM('left', 'right');
  CREATE TABLE "page_blogpreview_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_ticker_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"icon_style" varchar,
  	"name" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "page_ticker_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_ticker_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  
  CREATE TABLE "page_story_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_story_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_pages_blocks_story_block_layout" DEFAULT 'panel',
  	"eyebrow" varchar,
  	"title" varchar,
  	"accent_phrase" varchar,
  	"quote" varchar,
  	"body" varchar,
  	"attribution" varchar,
  	"media_id" integer,
  	"secondary_media_id" integer,
  	"overlay_media_id" integer,
  	"media_alt" varchar,
  	"image_position" "enum_pages_blocks_story_block_image_position" DEFAULT 'right',
  	"stat_badge_enabled" boolean DEFAULT false,
  	"stat_badge_value" varchar,
  	"stat_badge_label" varchar,
  	"enable_cta" boolean DEFAULT false,
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
  
  CREATE TABLE "page_brandsshowcase_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_brandsshowcase_block" (
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
  	"limit" numeric DEFAULT 4,
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
  
  CREATE TABLE "_page_blogpreview_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_ticker_block_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"icon_style" varchar,
  	"name" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_ticker_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_ticker_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
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
  
  CREATE TABLE "_page_story_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_story_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__pages_v_blocks_story_block_layout" DEFAULT 'panel',
  	"eyebrow" varchar,
  	"title" varchar,
  	"accent_phrase" varchar,
  	"quote" varchar,
  	"body" varchar,
  	"attribution" varchar,
  	"media_id" integer,
  	"secondary_media_id" integer,
  	"overlay_media_id" integer,
  	"media_alt" varchar,
  	"image_position" "enum__pages_v_blocks_story_block_image_position" DEFAULT 'right',
  	"stat_badge_enabled" boolean DEFAULT false,
  	"stat_badge_value" varchar,
  	"stat_badge_label" varchar,
  	"enable_cta" boolean DEFAULT false,
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
  
  CREATE TABLE "_page_brandsshowcase_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_brandsshowcase_block" (
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
  	"limit" numeric DEFAULT 4,
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
  
  CREATE TABLE "brands_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"mark" varchar,
  	"category" varchar,
  	"short_description" varchar,
  	"full_description" varchar,
  	"quote" varchar,
  	"stat_value" varchar,
  	"stat_label" varchar,
  	"image_id" integer,
  	"logo_id" integer,
  	"tenant_id" integer,
  	"website_url" varchar,
  	"primary_color" varchar,
  	"accent_color" varchar,
  	"enabled" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"coming_soon" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "brands_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "enable_link" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_type" "cms_link_kind" DEFAULT 'reference';
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_reference_id" integer;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_nofollow" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_disabled" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_button_style" "cms_link_style" DEFAULT 'primary';
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_button_size" "cms_link_size" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_icon_id" integer;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_icon_position" "cms_link_icon_pos" DEFAULT 'left';
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_analytics_tracking_id" varchar;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD COLUMN "link_aria_label" varchar;
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "presentation" "enum_pages_blocks_contentgrid_block_presentation" DEFAULT 'grid';
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_item_id" integer;
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_alt_override" varchar;
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_caption" varchar;
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_aspect_ratio" "enum_pages_blocks_contentgrid_block_media_aspect_ratio" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_object_fit" "enum_pages_blocks_contentgrid_block_media_object_fit" DEFAULT 'cover';
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_priority" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_focal_point_x" numeric DEFAULT 50;
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_focal_point_y" numeric DEFAULT 50;
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "media_position" "enum_pages_blocks_contentgrid_block_media_position" DEFAULT 'left';
  ALTER TABLE "pages_blocks_steps_block" ADD COLUMN "layout_variant" "enum_pages_blocks_steps_block_layout_variant" DEFAULT 'numbered-steps';
  ALTER TABLE "pages_blocks_stats_block_stats" ADD COLUMN "animated_target" numeric;
  ALTER TABLE "pages_blocks_stats_block_stats" ADD COLUMN "animated_suffix" varchar;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "section_header_eyebrow" varchar;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "section_header_title" varchar;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "section_header_heading_tag" "cms_section_tag" DEFAULT 'h2';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "section_header_subtitle" varchar;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "section_header_description" varchar;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "section_header_alignment" "cms_section_align" DEFAULT 'left';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "section_header_max_width" "cms_section_width" DEFAULT 'standard';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "source" "enum_pages_blocks_blogpreview_block_source" DEFAULT 'collection';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "featured_only" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "limit" numeric DEFAULT 3;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_background_color" "cms_block_bg" DEFAULT 'transparent';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_container_width" "cms_block_width" DEFAULT 'standard';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_background_image_id" integer;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_overlay_opacity" numeric;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_padding_top" "cms_block_pt" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_padding_bottom" "cms_block_pb" DEFAULT 'medium';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_animation" "cms_block_anim" DEFAULT 'none';
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_custom_classes" varchar;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD COLUMN "settings_html_id" varchar;
  ALTER TABLE "pages_rels" ADD COLUMN "blog_posts_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "brands_id" integer;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "enable_link" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_type" "cms_link_kind" DEFAULT 'reference';
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_label" varchar;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_reference_id" integer;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_url" varchar;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_nofollow" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_disabled" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_button_style" "cms_link_style" DEFAULT 'primary';
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_button_size" "cms_link_size" DEFAULT 'medium';
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_icon_id" integer;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_icon_position" "cms_link_icon_pos" DEFAULT 'left';
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_analytics_tracking_id" varchar;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD COLUMN "link_aria_label" varchar;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "presentation" "enum__pages_v_blocks_contentgrid_block_presentation" DEFAULT 'grid';
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_item_id" integer;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_alt_override" varchar;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_caption" varchar;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_aspect_ratio" "enum__pages_v_blocks_contentgrid_block_media_aspect_ratio" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_object_fit" "enum__pages_v_blocks_contentgrid_block_media_object_fit" DEFAULT 'cover';
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_priority" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_focal_point_x" numeric DEFAULT 50;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_focal_point_y" numeric DEFAULT 50;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "media_position" "enum__pages_v_blocks_contentgrid_block_media_position" DEFAULT 'left';
  ALTER TABLE "_pages_v_blocks_steps_block" ADD COLUMN "layout_variant" "enum__pages_v_blocks_steps_block_layout_variant" DEFAULT 'numbered-steps';
  ALTER TABLE "_pages_v_blocks_stats_block_stats" ADD COLUMN "animated_target" numeric;
  ALTER TABLE "_pages_v_blocks_stats_block_stats" ADD COLUMN "animated_suffix" varchar;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "section_header_eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "section_header_title" varchar;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "section_header_heading_tag" "cms_section_tag" DEFAULT 'h2';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "section_header_subtitle" varchar;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "section_header_description" varchar;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "section_header_alignment" "cms_section_align" DEFAULT 'left';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "section_header_max_width" "cms_section_width" DEFAULT 'standard';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "source" "enum__pages_v_blocks_blogpreview_block_source" DEFAULT 'collection';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "featured_only" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "limit" numeric DEFAULT 3;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_background_color" "cms_block_bg" DEFAULT 'transparent';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_container_width" "cms_block_width" DEFAULT 'standard';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_background_image_id" integer;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_overlay_opacity" numeric;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_padding_top" "cms_block_pt" DEFAULT 'medium';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_padding_bottom" "cms_block_pb" DEFAULT 'medium';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_animation" "cms_block_anim" DEFAULT 'none';
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_custom_classes" varchar;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD COLUMN "settings_html_id" varchar;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "blog_posts_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "brands_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "brands_id" integer;
  ALTER TABLE "page_blogpreview_vis" ADD CONSTRAINT "page_blogpreview_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_blogpreview_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_ticker_block_items" ADD CONSTRAINT "pages_blocks_ticker_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_ticker_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_ticker_vis" ADD CONSTRAINT "page_ticker_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_ticker_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_ticker_block" ADD CONSTRAINT "pages_blocks_ticker_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_ticker_block" ADD CONSTRAINT "pages_blocks_ticker_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_story_vis" ADD CONSTRAINT "page_story_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_story_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_block" ADD CONSTRAINT "pages_blocks_story_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_block" ADD CONSTRAINT "pages_blocks_story_block_secondary_media_id_media_id_fk" FOREIGN KEY ("secondary_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_block" ADD CONSTRAINT "pages_blocks_story_block_overlay_media_id_media_id_fk" FOREIGN KEY ("overlay_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_block" ADD CONSTRAINT "pages_blocks_story_block_cta_reference_id_pages_id_fk" FOREIGN KEY ("cta_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_block" ADD CONSTRAINT "pages_blocks_story_block_cta_icon_id_media_id_fk" FOREIGN KEY ("cta_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_block" ADD CONSTRAINT "pages_blocks_story_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_story_block" ADD CONSTRAINT "pages_blocks_story_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_brandsshowcase_vis" ADD CONSTRAINT "page_brandsshowcase_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_brandsshowcase_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_brandsshowcase_block" ADD CONSTRAINT "pages_blocks_brandsshowcase_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_brandsshowcase_block" ADD CONSTRAINT "pages_blocks_brandsshowcase_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_blogpreview_vis_v" ADD CONSTRAINT "_page_blogpreview_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_blogpreview_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ticker_block_items" ADD CONSTRAINT "_pages_v_blocks_ticker_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_ticker_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_ticker_vis_v" ADD CONSTRAINT "_page_ticker_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_ticker_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ticker_block" ADD CONSTRAINT "_pages_v_blocks_ticker_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_ticker_block" ADD CONSTRAINT "_pages_v_blocks_ticker_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_story_vis_v" ADD CONSTRAINT "_page_story_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_story_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_block" ADD CONSTRAINT "_pages_v_blocks_story_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_block" ADD CONSTRAINT "_pages_v_blocks_story_block_secondary_media_id_media_id_fk" FOREIGN KEY ("secondary_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_block" ADD CONSTRAINT "_pages_v_blocks_story_block_overlay_media_id_media_id_fk" FOREIGN KEY ("overlay_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_block" ADD CONSTRAINT "_pages_v_blocks_story_block_cta_reference_id_pages_id_fk" FOREIGN KEY ("cta_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_block" ADD CONSTRAINT "_pages_v_blocks_story_block_cta_icon_id_media_id_fk" FOREIGN KEY ("cta_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_block" ADD CONSTRAINT "_pages_v_blocks_story_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_story_block" ADD CONSTRAINT "_pages_v_blocks_story_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_brandsshowcase_vis_v" ADD CONSTRAINT "_page_brandsshowcase_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_brandsshowcase_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_brandsshowcase_block" ADD CONSTRAINT "_pages_v_blocks_brandsshowcase_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_brandsshowcase_block" ADD CONSTRAINT "_pages_v_blocks_brandsshowcase_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands_links" ADD CONSTRAINT "brands_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_tenant_id_id_tenants_id_fk" FOREIGN KEY ("tenant_id_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands_rels" ADD CONSTRAINT "brands_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands_rels" ADD CONSTRAINT "brands_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_blogpreview_vis_order_idx" ON "page_blogpreview_vis" USING btree ("order");
  CREATE INDEX "page_blogpreview_vis_parent_idx" ON "page_blogpreview_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_ticker_block_items_order_idx" ON "pages_blocks_ticker_block_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_ticker_block_items_parent_id_idx" ON "pages_blocks_ticker_block_items" USING btree ("_parent_id");
  CREATE INDEX "page_ticker_vis_order_idx" ON "page_ticker_vis" USING btree ("order");
  CREATE INDEX "page_ticker_vis_parent_idx" ON "page_ticker_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_ticker_block_order_idx" ON "pages_blocks_ticker_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_ticker_block_parent_id_idx" ON "pages_blocks_ticker_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_ticker_block_path_idx" ON "pages_blocks_ticker_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_ticker_block_settings_settings_background_i_idx" ON "pages_blocks_ticker_block" USING btree ("settings_background_image_id");
  CREATE INDEX "page_story_vis_order_idx" ON "page_story_vis" USING btree ("order");
  CREATE INDEX "page_story_vis_parent_idx" ON "page_story_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_story_block_order_idx" ON "pages_blocks_story_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_story_block_parent_id_idx" ON "pages_blocks_story_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_story_block_path_idx" ON "pages_blocks_story_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_story_block_media_idx" ON "pages_blocks_story_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_story_block_secondary_media_idx" ON "pages_blocks_story_block" USING btree ("secondary_media_id");
  CREATE INDEX "pages_blocks_story_block_overlay_media_idx" ON "pages_blocks_story_block" USING btree ("overlay_media_id");
  CREATE INDEX "pages_blocks_story_block_cta_cta_reference_idx" ON "pages_blocks_story_block" USING btree ("cta_reference_id");
  CREATE INDEX "pages_blocks_story_block_cta_cta_icon_idx" ON "pages_blocks_story_block" USING btree ("cta_icon_id");
  CREATE INDEX "pages_blocks_story_block_settings_settings_background_im_idx" ON "pages_blocks_story_block" USING btree ("settings_background_image_id");
  CREATE INDEX "page_brandsshowcase_vis_order_idx" ON "page_brandsshowcase_vis" USING btree ("order");
  CREATE INDEX "page_brandsshowcase_vis_parent_idx" ON "page_brandsshowcase_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_brandsshowcase_block_order_idx" ON "pages_blocks_brandsshowcase_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_brandsshowcase_block_parent_id_idx" ON "pages_blocks_brandsshowcase_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_brandsshowcase_block_path_idx" ON "pages_blocks_brandsshowcase_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_brandsshowcase_block_settings_settings_back_idx" ON "pages_blocks_brandsshowcase_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_page_blogpreview_vis_v_order_idx" ON "_page_blogpreview_vis_v" USING btree ("order");
  CREATE INDEX "_page_blogpreview_vis_v_parent_idx" ON "_page_blogpreview_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_ticker_block_items_order_idx" ON "_pages_v_blocks_ticker_block_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ticker_block_items_parent_id_idx" ON "_pages_v_blocks_ticker_block_items" USING btree ("_parent_id");
  CREATE INDEX "_page_ticker_vis_v_order_idx" ON "_page_ticker_vis_v" USING btree ("order");
  CREATE INDEX "_page_ticker_vis_v_parent_idx" ON "_page_ticker_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_ticker_block_order_idx" ON "_pages_v_blocks_ticker_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_ticker_block_parent_id_idx" ON "_pages_v_blocks_ticker_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_ticker_block_path_idx" ON "_pages_v_blocks_ticker_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_ticker_block_settings_settings_backgroun_idx" ON "_pages_v_blocks_ticker_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_page_story_vis_v_order_idx" ON "_page_story_vis_v" USING btree ("order");
  CREATE INDEX "_page_story_vis_v_parent_idx" ON "_page_story_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_story_block_order_idx" ON "_pages_v_blocks_story_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_story_block_parent_id_idx" ON "_pages_v_blocks_story_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_story_block_path_idx" ON "_pages_v_blocks_story_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_story_block_media_idx" ON "_pages_v_blocks_story_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_story_block_secondary_media_idx" ON "_pages_v_blocks_story_block" USING btree ("secondary_media_id");
  CREATE INDEX "_pages_v_blocks_story_block_overlay_media_idx" ON "_pages_v_blocks_story_block" USING btree ("overlay_media_id");
  CREATE INDEX "_pages_v_blocks_story_block_cta_cta_reference_idx" ON "_pages_v_blocks_story_block" USING btree ("cta_reference_id");
  CREATE INDEX "_pages_v_blocks_story_block_cta_cta_icon_idx" ON "_pages_v_blocks_story_block" USING btree ("cta_icon_id");
  CREATE INDEX "_pages_v_blocks_story_block_settings_settings_background_idx" ON "_pages_v_blocks_story_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_page_brandsshowcase_vis_v_order_idx" ON "_page_brandsshowcase_vis_v" USING btree ("order");
  CREATE INDEX "_page_brandsshowcase_vis_v_parent_idx" ON "_page_brandsshowcase_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_brandsshowcase_block_order_idx" ON "_pages_v_blocks_brandsshowcase_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_brandsshowcase_block_parent_id_idx" ON "_pages_v_blocks_brandsshowcase_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_brandsshowcase_block_path_idx" ON "_pages_v_blocks_brandsshowcase_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_brandsshowcase_block_settings_settings_b_idx" ON "_pages_v_blocks_brandsshowcase_block" USING btree ("settings_background_image_id");
  CREATE INDEX "brands_links_order_idx" ON "brands_links" USING btree ("_order");
  CREATE INDEX "brands_links_parent_id_idx" ON "brands_links" USING btree ("_parent_id");
  CREATE INDEX "brands_tenant_id_idx" ON "brands" USING btree ("tenant_id_id");
  CREATE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_image_idx" ON "brands" USING btree ("image_id");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_tenant_idx" ON "brands" USING btree ("tenant_id");
  CREATE INDEX "brands_enabled_idx" ON "brands" USING btree ("enabled");
  CREATE INDEX "brands_featured_idx" ON "brands" USING btree ("featured");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "brands_rels_order_idx" ON "brands_rels" USING btree ("order");
  CREATE INDEX "brands_rels_parent_idx" ON "brands_rels" USING btree ("parent_id");
  CREATE INDEX "brands_rels_path_idx" ON "brands_rels" USING btree ("path");
  CREATE INDEX "brands_rels_media_id_idx" ON "brands_rels" USING btree ("media_id");
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD CONSTRAINT "pages_blocks_contentgrid_block_items_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contentgrid_block_items" ADD CONSTRAINT "pages_blocks_contentgrid_block_items_link_icon_id_media_id_fk" FOREIGN KEY ("link_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contentgrid_block" ADD CONSTRAINT "pages_blocks_contentgrid_block_media_item_id_media_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_blogpreview_block" ADD CONSTRAINT "pages_blocks_blogpreview_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD CONSTRAINT "_pages_v_blocks_contentgrid_block_items_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD CONSTRAINT "_pages_v_blocks_contentgrid_block_items_link_icon_id_media_id_fk" FOREIGN KEY ("link_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD CONSTRAINT "_pages_v_blocks_contentgrid_block_media_item_id_media_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD CONSTRAINT "_pages_v_blocks_blogpreview_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_contentgrid_block_items_link_link_reference_idx" ON "pages_blocks_contentgrid_block_items" USING btree ("link_reference_id");
  CREATE INDEX "pages_blocks_contentgrid_block_items_link_link_icon_idx" ON "pages_blocks_contentgrid_block_items" USING btree ("link_icon_id");
  CREATE INDEX "pages_blocks_contentgrid_block_media_media_item_idx" ON "pages_blocks_contentgrid_block" USING btree ("media_item_id");
  CREATE INDEX "pages_blocks_blogpreview_block_settings_settings_backgro_idx" ON "pages_blocks_blogpreview_block" USING btree ("settings_background_image_id");
  CREATE INDEX "pages_rels_blog_posts_id_idx" ON "pages_rels" USING btree ("blog_posts_id");
  CREATE INDEX "pages_rels_brands_id_idx" ON "pages_rels" USING btree ("brands_id");
  CREATE INDEX "_pages_v_blocks_contentgrid_block_items_link_link_refere_idx" ON "_pages_v_blocks_contentgrid_block_items" USING btree ("link_reference_id");
  CREATE INDEX "_pages_v_blocks_contentgrid_block_items_link_link_icon_idx" ON "_pages_v_blocks_contentgrid_block_items" USING btree ("link_icon_id");
  CREATE INDEX "_pages_v_blocks_contentgrid_block_media_media_item_idx" ON "_pages_v_blocks_contentgrid_block" USING btree ("media_item_id");
  CREATE INDEX "_pages_v_blocks_blogpreview_block_settings_settings_back_idx" ON "_pages_v_blocks_blogpreview_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_pages_v_rels_blog_posts_id_idx" ON "_pages_v_rels" USING btree ("blog_posts_id");
  CREATE INDEX "_pages_v_rels_brands_id_idx" ON "_pages_v_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_blogpreview_vis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_ticker_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_ticker_vis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_ticker_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_story_vis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_story_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_brandsshowcase_vis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_brandsshowcase_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_blogpreview_vis_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_ticker_block_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_ticker_vis_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_ticker_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_story_vis_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_story_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_page_brandsshowcase_vis_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_brandsshowcase_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brands_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brands" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "brands_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "page_blogpreview_vis" CASCADE;
  DROP TABLE "pages_blocks_ticker_block_items" CASCADE;
  DROP TABLE "page_ticker_vis" CASCADE;
  DROP TABLE "pages_blocks_ticker_block" CASCADE;
  DROP TABLE "page_story_vis" CASCADE;
  DROP TABLE "pages_blocks_story_block" CASCADE;
  DROP TABLE "page_brandsshowcase_vis" CASCADE;
  DROP TABLE "pages_blocks_brandsshowcase_block" CASCADE;
  DROP TABLE "_page_blogpreview_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_ticker_block_items" CASCADE;
  DROP TABLE "_page_ticker_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_ticker_block" CASCADE;
  DROP TABLE "_page_story_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_story_block" CASCADE;
  DROP TABLE "_page_brandsshowcase_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_brandsshowcase_block" CASCADE;
  DROP TABLE "brands_links" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "brands_rels" CASCADE;
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP CONSTRAINT "pages_blocks_contentgrid_block_items_link_reference_id_pages_id_fk";
  
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP CONSTRAINT "pages_blocks_contentgrid_block_items_link_icon_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_contentgrid_block" DROP CONSTRAINT "pages_blocks_contentgrid_block_media_item_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_blogpreview_block" DROP CONSTRAINT "pages_blocks_blogpreview_block_settings_background_image_id_media_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_blog_posts_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_brands_fk";
  
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP CONSTRAINT "_pages_v_blocks_contentgrid_block_items_link_reference_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP CONSTRAINT "_pages_v_blocks_contentgrid_block_items_link_icon_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP CONSTRAINT "_pages_v_blocks_contentgrid_block_media_item_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP CONSTRAINT "_pages_v_blocks_blogpreview_block_settings_background_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_blog_posts_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_brands_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_brands_fk";
  
  DROP INDEX "pages_blocks_contentgrid_block_items_link_link_reference_idx";
  DROP INDEX "pages_blocks_contentgrid_block_items_link_link_icon_idx";
  DROP INDEX "pages_blocks_contentgrid_block_media_media_item_idx";
  DROP INDEX "pages_blocks_blogpreview_block_settings_settings_backgro_idx";
  DROP INDEX "pages_rels_blog_posts_id_idx";
  DROP INDEX "pages_rels_brands_id_idx";
  DROP INDEX "_pages_v_blocks_contentgrid_block_items_link_link_refere_idx";
  DROP INDEX "_pages_v_blocks_contentgrid_block_items_link_link_icon_idx";
  DROP INDEX "_pages_v_blocks_contentgrid_block_media_media_item_idx";
  DROP INDEX "_pages_v_blocks_blogpreview_block_settings_settings_back_idx";
  DROP INDEX "_pages_v_rels_blog_posts_id_idx";
  DROP INDEX "_pages_v_rels_brands_id_idx";
  DROP INDEX "payload_locked_documents_rels_brands_id_idx";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "enable_link";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_type";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_label";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_reference_id";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_url";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_nofollow";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_disabled";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_button_style";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_button_size";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_icon_id";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_icon_position";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_analytics_tracking_id";
  ALTER TABLE "pages_blocks_contentgrid_block_items" DROP COLUMN "link_aria_label";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "presentation";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_item_id";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_alt_override";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_caption";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_aspect_ratio";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_object_fit";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_priority";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_focal_point_x";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_focal_point_y";
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "media_position";
  ALTER TABLE "pages_blocks_steps_block" DROP COLUMN "layout_variant";
  ALTER TABLE "pages_blocks_stats_block_stats" DROP COLUMN "animated_target";
  ALTER TABLE "pages_blocks_stats_block_stats" DROP COLUMN "animated_suffix";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "section_header_eyebrow";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "section_header_title";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "section_header_heading_tag";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "section_header_subtitle";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "section_header_description";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "section_header_alignment";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "section_header_max_width";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "source";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "featured_only";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "limit";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_background_color";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_container_width";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_background_image_id";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_overlay_opacity";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_padding_top";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_padding_bottom";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_animation";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_custom_classes";
  ALTER TABLE "pages_blocks_blogpreview_block" DROP COLUMN "settings_html_id";
  ALTER TABLE "pages_rels" DROP COLUMN "blog_posts_id";
  ALTER TABLE "pages_rels" DROP COLUMN "brands_id";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "enable_link";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_type";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_label";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_reference_id";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_url";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_new_tab";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_nofollow";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_disabled";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_button_style";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_button_size";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_icon_id";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_icon_position";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_analytics_tracking_id";
  ALTER TABLE "_pages_v_blocks_contentgrid_block_items" DROP COLUMN "link_aria_label";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "presentation";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_item_id";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_alt_override";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_caption";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_aspect_ratio";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_object_fit";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_priority";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_focal_point_x";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_focal_point_y";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "media_position";
  ALTER TABLE "_pages_v_blocks_steps_block" DROP COLUMN "layout_variant";
  ALTER TABLE "_pages_v_blocks_stats_block_stats" DROP COLUMN "animated_target";
  ALTER TABLE "_pages_v_blocks_stats_block_stats" DROP COLUMN "animated_suffix";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "section_header_eyebrow";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "section_header_title";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "section_header_heading_tag";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "section_header_subtitle";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "section_header_description";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "section_header_alignment";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "section_header_max_width";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "source";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "featured_only";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "limit";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_background_color";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_container_width";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_background_image_id";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_overlay_opacity";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_padding_top";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_padding_bottom";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_animation";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_custom_classes";
  ALTER TABLE "_pages_v_blocks_blogpreview_block" DROP COLUMN "settings_html_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "blog_posts_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "brands_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "brands_id";
  DROP TYPE "public"."enum_pages_blocks_contentgrid_block_presentation";
  DROP TYPE "public"."enum_pages_blocks_contentgrid_block_media_aspect_ratio";
  DROP TYPE "public"."enum_pages_blocks_contentgrid_block_media_object_fit";
  DROP TYPE "public"."enum_pages_blocks_contentgrid_block_media_position";
  DROP TYPE "public"."enum_pages_blocks_steps_block_layout_variant";
  DROP TYPE "public"."enum_pages_blocks_blogpreview_block_source";
  DROP TYPE "public"."enum_pages_blocks_story_block_layout";
  DROP TYPE "public"."enum_pages_blocks_story_block_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_contentgrid_block_presentation";
  DROP TYPE "public"."enum__pages_v_blocks_contentgrid_block_media_aspect_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_contentgrid_block_media_object_fit";
  DROP TYPE "public"."enum__pages_v_blocks_contentgrid_block_media_position";
  DROP TYPE "public"."enum__pages_v_blocks_steps_block_layout_variant";
  DROP TYPE "public"."enum__pages_v_blocks_blogpreview_block_source";
  DROP TYPE "public"."enum__pages_v_blocks_story_block_layout";
  DROP TYPE "public"."enum__pages_v_blocks_story_block_image_position";`)
}
