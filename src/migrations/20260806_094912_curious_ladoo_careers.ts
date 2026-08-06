import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_careers_block_positions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"department" varchar,
  	"type" varchar,
  	"location" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "page_careers_vis" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_careers_block" (
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
  
  CREATE TABLE "_pages_v_blocks_careers_block_positions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"department" varchar,
  	"type" varchar,
  	"location" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_page_careers_vis_v" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms_block_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_careers_block" (
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
  
  ALTER TABLE "pages_blocks_contentgrid_block" ADD COLUMN "bg_text" varchar;
  ALTER TABLE "_pages_v_blocks_contentgrid_block" ADD COLUMN "bg_text" varchar;
  ALTER TABLE "pages_blocks_careers_block_positions" ADD CONSTRAINT "pages_blocks_careers_block_positions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_careers_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_careers_vis" ADD CONSTRAINT "page_careers_vis_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_careers_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_careers_block" ADD CONSTRAINT "pages_blocks_careers_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_careers_block" ADD CONSTRAINT "pages_blocks_careers_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_careers_block_positions" ADD CONSTRAINT "_pages_v_blocks_careers_block_positions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_careers_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_page_careers_vis_v" ADD CONSTRAINT "_page_careers_vis_v_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_careers_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_careers_block" ADD CONSTRAINT "_pages_v_blocks_careers_block_settings_background_image_id_media_id_fk" FOREIGN KEY ("settings_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_careers_block" ADD CONSTRAINT "_pages_v_blocks_careers_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_careers_block_positions_order_idx" ON "pages_blocks_careers_block_positions" USING btree ("_order");
  CREATE INDEX "pages_blocks_careers_block_positions_parent_id_idx" ON "pages_blocks_careers_block_positions" USING btree ("_parent_id");
  CREATE INDEX "page_careers_vis_order_idx" ON "page_careers_vis" USING btree ("order");
  CREATE INDEX "page_careers_vis_parent_idx" ON "page_careers_vis" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_careers_block_order_idx" ON "pages_blocks_careers_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_careers_block_parent_id_idx" ON "pages_blocks_careers_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_careers_block_path_idx" ON "pages_blocks_careers_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_careers_block_settings_settings_background__idx" ON "pages_blocks_careers_block" USING btree ("settings_background_image_id");
  CREATE INDEX "_pages_v_blocks_careers_block_positions_order_idx" ON "_pages_v_blocks_careers_block_positions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_careers_block_positions_parent_id_idx" ON "_pages_v_blocks_careers_block_positions" USING btree ("_parent_id");
  CREATE INDEX "_page_careers_vis_v_order_idx" ON "_page_careers_vis_v" USING btree ("order");
  CREATE INDEX "_page_careers_vis_v_parent_idx" ON "_page_careers_vis_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_careers_block_order_idx" ON "_pages_v_blocks_careers_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_careers_block_parent_id_idx" ON "_pages_v_blocks_careers_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_careers_block_path_idx" ON "_pages_v_blocks_careers_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_careers_block_settings_settings_backgrou_idx" ON "_pages_v_blocks_careers_block" USING btree ("settings_background_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_careers_block_positions" CASCADE;
  DROP TABLE "page_careers_vis" CASCADE;
  DROP TABLE "pages_blocks_careers_block" CASCADE;
  DROP TABLE "_pages_v_blocks_careers_block_positions" CASCADE;
  DROP TABLE "_page_careers_vis_v" CASCADE;
  DROP TABLE "_pages_v_blocks_careers_block" CASCADE;
  ALTER TABLE "pages_blocks_contentgrid_block" DROP COLUMN "bg_text";
  ALTER TABLE "_pages_v_blocks_contentgrid_block" DROP COLUMN "bg_text";`)
}
