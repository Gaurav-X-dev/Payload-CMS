import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "email_settings" ADD COLUMN "smtp_enabled" boolean DEFAULT false;
  ALTER TABLE "email_settings" ADD COLUMN "smtp_host" varchar;
  ALTER TABLE "email_settings" ADD COLUMN "smtp_port" numeric;
  ALTER TABLE "email_settings" ADD COLUMN "smtp_secure" boolean DEFAULT false;
  ALTER TABLE "email_settings" ADD COLUMN "smtp_username" varchar;
  ALTER TABLE "email_settings" ADD COLUMN "smtp_password_encrypted" varchar;
  ALTER TABLE "email_settings" ADD COLUMN "smtp_from_address" varchar;
  ALTER TABLE "email_settings" ADD COLUMN "smtp_from_name" varchar;
  ALTER TABLE "email_settings" ADD COLUMN "smtp_reply_to" varchar;
  ALTER TABLE "email_settings" DROP COLUMN "sender_name";
  ALTER TABLE "email_settings" DROP COLUMN "reply_to";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "email_settings" ADD COLUMN "sender_name" varchar;
  ALTER TABLE "email_settings" ADD COLUMN "reply_to" varchar;
  ALTER TABLE "email_settings" DROP COLUMN "smtp_enabled";
  ALTER TABLE "email_settings" DROP COLUMN "smtp_host";
  ALTER TABLE "email_settings" DROP COLUMN "smtp_port";
  ALTER TABLE "email_settings" DROP COLUMN "smtp_secure";
  ALTER TABLE "email_settings" DROP COLUMN "smtp_username";
  ALTER TABLE "email_settings" DROP COLUMN "smtp_password_encrypted";
  ALTER TABLE "email_settings" DROP COLUMN "smtp_from_address";
  ALTER TABLE "email_settings" DROP COLUMN "smtp_from_name";
  ALTER TABLE "email_settings" DROP COLUMN "smtp_reply_to";`)
}
