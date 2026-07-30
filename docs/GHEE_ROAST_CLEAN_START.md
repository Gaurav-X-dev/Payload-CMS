# Ghee Roast Clean Start

## 1. Purpose

This guide creates a genuinely clean local Payload environment. It explains how to remove development and test content safely, start Payload without tenant content, create the first Super Admin manually, create the Ghee Roast tenant, and configure the dynamic Header and homepage Hero.

The reset does not seed replacement records. With static theme fallbacks disabled, missing Ghee Roast Nav and Hero records render safe empty states instead of demo copy.

## 2. Safety Warning

This workflow is for development databases only.

- Verify `DATABASE_URI` before running a reset.
- Never point the command at a production database.
- The confirmed reset deletes tenant content, tenants, memberships, and all users not explicitly preserved.
- It never drops tables, deletes migrations, or changes schema.
- Media records and uploaded files remain by default. `--include-media` explicitly deletes both media records and their managed files.
- Make a database backup if any local records matter.

## 3. Environment Setup

Copy `.env.example` to `.env` and configure placeholders appropriate to the local machine:

```env
DATABASE_URI=
PAYLOAD_SECRET=
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
DEFAULT_TENANT_SLUG=ghee-roast
ENABLE_THEME_STATIC_FALLBACKS=false

S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=
S3_REGION=

RESEND_API_KEY=
REVALIDATE_SECRET=
```

The `SEED_*` variables in `.env.example` are required only for the optional `npm run db:seed:dev` workflow. Do not run that command for a manual clean start.

After changing `ENABLE_THEME_STATIC_FALLBACKS`, restart the Next.js development server. Only the literal value `true` enables static Ghee Roast Header and Hero fallbacks; missing, empty, and `false` values use safe empty states.

## 4. Verify Current Git Branch

```powershell
git branch --show-current
git status
```

The expected branch is:

```text
feature/ghee-roast-dynamic
```

Review existing working-tree changes before continuing.

## 5. Install Dependencies

```powershell
npm install
```

Node.js 22 or newer is required.

## 6. Preview Reset

```powershell
npm run db:reset:dev -- --confirm --dry-run
```

The command prints each collection and the number of records planned for deletion. Confirm that the database is the intended local database and review the counts for content, tenants, and users. A dry-run performs no updates or deletions.

## 7. Perform Clean Reset

```powershell
npm run db:reset:dev -- --confirm
```

Expected output includes the planned count for every cleaned collection followed by final deletion totals. With no preservation option, all users and tenants are removed. Retained media records are detached from deleted tenants and users.

Optional flags:

```powershell
# Delete media records and managed uploaded files too
npm run db:reset:dev -- --confirm --include-media

# Keep a specific login, but clear its deleted tenant memberships
npm run db:reset:dev -- --confirm --preserve-email=user@example.com
```

The command refuses to run when `NODE_ENV=production` or when `--confirm` is missing.

## 8. Start the Project

```powershell
npm run dev
```

Open:

- Payload Admin: `http://localhost:3000/admin`
- Ghee Roast: `http://ghee-roast.localhost:3000`

Starting the application does not run a seed or create tenant content.

## 9. Create First Super Admin

When no users remain, opening `/admin` displays Payload's first-user creation screen.

Enter:

- **Name:** the developer's chosen administrator name
- **Email:** a legitimate local-development email
- **Password:** a new local-development password

The Users hook assigns the first account the **Super Admin** (`super_admin`) role with no tenant restriction. Use an active account status if the installed Admin UI exposes one.

If `--preserve-email` kept an account, the first-user screen will not appear. Sign in with that preserved account instead.

## 10. Create Tenant User

The tenant must exist before its relationship can be assigned. A practical sequence is:

1. In **Users**, create the user while signed in as Super Admin.
2. Set **Name**, **Email**, and a new password.
3. Set **Roles** to **Tenant Admin** (`tenant_admin`), never `super_admin`.
4. After creating the Ghee Roast tenant, edit the user and add it under **Tenants**.
5. Save.

`tenant_member` is read-only for business content. Use `tenant_admin` for a user who must manage Ghee Roast content.

## 11. Create Ghee Roast Tenant

Open **Tenants → Create New** and configure the actual collection fields:

- **Name:** `Ghee Roast`
- **Slug:** `ghee-roast`
- **Type:** `Restaurant`
- **Theme:** `Ghee Roast`
- **Parent Tenant:** leave empty
- **Is Active:** enabled
- **Is Primary:** enable only if Ghee Roast should be the local primary tenant
- **Domains → Domain:** `ghee-roast.localhost`
- **Settings:** verify locale, timezone, and currency
- **Contact:** optional email and phone
- **Branding:** optional colors, logo, and favicon

Save the tenant, then return to the tenant user and assign this tenant in the user's **Tenants** relationship.

The unused `createTenantDefaults` helper is not registered in Payload configuration, so creating the tenant does not silently create Nav, Footer, or Site Settings records.

## 12. Create Site Settings

Open **Site Settings → Create New**:

- **Tenant:** Ghee Roast
- **Business Name:** the public site identity; this field is required
- **Legal Name** and **Tax ID:** optional
- **Cuisine Type** and **Price Range:** optional
- Configure maps, hours, integrations, social links, or analytics only as needed.

Site Settings has no logo field. Tenant branding and the Nav logo relationship provide brand media.

## 13. Create Dynamic Navbar

Open:

```text
Nav
  → Create New
```

Configure:

- **Tenant:** Ghee Roast
- **Internal Name:** for example `Ghee Roast Primary Header`
- **Location:** `Header`
- **Brand Name:** the text displayed beside the logo
- **Logo:** optional Ghee Roast Media relationship

Under **Links**, add a `Link` block for each item:

- **Label:** visible navigation text
- **Type:** Page, Internal URL, External URL, or Anchor Link
- **Page:** choose a same-tenant Page when Type is Page
- **URL:** enter the path or URL for other types
- **Enabled:** controls visibility
- **Sort Order:** lower numbers render first
- **New Tab:** opens the destination in a new tab
- **Nofollow** and **Visibility:** configure when needed

Under **CTA** configure:

- **Enabled**
- **Label**
- **URL**

The CTA renders only when it is enabled and both label and URL are present. Save the Nav record.

## 14. Create Dynamic Homepage Hero

Open:

```text
Pages
  → Create New
```

Configure the **General** tab:

- **Tenant:** Ghee Roast
- **Title:** `Home`
- **Is Home Page:** enabled
- **Slug:** leave empty; the Page hook forces homepage slugs to an empty value
- **Status:** `published`
- **Published At:** set as appropriate

In **Layout**, add a **Hero Block** and configure:

- **Enabled**
- **Eyebrow**
- **Heading**; line breaks preserve the theme heading layout
- **Highlighted Heading**
- **Description**
- **Primary CTA Label** and **Primary CTA URL**
- **Secondary CTA Label** and **Secondary CTA URL**
- **Desktop Background Image**
- **Mobile Background Image**
- **Foreground Image**
- **Image Alt**
- **Overlay Opacity**, when needed

Use Media belonging to the same tenant. Finally use Payload's **Publish** action so both the Page status and Payload draft status are published.

## 15. Verify Frontend

Open `http://ghee-roast.localhost:3000` and verify:

- Ghee Roast resolves to the active tenant.
- Header links and ordering match the Nav record.
- The Header CTA matches Payload.
- Hero copy, buttons, and media match the published Page.
- Static demo Header and Hero data are absent when fallbacks are disabled.
- Saved changes appear after a normal refresh.
- Mobile navigation still opens and closes correctly.
- Zuru Zuru remains unchanged.

## 16. Troubleshooting

### Old content still appears

Confirm `ENABLE_THEME_STATIC_FALLBACKS=false`, restart `npm run dev`, and verify the old Nav/Page records were included in the reset totals. Sections below the Hero remain intentionally static in this phase.

### Fallback variable is not loaded

The value belongs in `.env`, not only `.env.example`. Restart the development server after changing it. Only `true` enables fallback content.

### Tenant hostname is not found

Verify the tenant is active, has theme `ghee-roast`, and contains `ghee-roast.localhost` under **Domains**.

### Windows does not resolve the localhost subdomain

Modern browsers normally resolve `.localhost`. Otherwise add `127.0.0.1 ghee-roast.local` to the Windows hosts file and use the existing `ghee-roast.local` registry alias.

### The hostname includes a port

This is supported. The resolver removes `:3000` safely.

### Unknown hostname returns 404

This is expected. Only registered local theme hostnames are routed.

### Navbar is missing

With fallback disabled, a missing Nav intentionally renders an empty navigation. Check its Ghee Roast tenant relationship, `Header` location, enabled links, URLs/Page relationships, and CTA label/URL.

### Hero is missing

Confirm the Page belongs to Ghee Roast, **Is Home Page** is enabled, both status controls are published, and Layout contains an enabled Hero Block.

### User cannot see the tenant

Confirm the user has the `tenant_admin` role and the Ghee Roast tenant in **Users → Tenants**. Do not grant `super_admin` merely to bypass a missing membership.

### Image does not render

Confirm the Media record has a URL, belongs to Ghee Roast, and is selected in Nav, Tenant branding, or Hero. Media retained by a clean reset is deliberately unassigned and must be reassigned by a Super Admin before reuse.

### Reset refuses to run

Check that `NODE_ENV` is not `production`, add `--confirm`, and verify the database connection. Failures return a non-zero process exit code.

### Cached content appears

The Ghee content loader uses Payload's Local API without a read cache. Nav and Page hooks retain tenant-aware revalidation. Refresh normally; if an environment variable changed, restart the dev server.

### Generated Payload types are outdated

Run:

```powershell
npm run payload -- generate:types
npm run typecheck
```

## 17. Developer Testing Checklist

- [ ] Reset dry-run reviewed
- [ ] Database reset completed
- [ ] `npm run dev` starts
- [ ] `/admin` opens
- [ ] Super Admin created
- [ ] Tenant user created
- [ ] Ghee Roast tenant created
- [ ] Membership assigned
- [ ] Site Settings created
- [ ] Nav created
- [ ] Home Page created
- [ ] Hero configured
- [ ] Header renders dynamically
- [ ] Hero renders dynamically
- [ ] Mobile layout works
- [ ] Unknown hostname returns expected result
- [ ] Zuru Zuru regression checked
- [ ] Lint passes
- [ ] TypeScript passes
- [ ] Tests pass
- [ ] Production build passes

## 18. Future Dynamic Work

Future CMS phases can cover:

- Footer
- About section
- Menu section
- Gallery
- Testimonials
- Contact
- Catering
- Delivery
- Quality page
- SEO
- Forms
- Blogs
