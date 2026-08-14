import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_feature_strip_icon_source" AS ENUM('built-in', 'custom-svg');
  CREATE TYPE "public"."enum_site_settings_feature_strip_icon" AS ENUM('arrow', 'bowl', 'briefcase', 'building', 'cake', 'calendar', 'caretDown', 'caretRight', 'check', 'chef', 'clock', 'coriander', 'delivery', 'diamond', 'event', 'facebook', 'fire', 'ghee', 'handcrafted', 'hands', 'heart', 'instagram', 'leaf', 'map', 'martini', 'medal', 'moped', 'pepper', 'phone', 'shield', 'spice', 'star', 'sun', 'utensils', 'wedding', 'youtube');
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "icon" SET DEFAULT 'spice'::"public"."enum_site_settings_feature_strip_icon";
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_site_settings_feature_strip_icon" USING "icon"::"public"."enum_site_settings_feature_strip_icon";
  ALTER TABLE "media" ADD COLUMN "svg_sanitized" boolean DEFAULT false;
  ALTER TABLE "site_settings_feature_strip" ADD COLUMN "icon_source" "enum_site_settings_feature_strip_icon_source" DEFAULT 'built-in' NOT NULL;
  ALTER TABLE "site_settings_feature_strip" ADD COLUMN "custom_s_v_g_id" integer;
  ALTER TABLE "site_settings_feature_strip" ADD CONSTRAINT "site_settings_feature_strip_custom_s_v_g_id_media_id_fk" FOREIGN KEY ("custom_s_v_g_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_feature_strip_custom_s_v_g_idx" ON "site_settings_feature_strip" USING btree ("custom_s_v_g_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_feature_strip" DROP CONSTRAINT "site_settings_feature_strip_custom_s_v_g_id_media_id_fk";
  
  DROP INDEX "site_settings_feature_strip_custom_s_v_g_idx";
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "icon" SET DATA TYPE varchar;
  ALTER TABLE "site_settings_feature_strip" ALTER COLUMN "icon" DROP DEFAULT;
  ALTER TABLE "media" DROP COLUMN "svg_sanitized";
  ALTER TABLE "site_settings_feature_strip" DROP COLUMN "icon_source";
  ALTER TABLE "site_settings_feature_strip" DROP COLUMN "custom_s_v_g_id";
  DROP TYPE "public"."enum_site_settings_feature_strip_icon_source";
  DROP TYPE "public"."enum_site_settings_feature_strip_icon";`)
}
