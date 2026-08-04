import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "migration_20260803_212125_page_status_backup" (
      "record_kind" text NOT NULL,
      "record_id" integer NOT NULL,
      "custom_status" text,
      "native_status" text,
      CONSTRAINT "migration_20260803_212125_page_status_backup_kind_check"
        CHECK ("record_kind" IN ('page', 'version')),
      CONSTRAINT "migration_20260803_212125_page_status_backup_pk"
        PRIMARY KEY ("record_kind", "record_id")
    );

    INSERT INTO "migration_20260803_212125_page_status_backup"
      ("record_kind", "record_id", "custom_status", "native_status")
    SELECT 'page', "id", "status"::text, "_status"::text
    FROM "pages";

    INSERT INTO "migration_20260803_212125_page_status_backup"
      ("record_kind", "record_id", "custom_status", "native_status")
    SELECT 'version', "id", "version_status"::text, "version__status"::text
    FROM "_pages_v";

    DO $$
    BEGIN
      IF (
        SELECT COUNT(*)
        FROM "migration_20260803_212125_page_status_backup"
        WHERE "record_kind" = 'page'
      ) <> (SELECT COUNT(*) FROM "pages") THEN
        RAISE EXCEPTION 'Page status backup count does not match pages count';
      END IF;

      IF (
        SELECT COUNT(*)
        FROM "migration_20260803_212125_page_status_backup"
        WHERE "record_kind" = 'version'
      ) <> (SELECT COUNT(*) FROM "_pages_v") THEN
        RAISE EXCEPTION 'Page version status backup count does not match versions count';
      END IF;
    END $$;

    UPDATE "pages"
    SET "_status" = CASE
      WHEN "status"::text = 'published'
        AND ("_status" IS NULL OR "_status"::text = 'published')
        THEN 'published'::"public"."enum_pages_status"
      ELSE 'draft'::"public"."enum_pages_status"
    END;

    UPDATE "_pages_v"
    SET "version__status" = CASE
      WHEN "version_status"::text = 'published'
        AND ("version__status" IS NULL OR "version__status"::text = 'published')
        THEN 'published'::"public"."enum__pages_v_version_status"
      ELSE 'draft'::"public"."enum__pages_v_version_status"
    END;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF to_regclass('public.migration_20260803_212125_page_status_backup') IS NULL THEN
        RAISE EXCEPTION 'Page status backup table is missing; rollback cannot continue safely';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM "migration_20260803_212125_page_status_backup" AS "backup"
        WHERE "backup"."record_kind" = 'page'
          AND NOT EXISTS (
            SELECT 1
            FROM "pages" AS "page"
            WHERE "page"."id" = "backup"."record_id"
          )
      ) THEN
        RAISE EXCEPTION 'A backed-up Page is missing; rollback cannot continue safely';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM "migration_20260803_212125_page_status_backup" AS "backup"
        WHERE "backup"."record_kind" = 'version'
          AND NOT EXISTS (
            SELECT 1
            FROM "_pages_v" AS "version"
            WHERE "version"."id" = "backup"."record_id"
          )
      ) THEN
        RAISE EXCEPTION 'A backed-up Page version is missing; rollback cannot continue safely';
      END IF;
    END $$;

    UPDATE "pages" AS "page"
    SET "_status" = CASE "backup"."native_status"
      WHEN 'published' THEN 'published'::"public"."enum_pages_status"
      WHEN 'draft' THEN 'draft'::"public"."enum_pages_status"
      ELSE NULL
    END
    FROM "migration_20260803_212125_page_status_backup" AS "backup"
    WHERE "backup"."record_kind" = 'page'
      AND "backup"."record_id" = "page"."id";

    UPDATE "_pages_v" AS "version"
    SET "version__status" = CASE "backup"."native_status"
      WHEN 'published' THEN 'published'::"public"."enum__pages_v_version_status"
      WHEN 'draft' THEN 'draft'::"public"."enum__pages_v_version_status"
      ELSE NULL
    END
    FROM "migration_20260803_212125_page_status_backup" AS "backup"
    WHERE "backup"."record_kind" = 'version'
      AND "backup"."record_id" = "version"."id";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM "pages" AS "page"
        JOIN "migration_20260803_212125_page_status_backup" AS "backup"
          ON "backup"."record_kind" = 'page'
          AND "backup"."record_id" = "page"."id"
        WHERE "page"."_status"::text IS DISTINCT FROM "backup"."native_status"
      ) THEN
        RAISE EXCEPTION 'Page native statuses were not restored exactly';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM "_pages_v" AS "version"
        JOIN "migration_20260803_212125_page_status_backup" AS "backup"
          ON "backup"."record_kind" = 'version'
          AND "backup"."record_id" = "version"."id"
        WHERE "version"."version__status"::text IS DISTINCT FROM "backup"."native_status"
      ) THEN
        RAISE EXCEPTION 'Page version native statuses were not restored exactly';
      END IF;
    END $$;

    DROP TABLE "migration_20260803_212125_page_status_backup";
  `)
}
