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
| 4 | Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §8 |
| 5 | About | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Done — see §8 |
| 6 | Services | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 7 | Brands | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 8 | Portfolio | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 9 | How We Work | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 10 | Testimonials | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 11 | Careers | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 12 | FAQs | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 13 | Contact | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 14 | Blog/Journal | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 15 | SEO | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
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

## 9. Verification commands (from `package.json`)

`npm run typecheck` · `npm run lint` · `npm run build` · `npm test` (chains authorization, phase1,
phase2, development-content, ghee-cms) · `npm run test:security`. No test runner is Ghee-Roast- or
Curious-Hub-specific at the `npm run` level yet — new Curious Ladoo test files will be added to
`tests/` following the existing `node:test` convention and run explicitly by filename until wired
into a `test:curious-ladoo` script.
