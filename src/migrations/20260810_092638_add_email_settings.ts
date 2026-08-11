import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "email_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id_id" integer NOT NULL,
  	"sender_name" varchar,
  	"reply_to" varchar,
  	"welcome_email_enabled" boolean DEFAULT true,
  	"welcome_email_subject" varchar NOT NULL,
  	"welcome_email_heading" varchar NOT NULL,
  	"welcome_email_body" varchar NOT NULL,
  	"welcome_email_button_label" varchar DEFAULT 'Log In',
  	"forgot_password_email_enabled" boolean DEFAULT true,
  	"forgot_password_email_subject" varchar NOT NULL,
  	"forgot_password_email_heading" varchar NOT NULL,
  	"forgot_password_email_body" varchar NOT NULL,
  	"forgot_password_email_button_label" varchar DEFAULT 'Reset Password',
  	"footer_support_email" varchar,
  	"footer_footer_text" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_settings_id" integer;
  ALTER TABLE "email_settings" ADD CONSTRAINT "email_settings_tenant_id_id_tenants_id_fk" FOREIGN KEY ("tenant_id_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "email_settings_tenant_id_idx" ON "email_settings" USING btree ("tenant_id_id");
  CREATE INDEX "email_settings_updated_at_idx" ON "email_settings" USING btree ("updated_at");
  CREATE INDEX "email_settings_created_at_idx" ON "email_settings" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_settings_fk" FOREIGN KEY ("email_settings_id") REFERENCES "public"."email_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_email_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("email_settings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "email_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "email_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_settings_fk";
  
  DROP INDEX "payload_locked_documents_rels_email_settings_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_settings_id";`)
}
