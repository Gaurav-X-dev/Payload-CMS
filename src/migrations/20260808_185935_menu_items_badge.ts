import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_menu_items_badge" AS ENUM('none', 'chef', 'popular', 'new');
  ALTER TABLE "menu_items" ADD COLUMN "badge" "enum_menu_items_badge" DEFAULT 'none';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_items" DROP COLUMN "badge";
  DROP TYPE "public"."enum_menu_items_badge";`)
}
