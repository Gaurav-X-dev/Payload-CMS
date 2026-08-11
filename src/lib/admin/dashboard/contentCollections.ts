// Curated list of genuine, tenant-scoped CMS content collections eligible for Content Growth /
// Recent Updates. Deliberately excludes:
//  - users, tenants: not content
//  - email-settings, footer, nav, seo, site-settings: 1:1 tenant config singletons, not "growth"
//  - contact-submissions, reservations: inbound user submissions, not CMS-authored content
//  - redirects: operational, not content
// Each entry's `titleField` matches that collection's actual `admin.useAsTitle` (verified by
// reading every collection file directly, not assumed).
export type ContentCollectionSlug =
  | 'amenities'
  | 'blog-posts'
  | 'brands'
  | 'events'
  | 'faqs'
  | 'gallery'
  | 'locations'
  | 'media'
  | 'menu-categories'
  | 'menu-items'
  | 'packages'
  | 'pages'
  | 'portfolio'
  | 'rooms'
  | 'teammembers'
  | 'testimonials'

export type ContentCollectionMeta = {
  slug: ContentCollectionSlug
  titleField: string
}

export const CONTENT_GROWTH_COLLECTIONS: ContentCollectionMeta[] = [
  { slug: 'pages', titleField: 'title' },
  { slug: 'menu-items', titleField: 'title' },
  { slug: 'menu-categories', titleField: 'title' },
  { slug: 'blog-posts', titleField: 'title' },
  { slug: 'media', titleField: 'alt' },
  { slug: 'testimonials', titleField: 'customerName' },
  { slug: 'events', titleField: 'title' },
  { slug: 'gallery', titleField: 'title' },
  { slug: 'brands', titleField: 'name' },
  { slug: 'portfolio', titleField: 'title' },
  { slug: 'teammembers', titleField: 'title' },
  { slug: 'locations', titleField: 'title' },
  { slug: 'faqs', titleField: 'title' },
  { slug: 'rooms', titleField: 'title' },
  { slug: 'amenities', titleField: 'title' },
  { slug: 'packages', titleField: 'title' },
]

// Of the curated content collections, only these two have a real publish/draft workflow
// (versions.drafts: true + a genuine "published" state) — verified by reading each collection
// file. The rest have no draft/publish concept at all, so they cannot contribute to a
// "Publishing Trend" and are correctly excluded.
export type PublishableCollectionMeta = {
  slug: 'blog-posts' | 'pages'
  // Field holding the publish-state value.
  statusField: string
  // Value that means "published" for statusField.
  publishedValue: string
  // Field to bucket by for the trend. For blog-posts this is the intentional publishedDate
  // field; for pages there is no reliable auto-stamped publish moment (publishedAt is a plain,
  // manually-editable field with no hook setting it), so updatedAt is used as the most honest
  // available signal — documented explicitly, not fabricated.
  timestampField: string
  timestampFallbackField?: string
}

export const PUBLISHING_TREND_COLLECTIONS: PublishableCollectionMeta[] = [
  {
    slug: 'blog-posts',
    statusField: 'status',
    publishedValue: 'published',
    timestampField: 'publishedDate',
    timestampFallbackField: 'updatedAt',
  },
  {
    slug: 'pages',
    statusField: '_status',
    publishedValue: 'published',
    timestampField: 'updatedAt',
  },
]
