import {
  buildConfig,
  type CollectionConfig,
} from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

// Collections
import { Users } from './collections/Users'
import { Tenants } from './collections/Tenants'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { MenuCategories } from './collections/MenuCategories'
import { MenuItems } from './collections/MenuItems'
import { Testimonials } from './collections/Testimonials'
import { TeamMembers } from './collections/TeamMembers'
import { Events } from './collections/Events'
import { Reservations } from './collections/Reservations'
import { BlogPosts } from './collections/BlogPosts'
import { Locations } from './collections/Locations'
import { FAQs } from './collections/FAQs'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Gallery } from './collections/Gallery'
import { Brands } from './collections/Brands'
import { Portfolio } from './collections/Portfolio'
import { SiteSettings } from './collections/SiteSettings'
import { Nav } from './collections/Nav'
import { Footer } from './collections/Footer'
import { SEO } from './collections/SEO'
import { EmailSettings } from './collections/EmailSettings'
import { Redirects } from './collections/Redirects'
import { Rooms } from './collections/Rooms'
import { Amenities } from './collections/Amenities'
import { Packages } from './collections/Packages'
import { assignTenant } from './hooks/assignTenant'
import { validateTenantTransfer } from './hooks/tenantTransferIntegrity'
import { buildTrustedOrigins } from './lib/security/trustedOrigins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * One explicit allowlist shared by CORS and CSRF — never `*`, which would defeat CSRF protection
 * on the cookie-authenticated Admin panel. See lib/security/trustedOrigins.ts for how it is built
 * and which environment variables feed it.
 */
const trustedOrigins = buildTrustedOrigins()

const withTrustedTenantAssignment = (
  collection: CollectionConfig,
): CollectionConfig => {
  const isTenantScoped = collection.fields.some(
    (field) => 'name' in field && field.name === 'tenantId',
  )

  if (!isTenantScoped) return collection

  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      beforeValidate: [
        assignTenant,
        validateTenantTransfer,
        ...(collection.hooks?.beforeValidate ?? []),
      ],
    },
  }
}

export default buildConfig({
  // `serverURL` is deliberately left unset, even though Payload's own warning suggests setting it.
  //
  // getRequestOrigin (payload/dist/utilities/getRequestOrigin.js) has two ways to produce a
  // trusted origin: return `serverURL` verbatim, or validate the Host-derived origin against the
  // cors/csrf allowlist and return that. The allowlist path is the correct one for a multi-tenant
  // deployment — each tenant domain then yields its own request origin instead of every tenant
  // being pinned to one canonical URL.
  //
  // Setting `serverURL` would also change media URLs. The `url` field's afterRead hook calls
  // generateFilePathOrURL with `relative: false`, so a non-empty serverURL turns every read of a
  // locally-stored file from `/api/media/file/x.jpg` into `https://<serverURL>/api/media/file/x.jpg`
  // — meaning a tenant browsing their own domain would load images from the Railway domain, and a
  // stale NEXT_PUBLIC_SERVER_URL would break every image at once. (Stored values are unaffected:
  // the beforeChange hook uses `relative: true`.) Not worth the blast radius when the allowlist
  // silences the warning on its own.
  cors: trustedOrigins,
  csrf: trustedOrigins,
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: {
            exportName: 'EnterpriseDashboard',
            path: './components/admin/EnterpriseDashboard',
          },
        },
      },
    },
  },
  collections: [
    Users,
    Tenants,
    Media,
    Pages,
    MenuCategories,
    MenuItems,
    Testimonials,
    TeamMembers,
    Events,
    Reservations,
    BlogPosts,
    Locations,
    FAQs,
    ContactSubmissions,
    NewsletterSubscribers,
    Gallery,
    Brands,
    Portfolio,
    SiteSettings,
    Nav,
    Footer,
    SEO,
    EmailSettings,
    Redirects,
    Rooms,
    Amenities,
    Packages,
  ].map(withTrustedTenantAssignment),
  editor: lexicalEditor({}),
  // No global email adapter is registered. Real delivery is entirely tenant-scoped, resolved
  // and sent per-tenant via src/lib/mail/smtpTransport.ts (their own SMTP account, e.g.
  // Hostinger) — never one shared global transport. Payload still performs one internal,
  // unavoidable `email.sendEmail(...)` call as part of its official forgotPassword operation;
  // leaving this unset means that call lands on Payload's built-in console adapter (a log line
  // only, no external delivery), which is intentional — see forgotPasswordEmailContent.ts.
  plugins: [
    ...(process.env.S3_ACCESS_KEY && process.env.S3_ENDPOINT
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.S3_BUCKET || 'payload-media',
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY || '',
              },
              region: process.env.S3_REGION || 'auto',
              endpoint: process.env.S3_ENDPOINT,
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: false,
  }),
})
