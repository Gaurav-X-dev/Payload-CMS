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
| 3 | Site Settings, Nav, Footer | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 4 | Home | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
| 5 | About | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | Pending |
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

## 6. Verification commands (from `package.json`)

`npm run typecheck` · `npm run lint` · `npm run build` · `npm test` (chains authorization, phase1,
phase2, development-content, ghee-cms) · `npm run test:security`. No test runner is Ghee-Roast- or
Curious-Hub-specific at the `npm run` level yet — new Curious Ladoo test files will be added to
`tests/` following the existing `node:test` convention and run explicitly by filename until wired
into a `test:curious-ladoo` script.
