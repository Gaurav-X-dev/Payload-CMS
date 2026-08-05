import type { Payload } from 'payload'
import { USER_ROLES } from '../access/tenantContext'

export type CuriousLadooSeedResult = {
  footerID: number | string
  navID: number | string
  seoID: number | string
  siteSettingsID: number | string
  tenantID: number | string
}

const findFirst = async (
  payload: Payload,
  collection: Parameters<Payload['find']>[0]['collection'],
  where: NonNullable<Parameters<Payload['find']>[0]['where']>,
) => {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where,
  })
  return result.docs[0]
}

/**
 * Creates (or idempotently updates) the Curious Ladoo tenant identity plus its
 * Site Settings / Nav / Footer / SEO singleton documents. Safe to re-run: every
 * document is matched by tenant slug/id first, never duplicated. Does not touch
 * Ghee Roast, Zuru Zuru, or any other tenant's records.
 */
export async function seedCuriousLadooContent(payload: Payload): Promise<CuriousLadooSeedResult> {
  // Tenant-scoped collections require an authenticated trusted context (assignTenant
  // rejects unauthenticated creates outside of a real public request). Act as an
  // existing super admin so tenantId assignment and audit stamping resolve correctly;
  // overrideAccess still governs the actual permission check.
  const superAdmin = await findFirst(payload, 'users', {
    roles: { contains: USER_ROLES.superAdmin },
  })
  if (!superAdmin) {
    throw new Error('No super admin user exists to run the Curious Ladoo seed as.')
  }

  const existingTenant = await findFirst(payload, 'tenants', {
    slug: { equals: 'curious-ladoo' },
  })
  const tenantData = {
    branding: {
      accentColor: '#D4845A',
      backgroundColor: '#F8F5F0',
      primaryColor: '#C46A3A',
    },
    contact: {
      contactEmail: 'hello@curiousladoo.com',
      contactPhone: '+91 98765 43210',
    },
    domains: [],
    features: {
      enableBlog: true,
      enableCatering: false,
      enableGallery: true,
      enableMenu: false,
      enableReservations: false,
    },
    isActive: true,
    isPrimary: true,
    layout: {
      footerStyle: 'light' as const,
      headerStyle: 'transparent-scroll' as const,
      preset: 'elegant' as const,
    },
    name: 'Curious Ladoo',
    settings: {
      currency: 'INR',
      defaultLocale: 'en',
      timezone: 'Asia/Kolkata',
    },
    slug: 'curious-ladoo',
    theme: 'curious-hub' as const,
    type: 'hospitality' as const,
    typography: {
      bodyFont: 'Inter',
      cardRadius: '8px',
      decorativeFont: 'Cormorant Garamond',
      headingFont: 'Playfair Display',
      headingTransform: 'none' as const,
    },
  }
  const tenant = existingTenant
    ? await payload.update({
        id: existingTenant.id,
        collection: 'tenants',
        data: tenantData,
        overrideAccess: true,
        user: superAdmin,
      })
    : await payload.create({
        collection: 'tenants',
        data: tenantData,
        overrideAccess: true,
        user: superAdmin,
      })

  const existingSettings = await findFirst(payload, 'site-settings', {
    tenantId: { equals: tenant.id },
  })
  const settingsData = {
    _status: 'published' as const,
    businessName: 'Curious Ladoo',
    contactAddress: 'New Delhi, India',
    newsletter: {
      buttonLabel: 'Subscribe',
      description:
        'Get updates on new brands, openings, and hospitality insights from Curious Ladoo.',
      enabled: true,
      errorMessage: 'We could not save your signup. Please try again later.',
      highlightedWord: 'Loop',
      placeholder: 'Enter your email address',
      privacyText: 'We respect your privacy. Unsubscribe anytime.',
      successMessage: 'Thank you for subscribing!',
      title: 'Stay In The Loop',
    },
    showAnnouncementBar: false,
    siteDescription:
      'Curious Ladoo is a premium hospitality group building restaurant brands, consulting services, cloud kitchens, and hospitality systems across India.',
    socials: [
      {
        enabled: true,
        icon: 'platform' as const,
        openInNewTab: true,
        platform: 'instagram' as const,
        sortOrder: 0,
        url: 'https://instagram.com/curiousladoo',
      },
      {
        enabled: true,
        icon: 'platform' as const,
        openInNewTab: true,
        platform: 'linkedin' as const,
        sortOrder: 1,
        url: 'https://linkedin.com/company/curiousladoo',
      },
      {
        enabled: true,
        icon: 'platform' as const,
        openInNewTab: true,
        platform: 'twitter' as const,
        sortOrder: 2,
        url: 'https://twitter.com/curiousladoo',
      },
    ],
    tagline: 'Building Hospitality Brands',
    tenantId: tenant.id,
    whatsappNumber: '9876543210',
  }
  const siteSettings = existingSettings
    ? await payload.update({
        id: existingSettings.id,
        collection: 'site-settings',
        data: settingsData,
        overrideAccess: true,
        user: superAdmin,
      })
    : await payload.create({
        collection: 'site-settings',
        data: settingsData,
        overrideAccess: true,
        user: superAdmin,
      })

  const existingNav = await findFirst(payload, 'nav', {
    tenantId: { equals: tenant.id },
  })
  const navData = {
    _status: 'published' as const,
    brandName: 'Curious Ladoo',
    cta: {
      enabled: true,
      label: "Let's Talk",
      url: '/contact',
    },
    internalName: 'Curious Ladoo Primary Header',
    links: [
      ['Home', '/', 0],
      ['About', '/about', 10],
      ['Services', '/services', 20],
      ['Brands', '/brands', 30],
      ['How We Work', '/how-we-work', 40],
      ['Insights', '/blog', 50],
      ['Contact', '/contact', 60],
    ].map(([label, url, sortOrder]) => ({
      blockType: 'link' as const,
      enabled: true,
      label: String(label),
      newTab: false,
      sortOrder: Number(sortOrder),
      type: 'internal' as const,
      url: String(url),
      visibility: 'public' as const,
    })),
    location: 'header' as const,
    tenantId: tenant.id,
  }
  const nav = existingNav
    ? await payload.update({
        id: existingNav.id,
        collection: 'nav',
        data: navData,
        overrideAccess: true,
        user: superAdmin,
      })
    : await payload.create({
        collection: 'nav',
        data: navData,
        overrideAccess: true,
        user: superAdmin,
      })

  const existingFooter = await findFirst(payload, 'footer', {
    tenantId: { equals: tenant.id },
  })
  const footerData = {
    _status: 'published' as const,
    columns: [
      {
        title: 'Company',
        links: [
          { label: 'Our Story', url: '/about#story' },
          { label: 'Our Philosophy', url: '/about#philosophy' },
          { label: 'Our Journey', url: '/about#journey' },
          { label: 'Leadership', url: '/about#leadership' },
          { label: 'Careers', url: '/careers' },
        ],
      },
      {
        title: 'Brands',
        links: [
          { label: 'Zuru Zuru', url: '/brands#zuru' },
          { label: 'Ghee Roast', url: '/brands#ghee' },
          { label: 'Z-Quick', url: '/brands#quick' },
          { label: 'Future Brands', url: '/brands#future' },
        ],
      },
      {
        title: 'Services',
        links: [
          { label: 'Consulting', url: '/services#consulting' },
          { label: 'Menu Engineering', url: '/services#menu' },
          { label: 'Franchise Dev', url: '/services#franchise' },
          { label: 'Technology', url: '/services#tech' },
          { label: 'Staff Training', url: '/services#training' },
        ],
      },
      {
        title: 'Partner',
        links: [
          { label: 'Investors', url: '/contact?interest=b2b' },
          { label: 'Franchise', url: '/contact?interest=b2b' },
          { label: 'Suppliers', url: '/contact?interest=other' },
          { label: 'Insights', url: '/blog' },
        ],
      },
    ],
    contactHeading: 'Get In Touch',
    copyright: '© {year} Curious Ladoo Pvt. Ltd. All rights reserved.',
    tenantId: tenant.id,
  }
  const footer = existingFooter
    ? await payload.update({
        id: existingFooter.id,
        collection: 'footer',
        data: footerData,
        overrideAccess: true,
        user: superAdmin,
      })
    : await payload.create({
        collection: 'footer',
        data: footerData,
        overrideAccess: true,
        user: superAdmin,
      })

  const existingSEO = await findFirst(payload, 'seo', {
    tenantId: { equals: tenant.id },
  })
  const seoData = {
    keywords:
      'hospitality group, restaurant brands, F&B consulting, cloud kitchen, restaurant design, menu engineering',
    metaDescription:
      'Curious Ladoo is a premium hospitality group building restaurant brands, consulting services, cloud kitchens, and hospitality systems across India.',
    metaTitlePattern: '%s | Curious Ladoo',
    ogSiteName: 'Curious Ladoo',
    ogTitle: 'Curious Ladoo — We Build Hospitality That Lasts',
    tenantId: tenant.id,
    twitterSite: '@curiousladoo',
  }
  const seo = existingSEO
    ? await payload.update({
        id: existingSEO.id,
        collection: 'seo',
        data: seoData,
        overrideAccess: true,
        user: superAdmin,
      })
    : await payload.create({
        collection: 'seo',
        data: seoData,
        overrideAccess: true,
        user: superAdmin,
      })

  payload.logger.info('Curious Ladoo seed completed.')

  return {
    footerID: footer.id,
    navID: nav.id,
    seoID: seo.id,
    siteSettingsID: siteSettings.id,
    tenantID: tenant.id,
  }
}
