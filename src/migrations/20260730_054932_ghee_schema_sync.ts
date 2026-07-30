import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

/**
 * Synchronizes the existing dev-pushed schema with the current Payload config.
 *
 * The two legacy mock-block tables are intentionally retained. The forward
 * migration contains no table, column, enum, or index drops.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."cms_block_visibility" AS ENUM('desktop', 'tablet', 'mobile');
    CREATE TYPE "public"."cms_block_bg" AS ENUM('transparent', 'surface', 'primary', 'accent', 'dark');
    CREATE TYPE "public"."cms_block_width" AS ENUM('standard', 'wide', 'full');
    CREATE TYPE "public"."cms_block_pt" AS ENUM('none', 'small', 'medium', 'large');
    CREATE TYPE "public"."cms_block_pb" AS ENUM('none', 'small', 'medium', 'large');
    CREATE TYPE "public"."cms_block_anim" AS ENUM('none', 'fade-in', 'slide-up', 'zoom-in', 'stagger');
    CREATE TYPE "public"."enum_pages_blocks_cardgrid_block_cards_image_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
    CREATE TYPE "public"."enum_pages_blocks_cardgrid_block_cards_image_object_fit" AS ENUM('cover', 'contain');
    CREATE TYPE "public"."cms_link_kind" AS ENUM('reference', 'custom', 'anchor', 'email', 'phone');
    CREATE TYPE "public"."cms_link_style" AS ENUM('primary', 'secondary', 'outline', 'ghost', 'text');
    CREATE TYPE "public"."cms_link_size" AS ENUM('small', 'medium', 'large');
    CREATE TYPE "public"."cms_link_icon_pos" AS ENUM('left', 'right');
    CREATE TYPE "public"."cms_section_tag" AS ENUM('h1', 'h2', 'h3', 'h4');
    CREATE TYPE "public"."cms_section_align" AS ENUM('left', 'center', 'right');
    CREATE TYPE "public"."cms_section_width" AS ENUM('standard', 'narrow', 'wide');
    CREATE TYPE "public"."enum_pages_blocks_cardgrid_block_columns" AS ENUM('2', '3', '4');
    CREATE TYPE "public"."enum_pages_blocks_testimonials_block_source" AS ENUM('collection', 'manual');
    CREATE TYPE "public"."enum_pages_blocks_split_block_image_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
    CREATE TYPE "public"."enum_pages_blocks_split_block_image_object_fit" AS ENUM('cover', 'contain');
    CREATE TYPE "public"."enum_pages_blocks_split_block_image_position" AS ENUM('left', 'right');
    CREATE TYPE "public"."enum_pages_blocks_split_block_cta_group_alignment" AS ENUM('left', 'center', 'right');
    CREATE TYPE "public"."enum_pages_blocks_gallery_block_source" AS ENUM('collection', 'manual');
    CREATE TYPE "public"."enum_pages_blocks_gallery_block_category" AS ENUM('all', 'food', 'ambiance', 'events', 'kitchen', 'exterior');
    CREATE TYPE "public"."enum_pages_blocks_form_block_form_type" AS ENUM('contact', 'reservation', 'catering');
    CREATE TYPE "public"."enum_pages_blocks_menushowcase_block_cta_group_alignment" AS ENUM('left', 'center', 'right');
    CREATE TYPE "public"."enum_pages_blocks_cta_block_cta_group_alignment" AS ENUM('left', 'center', 'right');
    CREATE TYPE "public"."enum_pages_blocks_spacer_block_size" AS ENUM('small', 'medium', 'large', 'xlarge');
    CREATE TYPE "public"."cms_page_status" AS ENUM('draft', 'published', 'archived');
    CREATE TYPE "public"."enum__pages_v_blocks_cardgrid_block_cards_image_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
    CREATE TYPE "public"."enum__pages_v_blocks_cardgrid_block_cards_image_object_fit" AS ENUM('cover', 'contain');
    CREATE TYPE "public"."enum__pages_v_blocks_cardgrid_block_columns" AS ENUM('2', '3', '4');
    CREATE TYPE "public"."enum__pages_v_blocks_testimonials_block_source" AS ENUM('collection', 'manual');
    CREATE TYPE "public"."enum__pages_v_blocks_split_block_image_aspect_ratio" AS ENUM('auto', '16:9', '4:3', '1:1', '9:16');
    CREATE TYPE "public"."enum__pages_v_blocks_split_block_image_object_fit" AS ENUM('cover', 'contain');
    CREATE TYPE "public"."enum__pages_v_blocks_split_block_image_position" AS ENUM('left', 'right');
    CREATE TYPE "public"."enum__pages_v_blocks_split_block_cta_group_alignment" AS ENUM('left', 'center', 'right');
    CREATE TYPE "public"."enum__pages_v_blocks_gallery_block_source" AS ENUM('collection', 'manual');
    CREATE TYPE "public"."enum__pages_v_blocks_gallery_block_category" AS ENUM('all', 'food', 'ambiance', 'events', 'kitchen', 'exterior');
    CREATE TYPE "public"."enum__pages_v_blocks_form_block_form_type" AS ENUM('contact', 'reservation', 'catering');
    CREATE TYPE "public"."enum__pages_v_blocks_menushowcase_block_cta_group_alignment" AS ENUM('left', 'center', 'right');
    CREATE TYPE "public"."enum__pages_v_blocks_cta_block_cta_group_alignment" AS ENUM('left', 'center', 'right');
    CREATE TYPE "public"."enum__pages_v_blocks_spacer_block_size" AS ENUM('small', 'medium', 'large', 'xlarge');
    CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published', 'cancelled');
    CREATE TYPE "public"."cms_blog_status" AS ENUM('draft', 'published', 'archived');
    CREATE TABLE "pages_blocks_featurestrip_block_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"icon" varchar,
	"title" varchar,
	"description" varchar
);

    CREATE TABLE "page_featurestrip_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_featurestrip_block" (
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

    CREATE TABLE "pages_blocks_cardgrid_block_cards" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"image_item_id" integer,
	"image_alt_override" varchar,
	"image_caption" varchar,
	"image_aspect_ratio" "enum_pages_blocks_cardgrid_block_cards_image_aspect_ratio" DEFAULT 'auto',
	"image_object_fit" "enum_pages_blocks_cardgrid_block_cards_image_object_fit" DEFAULT 'cover',
	"image_priority" boolean DEFAULT false,
	"image_focal_point_x" numeric DEFAULT 50,
	"image_focal_point_y" numeric DEFAULT 50,
	"title" varchar,
	"description" varchar,
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
	"link_aria_label" varchar
);

    CREATE TABLE "page_cardgrid_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_cardgrid_block" (
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
	"columns" "enum_pages_blocks_cardgrid_block_columns" DEFAULT '3',
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

    CREATE TABLE "pages_blocks_contentgrid_block_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"icon" varchar,
	"title" varchar,
	"description" varchar
);

    CREATE TABLE "page_contentgrid_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_contentgrid_block" (
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

    CREATE TABLE "pages_blocks_steps_block_steps" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar,
	"icon" varchar,
	"title" varchar,
	"description" varchar
);

    CREATE TABLE "page_steps_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_steps_block" (
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

    CREATE TABLE "page_testimonials_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_testimonials_block" (
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
	"source" "enum_pages_blocks_testimonials_block_source" DEFAULT 'collection',
	"featured_only" boolean DEFAULT true,
	"limit" numeric DEFAULT 3,
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

    CREATE TABLE "pages_blocks_stats_block_stats" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"value" varchar,
	"label" varchar
);

    CREATE TABLE "page_stats_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_stats_block" (
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

    CREATE TABLE "pages_blocks_split_block_points" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
);

    CREATE TABLE "page_split_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_split_block" (
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
	"body" varchar,
	"image_item_id" integer,
	"image_alt_override" varchar,
	"image_caption" varchar,
	"image_aspect_ratio" "enum_pages_blocks_split_block_image_aspect_ratio" DEFAULT 'auto',
	"image_object_fit" "enum_pages_blocks_split_block_image_object_fit" DEFAULT 'cover',
	"image_priority" boolean DEFAULT false,
	"image_focal_point_x" numeric DEFAULT 50,
	"image_focal_point_y" numeric DEFAULT 50,
	"image_position" "enum_pages_blocks_split_block_image_position" DEFAULT 'left',
	"cta_group_alignment" "enum_pages_blocks_split_block_cta_group_alignment" DEFAULT 'left',
	"cta_group_enable_primary" boolean DEFAULT true,
	"cta_group_enable_secondary" boolean DEFAULT false,
	"cta_group_primary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_primary_c_t_a_label" varchar,
	"cta_group_primary_c_t_a_reference_id" integer,
	"cta_group_primary_c_t_a_url" varchar,
	"cta_group_primary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_primary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_primary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_primary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_primary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_primary_c_t_a_icon_id" integer,
	"cta_group_primary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_primary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_primary_c_t_a_aria_label" varchar,
	"cta_group_secondary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_secondary_c_t_a_label" varchar,
	"cta_group_secondary_c_t_a_reference_id" integer,
	"cta_group_secondary_c_t_a_url" varchar,
	"cta_group_secondary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_secondary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_secondary_c_t_a_icon_id" integer,
	"cta_group_secondary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_secondary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_secondary_c_t_a_aria_label" varchar,
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

    CREATE TABLE "page_gallery_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_gallery_block" (
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
	"source" "enum_pages_blocks_gallery_block_source" DEFAULT 'collection',
	"category" "enum_pages_blocks_gallery_block_category" DEFAULT 'all',
	"featured_only" boolean DEFAULT false,
	"limit" numeric DEFAULT 8,
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

    CREATE TABLE "page_form_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_form_block" (
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
	"form_type" "enum_pages_blocks_form_block_form_type" DEFAULT 'contact',
	"submit_label" varchar DEFAULT 'Send message',
	"success_message" varchar DEFAULT 'Thank you. We will be in touch shortly.',
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

    CREATE TABLE "page_menushowcase_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_menushowcase_block" (
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
	"featured_only" boolean DEFAULT true,
	"limit" numeric DEFAULT 6,
	"cta_group_alignment" "enum_pages_blocks_menushowcase_block_cta_group_alignment" DEFAULT 'left',
	"cta_group_enable_primary" boolean DEFAULT true,
	"cta_group_enable_secondary" boolean DEFAULT false,
	"cta_group_primary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_primary_c_t_a_label" varchar,
	"cta_group_primary_c_t_a_reference_id" integer,
	"cta_group_primary_c_t_a_url" varchar,
	"cta_group_primary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_primary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_primary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_primary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_primary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_primary_c_t_a_icon_id" integer,
	"cta_group_primary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_primary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_primary_c_t_a_aria_label" varchar,
	"cta_group_secondary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_secondary_c_t_a_label" varchar,
	"cta_group_secondary_c_t_a_reference_id" integer,
	"cta_group_secondary_c_t_a_url" varchar,
	"cta_group_secondary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_secondary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_secondary_c_t_a_icon_id" integer,
	"cta_group_secondary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_secondary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_secondary_c_t_a_aria_label" varchar,
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

    CREATE TABLE "page_team_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_team_block" (
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
	"limit" numeric DEFAULT 8,
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

    CREATE TABLE "page_events_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_events_block" (
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
	"featured_only" boolean DEFAULT false,
	"limit" numeric DEFAULT 6,
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

    CREATE TABLE "page_faq_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_faq_block" (
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
	"limit" numeric DEFAULT 10,
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

    CREATE TABLE "page_locations_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_locations_block" (
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
	"show_map" boolean DEFAULT true,
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

    CREATE TABLE "pages_blocks_blogpreview_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"block_name" varchar
);

    CREATE TABLE "pages_blocks_embed_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"block_name" varchar
);

    CREATE TABLE "page_cta_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_cta_block" (
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
	"cta_group_alignment" "enum_pages_blocks_cta_block_cta_group_alignment" DEFAULT 'left',
	"cta_group_enable_primary" boolean DEFAULT true,
	"cta_group_enable_secondary" boolean DEFAULT false,
	"cta_group_primary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_primary_c_t_a_label" varchar,
	"cta_group_primary_c_t_a_reference_id" integer,
	"cta_group_primary_c_t_a_url" varchar,
	"cta_group_primary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_primary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_primary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_primary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_primary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_primary_c_t_a_icon_id" integer,
	"cta_group_primary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_primary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_primary_c_t_a_aria_label" varchar,
	"cta_group_secondary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_secondary_c_t_a_label" varchar,
	"cta_group_secondary_c_t_a_reference_id" integer,
	"cta_group_secondary_c_t_a_url" varchar,
	"cta_group_secondary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_secondary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_secondary_c_t_a_icon_id" integer,
	"cta_group_secondary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_secondary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_secondary_c_t_a_aria_label" varchar,
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

    CREATE TABLE "page_newsletter_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_newsletter_block" (
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
	"placeholder" varchar DEFAULT 'Enter your email address',
	"button_label" varchar DEFAULT 'Subscribe',
	"privacy_text" varchar,
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

    CREATE TABLE "page_richtext_vis" (
	"order" integer NOT NULL,
	"parent_id" varchar NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "pages_blocks_richtext_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"content" jsonb,
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

    CREATE TABLE "pages_blocks_spacer_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"size" "enum_pages_blocks_spacer_block_size" DEFAULT 'medium',
	"block_name" varchar
);

    CREATE TABLE "pages_blocks_roomsshowcase_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"block_name" varchar
);

    CREATE TABLE "pages_blocks_amenities_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"block_name" varchar
);

    CREATE TABLE "pages_blocks_packages_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"block_name" varchar
);

    CREATE TABLE "pages_blocks_subbrands_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"block_name" varchar
);

    CREATE TABLE "pages_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"testimonials_id" integer,
	"gallery_id" integer,
	"menu_categories_id" integer,
	"teammembers_id" integer,
	"events_id" integer,
	"faqs_id" integer,
	"locations_id" integer
);

    CREATE TABLE "_pages_v_blocks_featurestrip_block_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"icon" varchar,
	"title" varchar,
	"description" varchar,
	"_uuid" varchar
);

    CREATE TABLE "_page_featurestrip_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_featurestrip_block" (
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

    CREATE TABLE "_pages_v_blocks_cardgrid_block_cards" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"image_item_id" integer,
	"image_alt_override" varchar,
	"image_caption" varchar,
	"image_aspect_ratio" "enum__pages_v_blocks_cardgrid_block_cards_image_aspect_ratio" DEFAULT 'auto',
	"image_object_fit" "enum__pages_v_blocks_cardgrid_block_cards_image_object_fit" DEFAULT 'cover',
	"image_priority" boolean DEFAULT false,
	"image_focal_point_x" numeric DEFAULT 50,
	"image_focal_point_y" numeric DEFAULT 50,
	"title" varchar,
	"description" varchar,
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
	"_uuid" varchar
);

    CREATE TABLE "_page_cardgrid_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_cardgrid_block" (
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
	"columns" "enum__pages_v_blocks_cardgrid_block_columns" DEFAULT '3',
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

    CREATE TABLE "_pages_v_blocks_contentgrid_block_items" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"icon" varchar,
	"title" varchar,
	"description" varchar,
	"_uuid" varchar
);

    CREATE TABLE "_page_contentgrid_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_contentgrid_block" (
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

    CREATE TABLE "_pages_v_blocks_steps_block_steps" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar,
	"icon" varchar,
	"title" varchar,
	"description" varchar,
	"_uuid" varchar
);

    CREATE TABLE "_page_steps_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_steps_block" (
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

    CREATE TABLE "_page_testimonials_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_testimonials_block" (
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
	"source" "enum__pages_v_blocks_testimonials_block_source" DEFAULT 'collection',
	"featured_only" boolean DEFAULT true,
	"limit" numeric DEFAULT 3,
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

    CREATE TABLE "_pages_v_blocks_stats_block_stats" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar,
	"label" varchar,
	"_uuid" varchar
);

    CREATE TABLE "_page_stats_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_stats_block" (
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

    CREATE TABLE "_pages_v_blocks_split_block_points" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar,
	"_uuid" varchar
);

    CREATE TABLE "_page_split_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_split_block" (
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
	"body" varchar,
	"image_item_id" integer,
	"image_alt_override" varchar,
	"image_caption" varchar,
	"image_aspect_ratio" "enum__pages_v_blocks_split_block_image_aspect_ratio" DEFAULT 'auto',
	"image_object_fit" "enum__pages_v_blocks_split_block_image_object_fit" DEFAULT 'cover',
	"image_priority" boolean DEFAULT false,
	"image_focal_point_x" numeric DEFAULT 50,
	"image_focal_point_y" numeric DEFAULT 50,
	"image_position" "enum__pages_v_blocks_split_block_image_position" DEFAULT 'left',
	"cta_group_alignment" "enum__pages_v_blocks_split_block_cta_group_alignment" DEFAULT 'left',
	"cta_group_enable_primary" boolean DEFAULT true,
	"cta_group_enable_secondary" boolean DEFAULT false,
	"cta_group_primary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_primary_c_t_a_label" varchar,
	"cta_group_primary_c_t_a_reference_id" integer,
	"cta_group_primary_c_t_a_url" varchar,
	"cta_group_primary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_primary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_primary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_primary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_primary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_primary_c_t_a_icon_id" integer,
	"cta_group_primary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_primary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_primary_c_t_a_aria_label" varchar,
	"cta_group_secondary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_secondary_c_t_a_label" varchar,
	"cta_group_secondary_c_t_a_reference_id" integer,
	"cta_group_secondary_c_t_a_url" varchar,
	"cta_group_secondary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_secondary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_secondary_c_t_a_icon_id" integer,
	"cta_group_secondary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_secondary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_secondary_c_t_a_aria_label" varchar,
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

    CREATE TABLE "_page_gallery_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_gallery_block" (
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
	"source" "enum__pages_v_blocks_gallery_block_source" DEFAULT 'collection',
	"category" "enum__pages_v_blocks_gallery_block_category" DEFAULT 'all',
	"featured_only" boolean DEFAULT false,
	"limit" numeric DEFAULT 8,
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

    CREATE TABLE "_page_form_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_form_block" (
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
	"form_type" "enum__pages_v_blocks_form_block_form_type" DEFAULT 'contact',
	"submit_label" varchar DEFAULT 'Send message',
	"success_message" varchar DEFAULT 'Thank you. We will be in touch shortly.',
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

    CREATE TABLE "_page_menushowcase_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_menushowcase_block" (
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
	"featured_only" boolean DEFAULT true,
	"limit" numeric DEFAULT 6,
	"cta_group_alignment" "enum__pages_v_blocks_menushowcase_block_cta_group_alignment" DEFAULT 'left',
	"cta_group_enable_primary" boolean DEFAULT true,
	"cta_group_enable_secondary" boolean DEFAULT false,
	"cta_group_primary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_primary_c_t_a_label" varchar,
	"cta_group_primary_c_t_a_reference_id" integer,
	"cta_group_primary_c_t_a_url" varchar,
	"cta_group_primary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_primary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_primary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_primary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_primary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_primary_c_t_a_icon_id" integer,
	"cta_group_primary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_primary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_primary_c_t_a_aria_label" varchar,
	"cta_group_secondary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_secondary_c_t_a_label" varchar,
	"cta_group_secondary_c_t_a_reference_id" integer,
	"cta_group_secondary_c_t_a_url" varchar,
	"cta_group_secondary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_secondary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_secondary_c_t_a_icon_id" integer,
	"cta_group_secondary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_secondary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_secondary_c_t_a_aria_label" varchar,
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

    CREATE TABLE "_page_team_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_team_block" (
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
	"limit" numeric DEFAULT 8,
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

    CREATE TABLE "_page_events_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_events_block" (
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
	"featured_only" boolean DEFAULT false,
	"limit" numeric DEFAULT 6,
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

    CREATE TABLE "_page_faq_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_faq_block" (
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
	"limit" numeric DEFAULT 10,
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

    CREATE TABLE "_page_locations_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_locations_block" (
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
	"show_map" boolean DEFAULT true,
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

    CREATE TABLE "_pages_v_blocks_blogpreview_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

    CREATE TABLE "_pages_v_blocks_embed_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

    CREATE TABLE "_page_cta_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_cta_block" (
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
	"cta_group_alignment" "enum__pages_v_blocks_cta_block_cta_group_alignment" DEFAULT 'left',
	"cta_group_enable_primary" boolean DEFAULT true,
	"cta_group_enable_secondary" boolean DEFAULT false,
	"cta_group_primary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_primary_c_t_a_label" varchar,
	"cta_group_primary_c_t_a_reference_id" integer,
	"cta_group_primary_c_t_a_url" varchar,
	"cta_group_primary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_primary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_primary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_primary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_primary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_primary_c_t_a_icon_id" integer,
	"cta_group_primary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_primary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_primary_c_t_a_aria_label" varchar,
	"cta_group_secondary_c_t_a_type" "cms_link_kind" DEFAULT 'reference',
	"cta_group_secondary_c_t_a_label" varchar,
	"cta_group_secondary_c_t_a_reference_id" integer,
	"cta_group_secondary_c_t_a_url" varchar,
	"cta_group_secondary_c_t_a_new_tab" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_nofollow" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_disabled" boolean DEFAULT false,
	"cta_group_secondary_c_t_a_button_style" "cms_link_style" DEFAULT 'primary',
	"cta_group_secondary_c_t_a_button_size" "cms_link_size" DEFAULT 'medium',
	"cta_group_secondary_c_t_a_icon_id" integer,
	"cta_group_secondary_c_t_a_icon_position" "cms_link_icon_pos" DEFAULT 'left',
	"cta_group_secondary_c_t_a_analytics_tracking_id" varchar,
	"cta_group_secondary_c_t_a_aria_label" varchar,
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

    CREATE TABLE "_page_newsletter_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_newsletter_block" (
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
	"placeholder" varchar DEFAULT 'Enter your email address',
	"button_label" varchar DEFAULT 'Subscribe',
	"privacy_text" varchar,
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

    CREATE TABLE "_page_richtext_vis_v" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "cms_block_visibility",
	"id" serial PRIMARY KEY NOT NULL
);

    CREATE TABLE "_pages_v_blocks_richtext_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"content" jsonb,
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

    CREATE TABLE "_pages_v_blocks_spacer_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"size" "enum__pages_v_blocks_spacer_block_size" DEFAULT 'medium',
	"_uuid" varchar,
	"block_name" varchar
);

    CREATE TABLE "_pages_v_blocks_roomsshowcase_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

    CREATE TABLE "_pages_v_blocks_amenities_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

    CREATE TABLE "_pages_v_blocks_packages_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

    CREATE TABLE "_pages_v_blocks_subbrands_block" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"subtitle" varchar,
	"_uuid" varchar,
	"block_name" varchar
);

    CREATE TABLE "_pages_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"testimonials_id" integer,
	"gallery_id" integer,
	"menu_categories_id" integer,
	"teammembers_id" integer,
	"events_id" integer,
	"faqs_id" integer,
	"locations_id" integer
);

    CREATE TABLE "locations_order_links" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"platform" varchar NOT NULL,
	"url" varchar NOT NULL
);

    CREATE TABLE "nav_blocks_link_children" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"url" varchar NOT NULL,
	"new_tab" boolean DEFAULT false
);

    ALTER TABLE "testimonials" ALTER COLUMN "rating" SET DEFAULT 5;
    ALTER TABLE "testimonials" ALTER COLUMN "sort_order" SET DEFAULT 0;
    ALTER TABLE "_pages_v" ALTER COLUMN "version_status" DROP DEFAULT;
    ALTER TABLE "_pages_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."cms_page_status" USING "version_status"::text::"public"."cms_page_status";
    ALTER TABLE "_pages_v" ALTER COLUMN "version_status" SET DEFAULT 'draft';
    ALTER TABLE "_pages_v" ALTER COLUMN "version_sort_order" SET DEFAULT 0;
    ALTER TABLE "menu_items" ALTER COLUMN "description" SET NOT NULL;
    ALTER TABLE "menu_items" ALTER COLUMN "display_order" SET DEFAULT 0;
    ALTER TABLE "media" ALTER COLUMN "focal_point_x" SET DEFAULT 50;
    ALTER TABLE "media" ALTER COLUMN "focal_point_y" SET DEFAULT 50;
    ALTER TABLE "site_settings_delivery_settings_delivery_urls" ALTER COLUMN "platform" SET NOT NULL;
    ALTER TABLE "site_settings_delivery_settings_delivery_urls" ALTER COLUMN "url" SET NOT NULL;
    ALTER TABLE "_blog_posts_v" ALTER COLUMN "version_status" DROP DEFAULT;
    ALTER TABLE "_blog_posts_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."cms_blog_status" USING "version_status"::text::"public"."cms_blog_status";
    ALTER TABLE "_blog_posts_v" ALTER COLUMN "version_status" SET DEFAULT 'draft';
    ALTER TABLE "nav_blocks_link" ALTER COLUMN "sort_order" SET DEFAULT 0;
    ALTER TABLE "blog_posts" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "blog_posts" ALTER COLUMN "status" SET DATA TYPE "public"."cms_blog_status" USING "status"::text::"public"."cms_blog_status";
    ALTER TABLE "blog_posts" ALTER COLUMN "status" SET DEFAULT 'draft';
    ALTER TABLE "gallery" ALTER COLUMN "sort_order" SET DEFAULT 0;
    ALTER TABLE "site_settings_hours" ALTER COLUMN "day" SET NOT NULL;
    ALTER TABLE "menu_categories" ALTER COLUMN "sort_order" SET DEFAULT 0;
    ALTER TABLE "pages" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "pages" ALTER COLUMN "status" SET DATA TYPE "public"."cms_page_status" USING "status"::text::"public"."cms_page_status";
    ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'draft';
    ALTER TABLE "pages" ALTER COLUMN "sort_order" SET DEFAULT 0;
    ALTER TABLE "users" ALTER COLUMN "login_attempts" SET DEFAULT 0;
    ALTER TABLE "teammembers" ADD COLUMN "role" varchar NOT NULL;
    ALTER TABLE "teammembers" ADD COLUMN "photo_id" integer;
    ALTER TABLE "teammembers" ADD COLUMN "bio" varchar;
    ALTER TABLE "teammembers" ADD COLUMN "quote" varchar;
    ALTER TABLE "teammembers" ADD COLUMN "is_active" boolean DEFAULT true;
    ALTER TABLE "teammembers" ADD COLUMN "sort_order" numeric DEFAULT 0;
    ALTER TABLE "events" ADD COLUMN "summary" varchar NOT NULL;
    ALTER TABLE "events" ADD COLUMN "description" varchar;
    ALTER TABLE "events" ADD COLUMN "starts_at" timestamp(3) with time zone NOT NULL;
    ALTER TABLE "events" ADD COLUMN "ends_at" timestamp(3) with time zone;
    ALTER TABLE "events" ADD COLUMN "location_name" varchar;
    ALTER TABLE "events" ADD COLUMN "image_id" integer;
    ALTER TABLE "events" ADD COLUMN "booking_url" varchar;
    ALTER TABLE "events" ADD COLUMN "status" "enum_events_status" DEFAULT 'draft' NOT NULL;
    ALTER TABLE "events" ADD COLUMN "is_featured" boolean DEFAULT false;
    ALTER TABLE "faqs" ADD COLUMN "answer" varchar NOT NULL;
    ALTER TABLE "faqs" ADD COLUMN "category" varchar;
    ALTER TABLE "faqs" ADD COLUMN "is_active" boolean DEFAULT true;
    ALTER TABLE "faqs" ADD COLUMN "sort_order" numeric DEFAULT 0;
    ALTER TABLE "locations" ADD COLUMN "city" varchar NOT NULL;
    ALTER TABLE "locations" ADD COLUMN "address" varchar NOT NULL;
    ALTER TABLE "locations" ADD COLUMN "description" varchar;
    ALTER TABLE "locations" ADD COLUMN "phone" varchar;
    ALTER TABLE "locations" ADD COLUMN "email" varchar;
    ALTER TABLE "locations" ADD COLUMN "maps_url" varchar;
    ALTER TABLE "locations" ADD COLUMN "maps_embed_url" varchar;
    ALTER TABLE "locations" ADD COLUMN "is_active" boolean DEFAULT true;
    ALTER TABLE "locations" ADD COLUMN "sort_order" numeric DEFAULT 0;
    ALTER TABLE "site_settings" ADD COLUMN "tagline" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "site_description" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "contact_address" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "newsletter_enabled" boolean DEFAULT true;
    ALTER TABLE "site_settings" ADD COLUMN "newsletter_title" varchar DEFAULT 'Join The Flavour Club';
    ALTER TABLE "site_settings" ADD COLUMN "newsletter_highlighted_word" varchar DEFAULT 'Flavour';
    ALTER TABLE "site_settings" ADD COLUMN "newsletter_description" varchar;
    ALTER TABLE "site_settings" ADD COLUMN "newsletter_placeholder" varchar DEFAULT 'Enter your email address';
    ALTER TABLE "site_settings" ADD COLUMN "newsletter_button_label" varchar DEFAULT 'Subscribe';
    ALTER TABLE "site_settings" ADD COLUMN "newsletter_privacy_text" varchar DEFAULT 'We respect your privacy. Unsubscribe anytime.';
    ALTER TABLE "footer" ADD COLUMN "contact_heading" varchar DEFAULT 'Get In Touch';
    ALTER TABLE "footer_bottom_links" ADD COLUMN "new_tab" boolean DEFAULT false;
    ALTER TABLE "pages_blocks_hero_block" ADD COLUMN "order_platforms_label" varchar DEFAULT 'Also available on';
    ALTER TABLE "pages_blocks_hero_block" ADD COLUMN "stamp_text" varchar DEFAULT 'Slow
Roasted
In Ghee
With Love';
    ALTER TABLE "_pages_v_blocks_hero_block" ADD COLUMN "order_platforms_label" varchar DEFAULT 'Also available on';
    ALTER TABLE "_pages_v_blocks_hero_block" ADD COLUMN "stamp_text" varchar DEFAULT 'Slow
Roasted
In Ghee
With Love';
    ALTER TABLE "pages_blocks_featurestrip_block_items" ADD CONSTRAINT "pages_blocks_featurestrip_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_featurestrip_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_featurestrip_vis" ADD CONSTRAINT "page_featurestrip_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_featurestrip_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_featurestrip_block" ADD CONSTRAINT "pages_blocks_featurestrip_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_featurestrip_block" ADD CONSTRAINT "pages_blocks_featurestrip_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_cardgrid_block_cards" ADD CONSTRAINT "pages_blocks_cardgrid_block_cards_image_item_id_media_id_fk" FOREIGN KEY ("image_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cardgrid_block_cards" ADD CONSTRAINT "pages_blocks_cardgrid_block_cards_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cardgrid_block_cards" ADD CONSTRAINT "pages_blocks_cardgrid_block_cards_link_icon_id_media_id_fk" FOREIGN KEY ("link_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cardgrid_block_cards" ADD CONSTRAINT "pages_blocks_cardgrid_block_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cardgrid_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_cardgrid_vis" ADD CONSTRAINT "page_cardgrid_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_cardgrid_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_cardgrid_block" ADD CONSTRAINT "pages_blocks_cardgrid_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cardgrid_block" ADD CONSTRAINT "pages_blocks_cardgrid_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_contentgrid_block_items" ADD CONSTRAINT "pages_blocks_contentgrid_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contentgrid_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_contentgrid_vis" ADD CONSTRAINT "page_contentgrid_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_contentgrid_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_contentgrid_block" ADD CONSTRAINT "pages_blocks_contentgrid_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_contentgrid_block" ADD CONSTRAINT "pages_blocks_contentgrid_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_steps_block_steps" ADD CONSTRAINT "pages_blocks_steps_block_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_steps_vis" ADD CONSTRAINT "page_steps_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_steps_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_steps_block" ADD CONSTRAINT "pages_blocks_steps_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_steps_block" ADD CONSTRAINT "pages_blocks_steps_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_testimonials_vis" ADD CONSTRAINT "page_testimonials_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_testimonials_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_testimonials_block" ADD CONSTRAINT "pages_blocks_testimonials_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_testimonials_block" ADD CONSTRAINT "pages_blocks_testimonials_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_stats_block_stats" ADD CONSTRAINT "pages_blocks_stats_block_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_stats_vis" ADD CONSTRAINT "page_stats_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_stats_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_stats_block" ADD CONSTRAINT "pages_blocks_stats_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_stats_block" ADD CONSTRAINT "pages_blocks_stats_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_split_block_points" ADD CONSTRAINT "pages_blocks_split_block_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_split_vis" ADD CONSTRAINT "page_split_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_split_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_split_block" ADD CONSTRAINT "pages_blocks_split_block_image_item_id_media_id_fk" FOREIGN KEY ("image_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_split_block" ADD CONSTRAINT "pages_blocks_split_block_cta_group_primary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_split_block" ADD CONSTRAINT "pages_blocks_split_block_cta_group_primary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_split_block" ADD CONSTRAINT "pages_blocks_split_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_split_block" ADD CONSTRAINT "pages_blocks_split_block_cta_group_secondary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_split_block" ADD CONSTRAINT "pages_blocks_split_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_split_block" ADD CONSTRAINT "pages_blocks_split_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_gallery_vis" ADD CONSTRAINT "page_gallery_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_gallery_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_gallery_block" ADD CONSTRAINT "pages_blocks_gallery_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_gallery_block" ADD CONSTRAINT "pages_blocks_gallery_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_form_vis" ADD CONSTRAINT "page_form_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_form_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_menushowcase_vis" ADD CONSTRAINT "page_menushowcase_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_menushowcase_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_menushowcase_block" ADD CONSTRAINT "pages_blocks_menushowcase_block_cta_group_primary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_menushowcase_block" ADD CONSTRAINT "pages_blocks_menushowcase_block_cta_group_primary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_menushowcase_block" ADD CONSTRAINT "pages_blocks_menushowcase_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_menushowcase_block" ADD CONSTRAINT "pages_blocks_menushowcase_block_cta_group_secondary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_menushowcase_block" ADD CONSTRAINT "pages_blocks_menushowcase_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_menushowcase_block" ADD CONSTRAINT "pages_blocks_menushowcase_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_team_vis" ADD CONSTRAINT "page_team_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_team_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_team_block" ADD CONSTRAINT "pages_blocks_team_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_team_block" ADD CONSTRAINT "pages_blocks_team_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_events_vis" ADD CONSTRAINT "page_events_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_events_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_events_block" ADD CONSTRAINT "pages_blocks_events_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_events_block" ADD CONSTRAINT "pages_blocks_events_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_faq_vis" ADD CONSTRAINT "page_faq_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_faq_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_faq_block" ADD CONSTRAINT "pages_blocks_faq_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_faq_block" ADD CONSTRAINT "pages_blocks_faq_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_locations_vis" ADD CONSTRAINT "page_locations_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_locations_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_locations_block" ADD CONSTRAINT "pages_blocks_locations_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_locations_block" ADD CONSTRAINT "pages_blocks_locations_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_blogpreview_block" ADD CONSTRAINT "pages_blocks_blogpreview_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_embed_block" ADD CONSTRAINT "pages_blocks_embed_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_cta_vis" ADD CONSTRAINT "page_cta_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_cta_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_cta_block" ADD CONSTRAINT "pages_blocks_cta_block_cta_group_primary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cta_block" ADD CONSTRAINT "pages_blocks_cta_block_cta_group_primary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cta_block" ADD CONSTRAINT "pages_blocks_cta_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cta_block" ADD CONSTRAINT "pages_blocks_cta_block_cta_group_secondary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cta_block" ADD CONSTRAINT "pages_blocks_cta_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_cta_block" ADD CONSTRAINT "pages_blocks_cta_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_newsletter_vis" ADD CONSTRAINT "page_newsletter_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_newsletter_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_newsletter_block" ADD CONSTRAINT "pages_blocks_newsletter_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_newsletter_block" ADD CONSTRAINT "pages_blocks_newsletter_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "page_richtext_vis" ADD CONSTRAINT "page_richtext_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_richtext_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_richtext_block" ADD CONSTRAINT "pages_blocks_richtext_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "pages_blocks_richtext_block" ADD CONSTRAINT "pages_blocks_richtext_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_spacer_block" ADD CONSTRAINT "pages_blocks_spacer_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_roomsshowcase_block" ADD CONSTRAINT "pages_blocks_roomsshowcase_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_amenities_block" ADD CONSTRAINT "pages_blocks_amenities_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_packages_block" ADD CONSTRAINT "pages_blocks_packages_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_blocks_subbrands_block" ADD CONSTRAINT "pages_blocks_subbrands_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_menu_categories_fk" FOREIGN KEY ("menu_categories_id") REFERENCES "public"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_teammembers_fk" FOREIGN KEY ("teammembers_id") REFERENCES "public"."teammembers"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_featurestrip_block_items" ADD CONSTRAINT "_pages_v_blocks_featurestrip_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_featurestrip_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_featurestrip_vis_v" ADD CONSTRAINT "_page_featurestrip_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_featurestrip_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_featurestrip_block" ADD CONSTRAINT "_pages_v_blocks_featurestrip_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_featurestrip_block" ADD CONSTRAINT "_pages_v_blocks_featurestrip_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cardgrid_block_cards" ADD CONSTRAINT "_pages_v_blocks_cardgrid_block_cards_image_item_id_media_id_fk" FOREIGN KEY ("image_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cardgrid_block_cards" ADD CONSTRAINT "_pages_v_blocks_cardgrid_block_cards_link_reference_id_pages_id_fk" FOREIGN KEY ("link_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cardgrid_block_cards" ADD CONSTRAINT "_pages_v_blocks_cardgrid_block_cards_link_icon_id_media_id_fk" FOREIGN KEY ("link_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cardgrid_block_cards" ADD CONSTRAINT "_pages_v_blocks_cardgrid_block_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cardgrid_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_cardgrid_vis_v" ADD CONSTRAINT "_page_cardgrid_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_cardgrid_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cardgrid_block" ADD CONSTRAINT "_pages_v_blocks_cardgrid_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cardgrid_block" ADD CONSTRAINT "_pages_v_blocks_cardgrid_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_contentgrid_block_items" ADD CONSTRAINT "_pages_v_blocks_contentgrid_block_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contentgrid_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_contentgrid_vis_v" ADD CONSTRAINT "_page_contentgrid_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_contentgrid_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD CONSTRAINT "_pages_v_blocks_contentgrid_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD CONSTRAINT "_pages_v_blocks_contentgrid_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_steps_block_steps" ADD CONSTRAINT "_pages_v_blocks_steps_block_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_steps_vis_v" ADD CONSTRAINT "_page_steps_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_steps_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_steps_block" ADD CONSTRAINT "_pages_v_blocks_steps_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_steps_block" ADD CONSTRAINT "_pages_v_blocks_steps_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_testimonials_vis_v" ADD CONSTRAINT "_page_testimonials_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_testimonials_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_testimonials_block" ADD CONSTRAINT "_pages_v_blocks_testimonials_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_testimonials_block" ADD CONSTRAINT "_pages_v_blocks_testimonials_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_stats_block_stats" ADD CONSTRAINT "_pages_v_blocks_stats_block_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_stats_vis_v" ADD CONSTRAINT "_page_stats_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_stats_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_stats_block" ADD CONSTRAINT "_pages_v_blocks_stats_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_stats_block" ADD CONSTRAINT "_pages_v_blocks_stats_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_split_block_points" ADD CONSTRAINT "_pages_v_blocks_split_block_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_split_vis_v" ADD CONSTRAINT "_page_split_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_split_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_split_block" ADD CONSTRAINT "_pages_v_blocks_split_block_image_item_id_media_id_fk" FOREIGN KEY ("image_item_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_split_block" ADD CONSTRAINT "_pages_v_blocks_split_block_cta_group_primary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_split_block" ADD CONSTRAINT "_pages_v_blocks_split_block_cta_group_primary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_split_block" ADD CONSTRAINT "_pages_v_blocks_split_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_split_block" ADD CONSTRAINT "_pages_v_blocks_split_block_cta_group_secondary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_split_block" ADD CONSTRAINT "_pages_v_blocks_split_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_split_block" ADD CONSTRAINT "_pages_v_blocks_split_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_gallery_vis_v" ADD CONSTRAINT "_page_gallery_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_gallery_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_gallery_block" ADD CONSTRAINT "_pages_v_blocks_gallery_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_gallery_block" ADD CONSTRAINT "_pages_v_blocks_gallery_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_form_vis_v" ADD CONSTRAINT "_page_form_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_form_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_menushowcase_vis_v" ADD CONSTRAINT "_page_menushowcase_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_menushowcase_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_menushowcase_block" ADD CONSTRAINT "_pages_v_blocks_menushowcase_block_cta_group_primary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_menushowcase_block" ADD CONSTRAINT "_pages_v_blocks_menushowcase_block_cta_group_primary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_menushowcase_block" ADD CONSTRAINT "_pages_v_blocks_menushowcase_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_menushowcase_block" ADD CONSTRAINT "_pages_v_blocks_menushowcase_block_cta_group_secondary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_menushowcase_block" ADD CONSTRAINT "_pages_v_blocks_menushowcase_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_menushowcase_block" ADD CONSTRAINT "_pages_v_blocks_menushowcase_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_team_vis_v" ADD CONSTRAINT "_page_team_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_team_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_team_block" ADD CONSTRAINT "_pages_v_blocks_team_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_team_block" ADD CONSTRAINT "_pages_v_blocks_team_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_events_vis_v" ADD CONSTRAINT "_page_events_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_events_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_events_block" ADD CONSTRAINT "_pages_v_blocks_events_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_events_block" ADD CONSTRAINT "_pages_v_blocks_events_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_faq_vis_v" ADD CONSTRAINT "_page_faq_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_faq_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_faq_block" ADD CONSTRAINT "_pages_v_blocks_faq_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_faq_block" ADD CONSTRAINT "_pages_v_blocks_faq_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_locations_vis_v" ADD CONSTRAINT "_page_locations_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_locations_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_locations_block" ADD CONSTRAINT "_pages_v_blocks_locations_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_locations_block" ADD CONSTRAINT "_pages_v_blocks_locations_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_blogpreview_block" ADD CONSTRAINT "_pages_v_blocks_blogpreview_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_embed_block" ADD CONSTRAINT "_pages_v_blocks_embed_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_cta_vis_v" ADD CONSTRAINT "_page_cta_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_cta_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cta_block" ADD CONSTRAINT "_pages_v_blocks_cta_block_cta_group_primary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cta_block" ADD CONSTRAINT "_pages_v_blocks_cta_block_cta_group_primary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_primary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cta_block" ADD CONSTRAINT "_pages_v_blocks_cta_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_reference_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cta_block" ADD CONSTRAINT "_pages_v_blocks_cta_block_cta_group_secondary_c_t_a_icon_id_media_id_fk" FOREIGN KEY ("cta_group_secondary_c_t_a_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cta_block" ADD CONSTRAINT "_pages_v_blocks_cta_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_cta_block" ADD CONSTRAINT "_pages_v_blocks_cta_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_newsletter_vis_v" ADD CONSTRAINT "_page_newsletter_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_newsletter_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_newsletter_block" ADD CONSTRAINT "_pages_v_blocks_newsletter_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_newsletter_block" ADD CONSTRAINT "_pages_v_blocks_newsletter_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_page_richtext_vis_v" ADD CONSTRAINT "_page_richtext_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_richtext_block"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_richtext_block" ADD CONSTRAINT "_pages_v_blocks_richtext_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_richtext_block" ADD CONSTRAINT "_pages_v_blocks_richtext_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_spacer_block" ADD CONSTRAINT "_pages_v_blocks_spacer_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_roomsshowcase_block" ADD CONSTRAINT "_pages_v_blocks_roomsshowcase_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_amenities_block" ADD CONSTRAINT "_pages_v_blocks_amenities_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_packages_block" ADD CONSTRAINT "_pages_v_blocks_packages_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_blocks_subbrands_block" ADD CONSTRAINT "_pages_v_blocks_subbrands_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_menu_categories_fk" FOREIGN KEY ("menu_categories_id") REFERENCES "public"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_teammembers_fk" FOREIGN KEY ("teammembers_id") REFERENCES "public"."teammembers"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "locations_order_links" ADD CONSTRAINT "locations_order_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "nav_blocks_link_children" ADD CONSTRAINT "nav_blocks_link_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."nav_blocks_link"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "pages_blocks_featurestrip_block_items_order_idx" ON "pages_blocks_featurestrip_block_items" USING btree ("_order");
    CREATE INDEX "pages_blocks_featurestrip_block_items_parent_id_idx" ON "pages_blocks_featurestrip_block_items" USING btree ("_parent_id");
    CREATE INDEX "page_featurestrip_vis_order_idx" ON "page_featurestrip_vis" USING btree ("order");
    CREATE INDEX "page_featurestrip_vis_parent_idx" ON "page_featurestrip_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_featurestrip_block_order_idx" ON "pages_blocks_featurestrip_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_featurestrip_block_parent_id_idx" ON "pages_blocks_featurestrip_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_featurestrip_block_path_idx" ON "pages_blocks_featurestrip_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_featurestrip_block_settings_settings_backgr_idx" ON "pages_blocks_featurestrip_block" USING btree ("settings_background_image_id");
    CREATE INDEX "pages_blocks_cardgrid_block_cards_order_idx" ON "pages_blocks_cardgrid_block_cards" USING btree ("_order");
    CREATE INDEX "pages_blocks_cardgrid_block_cards_parent_id_idx" ON "pages_blocks_cardgrid_block_cards" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_cardgrid_block_cards_image_image_item_idx" ON "pages_blocks_cardgrid_block_cards" USING btree ("image_item_id");
    CREATE INDEX "pages_blocks_cardgrid_block_cards_link_link_reference_idx" ON "pages_blocks_cardgrid_block_cards" USING btree ("link_reference_id");
    CREATE INDEX "pages_blocks_cardgrid_block_cards_link_link_icon_idx" ON "pages_blocks_cardgrid_block_cards" USING btree ("link_icon_id");
    CREATE INDEX "page_cardgrid_vis_order_idx" ON "page_cardgrid_vis" USING btree ("order");
    CREATE INDEX "page_cardgrid_vis_parent_idx" ON "page_cardgrid_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_cardgrid_block_order_idx" ON "pages_blocks_cardgrid_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_cardgrid_block_parent_id_idx" ON "pages_blocks_cardgrid_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_cardgrid_block_path_idx" ON "pages_blocks_cardgrid_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_cardgrid_block_settings_settings_background_idx" ON "pages_blocks_cardgrid_block" USING btree ("settings_background_image_id");
    CREATE INDEX "pages_blocks_contentgrid_block_items_order_idx" ON "pages_blocks_contentgrid_block_items" USING btree ("_order");
    CREATE INDEX "pages_blocks_contentgrid_block_items_parent_id_idx" ON "pages_blocks_contentgrid_block_items" USING btree ("_parent_id");
    CREATE INDEX "page_contentgrid_vis_order_idx" ON "page_contentgrid_vis" USING btree ("order");
    CREATE INDEX "page_contentgrid_vis_parent_idx" ON "page_contentgrid_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_contentgrid_block_order_idx" ON "pages_blocks_contentgrid_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_contentgrid_block_parent_id_idx" ON "pages_blocks_contentgrid_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_contentgrid_block_path_idx" ON "pages_blocks_contentgrid_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_contentgrid_block_settings_settings_backgro_idx" ON "pages_blocks_contentgrid_block" USING btree ("settings_background_image_id");
    CREATE INDEX "pages_blocks_steps_block_steps_order_idx" ON "pages_blocks_steps_block_steps" USING btree ("_order");
    CREATE INDEX "pages_blocks_steps_block_steps_parent_id_idx" ON "pages_blocks_steps_block_steps" USING btree ("_parent_id");
    CREATE INDEX "page_steps_vis_order_idx" ON "page_steps_vis" USING btree ("order");
    CREATE INDEX "page_steps_vis_parent_idx" ON "page_steps_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_steps_block_order_idx" ON "pages_blocks_steps_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_steps_block_parent_id_idx" ON "pages_blocks_steps_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_steps_block_path_idx" ON "pages_blocks_steps_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_steps_block_settings_settings_background_im_idx" ON "pages_blocks_steps_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_testimonials_vis_order_idx" ON "page_testimonials_vis" USING btree ("order");
    CREATE INDEX "page_testimonials_vis_parent_idx" ON "page_testimonials_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_testimonials_block_order_idx" ON "pages_blocks_testimonials_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_testimonials_block_parent_id_idx" ON "pages_blocks_testimonials_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_testimonials_block_path_idx" ON "pages_blocks_testimonials_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_testimonials_block_settings_settings_backgr_idx" ON "pages_blocks_testimonials_block" USING btree ("settings_background_image_id");
    CREATE INDEX "pages_blocks_stats_block_stats_order_idx" ON "pages_blocks_stats_block_stats" USING btree ("_order");
    CREATE INDEX "pages_blocks_stats_block_stats_parent_id_idx" ON "pages_blocks_stats_block_stats" USING btree ("_parent_id");
    CREATE INDEX "page_stats_vis_order_idx" ON "page_stats_vis" USING btree ("order");
    CREATE INDEX "page_stats_vis_parent_idx" ON "page_stats_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_stats_block_order_idx" ON "pages_blocks_stats_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_stats_block_parent_id_idx" ON "pages_blocks_stats_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_stats_block_path_idx" ON "pages_blocks_stats_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_stats_block_settings_settings_background_im_idx" ON "pages_blocks_stats_block" USING btree ("settings_background_image_id");
    CREATE INDEX "pages_blocks_split_block_points_order_idx" ON "pages_blocks_split_block_points" USING btree ("_order");
    CREATE INDEX "pages_blocks_split_block_points_parent_id_idx" ON "pages_blocks_split_block_points" USING btree ("_parent_id");
    CREATE INDEX "page_split_vis_order_idx" ON "page_split_vis" USING btree ("order");
    CREATE INDEX "page_split_vis_parent_idx" ON "page_split_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_split_block_order_idx" ON "pages_blocks_split_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_split_block_parent_id_idx" ON "pages_blocks_split_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_split_block_path_idx" ON "pages_blocks_split_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_split_block_image_image_item_idx" ON "pages_blocks_split_block" USING btree ("image_item_id");
    CREATE INDEX "pages_blocks_split_block_cta_group_primary_c_t_a_cta_gro_idx" ON "pages_blocks_split_block" USING btree ("cta_group_primary_c_t_a_reference_id");
    CREATE INDEX "pages_blocks_split_block_cta_group_primary_c_t_a_cta_g_1_idx" ON "pages_blocks_split_block" USING btree ("cta_group_primary_c_t_a_icon_id");
    CREATE INDEX "pages_blocks_split_block_cta_group_secondary_c_t_a_cta_g_idx" ON "pages_blocks_split_block" USING btree ("cta_group_secondary_c_t_a_reference_id");
    CREATE INDEX "pages_blocks_split_block_cta_group_secondary_c_t_a_cta_1_idx" ON "pages_blocks_split_block" USING btree ("cta_group_secondary_c_t_a_icon_id");
    CREATE INDEX "pages_blocks_split_block_settings_settings_background_im_idx" ON "pages_blocks_split_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_gallery_vis_order_idx" ON "page_gallery_vis" USING btree ("order");
    CREATE INDEX "page_gallery_vis_parent_idx" ON "page_gallery_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_gallery_block_order_idx" ON "pages_blocks_gallery_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_gallery_block_parent_id_idx" ON "pages_blocks_gallery_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_gallery_block_path_idx" ON "pages_blocks_gallery_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_gallery_block_settings_settings_background__idx" ON "pages_blocks_gallery_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_form_vis_order_idx" ON "page_form_vis" USING btree ("order");
    CREATE INDEX "page_form_vis_parent_idx" ON "page_form_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_form_block_settings_settings_background_ima_idx" ON "pages_blocks_form_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_menushowcase_vis_order_idx" ON "page_menushowcase_vis" USING btree ("order");
    CREATE INDEX "page_menushowcase_vis_parent_idx" ON "page_menushowcase_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_menushowcase_block_order_idx" ON "pages_blocks_menushowcase_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_menushowcase_block_parent_id_idx" ON "pages_blocks_menushowcase_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_menushowcase_block_path_idx" ON "pages_blocks_menushowcase_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_menushowcase_block_cta_group_primary_c_t_a__idx" ON "pages_blocks_menushowcase_block" USING btree ("cta_group_primary_c_t_a_reference_id");
    CREATE INDEX "pages_blocks_menushowcase_block_cta_group_primary_c_t__1_idx" ON "pages_blocks_menushowcase_block" USING btree ("cta_group_primary_c_t_a_icon_id");
    CREATE INDEX "pages_blocks_menushowcase_block_cta_group_secondary_c_t__idx" ON "pages_blocks_menushowcase_block" USING btree ("cta_group_secondary_c_t_a_reference_id");
    CREATE INDEX "pages_blocks_menushowcase_block_cta_group_secondary_c__1_idx" ON "pages_blocks_menushowcase_block" USING btree ("cta_group_secondary_c_t_a_icon_id");
    CREATE INDEX "pages_blocks_menushowcase_block_settings_settings_backgr_idx" ON "pages_blocks_menushowcase_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_team_vis_order_idx" ON "page_team_vis" USING btree ("order");
    CREATE INDEX "page_team_vis_parent_idx" ON "page_team_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_team_block_order_idx" ON "pages_blocks_team_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_team_block_parent_id_idx" ON "pages_blocks_team_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_team_block_path_idx" ON "pages_blocks_team_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_team_block_settings_settings_background_ima_idx" ON "pages_blocks_team_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_events_vis_order_idx" ON "page_events_vis" USING btree ("order");
    CREATE INDEX "page_events_vis_parent_idx" ON "page_events_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_events_block_order_idx" ON "pages_blocks_events_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_events_block_parent_id_idx" ON "pages_blocks_events_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_events_block_path_idx" ON "pages_blocks_events_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_events_block_settings_settings_background_i_idx" ON "pages_blocks_events_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_faq_vis_order_idx" ON "page_faq_vis" USING btree ("order");
    CREATE INDEX "page_faq_vis_parent_idx" ON "page_faq_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_faq_block_order_idx" ON "pages_blocks_faq_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_faq_block_parent_id_idx" ON "pages_blocks_faq_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_faq_block_path_idx" ON "pages_blocks_faq_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_faq_block_settings_settings_background_imag_idx" ON "pages_blocks_faq_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_locations_vis_order_idx" ON "page_locations_vis" USING btree ("order");
    CREATE INDEX "page_locations_vis_parent_idx" ON "page_locations_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_locations_block_order_idx" ON "pages_blocks_locations_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_locations_block_parent_id_idx" ON "pages_blocks_locations_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_locations_block_path_idx" ON "pages_blocks_locations_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_locations_block_settings_settings_backgroun_idx" ON "pages_blocks_locations_block" USING btree ("settings_background_image_id");
    CREATE INDEX "pages_blocks_blogpreview_block_order_idx" ON "pages_blocks_blogpreview_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_blogpreview_block_parent_id_idx" ON "pages_blocks_blogpreview_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_blogpreview_block_path_idx" ON "pages_blocks_blogpreview_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_embed_block_order_idx" ON "pages_blocks_embed_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_embed_block_parent_id_idx" ON "pages_blocks_embed_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_embed_block_path_idx" ON "pages_blocks_embed_block" USING btree ("_path");
    CREATE INDEX "page_cta_vis_order_idx" ON "page_cta_vis" USING btree ("order");
    CREATE INDEX "page_cta_vis_parent_idx" ON "page_cta_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_cta_block_order_idx" ON "pages_blocks_cta_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_cta_block_parent_id_idx" ON "pages_blocks_cta_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_cta_block_path_idx" ON "pages_blocks_cta_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_cta_block_cta_group_primary_c_t_a_cta_group_idx" ON "pages_blocks_cta_block" USING btree ("cta_group_primary_c_t_a_reference_id");
    CREATE INDEX "pages_blocks_cta_block_cta_group_primary_c_t_a_cta_gro_1_idx" ON "pages_blocks_cta_block" USING btree ("cta_group_primary_c_t_a_icon_id");
    CREATE INDEX "pages_blocks_cta_block_cta_group_secondary_c_t_a_cta_gro_idx" ON "pages_blocks_cta_block" USING btree ("cta_group_secondary_c_t_a_reference_id");
    CREATE INDEX "pages_blocks_cta_block_cta_group_secondary_c_t_a_cta_g_1_idx" ON "pages_blocks_cta_block" USING btree ("cta_group_secondary_c_t_a_icon_id");
    CREATE INDEX "pages_blocks_cta_block_settings_settings_background_imag_idx" ON "pages_blocks_cta_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_newsletter_vis_order_idx" ON "page_newsletter_vis" USING btree ("order");
    CREATE INDEX "page_newsletter_vis_parent_idx" ON "page_newsletter_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_newsletter_block_order_idx" ON "pages_blocks_newsletter_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_newsletter_block_parent_id_idx" ON "pages_blocks_newsletter_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_newsletter_block_path_idx" ON "pages_blocks_newsletter_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_newsletter_block_settings_settings_backgrou_idx" ON "pages_blocks_newsletter_block" USING btree ("settings_background_image_id");
    CREATE INDEX "page_richtext_vis_order_idx" ON "page_richtext_vis" USING btree ("order");
    CREATE INDEX "page_richtext_vis_parent_idx" ON "page_richtext_vis" USING btree ("parent_id");
    CREATE INDEX "pages_blocks_richtext_block_order_idx" ON "pages_blocks_richtext_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_richtext_block_parent_id_idx" ON "pages_blocks_richtext_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_richtext_block_path_idx" ON "pages_blocks_richtext_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_richtext_block_settings_settings_background_idx" ON "pages_blocks_richtext_block" USING btree ("settings_background_image_id");
    CREATE INDEX "pages_blocks_spacer_block_order_idx" ON "pages_blocks_spacer_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_spacer_block_parent_id_idx" ON "pages_blocks_spacer_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_spacer_block_path_idx" ON "pages_blocks_spacer_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_roomsshowcase_block_order_idx" ON "pages_blocks_roomsshowcase_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_roomsshowcase_block_parent_id_idx" ON "pages_blocks_roomsshowcase_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_roomsshowcase_block_path_idx" ON "pages_blocks_roomsshowcase_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_amenities_block_order_idx" ON "pages_blocks_amenities_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_amenities_block_parent_id_idx" ON "pages_blocks_amenities_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_amenities_block_path_idx" ON "pages_blocks_amenities_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_packages_block_order_idx" ON "pages_blocks_packages_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_packages_block_parent_id_idx" ON "pages_blocks_packages_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_packages_block_path_idx" ON "pages_blocks_packages_block" USING btree ("_path");
    CREATE INDEX "pages_blocks_subbrands_block_order_idx" ON "pages_blocks_subbrands_block" USING btree ("_order");
    CREATE INDEX "pages_blocks_subbrands_block_parent_id_idx" ON "pages_blocks_subbrands_block" USING btree ("_parent_id");
    CREATE INDEX "pages_blocks_subbrands_block_path_idx" ON "pages_blocks_subbrands_block" USING btree ("_path");
    CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
    CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
    CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
    CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
    CREATE INDEX "pages_rels_gallery_id_idx" ON "pages_rels" USING btree ("gallery_id");
    CREATE INDEX "pages_rels_menu_categories_id_idx" ON "pages_rels" USING btree ("menu_categories_id");
    CREATE INDEX "pages_rels_teammembers_id_idx" ON "pages_rels" USING btree ("teammembers_id");
    CREATE INDEX "pages_rels_events_id_idx" ON "pages_rels" USING btree ("events_id");
    CREATE INDEX "pages_rels_faqs_id_idx" ON "pages_rels" USING btree ("faqs_id");
    CREATE INDEX "pages_rels_locations_id_idx" ON "pages_rels" USING btree ("locations_id");
    CREATE INDEX "_pages_v_blocks_featurestrip_block_items_order_idx" ON "_pages_v_blocks_featurestrip_block_items" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_featurestrip_block_items_parent_id_idx" ON "_pages_v_blocks_featurestrip_block_items" USING btree ("_parent_id");
    CREATE INDEX "_page_featurestrip_vis_v_order_idx" ON "_page_featurestrip_vis_v" USING btree ("order");
    CREATE INDEX "_page_featurestrip_vis_v_parent_idx" ON "_page_featurestrip_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_featurestrip_block_order_idx" ON "_pages_v_blocks_featurestrip_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_featurestrip_block_parent_id_idx" ON "_pages_v_blocks_featurestrip_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_featurestrip_block_path_idx" ON "_pages_v_blocks_featurestrip_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_featurestrip_block_settings_settings_bac_idx" ON "_pages_v_blocks_featurestrip_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_cards_order_idx" ON "_pages_v_blocks_cardgrid_block_cards" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_cards_parent_id_idx" ON "_pages_v_blocks_cardgrid_block_cards" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_cards_image_image_item_idx" ON "_pages_v_blocks_cardgrid_block_cards" USING btree ("image_item_id");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_cards_link_link_reference_idx" ON "_pages_v_blocks_cardgrid_block_cards" USING btree ("link_reference_id");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_cards_link_link_icon_idx" ON "_pages_v_blocks_cardgrid_block_cards" USING btree ("link_icon_id");
    CREATE INDEX "_page_cardgrid_vis_v_order_idx" ON "_page_cardgrid_vis_v" USING btree ("order");
    CREATE INDEX "_page_cardgrid_vis_v_parent_idx" ON "_page_cardgrid_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_order_idx" ON "_pages_v_blocks_cardgrid_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_parent_id_idx" ON "_pages_v_blocks_cardgrid_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_path_idx" ON "_pages_v_blocks_cardgrid_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_cardgrid_block_settings_settings_backgro_idx" ON "_pages_v_blocks_cardgrid_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_pages_v_blocks_contentgrid_block_items_order_idx" ON "_pages_v_blocks_contentgrid_block_items" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_contentgrid_block_items_parent_id_idx" ON "_pages_v_blocks_contentgrid_block_items" USING btree ("_parent_id");
    CREATE INDEX "_page_contentgrid_vis_v_order_idx" ON "_page_contentgrid_vis_v" USING btree ("order");
    CREATE INDEX "_page_contentgrid_vis_v_parent_idx" ON "_page_contentgrid_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_contentgrid_block_order_idx" ON "_pages_v_blocks_contentgrid_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_contentgrid_block_parent_id_idx" ON "_pages_v_blocks_contentgrid_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_contentgrid_block_path_idx" ON "_pages_v_blocks_contentgrid_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_contentgrid_block_settings_settings_back_idx" ON "_pages_v_blocks_contentgrid_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_pages_v_blocks_steps_block_steps_order_idx" ON "_pages_v_blocks_steps_block_steps" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_steps_block_steps_parent_id_idx" ON "_pages_v_blocks_steps_block_steps" USING btree ("_parent_id");
    CREATE INDEX "_page_steps_vis_v_order_idx" ON "_page_steps_vis_v" USING btree ("order");
    CREATE INDEX "_page_steps_vis_v_parent_idx" ON "_page_steps_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_steps_block_order_idx" ON "_pages_v_blocks_steps_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_steps_block_parent_id_idx" ON "_pages_v_blocks_steps_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_steps_block_path_idx" ON "_pages_v_blocks_steps_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_steps_block_settings_settings_background_idx" ON "_pages_v_blocks_steps_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_testimonials_vis_v_order_idx" ON "_page_testimonials_vis_v" USING btree ("order");
    CREATE INDEX "_page_testimonials_vis_v_parent_idx" ON "_page_testimonials_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_testimonials_block_order_idx" ON "_pages_v_blocks_testimonials_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_testimonials_block_parent_id_idx" ON "_pages_v_blocks_testimonials_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_testimonials_block_path_idx" ON "_pages_v_blocks_testimonials_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_testimonials_block_settings_settings_bac_idx" ON "_pages_v_blocks_testimonials_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_pages_v_blocks_stats_block_stats_order_idx" ON "_pages_v_blocks_stats_block_stats" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_stats_block_stats_parent_id_idx" ON "_pages_v_blocks_stats_block_stats" USING btree ("_parent_id");
    CREATE INDEX "_page_stats_vis_v_order_idx" ON "_page_stats_vis_v" USING btree ("order");
    CREATE INDEX "_page_stats_vis_v_parent_idx" ON "_page_stats_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_stats_block_order_idx" ON "_pages_v_blocks_stats_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_stats_block_parent_id_idx" ON "_pages_v_blocks_stats_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_stats_block_path_idx" ON "_pages_v_blocks_stats_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_stats_block_settings_settings_background_idx" ON "_pages_v_blocks_stats_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_pages_v_blocks_split_block_points_order_idx" ON "_pages_v_blocks_split_block_points" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_split_block_points_parent_id_idx" ON "_pages_v_blocks_split_block_points" USING btree ("_parent_id");
    CREATE INDEX "_page_split_vis_v_order_idx" ON "_page_split_vis_v" USING btree ("order");
    CREATE INDEX "_page_split_vis_v_parent_idx" ON "_page_split_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_split_block_order_idx" ON "_pages_v_blocks_split_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_split_block_parent_id_idx" ON "_pages_v_blocks_split_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_split_block_path_idx" ON "_pages_v_blocks_split_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_split_block_image_image_item_idx" ON "_pages_v_blocks_split_block" USING btree ("image_item_id");
    CREATE INDEX "_pages_v_blocks_split_block_cta_group_primary_c_t_a_cta__idx" ON "_pages_v_blocks_split_block" USING btree ("cta_group_primary_c_t_a_reference_id");
    CREATE INDEX "_pages_v_blocks_split_block_cta_group_primary_c_t_a_ct_1_idx" ON "_pages_v_blocks_split_block" USING btree ("cta_group_primary_c_t_a_icon_id");
    CREATE INDEX "_pages_v_blocks_split_block_cta_group_secondary_c_t_a_ct_idx" ON "_pages_v_blocks_split_block" USING btree ("cta_group_secondary_c_t_a_reference_id");
    CREATE INDEX "_pages_v_blocks_split_block_cta_group_secondary_c_t_a__1_idx" ON "_pages_v_blocks_split_block" USING btree ("cta_group_secondary_c_t_a_icon_id");
    CREATE INDEX "_pages_v_blocks_split_block_settings_settings_background_idx" ON "_pages_v_blocks_split_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_gallery_vis_v_order_idx" ON "_page_gallery_vis_v" USING btree ("order");
    CREATE INDEX "_page_gallery_vis_v_parent_idx" ON "_page_gallery_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_gallery_block_order_idx" ON "_pages_v_blocks_gallery_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_gallery_block_parent_id_idx" ON "_pages_v_blocks_gallery_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_gallery_block_path_idx" ON "_pages_v_blocks_gallery_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_gallery_block_settings_settings_backgrou_idx" ON "_pages_v_blocks_gallery_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_form_vis_v_order_idx" ON "_page_form_vis_v" USING btree ("order");
    CREATE INDEX "_page_form_vis_v_parent_idx" ON "_page_form_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_form_block_settings_settings_background__idx" ON "_pages_v_blocks_form_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_menushowcase_vis_v_order_idx" ON "_page_menushowcase_vis_v" USING btree ("order");
    CREATE INDEX "_page_menushowcase_vis_v_parent_idx" ON "_page_menushowcase_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_menushowcase_block_order_idx" ON "_pages_v_blocks_menushowcase_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_menushowcase_block_parent_id_idx" ON "_pages_v_blocks_menushowcase_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_menushowcase_block_path_idx" ON "_pages_v_blocks_menushowcase_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_menushowcase_block_cta_group_primary_c_t_idx" ON "_pages_v_blocks_menushowcase_block" USING btree ("cta_group_primary_c_t_a_reference_id");
    CREATE INDEX "_pages_v_blocks_menushowcase_block_cta_group_primary_c_1_idx" ON "_pages_v_blocks_menushowcase_block" USING btree ("cta_group_primary_c_t_a_icon_id");
    CREATE INDEX "_pages_v_blocks_menushowcase_block_cta_group_secondary_c_idx" ON "_pages_v_blocks_menushowcase_block" USING btree ("cta_group_secondary_c_t_a_reference_id");
    CREATE INDEX "_pages_v_blocks_menushowcase_block_cta_group_secondary_1_idx" ON "_pages_v_blocks_menushowcase_block" USING btree ("cta_group_secondary_c_t_a_icon_id");
    CREATE INDEX "_pages_v_blocks_menushowcase_block_settings_settings_bac_idx" ON "_pages_v_blocks_menushowcase_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_team_vis_v_order_idx" ON "_page_team_vis_v" USING btree ("order");
    CREATE INDEX "_page_team_vis_v_parent_idx" ON "_page_team_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_team_block_order_idx" ON "_pages_v_blocks_team_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_team_block_parent_id_idx" ON "_pages_v_blocks_team_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_team_block_path_idx" ON "_pages_v_blocks_team_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_team_block_settings_settings_background__idx" ON "_pages_v_blocks_team_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_events_vis_v_order_idx" ON "_page_events_vis_v" USING btree ("order");
    CREATE INDEX "_page_events_vis_v_parent_idx" ON "_page_events_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_events_block_order_idx" ON "_pages_v_blocks_events_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_events_block_parent_id_idx" ON "_pages_v_blocks_events_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_events_block_path_idx" ON "_pages_v_blocks_events_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_events_block_settings_settings_backgroun_idx" ON "_pages_v_blocks_events_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_faq_vis_v_order_idx" ON "_page_faq_vis_v" USING btree ("order");
    CREATE INDEX "_page_faq_vis_v_parent_idx" ON "_page_faq_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_faq_block_order_idx" ON "_pages_v_blocks_faq_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_faq_block_parent_id_idx" ON "_pages_v_blocks_faq_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_faq_block_path_idx" ON "_pages_v_blocks_faq_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_faq_block_settings_settings_background_i_idx" ON "_pages_v_blocks_faq_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_locations_vis_v_order_idx" ON "_page_locations_vis_v" USING btree ("order");
    CREATE INDEX "_page_locations_vis_v_parent_idx" ON "_page_locations_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_locations_block_order_idx" ON "_pages_v_blocks_locations_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_locations_block_parent_id_idx" ON "_pages_v_blocks_locations_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_locations_block_path_idx" ON "_pages_v_blocks_locations_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_locations_block_settings_settings_backgr_idx" ON "_pages_v_blocks_locations_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_pages_v_blocks_blogpreview_block_order_idx" ON "_pages_v_blocks_blogpreview_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_blogpreview_block_parent_id_idx" ON "_pages_v_blocks_blogpreview_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_blogpreview_block_path_idx" ON "_pages_v_blocks_blogpreview_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_embed_block_order_idx" ON "_pages_v_blocks_embed_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_embed_block_parent_id_idx" ON "_pages_v_blocks_embed_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_embed_block_path_idx" ON "_pages_v_blocks_embed_block" USING btree ("_path");
    CREATE INDEX "_page_cta_vis_v_order_idx" ON "_page_cta_vis_v" USING btree ("order");
    CREATE INDEX "_page_cta_vis_v_parent_idx" ON "_page_cta_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_cta_block_order_idx" ON "_pages_v_blocks_cta_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_cta_block_parent_id_idx" ON "_pages_v_blocks_cta_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_cta_block_path_idx" ON "_pages_v_blocks_cta_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_cta_block_cta_group_primary_c_t_a_cta_gr_idx" ON "_pages_v_blocks_cta_block" USING btree ("cta_group_primary_c_t_a_reference_id");
    CREATE INDEX "_pages_v_blocks_cta_block_cta_group_primary_c_t_a_cta__1_idx" ON "_pages_v_blocks_cta_block" USING btree ("cta_group_primary_c_t_a_icon_id");
    CREATE INDEX "_pages_v_blocks_cta_block_cta_group_secondary_c_t_a_cta__idx" ON "_pages_v_blocks_cta_block" USING btree ("cta_group_secondary_c_t_a_reference_id");
    CREATE INDEX "_pages_v_blocks_cta_block_cta_group_secondary_c_t_a_ct_1_idx" ON "_pages_v_blocks_cta_block" USING btree ("cta_group_secondary_c_t_a_icon_id");
    CREATE INDEX "_pages_v_blocks_cta_block_settings_settings_background_i_idx" ON "_pages_v_blocks_cta_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_newsletter_vis_v_order_idx" ON "_page_newsletter_vis_v" USING btree ("order");
    CREATE INDEX "_page_newsletter_vis_v_parent_idx" ON "_page_newsletter_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_newsletter_block_order_idx" ON "_pages_v_blocks_newsletter_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_newsletter_block_parent_id_idx" ON "_pages_v_blocks_newsletter_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_newsletter_block_path_idx" ON "_pages_v_blocks_newsletter_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_newsletter_block_settings_settings_backg_idx" ON "_pages_v_blocks_newsletter_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_page_richtext_vis_v_order_idx" ON "_page_richtext_vis_v" USING btree ("order");
    CREATE INDEX "_page_richtext_vis_v_parent_idx" ON "_page_richtext_vis_v" USING btree ("parent_id");
    CREATE INDEX "_pages_v_blocks_richtext_block_order_idx" ON "_pages_v_blocks_richtext_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_richtext_block_parent_id_idx" ON "_pages_v_blocks_richtext_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_richtext_block_path_idx" ON "_pages_v_blocks_richtext_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_richtext_block_settings_settings_backgro_idx" ON "_pages_v_blocks_richtext_block" USING btree ("settings_background_image_id");
    CREATE INDEX "_pages_v_blocks_spacer_block_order_idx" ON "_pages_v_blocks_spacer_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_spacer_block_parent_id_idx" ON "_pages_v_blocks_spacer_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_spacer_block_path_idx" ON "_pages_v_blocks_spacer_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_roomsshowcase_block_order_idx" ON "_pages_v_blocks_roomsshowcase_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_roomsshowcase_block_parent_id_idx" ON "_pages_v_blocks_roomsshowcase_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_roomsshowcase_block_path_idx" ON "_pages_v_blocks_roomsshowcase_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_amenities_block_order_idx" ON "_pages_v_blocks_amenities_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_amenities_block_parent_id_idx" ON "_pages_v_blocks_amenities_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_amenities_block_path_idx" ON "_pages_v_blocks_amenities_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_packages_block_order_idx" ON "_pages_v_blocks_packages_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_packages_block_parent_id_idx" ON "_pages_v_blocks_packages_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_packages_block_path_idx" ON "_pages_v_blocks_packages_block" USING btree ("_path");
    CREATE INDEX "_pages_v_blocks_subbrands_block_order_idx" ON "_pages_v_blocks_subbrands_block" USING btree ("_order");
    CREATE INDEX "_pages_v_blocks_subbrands_block_parent_id_idx" ON "_pages_v_blocks_subbrands_block" USING btree ("_parent_id");
    CREATE INDEX "_pages_v_blocks_subbrands_block_path_idx" ON "_pages_v_blocks_subbrands_block" USING btree ("_path");
    CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
    CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
    CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
    CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
    CREATE INDEX "_pages_v_rels_gallery_id_idx" ON "_pages_v_rels" USING btree ("gallery_id");
    CREATE INDEX "_pages_v_rels_menu_categories_id_idx" ON "_pages_v_rels" USING btree ("menu_categories_id");
    CREATE INDEX "_pages_v_rels_teammembers_id_idx" ON "_pages_v_rels" USING btree ("teammembers_id");
    CREATE INDEX "_pages_v_rels_events_id_idx" ON "_pages_v_rels" USING btree ("events_id");
    CREATE INDEX "_pages_v_rels_faqs_id_idx" ON "_pages_v_rels" USING btree ("faqs_id");
    CREATE INDEX "_pages_v_rels_locations_id_idx" ON "_pages_v_rels" USING btree ("locations_id");
    CREATE INDEX "locations_order_links_order_idx" ON "locations_order_links" USING btree ("_order");
    CREATE INDEX "locations_order_links_parent_id_idx" ON "locations_order_links" USING btree ("_parent_id");
    CREATE INDEX "nav_blocks_link_children_order_idx" ON "nav_blocks_link_children" USING btree ("_order");
    CREATE INDEX "nav_blocks_link_children_parent_id_idx" ON "nav_blocks_link_children" USING btree ("_parent_id");
    ALTER TABLE "teammembers" ADD CONSTRAINT "teammembers_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX "teammembers_photo_idx" ON "teammembers" USING btree ("photo_id");
    CREATE INDEX "teammembers_is_active_idx" ON "teammembers" USING btree ("is_active");
    CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
    CREATE INDEX "events_is_featured_idx" ON "events" USING btree ("is_featured");
    CREATE INDEX "faqs_is_active_idx" ON "faqs" USING btree ("is_active");
    CREATE INDEX "locations_is_active_idx" ON "locations" USING btree ("is_active");
  `)
}

/**
 * Reverses only objects introduced or changed by this migration.
 * Run down only before storing content in the newly introduced schema.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "public"."teammembers" DROP CONSTRAINT IF EXISTS "teammembers_photo_id_media_id_fk";
    ALTER TABLE "public"."pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_testimonials_fk";
    ALTER TABLE "public"."pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_teammembers_fk";
    ALTER TABLE "public"."pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_parent_fk";
    ALTER TABLE "public"."pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_menu_categories_fk";
    ALTER TABLE "public"."pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_locations_fk";
    ALTER TABLE "public"."pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_gallery_fk";
    ALTER TABLE "public"."pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_faqs_fk";
    ALTER TABLE "public"."pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_events_fk";
    ALTER TABLE "public"."pages_blocks_testimonials_block" DROP CONSTRAINT IF EXISTS "pages_blocks_testimonials_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_testimonials_block" DROP CONSTRAINT IF EXISTS "pages_blocks_testimonials_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_team_block" DROP CONSTRAINT IF EXISTS "pages_blocks_team_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_team_block" DROP CONSTRAINT IF EXISTS "pages_blocks_team_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_subbrands_block" DROP CONSTRAINT IF EXISTS "pages_blocks_subbrands_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_steps_block" DROP CONSTRAINT IF EXISTS "pages_blocks_steps_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_steps_block" DROP CONSTRAINT IF EXISTS "pages_blocks_steps_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_steps_block_steps" DROP CONSTRAINT IF EXISTS "pages_blocks_steps_block_steps_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_stats_block" DROP CONSTRAINT IF EXISTS "pages_blocks_stats_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_stats_block" DROP CONSTRAINT IF EXISTS "pages_blocks_stats_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_stats_block_stats" DROP CONSTRAINT IF EXISTS "pages_blocks_stats_block_stats_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_split_block" DROP CONSTRAINT IF EXISTS "pages_blocks_split_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_split_block" DROP CONSTRAINT IF EXISTS "pages_blocks_split_block_image_item_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_split_block" DROP CONSTRAINT IF EXISTS "pages_blocks_split_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."pages_blocks_split_block" DROP CONSTRAINT IF EXISTS "pages_blocks_split_block_cta_group_secondary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_split_block" DROP CONSTRAINT IF EXISTS "pages_blocks_split_block_cta_group_primary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."pages_blocks_split_block" DROP CONSTRAINT IF EXISTS "pages_blocks_split_block_cta_group_primary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_split_block" DROP CONSTRAINT IF EXISTS "pages_blocks_split_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_split_block_points" DROP CONSTRAINT IF EXISTS "pages_blocks_split_block_points_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_spacer_block" DROP CONSTRAINT IF EXISTS "pages_blocks_spacer_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_roomsshowcase_block" DROP CONSTRAINT IF EXISTS "pages_blocks_roomsshowcase_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_richtext_block" DROP CONSTRAINT IF EXISTS "pages_blocks_richtext_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_richtext_block" DROP CONSTRAINT IF EXISTS "pages_blocks_richtext_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_packages_block" DROP CONSTRAINT IF EXISTS "pages_blocks_packages_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_newsletter_block" DROP CONSTRAINT IF EXISTS "pages_blocks_newsletter_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_newsletter_block" DROP CONSTRAINT IF EXISTS "pages_blocks_newsletter_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "pages_blocks_menushowcase_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "pages_blocks_menushowcase_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."pages_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "pages_blocks_menushowcase_block_cta_group_secondary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "pages_blocks_menushowcase_block_cta_group_primary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."pages_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "pages_blocks_menushowcase_block_cta_group_primary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "pages_blocks_menushowcase_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_locations_block" DROP CONSTRAINT IF EXISTS "pages_blocks_locations_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_locations_block" DROP CONSTRAINT IF EXISTS "pages_blocks_locations_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_gallery_block" DROP CONSTRAINT IF EXISTS "pages_blocks_gallery_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_gallery_block" DROP CONSTRAINT IF EXISTS "pages_blocks_gallery_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_form_block" DROP CONSTRAINT IF EXISTS "pages_blocks_form_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_form_block" DROP CONSTRAINT IF EXISTS "pages_blocks_form_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_featurestrip_block" DROP CONSTRAINT IF EXISTS "pages_blocks_featurestrip_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_featurestrip_block" DROP CONSTRAINT IF EXISTS "pages_blocks_featurestrip_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_featurestrip_block_items" DROP CONSTRAINT IF EXISTS "pages_blocks_featurestrip_block_items_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_faq_block" DROP CONSTRAINT IF EXISTS "pages_blocks_faq_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_faq_block" DROP CONSTRAINT IF EXISTS "pages_blocks_faq_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_events_block" DROP CONSTRAINT IF EXISTS "pages_blocks_events_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_events_block" DROP CONSTRAINT IF EXISTS "pages_blocks_events_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_embed_block" DROP CONSTRAINT IF EXISTS "pages_blocks_embed_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_cta_block" DROP CONSTRAINT IF EXISTS "pages_blocks_cta_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_cta_block" DROP CONSTRAINT IF EXISTS "pages_blocks_cta_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."pages_blocks_cta_block" DROP CONSTRAINT IF EXISTS "pages_blocks_cta_block_cta_group_secondary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_cta_block" DROP CONSTRAINT IF EXISTS "pages_blocks_cta_block_cta_group_primary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."pages_blocks_cta_block" DROP CONSTRAINT IF EXISTS "pages_blocks_cta_block_cta_group_primary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_cta_block" DROP CONSTRAINT IF EXISTS "pages_blocks_cta_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_contentgrid_block" DROP CONSTRAINT IF EXISTS "pages_blocks_contentgrid_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_contentgrid_block" DROP CONSTRAINT IF EXISTS "pages_blocks_contentgrid_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_contentgrid_block_items" DROP CONSTRAINT IF EXISTS "pages_blocks_contentgrid_block_items_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_cardgrid_block" DROP CONSTRAINT IF EXISTS "pages_blocks_cardgrid_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_cardgrid_block" DROP CONSTRAINT IF EXISTS "pages_blocks_cardgrid_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_cardgrid_block_cards" DROP CONSTRAINT IF EXISTS "pages_blocks_cardgrid_block_cards_link_reference_id_pages_id_fk";
    ALTER TABLE "public"."pages_blocks_cardgrid_block_cards" DROP CONSTRAINT IF EXISTS "pages_blocks_cardgrid_block_cards_link_icon_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_cardgrid_block_cards" DROP CONSTRAINT IF EXISTS "pages_blocks_cardgrid_block_cards_image_item_id_media_id_fk";
    ALTER TABLE "public"."pages_blocks_cardgrid_block_cards" DROP CONSTRAINT IF EXISTS "pages_blocks_cardgrid_block_cards_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_blogpreview_block" DROP CONSTRAINT IF EXISTS "pages_blocks_blogpreview_block_parent_id_fk";
    ALTER TABLE "public"."pages_blocks_amenities_block" DROP CONSTRAINT IF EXISTS "pages_blocks_amenities_block_parent_id_fk";
    ALTER TABLE "public"."page_testimonials_vis" DROP CONSTRAINT IF EXISTS "page_testimonials_vis_parent_fk";
    ALTER TABLE "public"."page_team_vis" DROP CONSTRAINT IF EXISTS "page_team_vis_parent_fk";
    ALTER TABLE "public"."page_steps_vis" DROP CONSTRAINT IF EXISTS "page_steps_vis_parent_fk";
    ALTER TABLE "public"."page_stats_vis" DROP CONSTRAINT IF EXISTS "page_stats_vis_parent_fk";
    ALTER TABLE "public"."page_split_vis" DROP CONSTRAINT IF EXISTS "page_split_vis_parent_fk";
    ALTER TABLE "public"."page_richtext_vis" DROP CONSTRAINT IF EXISTS "page_richtext_vis_parent_fk";
    ALTER TABLE "public"."page_newsletter_vis" DROP CONSTRAINT IF EXISTS "page_newsletter_vis_parent_fk";
    ALTER TABLE "public"."page_menushowcase_vis" DROP CONSTRAINT IF EXISTS "page_menushowcase_vis_parent_fk";
    ALTER TABLE "public"."page_locations_vis" DROP CONSTRAINT IF EXISTS "page_locations_vis_parent_fk";
    ALTER TABLE "public"."page_gallery_vis" DROP CONSTRAINT IF EXISTS "page_gallery_vis_parent_fk";
    ALTER TABLE "public"."page_form_vis" DROP CONSTRAINT IF EXISTS "page_form_vis_parent_fk";
    ALTER TABLE "public"."page_featurestrip_vis" DROP CONSTRAINT IF EXISTS "page_featurestrip_vis_parent_fk";
    ALTER TABLE "public"."page_faq_vis" DROP CONSTRAINT IF EXISTS "page_faq_vis_parent_fk";
    ALTER TABLE "public"."page_events_vis" DROP CONSTRAINT IF EXISTS "page_events_vis_parent_fk";
    ALTER TABLE "public"."page_cta_vis" DROP CONSTRAINT IF EXISTS "page_cta_vis_parent_fk";
    ALTER TABLE "public"."page_contentgrid_vis" DROP CONSTRAINT IF EXISTS "page_contentgrid_vis_parent_fk";
    ALTER TABLE "public"."page_cardgrid_vis" DROP CONSTRAINT IF EXISTS "page_cardgrid_vis_parent_fk";
    ALTER TABLE "public"."nav_blocks_link_children" DROP CONSTRAINT IF EXISTS "nav_blocks_link_children_parent_id_fk";
    ALTER TABLE "public"."locations_order_links" DROP CONSTRAINT IF EXISTS "locations_order_links_parent_id_fk";
    ALTER TABLE "public"."events" DROP CONSTRAINT IF EXISTS "events_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_testimonials_fk";
    ALTER TABLE "public"."_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_teammembers_fk";
    ALTER TABLE "public"."_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_parent_fk";
    ALTER TABLE "public"."_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_menu_categories_fk";
    ALTER TABLE "public"."_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_locations_fk";
    ALTER TABLE "public"."_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_gallery_fk";
    ALTER TABLE "public"."_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_faqs_fk";
    ALTER TABLE "public"."_pages_v_rels" DROP CONSTRAINT IF EXISTS "_pages_v_rels_events_fk";
    ALTER TABLE "public"."_pages_v_blocks_testimonials_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_testimonials_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_testimonials_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_testimonials_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_team_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_team_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_team_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_team_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_subbrands_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_subbrands_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_steps_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_steps_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_steps_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_steps_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_steps_block_steps" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_steps_block_steps_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_stats_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_stats_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_stats_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_stats_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_stats_block_stats" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_stats_block_stats_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_split_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_split_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_split_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_split_block_image_item_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_split_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_split_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_split_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_split_block_cta_group_secondary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_split_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_split_block_cta_group_primary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_split_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_split_block_cta_group_primary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_split_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_split_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_split_block_points" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_split_block_points_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_spacer_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_spacer_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_roomsshowcase_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_roomsshowcase_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_richtext_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_richtext_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_richtext_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_richtext_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_packages_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_packages_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_newsletter_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_newsletter_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_newsletter_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_newsletter_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_menushowcase_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_menushowcase_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_menushowcase_block_cta_group_secondary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_menushowcase_block_cta_group_primary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_menushowcase_block_cta_group_primary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_menushowcase_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_menushowcase_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_locations_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_locations_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_locations_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_locations_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_gallery_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_gallery_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_gallery_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_gallery_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_form_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_form_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_form_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_form_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_featurestrip_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_featurestrip_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_featurestrip_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_featurestrip_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_featurestrip_block_items" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_featurestrip_block_items_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_faq_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_faq_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_faq_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_faq_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_events_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_events_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_events_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_events_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_embed_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_embed_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cta_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cta_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cta_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cta_block_cta_group_secondary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cta_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cta_block_cta_group_secondary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cta_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cta_block_cta_group_primary_c_t_a_reference_id_pages_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cta_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cta_block_cta_group_primary_c_t_a_icon_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cta_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cta_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_contentgrid_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_contentgrid_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_contentgrid_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_contentgrid_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_contentgrid_block_items" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_contentgrid_block_items_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cardgrid_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cardgrid_block_settings_background_image_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cardgrid_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cardgrid_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cardgrid_block_cards" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cardgrid_block_cards_link_reference_id_pages_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cardgrid_block_cards" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cardgrid_block_cards_link_icon_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cardgrid_block_cards" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cardgrid_block_cards_image_item_id_media_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_cardgrid_block_cards" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_cardgrid_block_cards_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_blogpreview_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_blogpreview_block_parent_id_fk";
    ALTER TABLE "public"."_pages_v_blocks_amenities_block" DROP CONSTRAINT IF EXISTS "_pages_v_blocks_amenities_block_parent_id_fk";
    ALTER TABLE "public"."_page_testimonials_vis_v" DROP CONSTRAINT IF EXISTS "_page_testimonials_vis_v_parent_fk";
    ALTER TABLE "public"."_page_team_vis_v" DROP CONSTRAINT IF EXISTS "_page_team_vis_v_parent_fk";
    ALTER TABLE "public"."_page_steps_vis_v" DROP CONSTRAINT IF EXISTS "_page_steps_vis_v_parent_fk";
    ALTER TABLE "public"."_page_stats_vis_v" DROP CONSTRAINT IF EXISTS "_page_stats_vis_v_parent_fk";
    ALTER TABLE "public"."_page_split_vis_v" DROP CONSTRAINT IF EXISTS "_page_split_vis_v_parent_fk";
    ALTER TABLE "public"."_page_richtext_vis_v" DROP CONSTRAINT IF EXISTS "_page_richtext_vis_v_parent_fk";
    ALTER TABLE "public"."_page_newsletter_vis_v" DROP CONSTRAINT IF EXISTS "_page_newsletter_vis_v_parent_fk";
    ALTER TABLE "public"."_page_menushowcase_vis_v" DROP CONSTRAINT IF EXISTS "_page_menushowcase_vis_v_parent_fk";
    ALTER TABLE "public"."_page_locations_vis_v" DROP CONSTRAINT IF EXISTS "_page_locations_vis_v_parent_fk";
    ALTER TABLE "public"."_page_gallery_vis_v" DROP CONSTRAINT IF EXISTS "_page_gallery_vis_v_parent_fk";
    ALTER TABLE "public"."_page_form_vis_v" DROP CONSTRAINT IF EXISTS "_page_form_vis_v_parent_fk";
    ALTER TABLE "public"."_page_featurestrip_vis_v" DROP CONSTRAINT IF EXISTS "_page_featurestrip_vis_v_parent_fk";
    ALTER TABLE "public"."_page_faq_vis_v" DROP CONSTRAINT IF EXISTS "_page_faq_vis_v_parent_fk";
    ALTER TABLE "public"."_page_events_vis_v" DROP CONSTRAINT IF EXISTS "_page_events_vis_v_parent_fk";
    ALTER TABLE "public"."_page_cta_vis_v" DROP CONSTRAINT IF EXISTS "_page_cta_vis_v_parent_fk";
    ALTER TABLE "public"."_page_contentgrid_vis_v" DROP CONSTRAINT IF EXISTS "_page_contentgrid_vis_v_parent_fk";
    ALTER TABLE "public"."_page_cardgrid_vis_v" DROP CONSTRAINT IF EXISTS "_page_cardgrid_vis_v_parent_fk";
    DROP INDEX IF EXISTS "public"."teammembers_photo_idx";
    DROP INDEX IF EXISTS "public"."teammembers_is_active_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_testimonials_id_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_teammembers_id_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_path_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_parent_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_order_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_menu_categories_id_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_locations_id_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_gallery_id_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_faqs_id_idx";
    DROP INDEX IF EXISTS "public"."pages_rels_events_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_testimonials_block_settings_settings_backgr_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_testimonials_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_testimonials_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_testimonials_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_team_block_settings_settings_background_ima_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_team_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_team_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_team_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_subbrands_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_subbrands_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_subbrands_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_steps_block_settings_settings_background_im_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_steps_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_steps_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_steps_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_steps_block_steps_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_steps_block_steps_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_stats_block_settings_settings_background_im_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_stats_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_stats_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_stats_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_stats_block_stats_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_stats_block_stats_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_settings_settings_background_im_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_image_image_item_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_cta_group_secondary_c_t_a_cta_g_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_cta_group_secondary_c_t_a_cta_1_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_cta_group_primary_c_t_a_cta_gro_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_cta_group_primary_c_t_a_cta_g_1_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_points_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_split_block_points_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_spacer_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_spacer_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_spacer_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_roomsshowcase_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_roomsshowcase_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_roomsshowcase_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_richtext_block_settings_settings_background_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_richtext_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_richtext_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_richtext_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_packages_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_packages_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_packages_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_newsletter_block_settings_settings_backgrou_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_newsletter_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_newsletter_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_newsletter_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_menushowcase_block_settings_settings_backgr_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_menushowcase_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_menushowcase_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_menushowcase_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_menushowcase_block_cta_group_secondary_c_t__idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_menushowcase_block_cta_group_secondary_c__1_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_menushowcase_block_cta_group_primary_c_t_a__idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_menushowcase_block_cta_group_primary_c_t__1_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_locations_block_settings_settings_backgroun_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_locations_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_locations_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_locations_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_gallery_block_settings_settings_background__idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_gallery_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_gallery_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_gallery_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_form_block_settings_settings_background_ima_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_form_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_form_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_form_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_featurestrip_block_settings_settings_backgr_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_featurestrip_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_featurestrip_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_featurestrip_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_featurestrip_block_items_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_featurestrip_block_items_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_faq_block_settings_settings_background_imag_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_faq_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_faq_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_faq_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_events_block_settings_settings_background_i_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_events_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_events_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_events_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_embed_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_embed_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_embed_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cta_block_settings_settings_background_imag_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cta_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cta_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cta_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cta_block_cta_group_secondary_c_t_a_cta_gro_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cta_block_cta_group_secondary_c_t_a_cta_g_1_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cta_block_cta_group_primary_c_t_a_cta_group_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cta_block_cta_group_primary_c_t_a_cta_gro_1_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_contentgrid_block_settings_settings_backgro_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_contentgrid_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_contentgrid_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_contentgrid_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_contentgrid_block_items_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_contentgrid_block_items_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_settings_settings_background_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_cards_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_cards_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_cards_link_link_reference_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_cards_link_link_icon_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_cardgrid_block_cards_image_image_item_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_blogpreview_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_blogpreview_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_blogpreview_block_order_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_amenities_block_path_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_amenities_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."pages_blocks_amenities_block_order_idx";
    DROP INDEX IF EXISTS "public"."page_testimonials_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_testimonials_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_team_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_team_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_steps_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_steps_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_stats_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_stats_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_split_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_split_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_richtext_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_richtext_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_newsletter_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_newsletter_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_menushowcase_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_menushowcase_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_locations_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_locations_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_gallery_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_gallery_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_form_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_form_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_featurestrip_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_featurestrip_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_faq_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_faq_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_events_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_events_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_cta_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_cta_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_contentgrid_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_contentgrid_vis_order_idx";
    DROP INDEX IF EXISTS "public"."page_cardgrid_vis_parent_idx";
    DROP INDEX IF EXISTS "public"."page_cardgrid_vis_order_idx";
    DROP INDEX IF EXISTS "public"."nav_blocks_link_children_parent_id_idx";
    DROP INDEX IF EXISTS "public"."nav_blocks_link_children_order_idx";
    DROP INDEX IF EXISTS "public"."locations_is_active_idx";
    DROP INDEX IF EXISTS "public"."locations_order_links_parent_id_idx";
    DROP INDEX IF EXISTS "public"."locations_order_links_order_idx";
    DROP INDEX IF EXISTS "public"."faqs_is_active_idx";
    DROP INDEX IF EXISTS "public"."events_is_featured_idx";
    DROP INDEX IF EXISTS "public"."events_image_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_testimonials_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_teammembers_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_parent_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_menu_categories_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_locations_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_gallery_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_faqs_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_rels_events_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_testimonials_block_settings_settings_bac_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_testimonials_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_testimonials_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_testimonials_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_team_block_settings_settings_background__idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_team_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_team_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_team_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_subbrands_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_subbrands_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_subbrands_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_steps_block_settings_settings_background_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_steps_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_steps_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_steps_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_steps_block_steps_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_steps_block_steps_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_stats_block_settings_settings_background_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_stats_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_stats_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_stats_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_stats_block_stats_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_stats_block_stats_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_settings_settings_background_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_image_image_item_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_cta_group_secondary_c_t_a_ct_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_cta_group_secondary_c_t_a__1_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_cta_group_primary_c_t_a_cta__idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_cta_group_primary_c_t_a_ct_1_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_points_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_split_block_points_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_spacer_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_spacer_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_spacer_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_roomsshowcase_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_roomsshowcase_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_roomsshowcase_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_richtext_block_settings_settings_backgro_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_richtext_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_richtext_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_richtext_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_packages_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_packages_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_packages_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_newsletter_block_settings_settings_backg_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_newsletter_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_newsletter_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_newsletter_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_menushowcase_block_settings_settings_bac_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_menushowcase_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_menushowcase_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_menushowcase_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_menushowcase_block_cta_group_secondary_c_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_menushowcase_block_cta_group_secondary_1_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_menushowcase_block_cta_group_primary_c_t_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_menushowcase_block_cta_group_primary_c_1_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_locations_block_settings_settings_backgr_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_locations_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_locations_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_locations_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_gallery_block_settings_settings_backgrou_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_gallery_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_gallery_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_gallery_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_form_block_settings_settings_background__idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_form_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_form_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_form_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_featurestrip_block_settings_settings_bac_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_featurestrip_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_featurestrip_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_featurestrip_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_featurestrip_block_items_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_featurestrip_block_items_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_faq_block_settings_settings_background_i_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_faq_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_faq_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_faq_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_events_block_settings_settings_backgroun_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_events_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_events_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_events_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_embed_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_embed_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_embed_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cta_block_settings_settings_background_i_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cta_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cta_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cta_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cta_block_cta_group_secondary_c_t_a_cta__idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cta_block_cta_group_secondary_c_t_a_ct_1_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cta_block_cta_group_primary_c_t_a_cta_gr_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cta_block_cta_group_primary_c_t_a_cta__1_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_contentgrid_block_settings_settings_back_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_contentgrid_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_contentgrid_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_contentgrid_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_contentgrid_block_items_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_contentgrid_block_items_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_settings_settings_backgro_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_cards_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_cards_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_cards_link_link_reference_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_cards_link_link_icon_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_cardgrid_block_cards_image_image_item_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_blogpreview_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_blogpreview_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_blogpreview_block_order_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_amenities_block_path_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_amenities_block_parent_id_idx";
    DROP INDEX IF EXISTS "public"."_pages_v_blocks_amenities_block_order_idx";
    DROP INDEX IF EXISTS "public"."_page_testimonials_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_testimonials_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_team_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_team_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_steps_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_steps_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_stats_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_stats_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_split_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_split_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_richtext_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_richtext_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_newsletter_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_newsletter_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_menushowcase_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_menushowcase_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_locations_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_locations_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_gallery_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_gallery_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_form_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_form_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_featurestrip_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_featurestrip_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_faq_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_faq_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_events_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_events_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_cta_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_cta_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_contentgrid_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_contentgrid_vis_v_order_idx";
    DROP INDEX IF EXISTS "public"."_page_cardgrid_vis_v_parent_idx";
    DROP INDEX IF EXISTS "public"."_page_cardgrid_vis_v_order_idx";
    ALTER TABLE "public"."footer" DROP COLUMN IF EXISTS "contact_heading";
    ALTER TABLE "public"."footer_bottom_links" DROP COLUMN IF EXISTS "new_tab";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "newsletter_privacy_text";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "newsletter_button_label";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "newsletter_placeholder";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "newsletter_description";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "newsletter_highlighted_word";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "newsletter_title";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "newsletter_enabled";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "contact_address";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "site_description";
    ALTER TABLE "public"."site_settings" DROP COLUMN IF EXISTS "tagline";
    ALTER TABLE "public"."faqs" DROP COLUMN IF EXISTS "sort_order";
    ALTER TABLE "public"."faqs" DROP COLUMN IF EXISTS "is_active";
    ALTER TABLE "public"."faqs" DROP COLUMN IF EXISTS "category";
    ALTER TABLE "public"."faqs" DROP COLUMN IF EXISTS "answer";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "sort_order";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "is_active";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "maps_embed_url";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "maps_url";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "email";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "phone";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "description";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "address";
    ALTER TABLE "public"."locations" DROP COLUMN IF EXISTS "city";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "is_featured";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "status";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "booking_url";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "image_id";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "location_name";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "ends_at";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "starts_at";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "description";
    ALTER TABLE "public"."events" DROP COLUMN IF EXISTS "summary";
    ALTER TABLE "public"."teammembers" DROP COLUMN IF EXISTS "sort_order";
    ALTER TABLE "public"."teammembers" DROP COLUMN IF EXISTS "is_active";
    ALTER TABLE "public"."teammembers" DROP COLUMN IF EXISTS "quote";
    ALTER TABLE "public"."teammembers" DROP COLUMN IF EXISTS "bio";
    ALTER TABLE "public"."teammembers" DROP COLUMN IF EXISTS "photo_id";
    ALTER TABLE "public"."teammembers" DROP COLUMN IF EXISTS "role";
    ALTER TABLE "public"."_pages_v_blocks_hero_block" DROP COLUMN IF EXISTS "stamp_text";
    ALTER TABLE "public"."_pages_v_blocks_hero_block" DROP COLUMN IF EXISTS "order_platforms_label";
    ALTER TABLE "public"."pages_blocks_hero_block" DROP COLUMN IF EXISTS "stamp_text";
    ALTER TABLE "public"."pages_blocks_hero_block" DROP COLUMN IF EXISTS "order_platforms_label";
    ALTER TABLE "public"."site_settings_delivery_settings_delivery_urls" ALTER COLUMN "url" DROP NOT NULL;
    ALTER TABLE "public"."site_settings_delivery_settings_delivery_urls" ALTER COLUMN "platform" DROP NOT NULL;
    ALTER TABLE "public"."site_settings_hours" ALTER COLUMN "day" DROP NOT NULL;
    ALTER TABLE "public"."_blog_posts_v" ALTER COLUMN "version_status" DROP DEFAULT;
    ALTER TABLE "public"."_blog_posts_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__blog_posts_v_version_status" USING "version_status"::text::"public"."enum__blog_posts_v_version_status";
    ALTER TABLE "public"."_blog_posts_v" ALTER COLUMN "version_status" SET DEFAULT 'draft'::enum__blog_posts_v_version_status;
    ALTER TABLE "public"."blog_posts" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "public"."blog_posts" ALTER COLUMN "status" SET DATA TYPE "public"."enum_blog_posts_status" USING "status"::text::"public"."enum_blog_posts_status";
    ALTER TABLE "public"."blog_posts" ALTER COLUMN "status" SET DEFAULT 'draft'::enum_blog_posts_status;
    ALTER TABLE "public"."menu_items" ALTER COLUMN "description" DROP NOT NULL;
    ALTER TABLE "public"."_pages_v" ALTER COLUMN "version_status" DROP DEFAULT;
    ALTER TABLE "public"."_pages_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__pages_v_version_status" USING "version_status"::text::"public"."enum__pages_v_version_status";
    ALTER TABLE "public"."_pages_v" ALTER COLUMN "version_status" SET DEFAULT 'draft'::enum__pages_v_version_status;
    ALTER TABLE "public"."pages" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "public"."pages" ALTER COLUMN "status" SET DATA TYPE "public"."enum_pages_status" USING "status"::text::"public"."enum_pages_status";
    ALTER TABLE "public"."pages" ALTER COLUMN "status" SET DEFAULT 'draft'::enum_pages_status;
    DROP TABLE IF EXISTS "public"."pages_rels";
    DROP TABLE IF EXISTS "public"."pages_blocks_testimonials_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_team_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_subbrands_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_steps_block_steps";
    DROP TABLE IF EXISTS "public"."pages_blocks_steps_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_stats_block_stats";
    DROP TABLE IF EXISTS "public"."pages_blocks_stats_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_split_block_points";
    DROP TABLE IF EXISTS "public"."pages_blocks_split_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_spacer_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_roomsshowcase_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_richtext_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_packages_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_newsletter_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_menushowcase_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_locations_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_gallery_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_form_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_featurestrip_block_items";
    DROP TABLE IF EXISTS "public"."pages_blocks_featurestrip_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_faq_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_events_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_embed_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_cta_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_contentgrid_block_items";
    DROP TABLE IF EXISTS "public"."pages_blocks_contentgrid_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_cardgrid_block_cards";
    DROP TABLE IF EXISTS "public"."pages_blocks_cardgrid_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_blogpreview_block";
    DROP TABLE IF EXISTS "public"."pages_blocks_amenities_block";
    DROP TABLE IF EXISTS "public"."page_testimonials_vis";
    DROP TABLE IF EXISTS "public"."page_team_vis";
    DROP TABLE IF EXISTS "public"."page_steps_vis";
    DROP TABLE IF EXISTS "public"."page_stats_vis";
    DROP TABLE IF EXISTS "public"."page_split_vis";
    DROP TABLE IF EXISTS "public"."page_richtext_vis";
    DROP TABLE IF EXISTS "public"."page_newsletter_vis";
    DROP TABLE IF EXISTS "public"."page_menushowcase_vis";
    DROP TABLE IF EXISTS "public"."page_locations_vis";
    DROP TABLE IF EXISTS "public"."page_gallery_vis";
    DROP TABLE IF EXISTS "public"."page_form_vis";
    DROP TABLE IF EXISTS "public"."page_featurestrip_vis";
    DROP TABLE IF EXISTS "public"."page_faq_vis";
    DROP TABLE IF EXISTS "public"."page_events_vis";
    DROP TABLE IF EXISTS "public"."page_cta_vis";
    DROP TABLE IF EXISTS "public"."page_contentgrid_vis";
    DROP TABLE IF EXISTS "public"."page_cardgrid_vis";
    DROP TABLE IF EXISTS "public"."nav_blocks_link_children";
    DROP TABLE IF EXISTS "public"."locations_order_links";
    DROP TABLE IF EXISTS "public"."_pages_v_rels";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_testimonials_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_team_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_subbrands_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_steps_block_steps";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_steps_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_stats_block_stats";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_stats_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_split_block_points";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_split_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_spacer_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_roomsshowcase_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_richtext_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_packages_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_newsletter_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_menushowcase_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_locations_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_gallery_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_form_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_featurestrip_block_items";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_featurestrip_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_faq_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_events_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_embed_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_cta_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_contentgrid_block_items";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_contentgrid_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_cardgrid_block_cards";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_cardgrid_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_blogpreview_block";
    DROP TABLE IF EXISTS "public"."_pages_v_blocks_amenities_block";
    DROP TABLE IF EXISTS "public"."_page_testimonials_vis_v";
    DROP TABLE IF EXISTS "public"."_page_team_vis_v";
    DROP TABLE IF EXISTS "public"."_page_steps_vis_v";
    DROP TABLE IF EXISTS "public"."_page_stats_vis_v";
    DROP TABLE IF EXISTS "public"."_page_split_vis_v";
    DROP TABLE IF EXISTS "public"."_page_richtext_vis_v";
    DROP TABLE IF EXISTS "public"."_page_newsletter_vis_v";
    DROP TABLE IF EXISTS "public"."_page_menushowcase_vis_v";
    DROP TABLE IF EXISTS "public"."_page_locations_vis_v";
    DROP TABLE IF EXISTS "public"."_page_gallery_vis_v";
    DROP TABLE IF EXISTS "public"."_page_form_vis_v";
    DROP TABLE IF EXISTS "public"."_page_featurestrip_vis_v";
    DROP TABLE IF EXISTS "public"."_page_faq_vis_v";
    DROP TABLE IF EXISTS "public"."_page_events_vis_v";
    DROP TABLE IF EXISTS "public"."_page_cta_vis_v";
    DROP TABLE IF EXISTS "public"."_page_contentgrid_vis_v";
    DROP TABLE IF EXISTS "public"."_page_cardgrid_vis_v";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_testimonials_block_source";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_split_block_image_position";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_split_block_image_object_fit";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_split_block_image_aspect_ratio";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_split_block_cta_group_alignment";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_spacer_block_size";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_menushowcase_block_cta_group_alignment";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gallery_block_source";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_gallery_block_category";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_form_block_form_type";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_cta_block_cta_group_alignment";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_cardgrid_block_columns";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_cardgrid_block_cards_image_object_fit";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_cardgrid_block_cards_image_aspect_ratio";
    DROP TYPE IF EXISTS "public"."enum_events_status";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_testimonials_block_source";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_split_block_image_position";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_split_block_image_object_fit";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_split_block_image_aspect_ratio";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_split_block_cta_group_alignment";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_spacer_block_size";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_menushowcase_block_cta_group_alignment";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gallery_block_source";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_gallery_block_category";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_form_block_form_type";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_cta_block_cta_group_alignment";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_cardgrid_block_columns";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_cardgrid_block_cards_image_object_fit";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_cardgrid_block_cards_image_aspect_ratio";
    DROP TYPE IF EXISTS "public"."cms_section_width";
    DROP TYPE IF EXISTS "public"."cms_section_tag";
    DROP TYPE IF EXISTS "public"."cms_section_align";
    DROP TYPE IF EXISTS "public"."cms_page_status";
    DROP TYPE IF EXISTS "public"."cms_link_style";
    DROP TYPE IF EXISTS "public"."cms_link_size";
    DROP TYPE IF EXISTS "public"."cms_link_kind";
    DROP TYPE IF EXISTS "public"."cms_link_icon_pos";
    DROP TYPE IF EXISTS "public"."cms_blog_status";
    DROP TYPE IF EXISTS "public"."cms_block_width";
    DROP TYPE IF EXISTS "public"."cms_block_visibility";
    DROP TYPE IF EXISTS "public"."cms_block_pt";
    DROP TYPE IF EXISTS "public"."cms_block_pb";
    DROP TYPE IF EXISTS "public"."cms_block_bg";
    DROP TYPE IF EXISTS "public"."cms_block_anim";
  `)
}
