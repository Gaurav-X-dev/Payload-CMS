# Payload CMS multi-tenant application

## Local development

Use Node.js 22 or newer (Node.js 24 is the currently verified version) and npm.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and replace every placeholder. Never commit secrets.
3. Provide PostgreSQL 16 using `docker compose -f docker-compose.dev.yml up -d` or an equivalent local database, and set `DATABASE_URI`.
4. Generate Payload's tracked admin import map with `npm run payload:generate-importmap`.
5. Start the application with `npm run dev`.

The admin is served at `/admin`. Browser QA must use a legitimate, disposable local account created through the normal application flow. No test credentials are stored in this repository.

### Controlled development reset and seed

For a complete manual CMS bootstrap, set `ENABLE_THEME_STATIC_FALLBACKS=false` and follow
[`docs/GHEE_ROAST_CLEAN_START.md`](docs/GHEE_ROAST_CLEAN_START.md).

The optional automated seed requires all seven `SEED_*` variables from `.env.example`:

```powershell
npm run db:reset:dev -- --confirm
npm run db:seed:dev
npm run dev
```

The reset command is development-only, refuses to run without `--confirm`, and never drops tables or migrations. With no `--preserve-email` flag it removes every user, allowing Payload to show its first-user setup screen. Media records and uploaded files are preserved by default, while their deleted tenant/user relationships are detached. To explicitly delete media records and files, add `--include-media`; use `--dry-run` to print counts without changing records. Preserve an account only with `--preserve-email=user@example.com`.

The seed is idempotent: it creates or updates one Ghee Roast tenant (`ghee-roast`), one environment-configured Super Admin, one tenant administrator, site identity, primary header navigation, and the published homepage Hero. Re-running it updates those stable records rather than creating duplicates. Passwords are handled by Payload Auth and are never printed.

After seeding:

1. Open `http://localhost:3000/admin`.
2. Sign in using `SEED_SUPER_ADMIN_EMAIL` to manage every tenant, or `SEED_TENANT_USER_EMAIL` to manage only Ghee Roast content.
3. Open the **Nav** collection, select **Ghee Roast Primary Header**, and edit links, ordering, logo, brand name, or the Order Online CTA.
4. Open the **Pages** collection, select **Ghee Roast Home**, and edit its **Hero** block.
5. Open `http://ghee-roast.localhost:3000` to verify the server-rendered result.

When `ENABLE_THEME_STATIC_FALLBACKS=true`, the public theme uses its existing static navigation and Hero when CMS records are absent. With the recommended clean-start value `false`, it renders a safe empty Header/Hero state instead.

### Ghee Roast local theme

The static Ghee Roast theme is selected by hostname and is available at `http://ghee-roast.localhost:3000`. Its routes are `/`, `/about`, `/menu`, `/catering`, `/contact`, `/delivery`, and `/quality`; the hostname remains visible and no tenant path prefix is used. `localhost` is a development fallback.

Modern browsers normally resolve `.localhost` automatically. If a local environment does not, map `127.0.0.1 ghee-roast.local` in the Windows hosts file; that fallback is already present in the static local-site registry. The source design under `templates/ghee-roast` remains read-only reference material; production assets live under `public/themes/ghee-roast`.

## Quality commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Type-check application and tests |
| `npm run typecheck:app` | Type-check production application sources |
| `npm run typecheck:tests` | Type-check tests with their Node `.ts` import semantics |
| `npm run lint` | Run ESLint over source, tests, scripts, and configuration |
| `npm run lint:fix` | Apply reviewed ESLint autofixes |
| `npm run build` | Run both type-checks and create the production Next.js build |
| `npm test` | Run the complete non-destructive unit test matrix |
| `npm run test:authorization` | Run role, authorization, validation, and privilege-escalation unit tests |
| `npm run test:phase1` | Run tenant-access unit tests |
| `npm run test:phase2` | Run relationship-integrity tests |
| `npm run test:security:serial` | Run the authoritative security suite serially |

Security tests require a reachable test database configured by `.env`. They initialize Payload directly; they do not depend on an already-running Next.js development server. Fixtures use deterministic per-suite namespaces, remove only records they created, and close database resources.

## Admin architecture

`src/payload.config.ts` registers `EnterpriseDashboard` with Payload's supported component descriptor, including its named `exportName`. Payload generates `src/app/(payload)/admin/importMap.js`; do not hand-edit that file. Regenerate it after changing admin component registration and verify that a second generation is diff-free.

The admin layout imports the shared admin theme, list, and form styles. Semantic variables in `src/styles/admin-theme.css` provide dark, light, and system-mode values under the admin scope. The public application layout does not import those styles, which keeps admin tokens and presentation out of public routes.

## Troubleshooting

- If the dashboard reports an import-map error, run `npm run payload:generate-importmap` and confirm the named `EnterpriseDashboard` entry is present.
- If test imports report TS5097, use `npm run typecheck:tests`; the dedicated test configuration enables TypeScript extensions only with `noEmit`.
- If security tests collide or do not terminate, stop other concurrent security runs and use the serialized command.
- If the build cannot connect to PostgreSQL, verify `DATABASE_URI`, database health, and that the schema/migrations expected by the environment are current.
- ESLint currently reports existing `no-explicit-any` and unused-symbol debt as warnings. New code should not add to that debt.

## Package advisories

Review production advisories with `npm audit --omit=dev`. Do not use `npm audit fix --force`: the current forced remediation path may propose incompatible framework downgrades, while some transitive tooling advisories require upstream releases. Re-run the build and complete security matrix after any supported dependency update.

## Release checklist

### Pre-release

- [ ] Environment variables and secrets verified
- [ ] Database backup completed and migration status verified
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` are green
- [ ] Generated import map is current and repeatable
- [ ] Serialized security suite plus Stages 18, 23, 24, Phase 1, and Phase 2 are green
- [ ] Authenticated admin browser QA is complete
- [ ] Dark, light, and system themes are validated
- [ ] Responsive and accessibility checks are complete
- [ ] Public frontend routes are validated for admin-style isolation
- [ ] Production package advisories are reviewed

### Deployment

- [ ] Install locked production dependencies
- [ ] Build and start or restart the service
- [ ] Verify representative health/public routes and admin login
- [ ] Verify tenant access boundaries and application logs

### Post-release

- [ ] Dashboard, collection list, and create/edit form open normally
- [ ] Public site opens normally
- [ ] Server and browser console contain no new errors
- [ ] No tenant leakage or unauthorized actions are visible
