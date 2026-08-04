import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_feature_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"icon" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  ALTER TABLE "nav_blocks_link" ALTER COLUMN "sort_order" SET NOT NULL;
  ALTER TABLE "nav_blocks_link_children" ADD COLUMN "enabled" boolean DEFAULT true;
  ALTER TABLE "nav_blocks_link_children" ADD COLUMN "sort_order" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ADD CONSTRAINT "site_settings_feature_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_feature_strip_order_idx" ON "site_settings_feature_strip" USING btree ("_order");
  CREATE INDEX "site_settings_feature_strip_parent_id_idx" ON "site_settings_feature_strip" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_feature_strip" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_feature_strip" CASCADE;
  ALTER TABLE "nav_blocks_link" ALTER COLUMN "sort_order" DROP NOT NULL;
  ALTER TABLE "nav_blocks_link_children" DROP COLUMN "enabled";
  ALTER TABLE "nav_blocks_link_children" DROP COLUMN "sort_order";`)
}
