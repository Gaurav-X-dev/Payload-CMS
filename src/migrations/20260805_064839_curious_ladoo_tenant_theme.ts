import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_tenants_theme" ADD VALUE 'curious-hub';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants" ALTER COLUMN "theme" SET DATA TYPE text;
  ALTER TABLE "tenants" ALTER COLUMN "theme" SET DEFAULT 'ghee-roast'::text;
  DROP TYPE "public"."enum_tenants_theme";
  CREATE TYPE "public"."enum_tenants_theme" AS ENUM('ghee-roast', 'zuru-zuru');
  ALTER TABLE "tenants" ALTER COLUMN "theme" SET DEFAULT 'ghee-roast'::"public"."enum_tenants_theme";
  ALTER TABLE "tenants" ALTER COLUMN "theme" SET DATA TYPE "public"."enum_tenants_theme" USING "theme"::"public"."enum_tenants_theme";`)
}
