# Ghee Roast schema migration audit

Audit date: 2026-07-30  
Payload: 3.86.0  
PostgreSQL: 16.14  
Migration: `20260730_054932_ghee_schema_sync`

## Safety baseline

- The development database was inspected before migration and contained 2 users,
  1 tenant, and no Ghee Roast CMS content rows.
- A full custom-format backup was created at
  `backups/database/payload-pre-ghee-migration-20260730T104038+0530.dump`.
- Backup size: 276,517 bytes.
- SHA-256:
  `480123D9D511B8B64173B7787E62EC042E241FDC9C9994C3AF91127939596A85`.
- `pg_restore --list` validated the archive successfully.
- The backup was restored to the isolated database
  `payload_ghee_preflight_20260730_01`.
- The migration was tested in the isolated database in this order:
  `up`, catalog and Payload runtime verification, `down`, catalog comparison
  against the restored backup, and `up` again.
- The isolated database is intentionally retained; the development database was
  never dropped, reset, seeded, truncated, or recreated.

## Audited differences

| Collection/table area | Difference | Expected type/null/default | Existing-data impact | Forward action | Rollback action | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| Page block schema | 98 current main/version block, child-array, relationship, and per-block visibility tables missing | Payload-generated tables, primary keys, ordering/path columns, relationships, and 17 visibility tables in both main and version schemas | None: Pages contained 0 rows | Create all 98 tables, 180 foreign keys, and their indexes | Drop only the newly created foreign keys, indexes, and tables | Low after isolated proof |
| `nav_blocks_link_children` | Table missing | Ordered child links with parent FK | None: Nav contained 0 rows | Create table, FK, and indexes | Drop its FK, indexes, and table | Low |
| `locations_order_links` | Table missing | Ordered platform/URL rows with parent FK | None: Locations contained 0 rows | Create table, FK, and indexes | Drop its FK, indexes, and table | Low |
| `pages_blocks_hero_block`, `_pages_v_blocks_hero_block` | `order_platforms_label`, `stamp_text` missing in both live and version blocks | Nullable `varchar`; defaults `Also available on` and multiline stamp text | Existing tables had no Page rows | Add four columns with defaults | Drop only these four columns | Low |
| `teammembers` | `role`, `photo_id`, `bio`, `quote`, `is_active`, `sort_order` missing | `role varchar NOT NULL`; optional media/text; `is_active=true`; `sort_order=0` | Collection contained 0 rows, so required `role` is safe | Add six columns plus media FK/index | Drop only the six new columns and related FK/index | Low |
| `events` | Nine content/publication columns missing | Required `summary`, `starts_at`, and enum `status='draft'`; six optional fields | Collection contained 0 rows | Add columns, event enum, media FK, and indexes | Drop only added columns/FK/index/enum | Low |
| `locations` | Nine address/contact/publication columns missing | Required `city`, `address`; optional contact/maps fields; `is_active=true`; `sort_order=0` | Collection contained 0 rows | Add nine columns and indexes | Drop only added columns/indexes | Low |
| `faqs` | `answer`, `category`, `is_active`, `sort_order` missing | Required `answer`; optional category; `is_active=true`; `sort_order=0` | Collection contained 0 rows | Add four columns and indexes | Drop only added columns/indexes | Low |
| `site_settings` | Ten public site/newsletter columns missing | Optional text/boolean fields with safe newsletter defaults | Collection contained 0 rows | Add ten columns | Drop only the ten columns | Low |
| `footer`, `footer_bottom_links` | `contact_heading`, `new_tab` missing | Nullable fields; defaults `Get In Touch` and `false` | Footer contained 0 rows | Add two columns | Drop only the two columns | Low |
| Pages and Page versions | Custom status used old Payload-injected enum names | `cms_page_status`, preserving `draft` and `published` and adding configured `archived` | Pages contained 0 rows; every old value is accepted by the new enum | Create enum, remove default, cast through text, restore default | Remove default, cast back through text, restore old default | Low after up/down/up |
| Blog Posts and versions | Custom status used old Payload-injected enum names | `cms_blog_status`, preserving old values and configured `archived` | Blog Posts contained 0 rows; every old value is accepted by the new enum | Create enum, remove default, cast through text, restore default | Remove default, cast back through text, restore old default | Low after up/down/up |
| `menu_items.description` | Live column nullable, config required | `varchar NOT NULL` | Menu Items contained 0 rows | Set `NOT NULL` | Drop `NOT NULL` | Low |
| `site_settings_hours.day` | Live column nullable, config required | `varchar NOT NULL` | Site Settings contained 0 rows | Set `NOT NULL` | Drop `NOT NULL` | Low |
| Delivery platform rows | `platform` and `url` nullable, config required | Both `varchar NOT NULL` | Site Settings contained 0 rows | Set both `NOT NULL` | Drop both `NOT NULL` constraints | Low |
| Shared/block enums | 44 current enums missing | 15 compact shared enums, 28 main/version block enums, and event status | No rows used these missing enum types | Create all 44 enum types before dependent tables/columns | Drop only the 44 new enums after dependent objects | Low |
| Current-config indexes | 332 non-primary indexes missing | Payload-generated lookup, relationship, ordering, path, and version indexes | Index creation only; relevant CMS collections were empty | Create all 332 indexes | Drop only the 332 new indexes | Low |
| Legacy mock block tables | Two tables, six indexes, and two FKs exist but are absent from current config | Intentionally retained compatibility data | Possible historical data is preserved | No action | No action | None |

The final forward migration contains 725 statements:

- 44 `CREATE TYPE`
- 98 `CREATE TABLE`
- 44 `ADD COLUMN`
- 180 `ADD CONSTRAINT`
- 332 `CREATE INDEX`
- 27 safe default, enum-cast, and `NOT NULL` adjustments

It contains no table, column, enum, or index drops and no data deletion. The
rollback contains 714 statements and reverses only objects or definitions
introduced by this migration. Rollback must not be used after editors begin
storing content in the new fields or tables.

## Identifier audit

The earlier compact names were not sufficient because they created physical
name collisions. The corrected schema uses:

- contextual `page_<block>_vis` visibility tables;
- distinct `cms_block_width` and `cms_section_width` enums;
- distinct `cms_page_status` and `cms_blog_status` enums;
- shared compact `cms_block_*`, `cms_link_*`, and `cms_section_*` enums.

The corrected offline snapshot contains 154 configured tables and 76 enums,
including 34 distinct Page visibility tables. No configured table or enum name
exceeds PostgreSQL's 63-byte identifier limit, and no physical table or
incompatible enum collision remains.

## Verification result

After migration, both the isolated and development catalogs have:

- zero missing configured tables;
- zero missing configured columns;
- zero column-definition differences;
- zero missing configured enums;
- zero enum-value differences;
- zero missing configured indexes;
- zero missing configured foreign keys;
- zero missing configured unique constraints.

The only extra objects are the two intentionally retained legacy mock-block
tables and their six indexes/two foreign keys. Full depth-2 Payload Local API
reads across 23 project collections initialize and shut down without a schema
error.
