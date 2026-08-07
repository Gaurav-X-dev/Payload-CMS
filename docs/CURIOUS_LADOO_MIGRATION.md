# Curious Ladoo — Static Theme to Payload CMS Migration

Living tracker for converting `src/themes/curious-hub` (public brand: **Curious Ladoo**) from a
100%-static React theme into a fully Payload-CMS-driven tenant site, on branch
`feature/curious-ladoo-dynamic`, without regressing Ghee Roast or Zuru Zuru.

Source of truth for design: the existing React implementation. This document tracks the audit,
architectural decisions, the frontend/backend contract, and milestone-by-milestone progress.

---

## 1. Architecture findings (read-only audit)

### 1.1 Current state headline

- **`src/themes/curious-hub` is 0% wired to Payload.** Every page/component reads from
  `src/themes/curious-hub/data/*.ts` static TS modules. No `payload.find`, no generated types,
  no loader. Confirmed by exhaustive grep (no matches for `payload`/`getPayload` under the theme).
- **`ghee-roast` is the only fully CMS-driven theme** and is the reference architecture to mirror:
  `src/lib/site/getGheeRoastContent.ts` → `gheeRoastContentCore.ts` (Local API, tenant-scoped
  `payload.find`) → `src/themes/ghee-roast/mappers/cmsContent.ts` (Payload doc → view-model,
  null-safe, tenant-checked twice) → `src/themes/ghee-roast/components/CMSPage.tsx` (block-type
  switch) → presentational components. Draft content is never publicly reachable (`draft: false`
  + `_status: published` hardcoded in every query); missing data renders `null` or an
  editor-facing placeholder, never fabricated copy. This exact pipeline shape is what Curious
  Ladoo's loader/mapper/CMSPage layer will replicate.
- **`zuru-zuru` is also fully static** (not a regression target for CMS wiring, just must not break).
- **Routing today is hostname-driven, not path-driven.** `src/proxy.ts` bypasses `/admin`, `/api`,
  `/_next`, static assets. `src/lib/site/resolveLocalSite.ts` holds a hardcoded
  `localSiteRegistry: Record<hostname, LocalSite>`. **`localhost` / `127.0.0.1` / `::1` currently
  map to `gheeRoastSite`** (locked in by `tests/ghee-roast-hostname.test.ts`) — this is the thing
  Milestone 2 must change. `src/themes/registry.ts` maps `LocalThemeKey` (`'curious-hub' |
  'ghee-roast' | 'zuru-zuru'`) → `PageRenderer`. Payload Admin (`/admin`) is completely
  independent of this pipeline (explicit early-return in `proxy.ts`) — confirmed safe.
- **`curious-hub` has no Tenant DB row and is not a selectable `Tenants.theme` option**
  (`src/collections/Tenants.ts` options: only `ghee-roast`, `zuru-zuru`). It exists purely as a
  hostname→static-theme mapping today. Adding the DB tenant + enum option is additive (no
  existing row references it), so it's safe.
- **No Payload Globals exist at all** (`payload-types.ts` → `globals: {}`). "Site Settings",
  "Nav", "Footer", "SEO" are singleton-per-tenant **collections** (`unique tenantId`). Reuse this
  pattern — do not introduce real Payload Globals, it would be inconsistent with the rest of the
  schema.
- **`SiteSettings.access.read` is `tenantIsolation`, not public-read** (unlike Nav/Footer/SEO
  which use `tenantPublicRead`). Ghee Roast's public loader reads it via `overrideAccess: true`
  server-side, never through the public API. Curious Ladoo's loader must do the same — do not
  change `SiteSettings` access control.

### 1.2 Curious Hub theme inventory (full detail)

File tree, per-page section order, data-file field shapes, shared chrome (loader, cursor, header,
footer, ticker, counters, reveal, back-to-top), forms, and TypeScript types were fully catalogued.
Key findings that shape the contract below:

- **Home page has 18 sections; roughly half (`processSteps` → `partners`) already read from
  `homeData`, the other half (Hero, Ticker, About, Philosophy, Services preview, Brands grid, B2B,
  Visual Story, CTA) is hardcoded JSX that doesn't even reference the matching (dead) exports in
  `data/home.ts`.** This is the single biggest parity risk — literal marketing copy duplicated
  and drifted from its own data file.
- **Duplicated data across files**: `home.ts` testimonials vs `testimonials.ts` (different
  `avatar` semantics — initials string vs image path, needs reconciling to one CMS field type);
  `home.ts` leadershipTeam vs `about.ts` leadership.items; `home.ts` journeyMilestones vs
  `about.ts` journey.items; `home.ts` journalArticles vs `blog.ts` articles.
- **Two forms (Contact, Newsletter) are pure client-side `alert()` stubs** — no network call.
  Ghee Roast already has real submission plumbing (`src/themes/ghee-roast/forms/formRequests.ts`
  → `/api/contact-submissions`, which has public `create` access) — Curious Ladoo forms should
  follow the same pattern.
- **Testimonials, FAQs, Careers pages are orphaned from nav/footer** (direct-URL only) —
  preserved as-is, not a CMS concern.
- **Portfolio hero has no `image` field in its data shape** despite the component always
  rendering one (falls back to a hardcoded path) — a pre-existing bug to fix in the Hero block
  contract, not to replicate.
- **Existing `src/app/(app)/blog/*` app-router routes are separate from the theme's `/blog`
  page registry entry** — must be reconciled during Milestone 14 so `/blog` doesn't collide.

### 1.3 Reusable backend surface already in place

| Collection | Reuse for Curious Ladoo |
|---|---|
| `Pages` | All 12 CMS pages (layout blocks, `pageType`, `isHomePage`, SEO tab, draft/publish) |
| `Nav` | Header links incl. mega-menu (shape matches `navigationData` closely) |
| `Footer` | Footer columns/bottomLinks/copyright (shape matches `footerData`) |
| `SiteSettings` | Brand, contact, social, theme tokens, newsletter, announcement |
| `SEO` | Tenant-level SEO fallback |
| `Media` | All CMS imagery |
| `BlogPosts` | Blog/Journal |
| `TeamMembers` | Leadership/team (About, Home) |
| `Testimonials` | Testimonials (page + Home preview) |
| `FAQs` | FAQs (page + Services/Contact page-scoped subsets via a page-visibility field) |
| `Locations` | Offices (Contact, Footer) — replaces hardcoded New Delhi/Mumbai/Tokyo |
| `ContactSubmissions` | Contact form storage (already public-create) |
| `Gallery` | Portfolio/visual-story media where a simple gallery suffices |
| Blocks: `heroBlock`, `splitBlock`, `stepsBlock`, `statsBlock`, `contentgridBlock`,
  `cardgridBlock`, `testimonialsBlock`, `teamBlock`, `faqBlock`, `locationsBlock`, `formBlock`,
  `ctaBlock`, `newsletterBlock`, `socialLinksBlock`, `richtextBlock`, `galleryBlock`, `spacerBlock` | Cover the large majority of sections — see matrix |

### 1.4 New backend surface required (only where a reusable block/collection is a poor fit)

| New thing | Why reuse doesn't fit | Used by |
|---|---|---|
| `Brands` collection | Repeatable business record (name, slug, logo, description, optional `tenant` relationship to Ghee Roast/Zuru Zuru tenants, external URL, colors, SEO) — not expressible as a block | Brands page, Home brands grid |
| `Portfolio`/`CaseStudies` collection | Repeatable case-study record with its own detail fields (client, results, gallery, services delivered) | Portfolio page |
| `Careers`/`JobPostings` collection | Repeatable open-role record (department, location, type, requirements) | Careers page |
| `Services` collection | Same 4-5 services appear on both Home (icon preview) and Services page (full detail); repeated, structured, cross-page — qualifies as reusable per the spec's own test | Home services preview, Services page |
| `tickerBlock` | No existing block renders a looping marquee of brand/logo items | Home ticker |
| `blogpreviewBlock` real implementation | Currently a stub (title/subtitle only) in the shared block catalog | Home journal preview, Blog index |

All four new collections and the new/completed blocks are additive-only (new tables/enum values),
never touch Ghee Roast or Zuru Zuru schema, and will go through the standard migration review
process in §4 before being applied.

---

## 2. Naming & routing decisions

- **Public brand label everywhere:** "Curious Ladoo" (headings, `siteName`, nav brand text,
  footer, SEO defaults, logo alt text, admin labels).
- **Internal theme key stays `curious-hub`** (folder `src/themes/curious-hub`, `LocalThemeKey`
  value `'curious-hub'`, `themeRegistry` key `'curious-hub'`, `Tenants.theme` enum value
  `'curious-hub'`) — retained because it's already threaded through the theme registry,
  `LocalThemeKey` union, and (once created) the Tenant row's `theme` field; renaming it is a
  cosmetic-only change with no safety benefit, explicitly discouraged by the brief. **This
  section is the documented record of that retained legacy key.**
- **New Tenant DB row**: `slug: 'curious-ladoo'`, `name: 'Curious Ladoo'`, `theme: 'curious-hub'`,
  `type: 'hospitality'`, `isActive: true`, `isPrimary: true` (marks it the semantic default —
  currently unused by the resolver, kept true for future-proofing/documentation purposes only).
  `domains: []` initially (production domain added later).
- **Default localhost routing** (`resolveLocalSite.ts`): `localhost`, `127.0.0.1`, `::1` move
  from `gheeRoastSite` to `curiousHubSite`; add `curious-ladoo.localhost` / `curious-ladoo.local`
  as additional aliases pointing at the same site object; keep `curious-hub.localhost` /
  `curious-hub.local` working too (backward compatible, low cost to leave in). `ghee-roast.*` and
  `zuru-zuru.*` entries are untouched.
- **`DEFAULT_TENANT_SLUG`** (env, drives `resolvePublicTenantID` for Payload API/local-dev
  access-control scoping) moves from `ghee-roast` to `curious-ladoo` to stay consistent with the
  new default-tenant page-rendering behavior.

---

## 3. Frontend/backend contract matrix

Status legend: 🔴 hardcoded · 🟡 schema exists, not mapped · 🟢 already dynamic (local data, to be
re-pointed at CMS) · ⚪ missing backend model (new collection/block needed) · 🔵 duplicated source

### Home
| Section | Current component | Static source | CMS source | Status |
|---|---|---|---|---|
| Hero | inline | none (hardcoded) | `heroBlock` | 🔴 |
| Brands ticker | `Ticker` | page-local array | new `tickerBlock` → `Brands` | 🔴⚪ |
| About | inline | none (hardcoded, dead `homeData.aboutSection`) | `richtextBlock`/`splitBlock` | 🔴 |
| Philosophy pillars | inline | none (dead `homeData.philosophyPillars`) | `contentgridBlock` | 🔴 |
| Services preview | inline | none (dead `homeData.servicesPreview`) | new `Services` collection + `cardgridBlock` | 🔴⚪ |
| Brands grid | inline | none (dead `homeData.brandsGrid`) | `Brands` collection block | 🔴⚪ |
| B2B cards | inline | none (dead `homeData.b2bCards`) | `contentgridBlock` | 🔴 |
| How We Build | inline | `homeData.processSteps` | `stepsBlock` | 🟡 |
| Our Edge | inline | `homeData.edgePoints` | `contentgridBlock` | 🟡 |
| Metrics | `AnimatedCounter` | `homeData.metrics` | `statsBlock` | 🟡 |
| Visual Story | inline | none (hardcoded) | `splitBlock`/`richtextBlock` | 🔴 |
| Industries | inline | `homeData.industries` | `contentgridBlock` | 🟡 |
| Testimonials | inline | `homeData.testimonials` (dup) | `testimonialsBlock` → `Testimonials` | 🟡🔵 |
| Journal preview | inline | `homeData.journalArticles` (dup of `blog.ts`) | `blogpreviewBlock` (needs real impl) → `BlogPosts` | 🟡🔵 |
| Leadership | inline | `homeData.leadershipTeam` (dup of `about.ts`) | `teamBlock` → `TeamMembers` | 🟡🔵 |
| Journey | inline | `homeData.journeyMilestones` (dup of `about.ts`) | `stepsBlock` | 🟡🔵 |
| Partners | inline | `homeData.partners` | `cardgridBlock` | 🟡 |
| CTA | inline | none (dead `homeData.cta`) | `ctaBlock` | 🔴 |

### About
Hero → `heroBlock` 🔴 · Story → `richtextBlock` 🟢 · Mission/Vision → `splitBlock` 🟢 · Values →
`contentgridBlock` 🟢 · Leadership → `teamBlock`→`TeamMembers` 🟢🔵 · Journey → `stepsBlock`
🟢🔵 · CTA → `ctaBlock` 🟢

### Services
Hero → `heroBlock` 🟢 · Overview → `richtextBlock` 🟢 · 4 service detail blocks → `splitBlock`
(repeatable) 🟢, cross-referencing new `Services` collection ⚪ · Advantage grid →
`contentgridBlock` 🟢 · FAQ accordion → `faqBlock`→`FAQs` (page-scoped) 🟢 · CTA → `ctaBlock` 🟢

### Brands
Hero → `heroBlock` 🟢 · Brand spotlights → new `Brands` collection ⚪ (optionally
`tenant`-relationship-linked to Ghee Roast/Zuru Zuru) · Future/Collaborations → `splitBlock` 🟢 ·
CTA → `ctaBlock` 🟢

### Portfolio
Hero → `heroBlock` 🔴 (fix missing-image bug) · Filter bar → derived from new `Portfolio`
collection's `category` field, not hardcoded labels ⚪ · Grid → new `Portfolio` collection ⚪ ·
Before/After showcase → `splitBlock`/`galleryBlock` 🔴 · CTA → `ctaBlock` 🔴

### How We Work
Hero → `heroBlock` 🟢 · Timeline (5 steps) → `stepsBlock` 🟢 · Lifecycle/stat box → `statsBlock`/
`splitBlock` 🟢 · CTA → `ctaBlock` 🟢

### Testimonials
Hero → `heroBlock` 🟢 · Grid → `testimonialsBlock`→`Testimonials` 🟢 (currently local array,
duplicate of Home's) · CTA → `ctaBlock` 🔴

### Careers
Hero → `heroBlock` 🟢 · Open positions → new `Careers` collection ⚪ · Values → `contentgridBlock`
🟢 · CTA → `ctaBlock` 🔴 (currently a raw mailto, needs `linkField`)

### FAQs
Hero → `heroBlock` 🟢 · Accordion → `faqBlock`→`FAQs` 🟢 · CTA → `ctaBlock` 🔴

### Contact
Hero → `heroBlock` 🟢 · Info cards (general/hours) → `SiteSettings` contact group 🟢 · Locations
(currently hardcoded New Delhi/Mumbai/Tokyo/Dubai) → `Locations` collection 🔴 · Contact form →
`formBlock`→`ContactSubmissions` (currently pure `alert()`) 🔴 · Map → `locationsBlock`
(`showMap`) 🔴 · FAQ accordion → `faqBlock` 🟢

### Blog / Journal
Hero → `heroBlock` 🟢 · Featured article → `BlogPosts` (`featured` flag) 🟢 · Articles grid →
`BlogPosts` 🟢 (currently local array) · Newsletter → `newsletterBlock` (currently `alert()`) 🔴 ·
Index/detail routing needs reconciling with existing `src/app/(app)/blog/*` routes ⚪

### Global chrome
Header/Nav → `Nav` collection 🟢 (currently `data/navigation.ts`) · Footer → `Footer` collection
🟢 (currently `data/footer.ts` + `data/site.ts`, with one dead unused array) · Page loader,
custom cursor, noise overlay, scroll reveal, back-to-top → presentation-only, **no CMS source
needed**, must be preserved exactly as-is.

---

## 4. Progress table

| # | Milestone | Schema | Loader | Mapper | Renderer | Design | Validation | Test | Result |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Audit | – | – | – | – | – | – | – | ✅ Done (this doc) |
| 2 | Brand rename + default routing | – | – | – | ✅ | ✅ | – | ✅ | ✅ Done — see §6 |
| 3 | Site Settings, Nav, Footer | ✅ | – | – | – | – | ✅ | ✅ | ✅ Done — see §7 |
| 4 | Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §7 |
| 5 | About | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §8 |
| 6 | Services | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §9 |
| 7 | Brands | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §10 |
| 8 | Portfolio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §11 |
| 9 | How We Work | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §12 |
| 10 | Testimonials | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §13 |
| 11 | Careers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §14 |
| 12 | FAQs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §15 |
| 13 | Contact | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §16 |
| 14 | Blog/Journal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §17 |
| 15 | SEO | – | – | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §18 |
| 16 | Final design parity | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 17 | Regression testing | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |

---

## 5. Milestone 2 record — brand rename + default routing

- Renamed the displayed brand text "Curious Laddoos" → "Curious Ladoo" (and
  `curiousladdoos.com`/social handles → `curiousladoo`) across every `src/themes/curious-hub/**`
  file and the shared `(app)` layout default metadata title (22 files, mechanical find/replace,
  verified with `git diff --stat` — no structural changes). Internal identifiers (`curious-hub`
  folder, `LocalThemeKey`, theme registry key) intentionally left untouched per §2.
- `src/lib/site/resolveLocalSite.ts`: `localhost` / `127.0.0.1` / `::1` now resolve to
  `curiousHubSite` (was `gheeRoastSite`); added `curious-ladoo.local` / `curious-ladoo.localhost`
  as additional aliases alongside the existing `curious-hub.local` / `curious-hub.localhost`.
  `ghee-roast.*` and `zuru-zuru.*` entries untouched.
- `tests/ghee-roast-hostname.test.ts` updated: bare-localhost hosts moved out of the Ghee Roast
  assertion list into a new "Curious Ladoo default tenant" test covering `localhost`,
  `127.0.0.1`, `::1`, and all `curious-hub.*`/`curious-ladoo.*` aliases. Ghee Roast's own
  dedicated-hostname assertions are unchanged and still pass.
- **Deliberately deferred to Milestone 3** (bundling avoids a broken intermediate state): adding
  `'curious-hub'` as a `Tenants.theme` Postgres enum option, creating the actual Curious Ladoo
  `Tenant` row, and moving `DEFAULT_TENANT_SLUG` from `ghee-roast` to `curious-ladoo`. Until that
  lands, Payload's public-API tenant resolution (`resolvePublicTenantID`) still defaults to Ghee
  Roast on bare localhost — this only affects authenticated/API tenant-scoping, not the static
  page-rendering path exercised by this milestone (Curious Hub theme has zero Payload calls
  today).
- Verified: `npm run typecheck` clean. `tests/ghee-roast-hostname.test.ts` (5/5),
  `tests/ghee-roast-routing.test.ts` (8/8) pass. `tests/development-content.test.ts` has one
  pre-existing unrelated failure (`scripts.dev` string assertion out of date vs `package.json`,
  present at `HEAD` before this branch's work) — not caused by this milestone.

## 6. Milestone 3 record — Site Settings, Nav, Footer, SEO, and the Curious Ladoo tenant

**Schema change (additive, reviewed, applied):**
- `src/collections/Tenants.ts`: added `{ label: 'Curious Ladoo', value: 'curious-hub' }` to the
  `theme` select field's options.
- Migration `20260805_064839_curious_ladoo_tenant_theme` (generated via
  `npx payload migrate:create`, reviewed by hand before applying): UP is a single
  `ALTER TYPE "public"."enum_tenants_theme" ADD VALUE 'curious-hub';` — purely additive, no
  existing rows touched. DOWN reverts the enum to `('ghee-roast', 'zuru-zuru')` and will fail
  loudly (by design — Payload's generated pattern) if any row still uses `'curious-hub'` at
  rollback time, rather than silently corrupting data.
- **Migration safety steps actually performed**: `payload migrate:status` (7/7 previously applied,
  clean) → recorded before-counts and a JSON row snapshot of the `tenants` table (no `pg_dump`
  binary available in this environment, documented as a limitation) → `migrate:create` → manually
  read the generated SQL → applied via `payload migrate` → re-verified the enum and
  `payload_migrations` table → re-checked all 8 row counts (`tenants, site_settings, nav, footer,
  seo, pages, media, users`) were unchanged before vs. after the schema step. The `payload migrate`
  CLI prompts once for confirmation whenever a historical `{name:"dev", batch:-1}` marker exists in
  `payload_migrations` (present in this DB from before the migration workflow was formalized) — I
  read the Payload/drizzle source (`node_modules/@payloadcms/drizzle/dist/migrate.js`) to confirm
  this prompt only filters that marker row for batch numbering and does not itself run any
  destructive SQL, before answering it.
- **Discovered this DB already has ~11 leftover "Test Tenant A/B" rows** from earlier, apparently
  incomplete `tests/security/*` runs (unrelated to this branch, present before this session). Left
  untouched per the "do not delete tenants" rule.

**Curious Ladoo tenant + content records (created via Local API, idempotent seed):**
- `src/seed/curiousLadoo.ts` (`seedCuriousLadooContent`) + `scripts/seed-curious-ladoo.ts` +
  `npm run db:seed:curious-ladoo`, modeled directly on the existing
  `src/seed/development.ts`/`scripts/seed-development-data.ts` pattern: find-by-slug/tenantId,
  update if present, create if not — safe to re-run, never duplicates.
- Creates: **Tenant** (`slug: curious-ladoo`, `name: Curious Ladoo`, `theme: curious-hub`,
  `isActive/isPrimary: true`, branding colors pulled from the theme's actual CSS tokens
  `--ch-primary #C46A3A` / `--ch-accent #D4845A` / `--ch-bg #F8F5F0`, typography from the theme's
  Google Fonts). **Site Settings** (business name/tagline/description/address, WhatsApp number,
  3 social links with real URLs from `data/site.ts`, newsletter copy). **Nav** (7 top-level links
  matching `data/navigation.ts`'s top-level items — `type: internal` + raw `url`, the same pattern
  the existing Ghee Roast seed uses; megaMenu sub-items were **not** carried over because Payload's
  `megaMenu` block requires real Page relationships and no Curious Ladoo Pages exist yet — revisit
  once Milestone 4+ creates them, documented here as a known simplification, not silent data loss).
  **Footer** (4 columns — Company/Brands/Services/Partner — with real internal-path/anchor URLs
  from `data/footer.ts`; `bottomLinks` left empty because the source data's Privacy/Terms/Sitemap
  links were `href="#"` placeholders that fail `validateSafeURL`, and no legal pages exist yet).
  **SEO** (title pattern, description, keywords, OG/Twitter site name).
- Verified by reading the actual Postgres rows back (not just trusting the script's return value):
  site_settings, nav links (all 7, correct order), footer columns (all 4, correct nested links,
  and confirmed Ghee Roast's own footer columns were untouched in the same table), and SEO row all
  match exactly what was written. Row counts: tenants 14→15, site_settings 5→6, nav 3→4, footer
  1→2, seo 1→2 — each +1 as expected, nothing else moved.

**Bug fixed (pre-existing, blocking):** `scripts/register-ts-loader.mjs` was missing the
`/index.ts` resolution fallback that `tests/register-ts-loader.mjs` already had, so any script run
via `node --experimental-strip-types --import ./scripts/register-ts-loader.mjs` (i.e. `db:seed:dev`,
`db:reset:dev`, and the new `db:seed:curious-ladoo`) could not resolve directory-style imports like
`../blocks` (→ `src/blocks/index.ts`) and crashed with `ERR_MODULE_NOT_FOUND`. Fixed by mirroring
the working test-loader fallback chain. This was broken before this branch and blocked the existing
dev-seed scripts too, not just the new one.

**Known tooling quirk (not a bug I introduced, documented for future scripts):** Local API scripts
that call `payload.db.destroy?.()` directly can hang on process exit due to a documented
`@payloadcms/db-postgres@3.86` issue (a bootstrap client checked out in `connectWithReconnect` is
never released) — `tests/security/fixtures.ts`'s `shutdownPayload()` already has a workaround
(manually releasing idle-tracked clients before `pool.end()`). `scripts/seed-curious-ladoo.ts`
completed all its actual writes successfully in both attempts (verified against Postgres directly)
but hung after — the process was killed after confirming the data had landed correctly rather than
waiting indefinitely. Future scripts in this codebase should adopt the same `shutdownPayload()`
pattern; not applied here to keep this milestone's diff scoped to what was asked.

**Pre-existing, unrelated test-suite finding:** `npm run test:security` currently fails across
every stage that uses the shared `tests/security/fixtures.ts` helper (`setupSecurityFixtures`).
Root cause: fixture tenant/user names are built as `` `Tenant A Active ${deterministicId()}` ``
where `deterministicId()` embeds digits (e.g. `stage24-isolation-concurrency-1`), but
`SAFE_NAME_PATTERN` in `src/validation/shared.ts` (`/^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u`) rejects
any digit anywhere in a tenant name. This affects `tenants.name` validation
(`src/hooks/validateTenantIdentity.ts`) for every stage, confirmed via `git diff` that neither
`tests/security/fixtures.ts`, `src/validation/shared.ts`, nor `validateTenantIdentity.ts` were
touched by this branch — the entire security suite is broken at the base of
`feature/curious-ladoo-dynamic`, independent of this work. Left unfixed as out of scope for this
milestone; flagging clearly rather than silently reporting the suite as passing.

**Verified:** `npm run typecheck` clean. `npm test` (authorization, phase1, phase2,
development-content, ghee-cms) — all pass except the same pre-existing unrelated `dev` script
string assertion noted in Milestone 2. `npm run test:ghee-cms` run standalone: 40/40 pass — Ghee
Roast fully unaffected by the tenant/enum/loader changes.

## 7. Milestone 4 record — Home Page (loader, mapper, renderer, seed)

**Schema (all additive, no rows lost):**
- New `Brands` collection (name, slug, mark, category, descriptions, quote/stats, image/logo/gallery,
  optional `tenant` link, external links, colors, enabled/featured/comingSoon/sortOrder).
- 3 new blocks: `tickerBlock`, `storyBlock` (panel/overlay narrative layouts), `brandsshowcaseBlock`.
- Additive extensions: `contentgridBlock` (presentation variant, optional `mediaField()` companion
  image, per-item link), `statsBlock` (animated counter target/suffix), `stepsBlock` (numbered vs.
  timeline variant), `blogpreviewBlock` fleshed out from a stub (kept legacy `title`/`subtitle`
  hidden fields to avoid a rename-ambiguity migration prompt).
- One schema defect found and fixed mid-milestone, per the "stop and report" instruction: shared
  `mediaField()` hardcoded its inner `item` relationship `required: true` with no override, which
  is fine for its two existing callers (Split.ts, cardItem.ts) but wrong for ContentGrid's
  *optional* companion image (5 of 6 Home grid presentations have no image at all). Fixed by adding
  an opt-in `required` parameter to `mediaField()`, defaulting to `true` so existing callers are
  unaffected. **No migration needed** — confirmed via `information_schema` that
  `media_item_id` was already nullable in Postgres; `required: true` was only ever enforced at
  Payload's application layer for that field, not as a DB constraint.
- Migration `20260805_084729_curious_ladoo_home_blocks` (regenerated once, after that fix, so it
  matches the final schema) — reviewed and applied: 18 new tables, 16 new enum types, 97 additive
  columns, 52 FK constraints, zero destructive statements, DOWN exactly symmetric. Applied; all
  Ghee-Roast-populated table row counts unchanged before/after.

**`resolveLocalSite.ts` bug fixed:** `curiousHubSite.key` was `'curious-hub'`, which never matched
the real seeded `Tenant.slug` (`'curious-ladoo'`) — unlike Ghee Roast/Zuru Zuru where `key` already
equals their tenant slug. This silently broke both the new loader's tenant lookup and Payload's own
`resolvePublicTenantID` access-control path. Fixed the `key` value only; `theme` stays `'curious-hub'`.

**Pipeline:** `src/lib/site/curiousLadooContentCore.ts` (tenant-safe, published-only, dependency-aware
loader, typed `find<TDoc>` generic instead of `Record<string, unknown>`) → `getCuriousLadooContent.ts`
(React `cache()` wrapper) → `src/themes/curious-hub/mappers/cmsContent.ts` (strongly-typed mapper
using generated Payload types, tenant-checked per relationship, raw/populated Media both handled) →
`src/themes/curious-hub/components/CMSHomePage.tsx` (18-section renderer reusing the exact original
JSX/CSS Module classes) → wired into `CuriousHubPageRenderer.tsx`: **only** `/` goes through the CMS
pipeline; every other Curious Hub route is byte-for-byte the pre-Milestone-4 static path. `Header`/
`Footer`/`CuriousHubLayout` now accept optional CMS props with the static data as the fallback when
omitted, so non-Home pages are provably unaffected.

**Seed:** `src/seed/curiousLadooHome.ts` + `npm run db:seed:curious-ladoo-home` — idempotent
(find-or-create/update throughout), uploads the theme's existing static images into Payload Media
(dedup'd by `(tenantId, title)`; discovered and fixed a real collision where `journal1.png` is
reused for two logical purposes in the original design — now uploaded once, referenced twice),
creates 4 Brands (Zuru Zuru → real Zuru Zuru tenant, Ghee Roast → real Ghee Roast tenant, Z-Quick
and Future Brands standalone), 3 Testimonials, 3 Team Members, 3 Blog Posts, and the Home Page
record itself (18 blocks, exact designer order, `pageType: home`, `isHomePage: true`,
`_status: published`).

**Verified live** against the running dev server (not just unit tests): `/` → 200 with real CMS
content across every section (hero, ticker, philosophy, services, brands, b2b, process, edge,
metrics, visual story, industries, testimonials, journal, leadership, journey, partners, CTA all
confirmed present in the HTML), correct `<title>` from CMS SEO data, `/about` → 200 unchanged
static content, `ghee-roast.localhost` → 200 unchanged, `zuru-zuru.localhost` → 200 unchanged,
`/admin` → 200, unknown slug → 404, unknown hostname → 404.

**Tests:** new `tests/curious-ladoo-home.test.ts` (16/16 pass) plus a real bug it caught — the
loader trusted the DB `where` clause alone for published/tenant filtering with no application-level
re-check (unlike Ghee Roast's `isPublishedPageDocument` pattern); fixed to re-verify both in code.
Also fixed a pre-existing gap in `tests/register-ts-loader.mjs` discovered while testing (missing
`.tsx` resolution attempt) but reverted that specific change since Node's `--experimental-strip-types`
cannot execute JSX regardless of resolution — documented as a hard limitation, not something fixable
via the loader hook; the one test needing it was replaced with the live-server proof above.

**Full verification:** `typecheck` clean · `test:ghee-cms` 40/40 · `test:authorization` 23/23 ·
`test:phase1` 11/11 · `test:phase2` 11/11 · `test:development-content` 11/12 (same pre-existing
unrelated failure noted in Milestones 2–3) · `lint` 0 errors introduced (1 pre-existing error in
`scripts/gen-migration.cjs`, untouched by this branch) · `npm run build` succeeds · `git diff --check` clean.

## 8. Milestone 5 record — About Page (loader, mapper, renderer, seed)

**Schema (additive only):**
- `storyBlock.layout` gained a third option, `'simple'` — the inner-page treatment used by About's
  Story section (no eyebrow/quote/CTA/stat badge, supports a two-paragraph `body` split on a blank
  line, `innerSection`/`aboutStoryGrid` CSS classes instead of Home's `aboutSection`). All fields
  previously gated to `layout === 'panel'` (title, accentPhrase, body, media row, imagePosition)
  were widened to `layout !== 'overlay'` so `'simple'` gets them too; `statBadge`/`enableCta`/`cta`
  stayed `'panel'`-only since `'simple'` doesn't use them.
- `contentgridBlock.presentation` gained `'values'` (centered header, numbered value cards —
  About's Values section) and `'mission-vision'` (media + two titled sub-items — About's
  Mission & Vision section). Both were actually added to the block schema in earlier work this
  session but their migration had never been generated/applied — discovered when regenerating
  types produced a migration touching both this and the `storyBlock.layout` enum together.
- Migration `20260805_105546_curious_ladoo_about_story_layout` — reviewed and applied. UP is 6
  `ALTER TYPE ... ADD VALUE` statements (3 enum values × live table + `_pages_v` versions table),
  zero drops/renames on the up path. Presented to the user for explicit approval before applying,
  per this branch's standing migration-approval practice; approved and applied.

**Pipeline reuse vs. new work:** most of About's sections needed no new code at all — reading the
static `AboutPage.tsx`/`data/about.ts` against the Home renderer already built in Milestone 4
showed several sections are pixel-identical, self-contained components already:
- **Leadership** → `teamBlock` + `TeamSection` (same 3 team members already seeded in Milestone 4,
  reused via `members: [], limit: 3`, not re-created).
- **Journey** → `stepsBlock` (`layoutVariant: 'timeline'`) + `StepsTimeline` — own `journeySection`
  wrapper, unaffected by which page it's on.
- **CTA** → `ctaBlock` + `CTASection` — the `bgWord` decorative text is already derived generically
  from `siteName.split(' ')[0]`, which resolves to "CURIOUS" for the Curious Ladoo tenant exactly
  as the static page hardcoded it. No changes needed.
- **Hero** → needed a pageType-aware dispatch (new): `CMSHomeBlock` now takes `pageType` and
  renders `InnerHeroSection` (matches `Shared.tsx`'s `InnerHero` markup) for any non-`'home'` page
  instead of the Home-only composite hero.
- **Story, Values, Mission & Vision** → genuinely new renderer components (`StorySimpleSection`,
  `ValuesGrid`, `MissionVisionGrid`) since these sections' markup/CSS classes don't match any
  existing Home presentation.

**Pipeline:** loader/mapper required no changes beyond `pageType` threading (done in earlier work
this session) — `curiousLadooContentCore.ts`'s page resolution was already generic (`{slug:{equals:
...}}` for any non-root pathname), so `/about` worked immediately once a Page record with
`pageType: 'about'`, `slug: 'about'`, `isHomePage: false` existed.

**Real bug found and fixed (defense in depth):** the loader's application-level re-check after the
DB query only re-verified tenant ID and publish status, not that the resolved page's
`slug`/`isHomePage` actually matched the requested pathname — it trusted the query's `where` clause
alone for that condition, the same class of gap fixed for publish-status in Milestone 4. Caught by
a new test whose fake `find()` (correctly) doesn't simulate `where`-clause filtering. Fixed in
`curiousLadooContentCore.ts`: the `publishedTenantPages` filter now also re-checks
`isHomePage`/`slug` against `normalizedPathname` in application code, not just the query.

**Routing:** `CuriousHubPageRenderer.tsx`'s Home-only `if (normalizedPathname === '/')` became a
`CMS_DRIVEN_PATHS` set (`'/'`, `'/about'`), exported and reused by `page.tsx`'s `generateMetadata`
so CMS-driven paths get `getCuriousLadooMetadata` (already page-generic, no changes needed) and
every other path keeps the static registry metadata. All other Curious Hub routes are untouched.

**Seed:** `src/seed/curiousLadooAbout.ts` + `npm run db:seed:curious-ladoo-about` — idempotent,
uploads 3 new images (`banner_about.png`, `team_about.png`, `office_tokyo.png`, dedup'd by
`(tenantId, title)`), creates the About Page record (7 blocks in exact designer order: hero, story,
mission-vision, values, leadership, journey, cta; `pageType: 'about'`, `slug: 'about'`,
`isHomePage: false`, `_status: 'published'`). Depends on the Milestone 4 Home seed having already
run (reuses its 3 Team Members) and fails loudly with a clear message if it hasn't.

**Verified live** against the running dev server (the user's own instance on port 3000 — did not
start a competing one): `curious-hub.localhost/about`, `curious-ladoo.localhost/about`, and bare
`localhost/about` all → 200 with real CMS content (every section's copy present in the HTML: hero
heading, story paragraphs, mission/vision sub-headings, all 3 value cards, all 3 leadership names,
all 5 journey years, CTA title with the `<br/>`+italic split rendering exactly as the static markup
did, both CTA buttons with their static arrow suffixes intact). Confirmed the Home-only hero CSS
classes (`t3Headline`, `heroSection`) are absent and `innerHero*` classes are present, proving the
`pageType` dispatch actually took effect. `ghee-roast.localhost/` → 200 unchanged,
`curious-hub.localhost/services` (still-static) → 200 unchanged, unknown route → 404.
**Noted, not fixed (out of scope — Milestone 15/SEO):** the `<title>`/description shown for
`/about` currently come from the tenant-wide SEO global (title pattern + description), not the
Page's own `metaTitle`/`metaDescription` fields — this is pre-existing behavior shared by every
CMS-driven page including Home, not something introduced or regressed here.

**Tests:** new `tests/curious-ladoo-about.test.ts` (9 tests, all pass) covering slug-based page
resolution (published/draft/wrong-slug), the `isHomePage`-true-on-a-non-root-path edge case that
caught the defense-in-depth gap above, the `'simple'` Story layout mapping, the `'values'`/
`'mission-vision'` presentation mapping, Team block pooling/sorting/limiting, and `pageType`
flowing through the top-level mapper. `tests/curious-ladoo-home.test.ts` updated only to fix a
now-stale comment (previously said `/about` stays static; it doesn't anymore) — all 13 of its own
tests still pass unchanged. Combined Home+About suite: 22/22 pass.

**Full verification:** `typecheck` clean (app + tests) · `tests/curious-ladoo-home.test.ts` +
`tests/curious-ladoo-about.test.ts` 22/22 · `test:ghee-cms` 40/40 · `test:authorization` 23/23 ·
`test:phase1` 11/11 · `test:phase2` 11/11 · `test:development-content` 11/12 (same pre-existing
unrelated `dev`-script-string failure noted in every earlier milestone) · `lint`: 0 errors/warnings
introduced (removed one now-unnecessary `eslint-disable` in `CMSHomePage.tsx`; the suite's 1
pre-existing error is in `scripts/gen-migration.cjs`, untouched by this branch) · `npm run build`
succeeds.

## 9. Milestone 6 record — Services Page (loader, mapper, renderer, seed)

**Schema (additive, reviewed, one real defect found and fixed):**
- New block `capabilityBlock` (`src/blocks/Capability.ts`): `sectionHeader()` + a repeatable
  `items[]` array (number, anchorId, title, description, `features[]` checklist, optional link,
  a required per-item image via `mediaField()`, and a `reverse` toggle) — backs the "Core Services
  Deep Dive" section, which has no existing block shape (title/desc/features/image/link repeated
  4x under one shared intro).
- `contentgridBlock.presentation` gained `'benefits'` — a centered-header, plain (non-numbered)
  card grid, distinct from `'values'` only in that it has no number badge.
- Curious Ladoo's existing `faqBlock` + `FAQs` collection support (both already existed in the
  shared catalog for Ghee Roast) — no schema change needed, just new Curious Ladoo mapper/renderer
  support, mirroring the `teamBlock`/`testimonialsBlock` "explicit selection with pool fallback"
  pattern already established.
- **Real schema defect found and fixed, per the "stop and report" rule:** the first migration
  attempt crashed `payload migrate:create` outright (not a DB write — a Postgres identifier-length
  violation caught before touching the database): `enum__pages_v_blocks_servicedetail_block_items_media_aspect_ratio`
  is 65 characters, 2 over Postgres's 63-char `NAMEDATALEN` limit. Root cause: the original block
  slug `servicedetailBlock` combined with nesting the shared `mediaField()` helper *inside* an
  `items` array (adds an `_items_` segment) and the `_pages_v_` versions/drafts shadow-table prefix
  (3 chars longer than the live table's `pages_`). Presented 3 fix options to you (shorten the
  block slug / shorten the nested field name / add enum-name overrides to the shared `mediaField()`
  builder); you chose shortening the slug. Renamed `servicedetailBlock` → `capabilityBlock`
  throughout (block file, `AllBlocks` registry, Curious Ladoo view-model types, mapper, renderer,
  and the Ghee Roast theme-exclusive block list) — zero blast radius since nothing had referenced
  the old name in committed/applied state yet. New enum name is 62 chars (fits, 1 to spare).
- Migration `20260805_160441_curious_ladoo_services` — reviewed and applied: 4 new enum types
  (aspect ratio/object fit × live/versions), 8 new tables (`capabilityBlock` and its nested arrays,
  live + versions), 1 new enum value (`benefits`) on the existing `contentgrid_block_presentation`
  enum × 2, all FKs pointing only at pre-existing tables (`pages`, `media`, and the block's own new
  tables). Zero drops/alterations to any existing data-bearing column on the `up` path.

**Loader:** added `faqs` as a fifth conditional collection dependency in
`curiousLadooContentCore.ts` (`CuriousLadooCollectionSlug`, `CuriousLadooContentResult`,
`collectionDependenciesForLayout` detecting `faqBlock`, and the dependency-gated fetch), following
the exact same shape as `brands`/`testimonials`/`teamMembers`/`blogPosts`. `/services` needed no
page-resolution changes at all — the slug-based lookup already built for `/about` in Milestone 5 is
fully generic.

**Mapper:** `mapCapabilityBlock` (features array flattened to strings, per-item image/link/reverse
mapped) and `mapFAQBlock` (explicit `items` relationship resolved against the fetched pool,
falls back to "all active tenant FAQs" when empty, filtered by tenant + `isActive`, sorted by
`sortOrder`, capped at `limit` — identical shape to `mapTeamBlock`). Both wired into
`mapCuriousLadooLayout`'s switch and the `collections` param threaded through
`mapCuriousLadooHomeContent`.

**Renderer:** `CapabilitySection` (reproduces the "Services Overview Intro" + "Core Services Deep
Dive" as one continuous section, alternating image side via the `reverse` class exactly as the
static CSS already expected), `BenefitsGrid` (new `ContentGridSection` case, reuses `.valuesGrid`/
`.valueCard` without the numbered badge), and a new client component `FAQAccordion.tsx` (single-
open-index accordion state, matching the original `ServicesPage.tsx`'s exact click-to-toggle
behavior) wrapped by a server `FAQSection`. Hero uses the same `pageType !== 'home'` →
`InnerHeroSection` dispatch built in Milestone 5; no new pageType value was added since nothing yet
branches on `'services'` specifically — `pageType: 'generic'` is used for now (documented decision,
not an oversight; add a real `'services'` `CMS_PAGE_TYPES` value later only if something needs to
key off it).

**Routing:** `CuriousHubPageRenderer.tsx`'s `CMS_DRIVEN_PATHS` set extended to `'/services'`
(already shared with `page.tsx`'s `generateMetadata` from Milestone 5's refactor — no separate
metadata wiring needed).

**Seed:** `src/seed/curiousLadooServices.ts` + `npm run db:seed:curious-ladoo-services` —
idempotent, uploads 2 new images (`banner_services.png`, `kitchen_ops.png`) and reuses 3 already
uploaded in Milestone 4 (`zuru_zuru.png`, `consulting.png`, `journal1.png`, deduplicated by
`(tenantId, title)`), creates 3 Services-specific FAQs (explicitly selected by ID in the
`faqBlock`, not left to "show all" — Services' FAQs aren't meant to leak onto a future unrelated
FAQ page), and the Services Page record (5 blocks: hero, capability, benefits, faq, cta;
`pageType: 'generic'`, `slug: 'services'`, `_status: 'published'`). Verified by reading the actual
Postgres rows back, including the `pages_rels` table to confirm the 3 FAQ relationship rows
persisted with the correct `path: 'layout.3.items'`.

**Live verification hit a real environment issue, not a code bug:** the long-running dev server
from prior milestones stopped responding entirely partway through verification — its log showed it
had independently hit the *same* 63-char identifier error (via Payload's dev-mode live schema-push
reacting to the pre-rename code on disk) at some point, which likely left its DB connection pool in
a bad state. The user's laptop was powered off before this could be resolved interactively; once it
came back, the stale dev server process was gone (port 3000 free), Postgres was confirmed reachable
independently, a fresh `npm run dev` was started cleanly, and full live verification then passed on
the first attempt (two initial cold-compile timeouts on first hit, succeeded immediately on retry).

**Verified live** against the fresh dev server across every tenant hostname alias
(`curious-hub.localhost`, `curious-ladoo.localhost`, bare `localhost`): `/services` → 200 with every
section's real content confirmed in the HTML (hero heading, all 4 capability items with their
features and alternating `reverse` class, all 3 benefit cards, all 3 FAQ questions, CTA title with
its exact `<br/>`+space+italic split and both arrow-suffixed buttons). `ghee-roast.localhost/` → 200
unchanged, `curious-hub.localhost/about` → 200 unchanged, `curious-hub.localhost/portfolio`
(still-static) → 200 unchanged, unknown route → 404.

**Tests:** new `tests/curious-ladoo-services.test.ts` (6 tests, all pass) covering slug-based page
resolution, the new `faqs` conditional collection dependency, `capabilityBlock` item mapping
(features/image/link/reverse, including the `enableLink: false` suppression case), the `'benefits'`
presentation pass-through, and both FAQ block modes (explicit selection with sort/filter/limit, and
empty-selection pool fallback). Existing `curious-ladoo-home.test.ts`/`curious-ladoo-about.test.ts`
call sites updated only to add the new required `faqs: []` collections param — no behavioral
changes, all 22 of their own tests still pass unchanged. Combined Home+About+Services suite: 28/28.

**Full verification:** `typecheck` clean (app + tests) · Home+About+Services suite 28/28 ·
`test:ghee-cms` 40/40 (including the block-registry parity test, confirming `capabilityBlock` is
correctly excluded from Ghee Roast's supported list, not rubber-stamped) · `test:authorization`
23/23 · `test:phase1` 11/11 · `test:phase2` 11/11 · `test:development-content` 11/12 (same
pre-existing unrelated `dev`-script-string failure noted in every earlier milestone) · `lint`: 0
errors/warnings introduced (the suite's 1 pre-existing error remains in `scripts/gen-migration.cjs`,
untouched by this branch) · `npm run build` succeeds.

## 10. Milestone 7 record — Brands Page (reuse-first: schema, mapper, renderer, seed)

**Reuse-first outcome:** the `Brands` collection (Milestone 4) already had `fullDescription`,
`quote`, `statValue`, `statLabel`, `links[]`, and a `slug` field explicitly documented as "Used on
the Brands page spotlight section" / "Used for the #anchor on the Brands page" — built ahead of
need in Milestone 4 but never consumed. Zero collection schema changes were required. Only the
Curious Ladoo *mapper* (which hadn't been reading those fields into the view-model) and the
*renderer* (which only had Home's compact-grid presentation) needed extending.

**Schema (additive only):**
- `brandsshowcaseBlock.presentation` gained `'grid'` (existing, now explicit default — Home's
  usage is untouched since the column defaults to `'grid'`) / `'spotlight'` (new — the Brands
  page's full editorial write-up per brand, alternating image side).
- **One new block, justified:** `pipelineBlock` (`src/blocks/Pipeline.ts`) for the "Collaborations
  & Future Projects" section — narrative header + a bulleted list of `{label, description}` items
  + an optional decorative icon/title/description callout box + an optional link. No existing
  block fits this shape: `contentgridBlock`'s single `media` field is a real image relationship,
  which can't represent a decorative icon+text callout box with no actual image; `splitBlock`'s
  `mediaField()` is `required: true` for the same reason; and the list itself (bold label + plain
  description) doesn't match `contentgridBlock.items`' icon/title/description/link shape closely
  enough to reuse without distorting either field's meaning. Registered in the shared `AllBlocks`
  catalog and added to Ghee Roast's `GHEE_ROAST_THEME_EXCLUSIVE_BLOCK_TYPES` (same pattern as
  `capabilityBlock` in Milestone 6) — Ghee Roast has no matching section and must not claim support
  merely to satisfy the block-registry parity test.
- Migration `20260806_051406_curious_ladoo_brands` — reviewed, shown to you, approved, then
  applied: 4 new enum types, 2 new nullable columns on `brandsshowcase_block` (default `'grid'`),
  6 new tables for `pipelineBlock` (live + versions), all FKs pointing only at pre-existing tables.
  Zero drops/alterations to any existing data-bearing column on the `up` path.

**Loader:** no changes. `collectionDependenciesForLayout` already detects `brandsshowcaseBlock` →
fetches `brands`; `pipelineBlock` is fully self-contained (no collection dependency). `/brands`
needed no page-resolution changes — the slug-based lookup built in Milestone 5 is fully generic.

**Mapper:** `mapBrand` extended to also populate `fullDescription`/`quote`/`statValue`/`statLabel`/
`links[]`/`slug` (all pre-existing collection fields, previously unmapped) alongside the fields
Home's grid already used (`category`/`comingSoon`/`description`/`href`/`image`/`mark`/`name`) — one
function now serves both presentations, nothing duplicated. `mapBrandsShowcaseBlock` passes through
the new `presentation` field. New `mapPipelineBlock` mirrors the established
enable-flag-gates-a-group pattern (`storyBlock.statBadge`, `contentgridBlock` items' `enableLink`).

**Renderer:** the existing `BrandsShowcaseSection` was split into a thin presentation dispatcher
plus `BrandsGrid` (renamed, otherwise byte-for-byte the pre-Milestone-7 Home card grid — verified
by test and live check that Home's brand grid still shows unchanged content) and a new
`BrandSpotlightGrid` (reproduces the exact alternating spotlight layout, `reverse` derived from
array index parity rather than a new field since the original data's alternation is always
index-based, filters out `comingSoon` brands defensively since the spotlight is for established
brands only). New `PipelineSection` reproduces the narrative+list+callout layout exactly, reusing
`.aboutStoryGrid`/`.aboutStoryImage` (the same wrapper classes Milestone 5's `MissionVisionGrid`
already established for this "text column beside a boxed callout" pattern) with a hardcoded
`id="future"` anchor — matching the precedent already set by `StorySimpleSection`/`MissionVisionGrid`
(id="story"/"philosophy") for single-use narrative sections, since no block-level `htmlId` wiring
exists anywhere in the renderer yet. Hero reuses the Milestone 5 `pageType !== 'home'` dispatch.

**A genuine content inconsistency was found, not fixed:** the original static `data/brands.ts`
badge for Ghee Roast reads "South Indian Coastal", but the already-seeded (Milestone 4) `Brands`
collection record — shared by Home's grid and now the Brands page's spotlight — has
`category: "South Indian Cuisine"`. This is a pre-existing mismatch between two previously-separate
static data files, now surfaced by unifying them into one CMS record. Per the explicit instruction
not to modify anything Home displays, this was **left as-is** rather than "fixed" toward either
page's wording — the Brands page spotlight badge shows the same "South Indian Cuisine" text Home's
card already shows. Flagging for your decision; changing it is a one-field content edit, not a
schema or code change, whenever you want it.

**Seed:** `src/seed/curiousLadooBrands.ts` + `npm run db:seed:curious-ladoo-brands` — idempotent.
Uploads zero new media (the hero image `visual_story.png` was already uploaded in Milestone 4 for
Home's overlay story section, reused via the standard `(tenantId, title)` dedup). **Partial
`payload.update()` calls** on the 3 existing Brand records (Zuru Zuru/Ghee Roast/Z-Quick) set only
`slug`/`fullDescription`/`quote`/`statValue`/`statLabel`/`links` — verified via direct Postgres
read that every field Home's grid depends on (`category`, `mark`, `enabled`, `featured`,
`comingSoon`, `sortOrder`, `websiteUrl`, `image`) is byte-for-byte unchanged from Milestone 4.
`slug` is set to `zuru`/`ghee`/`quick` (not the collection's name-derived auto-slug, which would
have produced `zuru-zuru`/`ghee-roast`/`z-quick` and broken the `/brands#zuru` etc. anchors already
referenced by Milestone 4's seeded `websiteUrl`s and the static footer). The 3 brands' placeholder
"ig"/"web" links (bare `#` in the original static data, which fails `validateSafeURL`) were seeded
as self-referential `/brands#{slug}` anchors — preserves the visible two-pill layout without
inventing a fake external URL. Creates the Brands Page record (4 blocks: hero, brandsshowcase
[spotlight, limit 3], pipeline, cta; `pageType: 'generic'`, `slug: 'brands'`,
`_status: 'published'`). The spotlight block's `sectionHeader.title` is set to an internal-only
value ("Brand Spotlights") to satisfy the shared `sectionHeader()`'s required-title field — never
rendered, since the original design has no heading above the brand list at all.

**Routing:** `CuriousHubPageRenderer.tsx`'s `CMS_DRIVEN_PATHS` extended to `'/brands'` (shared with
`page.tsx`'s `generateMetadata`, no separate wiring needed).

**Verified live** against the dev server across every tenant hostname alias: `/brands` → 200 with
every section's content confirmed (hero, all 3 spotlight brands with their full descriptions,
quotes, stats, and correct `id="zuru"/"ghee"/"quick"` anchors, "Future Brands" correctly absent
from the spotlight cards — confirmed present only in the unrelated static footer link — pipeline
section with both list items and the ☕ callout box, CTA with its exact `<br/>`+space+italic title
split). `ghee-roast.localhost/` → 200 unchanged. **Home's brand grid re-verified live**: still
shows "South Indian Cuisine" (not "Coastal"), proving the partial-update seed didn't touch it.
`/about`, `/services`, `/portfolio` (static) → 200 unchanged. Unknown route → 404.

**Tests:** new `tests/curious-ladoo-brands.test.ts` (5 tests) covering slug-based page resolution,
`mapBrand`'s new spotlight fields alongside its existing grid fields, the `presentation` default
(`'grid'` when unset — direct regression proof for Home), and `mapPipelineBlock`'s item/link/
spotlight mapping including the disabled-flag suppression case. Combined Home+About+Services+Brands
suite: 33/33 pass (no existing test needed modification — Milestone 7 introduced no new required
mapper parameters, unlike Milestone 6's `faqs`).

**Full verification:** `typecheck` clean (app + tests) · Home+About+Services+Brands suite 33/33 ·
`test:ghee-cms` 40/40 (block-registry parity test confirms `pipelineBlock` correctly excluded) ·
full `npm test` chain passes (same one pre-existing unrelated `dev`-script-string failure noted in
every earlier milestone) · `lint`: 0 errors/warnings introduced (the suite's 1 pre-existing error
remains in `scripts/gen-migration.cjs`, untouched by this branch) · `npm run build` succeeds.

## 11. Milestone 8 record — Portfolio Page (new collection: schema, mapper, renderer, seed)

**Data model decision (stopped and asked before implementing, per your instruction):** the
Portfolio grid has real client-side category filtering, which alone satisfies your stated
collection-creation trigger. Checked both existing candidates first and ruled them out: the
`Gallery` collection has no `description`/CTA/case-study fields and a fixed Ghee-Roast category
enum (food/ambiance/events/kitchen/exterior); `galleryBlock` hardcodes `relationTo: 'gallery'`, and
modifying it to support another source collection would touch a block Ghee Roast already uses.
Presented the full field-by-field design (including what was deliberately excluded — gallery,
metrics, services-delivered, per-item SEO, native drafts — none of which anything in the current
design renders) and got your explicit approval before writing any code.

**New collection — `Portfolio`** (`src/collections/Portfolio.ts`): tenant-scoped, `title`,
`slug` (auto via the same `tenantScopedUnique` pattern as Brands, reserved for a future detail
page, not used for routing yet), `category` (free text, must match a hardcoded filter label —
preserves the original's non-dynamic filter buttons exactly, no redesign), `year`, `description`,
`coverImage`, optional `brand` relationship (inert metadata, mirrors how `Brands.tenant` was added
ahead-of-need), `enableCTA` + shared `linkField()` (optional per-item override; unset falls back to
the exact original hardcoded "Inquire on case → /contact"), `featured`/`enabled`/`sortOrder`
(matching the `Brands`/`FAQs`/`TeamMembers` boolean-visibility convention rather than introducing
native drafts, since no sibling collection uses that pattern).

**New blocks — justified, both reuse-checked first:**
- `portfolioshowcaseBlock`: relationship→`portfolio` (hasMany, optional explicit selection, empty =
  all enabled sorted) + `limit`. `sectionHeader()` present for schema consistency but not
  rendered — the original grid has no heading above it (same established pattern as Milestone 7's
  Brands spotlight).
- `compareBlock`: two symmetric panels (`before`/`after`), each with `badgeLabel` + optional
  `mediaField()` + `placeholderText` (shown when no image is set — reproduces the original's
  literal "Unfinished Concrete Column Shell" text box exactly, while letting either panel become a
  real photo later with zero schema change). Badge accent color is a fixed presentational rule by
  panel position (matches how `reverse` alternation is derived elsewhere, not stored as a toggle).
  **Renamed from the originally-planned `beforeafterBlock`**: that slug pushed the nested
  before-panel media enum name to 64 chars in the `_pages_v` versions table — caught by
  *pre-generation* identifier-length checking this time (learned from Milestone 6's incident),
  before ever running `migrate:create`. `compareBlock` leaves 3 chars of margin.

Both new blocks registered in the shared `AllBlocks` catalog and immediately added to
`GHEE_ROAST_THEME_EXCLUSIVE_BLOCK_TYPES` — Ghee Roast has no case-study or before/after-comparison
concept, and must not claim support merely to satisfy the block-registry parity test. Zero existing
block schema was modified this milestone (unlike Milestones 6–7).

**Schema/migration** (`20260806_060607_curious_ladoo_portfolio`) — reviewed with a full
programmatic identifier-length scan before showing you the SQL: zero `CREATE TABLE`/`CREATE TYPE`
identifiers over 63 chars (max 39/60 respectively — those hard-fail if exceeded, confirmed by the
clean `migrate:create` run). Found 4 **foreign-key constraint names** over 63 chars
(`settings_background_image_id` combined with the longer new table names); verified empirically in
a rolled-back throwaway transaction against the real database that Postgres silently truncates
these without error and with zero collision risk (each is scoped to a different table) — cosmetic
only, not a blocker, and very likely already true of other long pre-existing block names in this
schema. 8 enums, 9 new tables, 3 new nullable columns on Payload's shared relationship-join tables,
zero DROP/DELETE/TRUNCATE on the `up` path. Captured before/after row counts for every relevant
table (including Ghee Roast's own page count) and confirmed byte-for-byte unchanged post-apply.
Shown to you and approved before applying, per your explicit instruction.

**Loader:** `portfolio` added as a 6th conditional collection dependency in
`curiousLadooContentCore.ts`, gated on `portfolioshowcaseBlock` presence — identical shape to
`brands`/`testimonials`/`teamMembers`/`blogPosts`/`faqs`. `/portfolio` needed no page-resolution
changes — the generic slug-based lookup already handles it.

**Mapper:** `mapPortfolioItem`/`mapPortfolioShowcaseBlock` (explicit-selection-with-pool-fallback,
identical shape to `mapTeamBlock`/`mapFAQBlock`) and `mapCompareBlock`/`mapComparePanel`. Both use
the generated Payload types (`Portfolio`, `PortfolioShowcaseBlock`, `CompareBlock`) throughout.

**Renderer:** new client component `PortfolioFilterGrid.tsx` (the interactive category-filter
state, reproducing the exact 4 hardcoded filter buttons and per-card "eager for first 3, lazy after"
image-loading behavior from the original) — `SmartLink` was exported from `CMSHomePage.tsx` for
reuse here rather than duplicated, per your explicit "reuse SmartLink" instruction.
`PortfolioShowcaseSection` (server wrapper, no heading rendered) and `CompareSection` +
`ComparePanelView` reproduce the Before/After section's exact layout, including the literal inline
placeholder-box styling (`#8A8680` background, Courier Prime monospace) when no image is set. No
Ghee Roast CSS or components were referenced anywhere.

**A byte-level rendering detail investigated and confirmed intentionally preserved:** the original
hero title `'Case Studies &\nTurnkey Launches'` contains a literal `\n`, but `.innerHeroTitle` has
no `white-space: pre-line` — so both the original static page and this CMS renderer collapse it to
a single space in the browser (`InnerHeroSection`'s `<h1>{heading}</h1>` has no special handling,
byte-for-byte matching `Shared.tsx`'s `InnerHero`). Seeded the literal `\n` anyway for source-data
fidelity; confirmed via the live server's raw payload that both the source string and the rendered
behavior match the pre-migration original exactly. Separately, the CTA title
`'Want to Turnaround Your\nRestaurant Business?'` was seeded **without** a trailing space after the
`\n` (unlike Services'/Brands'/About's CTAs) — the original Portfolio CTA uses plain JSX
(`Your<br /><em>`) with no space, not the `dangerouslySetInnerHTML` string-concatenation pattern
the other pages use (which always inserts one) — verified this reproduces the exact no-space output
via the existing `renderHeading`/`withLineBreaks` helpers with no code changes needed.

**Seed:** `src/seed/curiousLadooPortfolio.ts` + `npm run db:seed:curious-ladoo-portfolio` —
idempotent (find-by-title-then-update-or-create for all 6 Portfolio items, find-by-slug for the
Page). Uploads 2 new images (`culinary_art.png`, `t2_interior.png`) and reuses 5 already uploaded
in earlier milestones (`zuru_zuru.png`, `ghee_roast.png`, `zquick.png`, `consulting.png`,
`visual_story.png`), all deduplicated by `(tenantId, title)`. Never touches Users or Tenants.
Reports created/updated/skipped counts for media, portfolio items, and the page.

**Record counts (verified via direct Postgres read after seeding):** 6 Portfolio items created
(sort order 0–5, matching the original array order exactly), 1 Page created (`slug: 'portfolio'`,
4 blocks: hero → portfolioshowcase → compare → cta), 2 new Media rows created, 5 reused.

**Routing:** `CuriousHubPageRenderer.tsx`'s `CMS_DRIVEN_PATHS` extended to `'/portfolio'` (shared
with `page.tsx`'s `generateMetadata`).

**Live-verified** against the dev server across every tenant hostname alias: `/portfolio` → 200
with every section's content confirmed (hero, all 6 case-study cards, all 4 filter button labels,
all 6 cards correctly using the default "Inquire on case" fallback since none override it, the
Before/After section with its exact placeholder-box styling and the real Ghee Roast image on the
"After" panel, CTA with its exact no-space `<br/>`+italic split and both buttons).
`ghee-roast.localhost/`, Home, `/about`, `/services`, `/brands` → 200 unchanged.
`/how-we-work` (still-static) → 200 unchanged. Unknown route → 404. `/admin` → 200 unaffected.
Zuru Zuru carries no Payload-backed code at all, so it is unaffected by construction, not by
omission — confirmed no file under any Zuru Zuru path was touched.

**Tests:** new `tests/curious-ladoo-portfolio.test.ts` (10 tests) covering published/draft
visibility, the conditional `portfolio` collection dependency, empty-block handling, sortOrder +
enabled filtering + limit, cover-image and CTA-link relationship safety (raw ID, populated, missing,
cross-tenant), explicit-selection resolution (raw + populated + cross-tenant exclusion), the Compare
block's placeholder-vs-image panel logic, layout ordering, and the no-static-fallback source check.
Existing test files needed only the same mechanical `portfolio: []` addition to their
`mapCuriousLadooLayout`/`mapCuriousLadooHomeContent` fixture objects that Milestone 6's `faqs`
addition required — no behavioral changes. Combined Home+About+Services+Brands+Portfolio suite:
43/43 pass.

**Full verification:** `typecheck` clean (app + tests) · combined Curious Ladoo suite 43/43 ·
`test:ghee-cms` 40/40 (block-registry parity test confirms both new blocks correctly excluded) ·
full `npm test` chain passes (same one pre-existing unrelated `dev`-script-string failure noted in
every earlier milestone) · `lint`: 0 new errors/warnings (the suite's 1 pre-existing error remains
in `scripts/gen-migration.cjs`, untouched; the new migration file's `payload`/`req` unused-var
warning is Payload's own generator boilerplate, present in all 11 migration files, not unique to
this one) · `npm run build` succeeds · `git diff --check` passes (only informational CRLF/LF
advisories, zero actual whitespace errors).

## 12. Milestone 9 record — How We Work Page (reuse-first: extend two existing blocks, zero new blocks/collections)

**Data model:** both sections are simple page-local repeated cards (no cross-page reuse, filtering,
featured selection, or detail routing) — squarely "Data Model A," not a new collection. Given no
new collection was needed, this milestone didn't hit the "stop and ask" trigger from Milestone 8's
brief; proceeded directly, still gating the migration on your approval as always.

**Timeline section → extended `stepsBlock`** (`src/blocks/Steps.ts`): added an optional per-step
`media` field (`mediaField()`, `required: false`) and a new `layoutVariant` option,
`'visual-timeline'`. The alternating left/right layout needed **no new data field at all** — it's
driven entirely by `:nth-child(even)` CSS (`direction: rtl` trick) in the existing
`.timelineVisualNode` class, matching pure-CSS alternation already used elsewhere (Brands
spotlight's `reverse`-by-index). Purely additive: existing `'numbered-steps'`/`'timeline'` usages
(Home's process/journey sections, About's journey) are untouched — verified both by a dedicated
regression test and the full existing suite.

**Lifecycle section → reused `pipelineBlock`** (Milestone 7's Brands "Future Projects" block)
almost as-is, with two small additive changes:
- `items` array's `minRows: 1` requirement removed (Lifecycle has no bulleted list at all — just
  two plain paragraphs). Produced **zero migration SQL** — confirmed `minRows` was Payload-level
  validation only, not a DB constraint, matching the exact pattern already established for
  Milestone 6's `mediaField()` `required` flag.
- `spotlight` group gained an optional `value` field (large stat number, e.g. "16 Wks"), rendered
  above the icon — mutually exclusive with the existing `icon` field in the renderer (Brands'
  existing icon-only spotlights are visually untouched; the new stat-number treatment only applies
  when `value` is set).
- `PipelineSection`'s `header.description` rendering was switched from a single `<p>` to the
  existing `renderParagraphs()` helper (Milestone 5, used by `StorySimpleSection`) — splits on a
  blank line into multiple paragraphs. Backward-compatible: Brands' existing single-paragraph
  pipeline description (no blank line) still renders as exactly one `<p>`, byte-identical to before.

**No new blocks or collections were created this milestone** — the entire page reuses `heroBlock`,
the extended `stepsBlock`, the extended `pipelineBlock`, and `ctaBlock`.

**Schema/migration** (`20260806_070027_curious_ladoo_how_we_work`) — reviewed with the same
pre-generation identifier-length scan as Milestone 8: **zero** identifiers over 63 chars this time
(max enum name 57 — no nested-array-plus-mediaField combination this time, since the media field
lives in a plain array item, not doubly-nested). 4 new enum types, 1 new enum value, 9 new nullable
columns (8 for per-step media, 1 for `spotlight_value`), 1 FK, 2 indexes. Zero DROP/DELETE/TRUNCATE.
Pre/post row counts confirmed identical for `pages`/`steps_block`/`steps`/`pipeline_block` and
Ghee Roast's page count specifically. Shown to you and approved before applying.

**Loader:** no changes — both blocks were already fully supported by the existing dependency-free
path (`stepsBlock`/`pipelineBlock` carry their content inline, no collection dependency).

**Mapper:** `mapStepsBlock` gained a `tenantID` parameter (needed for the new per-step `mapMedia`
call) and the `'visual-timeline'` variant passthrough; `mapPipelineBlock`'s spotlight mapping gained
`value`. Both changes are non-breaking for existing callers.

**Renderer:** new `StepsVisualTimeline` component (exact reproduction of the connecting-line/dot/
alternating-image layout; no heading rendered above it, matching the original and the same
established "spotlight/showcase blocks render no header" pattern from Milestones 7–8).
`PipelineSection` updated in place for multi-paragraph + stat-value support, verified via a direct
regression test asserting Brands' exact original shape (populated items, icon, no value) still maps
identically.

**Seed:** `src/seed/curiousLadooHowWeWork.ts` + `npm run db:seed:curious-ladoo-how-we-work` —
idempotent, 1 new media upload (`t3_interior.png`), 5 reused (`team_about.png`, `zuru_zuru.png`,
`kitchen_ops.png`, `ghee_roast.png`, `consulting.png` — all already uploaded in earlier
milestones), creates the How We Work Page (4 blocks: hero, steps[visual-timeline], pipeline, cta).

**A rendering detail investigated and confirmed correct:** the CTA title
`"Have a Space or a Brand Idea?<br/>"` + italic `"Let's Co-Create."` uses the same
`dangerouslySetInnerHTML`-with-explicit-space pattern as Services'/Brands' CTAs (unlike Portfolio's
plain-JSX no-space CTA from Milestone 8) — seeded with a trailing space after the `\n`, verified
live that the rendered space is present, matching the original exactly.

**Routing:** `CuriousHubPageRenderer.tsx`'s `CMS_DRIVEN_PATHS` extended to `'/how-we-work'`.

**Live verification hit an unrelated environment issue, not a code bug:** the long-running dev
server (in continuous use since Milestone 7) hit `TypeError: __webpack_modules__[moduleId] is not
a function` — a known Next.js dev-mode HMR module-cache corruption from many accumulated
hot-reloads, not a code defect. Killed and restarted cleanly; full live verification then passed on
the first attempt against the fresh server.

**Verified live** across every tenant hostname alias: `/how-we-work` → 200 with every section's
content confirmed (hero, all 5 timeline steps with their images, the Lifecycle section with both
paragraphs rendered distinctly and the "16 Wks" stat box, CTA with its exact space-preserved
`<br/>`+italic split). **Brands page re-verified live**: its Pipeline section (icon, both list
items, "Partner on Concepts" link) renders completely unchanged, proving the `pipelineBlock`
extension didn't regress Milestone 7. Ghee Roast, Home, About, Services, Portfolio, static
`/contact`, `/admin` → all 200 unchanged. Unknown route → 404.

**Tests:** new `tests/curious-ladoo-how-we-work.test.ts` (6 tests) covering slug resolution,
per-step Media relationship safety (raw/populated/missing/cross-tenant) on the new visual-timeline
variant, a direct regression check that the pre-existing `'timeline'`/`'numbered-steps'` variants
are unaffected, the new items-less/stat-value Pipeline usage, a direct regression check reproducing
Brands' exact original Pipeline shape, and layout ordering. One pre-existing Brands test
(`curious-ladoo-brands.test.ts`) needed a one-line update to its strict `deepEqual` assertion to
account for the new `value: ''` field on the spotlight shape — a mechanical fixture update, not a
behavioral change (identical to the `faqs: []` pattern from Milestone 6). Combined Curious Ladoo
suite: 49/49 pass.

**Full verification:** `typecheck` clean (app + tests) · combined Curious Ladoo suite 49/49 ·
`test:ghee-cms` 40/40 · full `npm test` chain passes (same one pre-existing unrelated failure noted
in every earlier milestone) · `lint`: 0 new warnings after fixing one unused import in my own new
test file (the suite's 1 pre-existing error remains in `scripts/gen-migration.cjs`, untouched) ·
`npm run build` succeeds.

## 13. Milestone 10 record — Testimonials Page (reuse-first: reused `testimonialsBlock` as-is, one additive field on `ctaBlock`, zero new blocks/collections)

**Data model:** the page is exactly Home's/About's existing testimonials pattern applied to a fourth
set of records — no new fields needed on `Testimonials` itself. The only new field this milestone
needed was cosmetic (CTA background text), on an unrelated block. No new-collection trigger, no
stop-and-ask needed.

**CTA background word → additive `ctaBlock.bgText` field** (`src/blocks/CTA.ts`): a `maxLength: 20`
optional text field. The original static Testimonials CTA renders "STORIES" as the large decorative
background word instead of every other page's "CURIOUS" — previously hardcoded to the site name's
first word in `CTASection`. Renderer now checks `block.bgText` first, falling back to the site name
exactly as before when unset — purely additive, verified non-breaking for every existing `ctaBlock`
usage (Home, About, Services, Brands, Portfolio, How We Work all leave it unset and still render
"CURIOUS").

**Testimonials section → reused `testimonialsBlock`, no schema change.** Set `source: 'manual'` with
the 4 new testimonials explicitly selected, same contract already established for this page's dedicated
use of the block: manual mode is supposed to render exactly what's selected, ignoring `isFeatured`.

**No new blocks or collections were created this milestone** — the page reuses `heroBlock`, the
existing `testimonialsBlock`, and the extended `ctaBlock`.

**Schema/migration** (`20260806_084335_curious_ladoo_testimonials`) — 2 new nullable `varchar`
columns (`bg_text` on `pages_blocks_cta_block` and its `_pages_v_blocks_cta_block` draft-version
counterpart). Zero DROP/DELETE/TRUNCATE, zero new identifiers to length-check. Pre/post row counts
confirmed identical (`pages_blocks_cta_block=10`, Ghee Roast `pages=7`). Shown to you and approved
before applying.

**Loader:** no changes — `testimonials` was already a conditional collection dependency since
Milestone 4 (Home).

**Mapper:** `mapCTABlock` reads `block.bgText` (defaults to `''`, letting the renderer fall back to
the site name).

**Bug found and fixed during live verification (not a regression, but a pre-existing latent defect
this milestone was the first to trigger):** the freshly seeded page initially rendered only 3 of the
4 selected testimonials — Sarah Williams silently missing. Root cause: `TestimonialsBlock.limit`
(`src/blocks/Testimonials.ts`) has `defaultValue: 3` with **no admin `condition`**, unlike its sibling
field `featuredOnly` which is already correctly hidden outside `source: 'collection'` mode. Payload
persists that default onto every block row regardless of `source`, and `mapTestimonialsBlock`'s
`const limit = block.limit ?? filtered.length` applied it even in manual mode, truncating the
explicit 4-item selection to 3. This directly contradicted the block's own established contract
("manual mode uses only explicitly-selected items, regardless of `isFeatured`") — `limit` should
carry the same collection-mode-only meaning `featuredOnly` already does. Fixed in two places:
- `src/blocks/Testimonials.ts` and `src/blocks/BlogPreview.ts` (identical latent bug, not yet
  triggered live since Blog is a later milestone): added `admin.condition` hiding `limit` when
  `source !== 'collection'`, matching `featuredOnly`'s existing pattern. Admin-UI-only change, no DB
  column affected, no migration needed.
- `mapTestimonialsBlock`/`mapBlogPreviewBlock` in `cmsContent.ts`: `limit` is now only applied in
  collection mode (`manual ? filtered.length : (block.limit ?? filtered.length)`); manual mode always
  renders every explicitly-selected item.
Verified this didn't touch `mapBrandsShowcaseBlock`/`mapPortfolioShowcaseBlock`, whose `limit` field
has no `source` toggle at all (empty selection there means "auto-pull all," not "manual mode" — a
genuinely different, unconditional-limit contract by design) — left untouched. Added a dedicated
regression test reproducing the exact scenario (`limit: 3` explicitly present alongside 4 manually
selected items) so this can't silently reappear.

**Renderer:** `CTASection`'s background-word computation now checks `block.bgText` before falling
back to the site name's first word.

**Seed:** `src/seed/curiousLadooTestimonials.ts` + `npm run db:seed:curious-ladoo-testimonials` —
idempotent, creates 4 new tenant-scoped testimonials (`isFeatured: false`, no `photo`) and the
Testimonials Page (3 blocks: hero, testimonials[manual, 4 items], cta[bgText: "STORIES"]). No photo
is seeded deliberately: the original static page's avatar markup rendered a raw file path as literal
text instead of an image, and the referenced files don't exist in the repo — a pre-existing bug, not
a design choice worth reproducing. The existing initials fallback (already used by Home's
testimonials) renders correctly instead.

**Routing:** `CuriousHubPageRenderer.tsx`'s `CMS_DRIVEN_PATHS` extended to `'/testimonials'`.

**Live verification hit the same unrelated environment issue as Milestone 9:** the long-running dev
server (in continuous use since Milestone 7) hit the same `TypeError: __webpack_modules__[moduleId]
is not a function` HMR module-cache corruption. Killed and restarted cleanly; live verification then
proceeded (and is what caught the `limit`-truncation bug above — not an environment artifact).

**Verified live** across every tenant hostname alias: `/testimonials` → 200 with all 4 testimonials
present (names, roles, quotes, correct initials, no broken avatar-path text) and the CTA rendering
"STORIES" as the background word with both buttons. **Home re-verified live**: still exactly 3
featured testimonials (Rajiv Kumar/Sunita Patel/Arjun Mehta) and still "CURIOUS" as the CTA
background word — proving the additive `bgText` field and the `limit` fix didn't regress Home's
collection-mode usage. **Ghee Roast home re-verified live**: its own `testimonialsBlock` (also
`source: 'manual'`, coincidentally) still renders all 3 of its testimonials unchanged. Services,
Brands, Portfolio, How We Work, static `/contact`, `/admin`, Zuru Zuru → all 200 unchanged. Unknown
route → 404.

**Tests:** `tests/curious-ladoo-testimonials.test.ts` (6 tests) covering slug resolution, the CTA
`bgText` override vs. empty-string default, manual-mode explicit selection ignoring `isFeatured`, the
`limit`-truncation regression above, photo-null-falls-back-to-initials, and layout order. Combined
Curious Ladoo suite: 55/55 pass.

**Full verification:** `typecheck` clean (app + tests) · combined Curious Ladoo suite 55/55 ·
`test:ghee-cms` 40/40 · full `npm test` chain passes (same one pre-existing unrelated failure noted
in every earlier milestone: an assertion expecting `next dev` where the script is `next dev
--webpack`) · `lint`: 0 new warnings/errors (the suite's 1 pre-existing error remains in
`scripts/gen-migration.cjs`, confirmed untouched via `git status`) · `npm run build` succeeds.

## 14. Milestone 11 record — Careers Page (one new block, justified: `careersBlock`; one additive field on `contentgridBlock`)

**Data model:** Open Positions is a page-local repeated card list (title/department/type/location/
description, no cross-page reuse, filtering, featured selection, or detail routing) — "Data Model A,"
not a new collection. The Values section is a title-only numbered-pillar list — already the exact
shape `contentgridBlock`'s `pillars` presentation exists for. No collection-creation trigger fired.

**Open Positions → new `careersBlock`, justified.** Audited every existing block against the
department-badge + type-badge + title + description + 📍location + fixed "Apply →" card shape before
writing anything new: `ContentGrid` items have no department/type/location fields and stuffing them
into `description` would visually flatten the two badge pills and footer row the original design
uses; `CardGrid`'s `cardItemFields` is image-led with a per-card link, wrong shape and wrong link
model (Careers hardcodes every card's Apply link to `/contact`, never per-item); `FeatureStrip` is
icon/title/description only; `Events`/`Locations` are Ghee-Roast-specific collection relationships
with no job-listing concept at all; `Packages`/`Amenities` are bare title/subtitle stubs. None could
represent the shape without distortion, so `careersBlock` (`sectionHeader()` + `positions[]` array:
title/department/type/location/description, `required: true, minRows: 1`) was proposed, shown to you
with this reasoning, and approved before generating the migration. The "Apply →" destination stays
hardcoded to `/contact` in the renderer, matching the original exactly — not exposed as CMS data,
since the source design never made it configurable either.

**Values → reused `contentgridBlock`'s existing `pillars` presentation**, which already renders with
the identical CSS classes (`.philosophySection`/`.philosophyBgText`/`.philosophyPillars`/`.pillar`/
`.pillarNum`/`.pillarTitle`) the original static Careers page hand-authored for its Values section —
confirming this was the designer's own intended reuse, not a coincidental fit. Two small, additive
changes made it usable by a second page without touching Home's rendering:
- New optional `bgText` field on `contentgridBlock` (mirrors Milestone 10's `ctaBlock.bgText` exactly)
  — overrides the large decorative background word, defaulting to `PHILOSOPHY` when unset so Home's
  existing usage is untouched.
- `PillarsGrid`'s hardcoded `aria-label="Our philosophy"` now reads `block.header.eyebrow` (falls back
  to the same string when absent), and the per-item icon/description now render conditionally instead
  of unconditionally — Careers' title-only values items have neither, and the icon box in particular
  has a fixed 48px CSS footprint that would otherwise leave a visible empty gap above each title. Home
  always populates both, so this is a no-op there — verified live (5/5 icons and descriptions still
  render on Home's Philosophy section, unchanged). The section `id="philosophy"` stays hardcoded
  across both usages, matching the codebase's existing precedent of reused chrome-level ids (e.g.
  `BrandsGrid`'s `id="brands"` across Home and the dedicated Brands page) — verified via grep that
  nothing anywhere links to either `#philosophy` or the original static page's `#our-values`, so this
  has zero functional or visual impact; noted under Limitations below.

**No new collections were created this milestone.**

**Schema/migration** (`20260806_094912_curious_ladoo_careers`) — reviewed with the same
pre-generation identifier-length scan as every prior milestone: 2 FK constraint names exceed 63
chars (67/70 — both `..._settings_background_image_id_media_id_fk`), the same class of finding
already verified safe in Milestone 8 (FK constraint names silently truncate, no hard failure, no
collision — CREATE TYPE/CREATE TABLE identifiers, which do hard-fail, all stayed under the limit).
6 new tables (`careersBlock` + its `positions` array, live + draft-version), 2 new nullable `varchar`
columns (`contentgridBlock.bg_text`, live + draft-version), FKs, indexes. Zero DROP/DELETE/TRUNCATE
in the applied `up()`. Pre/post row counts confirmed identical (Ghee Roast pages=7,
`pages_blocks_contentgrid_block`=17). Shown to you with the full justification above and approved
before applying.

**Loader:** no changes — `careersBlock` carries all its content inline, no collection dependency.

**Mapper:** new `mapCareersBlock` (positions array passthrough); `mapContentGridBlock` gained
`bgText: text(block.bgText)`, non-breaking for every existing `contentgridBlock` usage.

**Renderer:** new `CareersSection` component (`id="open-positions"`, header structure matching the
original exactly — a plain `ScrollReveal` body paragraph, not wrapped in the `servicesHeaderRight`
container `ServicesGrid` uses for its own header, since the original Careers JSX never used that
wrapper either), hidden when `positions` is empty. `PillarsGrid` updated in place per above, verified
non-breaking for Home via a direct live re-check.

**Seed:** `src/seed/curiousLadooCareers.ts` + `npm run db:seed:curious-ladoo-careers` — idempotent,
fully page-local (no separate collection records, unlike Testimonials), creates the Careers Page (4
blocks: hero, careers[4 positions], contentgrid[pillars, 4 values], cta[bgText: "CAREERS"]). Verified
idempotent by running twice: second run returned `status: "updated"` against the same page id with an
unchanged block count.

**A rendering detail investigated and confirmed correct:** the original CTA button carried a
page-specific `id="careers-cta-btn"` with no corresponding CSS or script reference anywhere in the
codebase (confirmed via grep) — the shared `CTASection` component doesn't expose a per-button id hook
and every other CTA-driven page already omits one, so this was left out rather than adding a new field
to preserve a dead attribute.

**Routing:** `CuriousHubPageRenderer.tsx`'s `CMS_DRIVEN_PATHS` extended to `'/careers'`.

**Verified live** across every tenant hostname alias: `/careers` → 200 with every section's content
confirmed (hero, all 4 position cards with correct department/type/location badges and descriptions,
Apply linking to `/contact`, the Values section showing "VALUES" as the background word with all 4
plain titles and zero stray icon/description markup, CTA showing "CAREERS" and the "Send Your CV →"
mailto button). **Home re-verified live**: Philosophy section unchanged — still "PHILOSOPHY", all 5
icons and descriptions present, testimonials still exactly Rajiv/Sunita/Arjun, CTA still "CURIOUS".
Ghee Roast, Zuru Zuru, Services, Brands, Portfolio, How We Work, Testimonials, `/admin`, unknown route
→ all unchanged (one transient `/admin` timeout on first hit was a dev-server cold-compile delay, not
a regression — confirmed by an immediate clean retry).

**Tests:** new `tests/curious-ladoo-careers.test.ts` (5 tests) covering slug resolution, the
`careersBlock` positions mapper (populated and empty), the ContentGrid `pillars` `bgText` override vs.
empty-string default plus the icon/description-degrade-to-empty-string contract the renderer's new
conditionals depend on, and layout ordering. Combined Curious Ladoo suite: 60/60 pass.

**Full verification:** `typecheck` clean (app + tests) · combined Curious Ladoo suite 60/60 ·
`test:ghee-cms` 40/40 (block-registry parity test confirms `careersBlock` is correctly excluded from
Ghee Roast) · full `npm test` chain passes (same one pre-existing unrelated failure noted in every
earlier milestone) · `lint`: 0 new warnings/errors in any hand-written file (the only new warnings are
the standard 4-per-file `payload`/`req`-unused-parameter warnings Payload's migration generator always
produces, ×2 new migration files this pass — identical boilerplate pattern already present in every
prior migration; the suite's 1 pre-existing error remains in `scripts/gen-migration.cjs`, confirmed
untouched) · `npm run build` succeeds · `git diff --check` clean (only benign CRLF/LF warnings, no
actual whitespace errors).

**Limitations:** the reused `PillarsGrid` section keeps a single hardcoded `id="philosophy"` across
both its Home and Careers usages rather than the original static Careers page's `id="our-values"` —
confirmed via grep that neither id is referenced by any link or script anywhere in the codebase, so
this has no functional or visual effect, but is flagged here for full transparency since it's a literal
(if inert) departure from the original markup.

## 15. Milestone 12 record — FAQs Page (reuse-first: extend `FAQBlock`/`FAQs` collection and `FAQAccordion`, zero new blocks/collections)

**Data model:** the FAQ list is tenant-scoped reusable Q&A content — the `FAQs` collection and
`faqBlock` already exist and are already used by the Services page. No new collection or block was
needed; the only gap was a second visual presentation for the shared accordion.

**Hero and CTA → fully reused, zero schema changes.** `heroBlock` needed nothing new. `ctaBlock`
already had everything required — Milestone 10's `bgText` field covers "FAQ" as the background word,
and a single primary button (no secondary) was already supported.

**FAQ list → reused `faqBlock`/`FAQs` collection/`FAQAccordion`, with two justified additive
extensions.** Inspecting the CSS proved the dedicated FAQs page's accordion
(`.faqItem`/`.faqQuestion`/`.faqAnswer`/`.faqIcon`, real `<button>` + `aria-controls` +
`aria-expanded` + `role="region"` semantics) is a genuinely different visual treatment from the
existing `FAQAccordion`'s tab-style accordion already serving the Services page
(`.faqTabAccordion`/`.faqTabHeader`/`.faqTabContent`) — not an alias of the same styling. Reusing
`FAQAccordion` unmodified would have rendered the wrong design on the dedicated page; building a
parallel accordion component instead of extending it would have duplicated the shared single-open
`useState` logic. Resolved by:
- `FAQBlock` gained an optional `presentation` field (`'tabs'` default / `'plusminus'`), mirroring the
  identical pattern already established for `ContentGridBlock`/`TestimonialsBlock`/`BrandsShowcaseBlock`.
  Services' existing usage is untouched (defaults to `'tabs'`).
- `FAQAccordion.tsx` split its existing body into `FAQTabAccordion` (mechanical extraction, byte-
  identical behavior) and a new `FAQPlusMinusAccordion` (exact original markup/classes/aria semantics,
  wrapped in `ScrollReveal` with the original's `(i % 4)` stagger delay), dispatched by the new
  `presentation` prop (default `'tabs'`).
- `CMSHomePage.tsx`'s `FAQSection` became a thin dispatcher; the original body was renamed
  `FAQTabsSection` (mechanical, zero behavior change) and a new `FAQPlusMinusSection` reproduces the
  original page's left-aligned `.faqsSection`/`.servicesHeader` header exactly (distinct from
  `FAQTabsSection`'s centered `.innerSection` header, matching the two pages' genuinely different
  original layouts).

**`isFeatured` on the `FAQs` collection + `featuredOnly` on `FAQBlock`** — added per your CMS
requirement that Featured state be editable, even though the original design never visually filters
by it (nothing renders differently by default; every existing FAQ defaults to `isFeatured: false`).
`featuredOnly` only narrows the **auto-pulled pool** (empty `items`) — an explicit `items` selection
always renders exactly what was chosen, regardless of `featuredOnly` or `isFeatured`. This was
deliberately designed to avoid the exact bug class found and fixed in Milestone 10 (where
`Testimonials.limit` incorrectly applied to an explicit manual selection); a dedicated regression test
proves an explicit selection wins even when `featuredOnly: true` is also set.

**No new blocks or collections were created this milestone.**

**Schema/migration** (`20260806_103849_curious_ladoo_faqs`) — reviewed with the same pre-generation
identifier-length scan as every prior milestone: longest identifier 43 chars, zero over the 63-char
limit. 2 new enum types (`presentation`, live + draft-version), 4 new nullable/defaulted columns
(`faqBlock.presentation`, `faqBlock.featured_only` ×2 tables; `faqs.is_featured`), 1 new index. Zero
DROP/DELETE/TRUNCATE in the applied `up()`. Pre/post row counts confirmed identical (Ghee Roast
pages=7, `faqs` count unchanged pre-seed). Shown to you with the full justification above and
approved before applying.

**Loader:** no changes — the FAQs collection was already a conditional dependency
(`blockTypes.has('faqBlock')`) since Milestone 6 (Services), already tenant-scoped
(`tenantWhere(tenantID, [{isActive: {equals: true}}])`), bounded (`limit: 50`), and deterministically
sorted (`sort: 'sortOrder'`) at the query level — every LOADER requirement in your spec was already
satisfied by the existing implementation.

**Mapper:** `mapFAQBlock` gained the `featuredOnly`-narrows-the-auto-pool-only branch described above,
and passes through `presentation` (defaulting unknown/missing values to `'tabs'`).

**Renderer:** `FAQAccordion`/`FAQSection` split as described above; zero visible change to Services'
existing FAQ section, verified live.

**Seed:** `src/seed/curiousLadooFaqs.ts` + `npm run db:seed:curious-ladoo-faqs` — idempotent (verified
by running twice: second run reported `created: 0, updated: 5` against the same 5 record ids and the
same page id), creates 5 new tenant-scoped FAQs matching the original page's exact 5 questions
(`isFeatured: false`, no `category` — the original design never displays one) and the FAQs Page (3
blocks: hero, faq[plusminus, 5 explicit items], cta[bgText: "FAQ"]). Confirmed via direct SQL that
none of the 3 existing "Services"-category FAQs (ids 6–8, already used by the Services page) or the 5
Ghee Roast "Delivery"-category FAQs (ids 1–5) were touched, duplicated, or pulled into this page's
explicit selection.

**Record counts:** `faqs` table: 5 pre-existing (Ghee Roast) + 3 pre-existing (Services) + 5 new
(FAQs page) = 13 total, confirmed via direct SQL. Zero duplicates, zero deletions.

**Routing proof:** `CuriousHubPageRenderer.tsx`'s `CMS_DRIVEN_PATHS` extended to `'/faqs'`. Verified
live across every tenant hostname alias: `/faqs` → 200 with all 5 questions/answers, the plus/minus
accordion markup (`.faqItem`/`.faqQuestion`, `aria-expanded` ×5, `role="region"` ×5, zero
`.faqTabAccordion` classes leaked), and the CTA showing "FAQ" + "Still Have Questions?" + "Contact Us
→" → `/contact`. Draft pages confirmed hidden (unit test). Unknown route → 404 (live). No static
fallback — `/faqs` is now served exclusively through the CMS pipeline, matching every other completed
Curious Ladoo page.

**Test results:** new `tests/curious-ladoo-faqs.test.ts` (8 tests) covering published/draft
visibility, conditional collection dependency, tenant isolation + active filtering + sorting, category
passthrough, the featuredOnly/explicit-selection contract, presentation defaulting, raw/dangling
relationship safety, and layout ordering. Combined Curious Ladoo suite: 68/68 pass. `test:ghee-cms`:
40/40 (block-registry parity test unaffected — `faqBlock` was already Ghee-Roast-supported and its
Ghee Roast renderer, `FAQList`, doesn't read either new field). Full `npm test` chain passes (same one
pre-existing unrelated failure noted in every earlier milestone). Accordion single-open-interaction
behavior itself is a client-side `useState` concern with no server-side equivalent — verified live
(button semantics/aria attributes render correctly) rather than unit-tested, consistent with every
prior milestone's treatment of client-only interactivity.

**Build result:** `typecheck` clean (app + tests) · `lint`: 0 new warnings/errors in any hand-written
file (only the standard 4 `payload`/`req`-unused-parameter warnings from this milestone's one new
auto-generated migration file) · `npm run build` succeeds · `git diff --check` clean (only benign
CRLF/LF warnings).

**Ghee Roast status:** unaffected. `faqBlock` was already in `GHEE_ROAST_SUPPORTED_BLOCK_TYPES`; its
Ghee Roast renderer (`FAQList` in `CMSPage.tsx`) only reads `block.items`/`block.limit`, never
`presentation` or `featuredOnly`. Live-verified `ghee-roast.localhost/` → 200; `test:ghee-cms` 40/40.

**Zuru Zuru status:** unaffected — no code path touched this milestone reads or renders anything
Zuru-Zuru-specific. Live-verified `zuru-zuru.localhost/` → 200.

**Limitations:** none beyond the accordion-interactivity note above (not unit-testable in this
suite's architecture, verified live instead).

## 16. Milestone 13 record — Contact Page (one new block, justified: `officeMapBlock`; one additive field on `formBlock`; one pre-existing shared-infrastructure bug found and fixed)

**Data model:** the audit found the actual designer page simpler than a generic contact-page
checklist implies — no real per-location map buttons/URLs, no Instagram-specific CTA, no separate
newsletter section (Instagram is already on every page via the global Footer; the "map" is a
decorative hand-placed-marker SVG illustration, not a real map). Confirmed with you upfront:
preserve the actual design exactly, make everything that actually exists editable, and don't invent
sections the source of truth doesn't have.

**Hero and FAQ → fully reused, zero schema changes.** `heroBlock` already supports a foreground
image end-to-end (built generically since Milestone 4, just never previously exercised by an inner
page). `faqBlock`'s `presentation: 'tabs'` (Milestone 12) already renders the exact `.faqTabAccordion`
styling this page's own FAQ section uses.

**Form + info-cards split → reused `formBlock`/`Locations`/`ContactSubmissions`/`SiteSettings`/
`Tenant.contact`, with one additive field.** The original interleaves the form with three info cards
(General Inquiries, Operating Hours, Global Locations) in one `.contactSplitCustom` grid — a
different composition from Ghee Roast's own Contact page, which stacks `formBlock` and `locationsBlock`
as separate sections (confirmed by reading Ghee Roast's `CMSPage.tsx`). Reproducing the split without
a new block: added `formBlock.showContactInfoCards` (boolean, default `false` — Ghee Roast's own
formBlock usage, and its renderer, never reads it, so it's unaffected) that tells only the Curious
Ladoo renderer to compose the cards from data that was *already sitting in already-reused
collections* — General Inquiries reads `tenant.contact.contactEmail`/`contactPhone` (already seeded
in Milestone 3, matching the original text exactly), Operating Hours reads `SiteSettings.hours`
(existing global field, previously empty for this tenant), Global Locations reads the `Locations`
collection filtered `isActive`+`showOnContact`, tenant-scoped, sorted by `sortOrder`. Real form
submission reuses Ghee Roast's own `formRequests.ts` (`buildContactSubmissionRequest`,
`createSubmissionGuard`, `CONTACT_SUBMISSIONS_ENDPOINT`) via a plain cross-theme import — zero
duplication, zero modification to that file, so zero Ghee Roast risk from the import itself. The
rewritten `ContactForm.tsx` (previously dead code, never imported anywhere) now uses the classNames
the page's own "Contact Page specific local adjustments" CSS block actually targets (bare
`<input>`/`<select>`/`<textarea>` inside `.formGroupCustom`, `.premiumFormContainer`) instead of its
old `.formInputCustom` family, which — traced through the CSS cascade — would have rendered a
mismatched light-bordered-box style inside the page's dark form container.

**Decorative map → new `officeMapBlock`, justified.** No existing block has a "label + illustrative
left%/top% position" shape; `ContentGrid`'s items have no position fields, and adding them there
would pollute a widely-shared, Ghee-Roast-used block for one decorative, single-use concept. Fields:
`sectionHeader()` + `markers[]` (label/left/top, all plain text — the original stores raw CSS
percentage strings like `"65%"`, so the block does too, avoiding any invented coordinate system).

**No new collections were created this milestone.**

**Schema/migration** (`20260807_050855_curious_ladoo_contact`) — reviewed with the same
pre-generation identifier-length scan as every prior milestone: 2 FK constraint names exceed 63
chars (70/73 — both `..._settings_background_image_id_media_id_fk`), the same non-blocking class of
finding verified safe in Milestones 8/11/12. 6 new tables (`officeMapBlock` + its `markers` array,
live + draft-version), 2 new nullable boolean columns (`formBlock.show_contact_info_cards`, live +
draft-version). Zero DROP/DELETE/TRUNCATE in the applied `up()`. Pre/post row counts confirmed
identical (Ghee Roast pages=7; Ghee Roast's own pre-existing `formBlock` row confirmed to receive the
new column's default `false` with no behavior change). Shown to you with the full justification above
and approved before applying.

**A genuine pre-existing bug found and fixed, outside this page's own code.** Live end-to-end testing
of the real form submission (a `POST /api/contact-submissions`, not just a mapper/loader unit test)
failed with a `tenantId` validation error. Investigating, I found `tenantField()`'s (shared by all 23
tenant-scoped collections) `filterOptions` returns `false` for any unauthenticated request — because
`getUserTenantIDs(undefined)` is always `[]` — which rejects *any* value on the field, including the
correct, trusted, host-derived tenant that the `assignTenant` hook had already assigned moments
earlier in the same `beforeValidate` chain. I confirmed this wasn't something introduced by this
milestone by POSTing to Ghee Roast's own `/contact` form the identical way — it failed with the
identical error, proving every public contact/reservation submission site-wide was already broken
before I touched anything. Since the fix lives in shared infrastructure and this milestone's rules
say not to modify Ghee Roast or Zuru Zuru, I stopped and asked before touching it. Approved fix:
`filterOptions` now falls back to `resolvePublicTenantID(req)` or `false` (the exact tenant-derivation
`assignTenant` already trusts) instead of unconditionally `false`, when no user/user-tenants are
present. This is strictly corrective — the two authenticated branches (`isSuperAdminUser`,
`getUserTenantIDs`) are byte-identical to before, so nothing that currently works can regress; only
the previously-always-rejected public path changes, and it can only go from broken to working. This
change affects public *creates* on 23 collections in principle, but only `ContactSubmissions` and
`Reservations` actually allow public `create` — verified live for both: Curious Ladoo's Contact form
now returns `201` scoped to tenant `3181`, Ghee Roast's own Contact form now also returns `201`
scoped to tenant `3167` (previously broken, now fixed), and a spoofed `tenantId` in the request body
is still correctly rejected by `assignTenant`'s own explicit check (the security boundary is
unchanged — only the redundant, over-broad `filterOptions` layer was corrected).

**Form behavior and validation:** name/email required; subject optional in the UI (matching the
original's un-`required` `<select>`) but always carries a real value since a `<select>` always has
something selected; message required. Server-side: name/email/message validated+normalized via the
existing `ContactSubmissions` field hooks; subject validated against this page's own
`formBlock.subjectOptions` via the existing `validateContactSubmissionSubject` hook — which requires
`pageType: 'contact'` on the published page to resolve the right options, a detail the seed gets
right (verified with a dedicated unit test) and would silently break if a future edit ever changed
the page's type. Tenant is derived exclusively from the trusted request host (`assignTenant`), never
trusted from the client; a mismatched client-submitted tenantId is rejected. Duplicate/rapid
resubmission is guarded client-side via the shared `createSubmissionGuard` (the only
"spam protection" pattern that exists anywhere in this codebase — no honeypot/CAPTCHA infrastructure
exists to reuse, so none was invented). Success and error states are accessible (`role="status"` /
`role="alert"`), replacing the original prototype's blocking `alert()` — the original's `onSubmit`
never actually persisted anything, so this isn't a design change, it's completing an unfinished stub.
Internal errors are never exposed — only the CMS-configured `errorMessage` or a generic client-side
validation message.

**Location/map behavior:** `Locations` collection reused as-is — `validatePrimaryLocation` (existing
hook) still enforces exactly one primary per tenant; the seed's New Delhi record is primary, Mumbai
and Tokyo are not. Query-level filtering (`isActive`, `showOnContact`) plus mapper-level
tenant-isolation filtering (defense in depth, matching every other collection in this pipeline).
Deterministic `sortOrder` sort. Per the approved "preserve exact design only" scope, per-location
`mapsUrl`/`mapButtonLabel` are not rendered on this page (the original's map is decorative, not a
real per-location map), though the collection already supports them for any future page that needs
real map buttons.

**Media:** hero image reuses `t3_interior.png` (already uploaded in Milestone 9), zero new uploads,
tenant-safe relationship, alt text set, missing-image-safe (existing `mapMedia`/`InnerHeroSection`
null-guard, unchanged).

**Loader:** `Location` added to `CuriousLadooContentResult`/`CuriousLadooCollectionSlug`; `locations`
is a new conditional dependency (`blockTypes.has('formBlock')`), tenant-scoped, `isActive`+
`showOnContact` filtered at the query level, bounded (`limit: 50`), deterministically sorted
(`sort: 'sortOrder'`), depth 0 (no relationships to expand). No changes to any other collection's
query. Cache key (host/pathname/tenant) is unchanged — cache isolation was already correct.

**Mapper:** new `mapFormBlock` (tenant contact info + Site Settings hours + tenant-scoped Locations,
only computed when `showContactInfoCards` is true) and `mapOfficeMapBlock`.
`mapCuriousLadooLayout`/`mapCuriousLadooHomeContent` gained two new optional parameters (`tenant`,
`siteSettings`) and an optional `collections.locations` field — all optional/defaulted specifically so
none of the 9 existing test files' call sites needed to change (only one, unrelated,
`mapCuriousLadooHomeContent`-calling test needed a mechanical `locations: []` addition, since that
function's own inline type keeps every collection required).

**Renderer:** new `ContactFormSection` (dispatches to the plain single-column form or the full
info-cards split, matching `block.contactInfo`) and `OfficeMapSection` (exact original SVG/marker
markup). Rewrote `ContactForm.tsx` as described above.

**Seed:** `src/seed/curiousLadooContact.ts` + `npm run db:seed:curious-ladoo-contact` — idempotent
(verified by running twice: second run reported 0 created / 3 updated for both Locations and FAQs,
`siteSettingsHours: 'updated'` both times, same page id). Creates 3 tenant-scoped Locations, adds 7
Site Settings hours rows via a **partial update** (only the `hours` field is touched — Payload's
partial-update semantics leave every other Site Settings field, including socials and newsletter,
completely untouched), creates 3 new FAQs specific to this page (none overlap Ghee Roast's,
Services', the dedicated FAQs page's, or Careers' existing FAQs), reuses the existing hero image, and
creates the Contact Page (4 blocks: hero, form[split, 4 subject options], officemap[4 markers],
faq[tabs, 3 items]) with `pageType: 'contact'`.

**Record counts:** `locations` table: 2 pre-existing (Ghee Roast) + 3 new (Curious Ladoo) = 5, zero
duplicates. `faqs` table: 13 pre-existing + 3 new = 16. `contact-submissions`: verified live (see
below), 2 new rows from live-verification POSTs (tenant 3181 and 3167 respectively), zero data loss.

**Routing proof:** `CuriousHubPageRenderer.tsx`'s `CMS_DRIVEN_PATHS` extended to `'/contact'`.
Verified live across every tenant hostname alias: `/contact` → 200 with every section's content
confirmed (hero, General Inquiries card with correctly-formatted `+91 98765 43210`, Operating Hours
with all 7 configured rows, all 3 Locations, all 4 form fields and subject options, the decorative
map's 4 markers, all 3 FAQ questions in the tab-accordion presentation). **Real form submission
verified end-to-end**: valid submission → `201`; invalid email → `400` with a clear message; subject
not configured on this page → `400`; missing required field → `400`; spoofed `tenantId` → `400`,
rejected. Draft hidden (unit test). Unknown route → 404 (live). No static fallback. `/admin`
unaffected (one transient cold-start timeout on first hit, clean on immediate retry — not a
regression, consistent with every prior milestone's dev-server behavior).

**Test results:** new `tests/curious-ladoo-contact.test.ts` (8 tests) covering published/draft
visibility, the `locations` conditional collection dependency, the `showContactInfoCards`
true/false branches (including tenant-isolation of the Locations list), the `formBlock.enabled`
contract, `officeMapBlock` mapping, layout ordering, and the `pageType: 'contact'` requirement for
subject validation. Combined Curious Ladoo suite: 76/76. `tests/ghee-roast-forms.test.ts` (the
existing suite covering the shared form/tenant-safety infrastructure this milestone reused and then
fixed): 12/12, unchanged. `test:ghee-cms`: 40/40. Full `npm test` chain passes through
`test:phase1`/`test:phase2` (tenant-isolation regression, relevant given the `tenantField.ts` change)
before the same one pre-existing unrelated failure every prior milestone has hit.

**Build result:** `typecheck` clean (app + tests) · `lint`: 0 new warnings/errors in any hand-written
file (only the standard 4 `payload`/`req`-unused-parameter warnings from this milestone's one new
migration file; two real lint findings surfaced and fixed during development — an unused
`eslint-disable` comment and a `react-hooks/set-state-in-effect` violation on the query-param
preselect effect, justified and suppressed with an explanatory comment since deferring to an effect
is required to avoid a hydration mismatch) · `npm run build` succeeds · `git diff --check` clean (only
benign CRLF/LF warnings).

**Ghee Roast status:** unaffected by the Contact page's own new code (`showContactInfoCards`/
`officeMapBlock` are never read by Ghee Roast's renderer). **Improved, not regressed, by the shared
`tenantField.ts` fix** — its own contact form went from silently broken (every public submission
rejected) to working, verified live (`201`, correctly tenant-scoped to `3167`). `test:ghee-cms` 40/40,
`ghee-roast-forms.test.ts` 12/12.

**Zuru Zuru status:** unaffected — no Zuru-Zuru-specific code path touched. Live-verified
`zuru-zuru.localhost/` → 200. (Zuru Zuru has no public-facing tenant-scoped create form in the current
build, so the `tenantField.ts` fix has no observable effect there either way.)

**Limitations:** per the approved "preserve exact design only" scope, Instagram-specific CTA,
per-location real map buttons/URLs, and a separate newsletter/final-CTA section were intentionally
not added — none exist in the source-of-truth page (Instagram is already reachable via the global
Footer on this page like every other). The decorative map's marker positions remain hand-placed
illustrative percentages, not derived from Locations' real `latitude`/`longitude` — matching the
original design exactly.

## 17. Milestone 14 record — Blog / Journal (one additive field on `blogpreviewBlock`; the detail route built from scratch — it never rendered anything for any local theme before this milestone)

**Index page audit:** `BlogPage.tsx` has hero + a separate "Featured Article" banner + a 3-column
article grid (`.blogMainGrid`, distinct from the `blogpreviewBlock`-driven `.journalGrid` Home's
preview already uses) + a newsletter box. Every field it needs already exists on the `BlogPosts`
collection (title/slug/excerpt/content/heroImage/status/author/publishedDate/isFeatured/isPinned/
categories/tags/metaTitle/metaDescription/metaImage/relatedPosts/readingTimeMinutes) — confirmed
nothing was missing before writing any code.

**Detail route audit — a genuinely different starting point from every prior milestone.**
`src/app/(app)/blog/[slug]/page.tsx` never called `resolveLocalSite`/`renderLocalThemePage` at all;
it only handled a legacy `x-tenant-config` stub and otherwise 404'd. Confirmed live before touching
anything: every local-site request to `/blog/<any-slug>` already 404'd. There is no static "source of
truth" for the detail page to preserve — it was built from scratch, reusing `heroBlock`'s CSS
pattern, `.blogMainGrid`/`.journalCard`-family classes for "Related Articles", and Payload's own
official Lexical React serializer (`@payloadcms/richtext-lexical/react`'s `RichText`) for the article
body — Ghee Roast's own richText handling (`lexicalText`) is a lossy plain-text stub, not reused here
since the entire point of this page is displaying rich content correctly (headings/bold/links/lists).

**Reuse-first, one additive field.** `blogpreviewBlock` gained `presentation: 'preview' | 'index'`
(default `'preview'`, mirroring the FAQ/ContentGrid pattern from Milestones 11-12 exactly) so the
index page's featured-banner-plus-grid layout doesn't disturb Home's existing "Latest from the
Journal" preview section, which keeps using `'preview'` unchanged and was re-verified live to still
show its original 3 posts in the original order. No new block, no new collection.

**Schema/migration** (`20260807_061312_curious_ladoo_blog`) — reviewed with the same
pre-generation identifier-length scan as every prior milestone: longest identifier 51 chars, zero
over the 63-char limit. 2 new enum types, 2 new nullable/defaulted columns. Zero DROP/DELETE/TRUNCATE
in the applied `up()`. Pre/post row counts confirmed identical (Ghee Roast pages=7; the one
pre-existing `blogpreviewBlock` row on Home confirmed to receive the new column's default `'preview'`
with no behavior change). Shown to you with the full justification above and approved before applying.

**Featured-post selection:** `isPinned` ("Keep at the top of the blog index," per the field's own
admin description) selects the banner post; falling back to the first visible post (by
`-publishedDate`) when none is pinned. `isFeatured` keeps its pre-existing, separate meaning
(Home's `featuredOnly` curation flag) — the two fields were never conflated.

**Loader:** new `loadCuriousLadooBlogPostWithPayload` (added to `curiousLadooContentCore.ts`,
reusing its existing private helpers directly rather than duplicating them) resolves a single post by
tenant + slug — published-only, defense-in-depth re-verified in application code exactly like every
other Curious Ladoo loader in this file, which is also what makes cross-tenant slug guessing
impossible (a same-slug post under a different tenant is filtered out, never returned). `relatedPosts`
are resolved and tenant-filtered in the same pass. New `getCuriousLadooBlogPost.ts` mirrors
`getCuriousLadooContent.ts`'s `React.cache()` wrapper exactly, keyed on host + slug + tenant for cache
isolation. The index page's own data need (all published posts) was already served by the existing
conditional `blogPosts` dependency (`blockTypes.has('blogpreviewBlock')`, tenant-scoped, sorted
`-publishedDate`, bounded) since Milestone 4 — zero loader changes needed there.

**Mapper:** `mapBlogPreviewBlock` gained the featured/items split for `presentation: 'index'` (no
`limit` applied in index mode — the original design has no pagination to preserve). New
`mapCuriousLadooBlogPost` (post detail + author-name-if-populated + related posts + SEO fields).
`mapCuriousLadooSite` gained a `newsletter` field (sourced from the existing, previously-unused
`SiteSettings.newsletter` group) so the blog page's newsletter box content is genuinely
CMS-editable — confirmed via grep that nothing else in the theme reads this field, so populating it
had no effect on any other page.

**Renderer:** new `BlogIndexSection` (featured banner + grid, cards linked to `/blog/{slug}` — the
original static cards were never linked anywhere, which would have made the new detail routes
unreachable from the UI; fixing this is completing the "routes" the goal explicitly asked for, not a
redesign, and is called out here transparently), new `BlogPostPage` (title/meta/cover/RichText
body/tags/related posts), new `BlogNewsletter` (real submission, reusing Ghee Roast's
`buildNewsletterRequest`/`createSubmissionGuard` via a plain cross-theme import — same zero-risk,
zero-duplication pattern already established for the Contact form in Milestone 13; replaces the
original's non-functional `alert()` stub, matching that same precedent). New `buildCuriousLadooBlogPostMetadata`
+ `buildCuriousLadooBlogPostJsonLd` (canonical URL, OpenGraph `type: 'article'`, Twitter card,
`BlogPosting` JSON-LD) modeled on Ghee Roast's own already-proven `buildGheeRoastMetadata.ts`
approach — not shared code (different content-result shapes), but the same pattern. A small,
genuinely new `.articleBody`/`.articleMeta`/`.articleCoverImage`/`.articleTags` CSS block was added
for the article body's typography, since no prior design exists to preserve there.

**Detail routing:** `src/app/(app)/blog/[slug]/page.tsx` now checks `resolveLocalSite` first (mirroring
`/blog/page.tsx`'s already-existing pattern exactly) and renders the new detail page for local themes;
the pre-existing `x-tenant-config` stub path is untouched for non-local tenants. `generateMetadata` is
wired the same way. Unknown/draft slugs → `notFound()`.

**Seed:** `src/seed/curiousLadooBlog.ts` + `npm run db:seed:curious-ladoo-blog` — idempotent (verified
by running twice: second run reported `created: 0, updated: 7` for posts and `updated` for the index
page and Site Settings newsletter). The 3 posts already seeded by Milestone 4's Home seed are
**updated, never duplicated**, and only detail-page-relevant fields are touched (`isPinned` on the one
featured post, `metaTitle`... reverted after hitting the collection's 70-char limit — omitted instead,
falling back to the post title like every other page's SEO pattern, and a fuller article body).
`title`/`slug`/`excerpt`/`heroImage`/`publishedDate`/`categories`/`tags` on those three are left
**completely untouched**, so Home's preview (which reads exactly those fields) cannot change — verified
live. A pre-existing minor gap was found and deliberately left alone rather than "fixed": those three
posts' category label was originally seeded into `tags` instead of `categories` (which is what both
`JournalSection` and the new index page actually read for the small card label), so their cards show
no category chip; fixing it would also change Home's already-shipped rendering, so — per this
milestone's own "do not change completed Curious Ladoo behavior" rule — it was left exactly as
Milestone 4 shipped it. The 4 new posts set `categories` correctly. 4 new media uploads, reused
on every subsequent run. `SiteSettings.newsletter` updated via a **partial update** (only that field
touched — every other Site Settings field, including the `hours` array from Milestone 13, is left
untouched by Payload's partial-update semantics).

**No author was set on any post.** The only three users in the database are the super admin (no
tenant association) and one tenant-scoped admin/member each for Ghee Roast and Zuru Zuru — there is no
Curious-Ladoo-tenant-scoped user to assign, and creating one would violate this milestone's explicit
"never create/delete tenants or users" rule. `authorName` degrades to an empty string and the
detail page's meta line simply omits it, matching the posts' pre-existing `author: null` state.

**Record counts:** `blog-posts` table: 3 pre-existing (updated in place) + 4 new = 7 total for Curious
Ladoo, zero duplicates on re-run (confirmed via direct SQL, ordered by `publishedDate`).

**Routing proof:** `CMS_DRIVEN_PATHS` extended to `/blog` (index, via the standard Page pipeline).
Verified live across every tenant hostname alias: `/blog` → 200 (hero, featured banner showing the
pinned post, all 6 other posts in the grid, newsletter box with the correct seeded copy, all 7 cards
linked to their detail pages); `/blog/why-systems-beat-talent-every-time-in-restaurants` → 200 (title,
date, cover image, full multi-paragraph article body via the Lexical serializer, related-posts
section, JSON-LD `BlogPosting` script, correct canonical `<link>`); `/blog/does-not-exist` → 404.
**Real newsletter submission verified end-to-end**: `POST /api/contact-submissions` with
`subject: "Newsletter Signup"` → `201`, correctly tenant-scoped, exercising the same
`validateContactSubmissionSubject` bypass and the Milestone 13 `tenantField` fix. **Home
re-verified live**: still exactly the same 3 original posts, in the same order, in its preview
section — confirmed the 4 new (older-dated) posts never displace them from the existing `limit: 3`
auto-pool. Ghee Roast's own separate `/contact` and `/blog` (404, it has none) both re-checked live.

**Test results:** new `tests/curious-ladoo-blog.test.ts` (14 tests) covering index page
publish/draft visibility, the featured/items split (pinned-post-wins and no-pinned-post-falls-back
cases), the `'preview'` default staying unaffected, tenant + slug resolution, draft-hidden, unknown
slug, cross-tenant same-slug rejection (both at the loader level, where the filtering actually lives),
author/media/relatedPosts mapping safety, and the SEO metadata/JSON-LD builders. Combined Curious
Ladoo suite: 90/90 (including the pre-existing Home test "Blog Preview only ever includes published,
same-tenant posts," re-run and confirmed unaffected). `test:ghee-cms`: 40/40. Full `npm test` chain
passes through phase1/phase2 (same one pre-existing unrelated failure noted in every earlier
milestone).

**Build result:** `typecheck` clean (app + tests) · `lint`: 0 new warnings/errors in any hand-written
file after fixing two real findings during development (an unused destructured variable, suppressed
with an explanatory comment since it exists purely to exclude a field from a spread; only the standard
4 migration-boilerplate warnings are new) · `npm run build` succeeds · `git diff --check` clean (only
benign CRLF/LF warnings).

**Ghee Roast status:** unaffected. It has no blog pages of its own; `/blog` and `/blog/[slug]` both
correctly 404 for it (confirmed live), and its own `/contact` page (unrelated to this milestone,
re-checked as a general regression sweep) is unaffected.

**Zuru Zuru status:** unaffected — no code path touched this milestone reads or renders anything
Zuru-Zuru-specific. Live-verified `zuru-zuru.localhost/` → 200.

**Limitations:** no author is set on any Curious Ladoo blog post (no tenant-scoped user exists to
assign, and creating one is out of scope). The three pre-existing posts' category chip is empty on
their cards (a pre-existing Milestone 4 gap, deliberately left unfixed to avoid changing Home's
already-shipped output — see Seed section above).

## 18. Milestone 15 record — SEO (zero schema/migration changes; wires up already-existing, previously-underused SEO architecture)

**Audit first.** Every field this milestone needed already existed: the `SEO` collection
(tenant-scoped 1:1: `metaTitlePattern`, `metaDescription`, `keywords`, `canonicalUrl`, `robots`,
`ogTitle`/`ogDescription`/`defaultOGImage`/`ogSiteName`, `twitterCard`/`twitterSite`/`twitterCreator`,
`jsonLd`, `googleSiteVerification`/`bingSiteVerification`), the `Pages` collection's own SEO tab
(`metaTitle`, `metaDescription`, `metaImage`, `canonicalUrl`, `noIndex` — present on every page since
Milestone 3, populated with real per-page copy on all 10 pages, but never once read by any Curious
Ladoo code path before this milestone), and `Tenant.branding.favicon`/`logo` (present in schema,
wired into rendering for neither Ghee Roast nor Curious Ladoo before this milestone). **No migration
was created** — confirmed nothing needed to change at the schema level, so none was proposed.
Ghee Roast's own `buildGheeRoastMetadata.ts`/`GheeRoastLayout.tsx` JSON-LD pattern was used as the
reference architecture to mirror (title-pattern interpolation, canonical, robots, OpenGraph, Twitter,
verification, `<script type="application/ld+json">` with `<` escaped to `<` for injection
safety) — not shared code (the two themes' content shapes differ), but the same proven approach.

**A pre-existing gap this milestone closes, flagged (not silently patched) in Milestone 5's own
record:** `/about`'s `<title>`/description previously came from the tenant-wide SEO pattern only, not
the Page's own `metaTitle`/`metaDescription` — true of every CMS-driven page, not just About. Fixed
by wiring `buildCuriousLadooMetadata.ts` to read the Page-level fields first.

**Title-doubling avoided by design, not by copying Ghee Roast's rule verbatim.** Every Curious Ladoo
page's seeded `metaTitle` already ends in "— Curious Ladoo" / "| Curious Ladoo" (set in Milestones
5-14). Mirroring Ghee Roast's "always interpolate metaTitle through the tenant's `%s` pattern" rule
here would double-brand every title (e.g. "About Us — Curious Ladoo | Curious Ladoo"). Resolved by
treating an explicit `page.metaTitle` as the complete, final title (used verbatim); only the raw
`page.title` fallback (never brand-suffixed) is run through the tenant's `%s` pattern. Verified live:
`/about` → `<title>About Us — Curious Ladoo</title>` (single brand mention).

**A genuine bug found and fixed, not a redesign:** Milestone 14's blog metadata/JSON-LD builder used
the human-formatted display date (`post.date`, e.g. "June 1, 2025") for OpenGraph's `publishedTime`
and JSON-LD's `datePublished`/`dateModified` — both require ISO 8601 per spec, so Milestone 14 was
shipping invalid structured data. Fixed by adding `publishedDateISO`/`modifiedDate` to the blog post
mapper (raw ISO strings) and using those in the builder instead. Verified live:
`article:published_time` → `2025-06-01T00:00:00.000Z`, `article:modified_time` →
`2026-08-07T07:09:50.041Z`.

**New shared JSON-LD helpers** (`buildCuriousLadooJsonLd.ts`): `buildCuriousLadooBreadcrumbJsonLd`
(generic; a single "Home" crumb alone is dropped as meaningless), `combineCuriousLadooJsonLd`
(flattens N entries into one array, drops nulls), `serializeCuriousLadooJsonLd` (stringify + the same
`<` escape Ghee Roast uses, single-vs-array handling). Both the Page-based renderer
(`CuriousHubPageRenderer.tsx`) and the Blog detail route now combine their JSON-LD through these same
three functions and render it through one shared `CuriousHubLayout` `jsonLd` prop — Milestone 14's
ad-hoc inline `<script>` tag in the blog detail route was consolidated into this single mechanism
rather than left as a second code path.

**New page-level metadata builder** (`buildCuriousLadooMetadata.ts`, wired into the existing
`getCuriousLadooMetadata.ts` entry point — no new entry point created) also exports
`parseRobotsDirective`, reused by both the page-level and blog-post-level builders so the two can
never drift apart on how a robots directive string becomes Next.js's structured `robots` field.

**Seed** (`src/seed/curiousLadooSeo.ts` + `npm run db:seed:curious-ladoo-seo`) — a **partial update**
touching only `SEO.jsonLd` and `SEO.defaultOGImage` on Curious Ladoo's existing SEO document; every
other already-populated field (`metaTitlePattern`, `metaDescription`, `keywords`, `robots`,
`ogTitle`, `ogSiteName`, `twitterCard`, `twitterSite`) is left completely untouched — verified via
direct SQL before/after. `jsonLd` is set to an Organization schema (`name`, `description`, `sameAs`
built from the tenant's 3 already-configured, enabled Site Settings social URLs — Instagram, LinkedIn,
Twitter). `defaultOGImage` reuses the existing `hero.png` media document (found by tenant+title
lookup via the established `findOrUploadMedia` helper — never a hardcoded ID). Verified idempotent by
running twice: both runs reported `media: { created: 0, reused: 1 }, seo: 'updated'`.

**No favicon exists to wire up.** `Tenant.branding.favicon`/`logo` are both null for Curious Ladoo (no
admin has uploaded one) — confirmed via direct SQL. The rendering code (`site.favicon` →
`metadata.icons`) is complete and correct; it simply renders nothing until an asset is uploaded. Not
fixed by seeding one, since no source asset was designated as "the favicon" by any prior milestone and
inventing one would be a design decision outside this milestone's scope.

**`sitemap.ts` / `robots.ts`** (new, Next.js file-convention routes — neither existed for any tenant
before this milestone) — host-aware via `headers()` + `resolveLocalSite`. Curious Ladoo hosts get a
real sitemap (all published Pages + BlogPosts, tenant-scoped, `changeFrequency`/`priority` tiered by
type) and a robots rule set referencing it. Every other host (Ghee Roast, Zuru Zuru, unresolved)
gets an empty `<urlset>` / a generic universal `Disallow: /admin` rule with no sitemap reference,
rather than a 404 — **flagged transparently**: this is new shared infrastructure that applies the same
sensible crawler-hygiene default regardless of tenant, not tenant-specific behavior removed from
anyone; Ghee Roast and Zuru Zuru never had these routes before, so nothing is being taken away.

**Tests:** new `tests/curious-ladoo-seo.test.ts` (14 tests) covering `mapCuriousLadooSEO` (full field
mapping, tenant-scoping fallback, valid/malformed/array JSON-LD parsing), `buildCuriousLadooMetadata`
(404 empty-metadata case, metaTitle-verbatim vs `%s`-interpolated-fallback, canonical override vs
derived, `noIndex` forcing robots regardless of the tenant directive, OG/Twitter fallback chains,
favicon wiring), `parseRobotsDirective`, and the three JSON-LD helpers (breadcrumb minimum-length
rule, combine flattening/null-dropping, serialize empty/single/multiple/XSS-escape cases).
`tests/curious-ladoo-blog.test.ts`'s existing JSON-LD test was updated for the builder's new
`CuriousLadooJsonLdEntry[]` return type (previously a pre-serialized string) — re-verified passing.
Combined Curious Ladoo suite: **104/104**. `test:ghee-cms`: **40/40**. `test:authorization`: 23/23 ·
`test:phase1`: 11/11 · `test:phase2`: 11/11 · `test:development-content`: 11/12 (same pre-existing
unrelated `dev`-script-string failure noted in every earlier milestone).

**Build result:** `typecheck` clean (app + tests) · `lint`: 0 new warnings/errors in any file touched
this milestone (the single pre-existing error is in `scripts/gen-migration.cjs`, untouched; all 237
pre-existing warnings are in `tests/security/*`, also untouched) · `npm run build` succeeds
(`/sitemap.xml` and `/robots.txt` both compile as dynamic routes) · `git diff --check` clean (only
benign CRLF/LF warnings).

**Live verification** against the running dev server across all three tenant hostname aliases:
Curious Ladoo `/sitemap.xml` → 11 pages + 7 blog posts with correct `lastmod`/`changefreq`/`priority`;
`/robots.txt` → allow-all + sitemap reference; `/about` → correct `<title>`, description, canonical,
full OpenGraph + Twitter card set, Organization + BreadcrumbList JSON-LD; `/` → correct title/canonical;
`/blog/why-systems-beat-talent-every-time-in-restaurants` → correct canonical, `og:type=article`,
ISO-8601 `article:published_time`/`article:modified_time`, `article:tag`, valid `BlogPosting` +
`BreadcrumbList` JSON-LD; unknown route → 404 (unchanged). Ghee Roast and Zuru Zuru re-verified:
homepages still 200 with titles unchanged (Ghee Roast spot-checked), `/sitemap.xml` → empty `<urlset>`,
`/robots.txt` → generic rule with no sitemap reference for both.

**Ghee Roast status:** unaffected. No Ghee Roast file was modified this milestone; its own SEO
pipeline (`buildGheeRoastMetadata.ts`, `GheeRoastLayout.tsx`) is untouched and was only read as a
reference. Its `/sitemap.xml`/`/robots.txt` now resolve (previously 404) with generic, non-tenant-specific
content — the one shared-infrastructure change noted above.

**Zuru Zuru status:** unaffected — no code path touched this milestone reads or renders anything
Zuru-Zuru-specific. Live-verified `zuru-zuru.localhost/` → 200, `/sitemap.xml` → empty, `/robots.txt`
→ generic.

**Limitations:** no favicon/logo asset exists for Curious Ladoo yet (rendering code is correct but
inert until one is uploaded). The Organization JSON-LD's `description` and `sameAs` are seeded, static
content (not derived from a richer "About" source) — reasonable for a first pass, could later be
enriched with `LocalBusiness`/address/phone fields once a physical-location concept is confirmed in
scope. The Breadcrumb JSON-LD's crumb label for non-home pages uses the Page's raw `title` field
(e.g. "Curious Ladoo About", "Curious Ladoo Services" — every page's `title` was seeded in
Milestones 5-14 as an internal/admin-facing document label, distinct from the brand-suffixed
`metaTitle`). This is valid, non-broken structured data (schema.org places no constraint on crumb
wording), but the redundant "Curious Ladoo" prefix reads awkwardly. No separate "short display title"
field exists on `Pages` to use instead, and inventing one is a schema decision outside this milestone's
scope — flagged here rather than silently worked around.

## 19. Verification commands (from `package.json`)

`npm run typecheck` · `npm run lint` · `npm run build` · `npm test` (chains authorization, phase1,
phase2, development-content, ghee-cms) · `npm run test:security`. No test runner is Ghee-Roast- or
Curious-Hub-specific at the `npm run` level yet — new Curious Ladoo test files will be added to
`tests/` following the existing `node:test` convention and run explicitly by filename until wired
into a `test:curious-ladoo` script.
