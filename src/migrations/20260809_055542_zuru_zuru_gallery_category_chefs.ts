import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_gallery_category" ADD VALUE 'chefs';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "gallery" ALTER COLUMN "category" SET DATA TYPE text;
  ALTER TABLE "gallery" ALTER COLUMN "category" SET DEFAULT 'food'::text;
  DROP TYPE "public"."enum_gallery_category";
  CREATE TYPE "public"."enum_gallery_category" AS ENUM('food', 'ambiance', 'events', 'kitchen', 'exterior');
  ALTER TABLE "gallery" ALTER COLUMN "category" SET DEFAULT 'food'::"public"."enum_gallery_category";
  ALTER TABLE "gallery" ALTER COLUMN "category" SET DATA TYPE "public"."enum_gallery_category" USING "category"::"public"."enum_gallery_category";`)
}
