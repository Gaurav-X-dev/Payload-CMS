import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "menu_items_location_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"location_id" integer NOT NULL,
  	"price" numeric NOT NULL
  );

  ALTER TABLE "menu_items_rels" ADD COLUMN "locations_id" integer;
  ALTER TABLE "menu_items_location_pricing" ADD CONSTRAINT "menu_items_location_pricing_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_items_location_pricing" ADD CONSTRAINT "menu_items_location_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "menu_items_location_pricing_order_idx" ON "menu_items_location_pricing" USING btree ("_order");
  CREATE INDEX "menu_items_location_pricing_parent_id_idx" ON "menu_items_location_pricing" USING btree ("_parent_id");
  CREATE INDEX "menu_items_location_pricing_location_idx" ON "menu_items_location_pricing" USING btree ("location_id");
  ALTER TABLE "menu_items_rels" ADD CONSTRAINT "menu_items_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "menu_items_rels_locations_id_idx" ON "menu_items_rels" USING btree ("locations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_items_location_pricing" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "menu_items_location_pricing" CASCADE;
  ALTER TABLE "menu_items_rels" DROP CONSTRAINT "menu_items_rels_locations_fk";

  DROP INDEX "menu_items_rels_locations_id_idx";
  ALTER TABLE "menu_items_rels" DROP COLUMN "locations_id";`)
}
