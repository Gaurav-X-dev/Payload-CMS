import { buildConfig, type CollectionConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
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
import { Gallery } from './collections/Gallery'
import { SiteSettings } from './collections/SiteSettings'
import { Nav } from './collections/Nav'
import { Footer } from './collections/Footer'
import { SEO } from './collections/SEO'
import { Redirects } from './collections/Redirects'
import { Rooms } from './collections/Rooms'
import { Amenities } from './collections/Amenities'
import { Packages } from './collections/Packages'
import { assignTenant } from './hooks/assignTenant'
import { validateTenantTransfer } from './hooks/tenantTransferIntegrity'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
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
    Gallery,
    SiteSettings,
    Nav,
    Footer,
    SEO,
    Redirects,
    Rooms,
    Amenities,
    Packages,
  ].map(withTrustedTenantAssignment),
  editor: lexicalEditor({}),
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || 'payload-media',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || '',
          secretAccessKey: process.env.S3_SECRET_KEY || '',
        },
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
})
