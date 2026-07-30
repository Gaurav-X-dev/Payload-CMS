import type { Payload } from 'payload'
import { USER_ROLES } from '../access/tenantContext'

export type DevelopmentSeedEnvironment = {
  SEED_SUPER_ADMIN_EMAIL?: string
  SEED_SUPER_ADMIN_NAME?: string
  SEED_SUPER_ADMIN_PASSWORD?: string
  SEED_TENANT_DOMAIN?: string
  SEED_TENANT_USER_EMAIL?: string
  SEED_TENANT_USER_NAME?: string
  SEED_TENANT_USER_PASSWORD?: string
}

export type DevelopmentSeedResult = {
  homepageID: number | string
  navigationID: number | string
  siteSettingsID: number | string
  superAdminID: number | string
  tenantID: number | string
  tenantUserID: number | string
}

export const developmentSeedEnvironmentFromProcess = (): DevelopmentSeedEnvironment => ({
  SEED_SUPER_ADMIN_EMAIL: process.env.SEED_SUPER_ADMIN_EMAIL,
  SEED_SUPER_ADMIN_NAME: process.env.SEED_SUPER_ADMIN_NAME,
  SEED_SUPER_ADMIN_PASSWORD: process.env.SEED_SUPER_ADMIN_PASSWORD,
  SEED_TENANT_DOMAIN: process.env.SEED_TENANT_DOMAIN,
  SEED_TENANT_USER_EMAIL: process.env.SEED_TENANT_USER_EMAIL,
  SEED_TENANT_USER_NAME: process.env.SEED_TENANT_USER_NAME,
  SEED_TENANT_USER_PASSWORD: process.env.SEED_TENANT_USER_PASSWORD,
})

const requiredSeedKeys = [
  'SEED_SUPER_ADMIN_NAME',
  'SEED_SUPER_ADMIN_EMAIL',
  'SEED_SUPER_ADMIN_PASSWORD',
  'SEED_TENANT_DOMAIN',
  'SEED_TENANT_USER_NAME',
  'SEED_TENANT_USER_EMAIL',
  'SEED_TENANT_USER_PASSWORD',
] as const

export function validateDevelopmentSeedEnvironment(
  environment: DevelopmentSeedEnvironment,
): asserts environment is Required<DevelopmentSeedEnvironment> {
  const missing = requiredSeedKeys.filter((key) => !environment[key]?.trim())
  if (missing.length) {
    throw new Error(`Missing required development seed variables: ${missing.join(', ')}`)
  }
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

export async function seedDevelopmentContent(
  payload: Payload,
  environment: DevelopmentSeedEnvironment = developmentSeedEnvironmentFromProcess(),
): Promise<DevelopmentSeedResult> {
  validateDevelopmentSeedEnvironment(environment)

  const existingSuperAdmin = await findFirst(payload, 'users', {
    email: { equals: environment.SEED_SUPER_ADMIN_EMAIL.toLowerCase() },
  })
  const superAdmin = existingSuperAdmin
    ? await payload.update({
        id: existingSuperAdmin.id,
        collection: 'users',
        context: { developmentSeed: true },
        data: {
          email: environment.SEED_SUPER_ADMIN_EMAIL.toLowerCase(),
          name: environment.SEED_SUPER_ADMIN_NAME,
          password: environment.SEED_SUPER_ADMIN_PASSWORD,
          roles: [USER_ROLES.superAdmin],
          tenants: [],
        },
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'users',
        context: { developmentSeed: true },
        data: {
          email: environment.SEED_SUPER_ADMIN_EMAIL.toLowerCase(),
          name: environment.SEED_SUPER_ADMIN_NAME,
          password: environment.SEED_SUPER_ADMIN_PASSWORD,
          roles: [USER_ROLES.superAdmin],
          tenants: [],
        },
        overrideAccess: true,
      })

  const existingTenant = await findFirst(payload, 'tenants', {
    slug: { equals: 'ghee-roast' },
  })
  const tenantData = {
    branding: {
      accentColor: '#C44D18',
      backgroundColor: '#f4efe6',
      primaryColor: '#3E5237',
    },
    domains: [
      { domain: environment.SEED_TENANT_DOMAIN.toLowerCase() },
    ],
    features: {
      enableCatering: true,
      enableGallery: true,
      enableMenu: true,
      enableReservations: true,
    },
    isActive: true,
    isPrimary: true,
    layout: {
      footerStyle: 'light' as const,
      headerStyle: 'transparent-scroll' as const,
      preset: 'classic' as const,
    },
    name: 'Ghee Roast',
    settings: {
      currency: 'INR',
      defaultLocale: 'en',
      timezone: 'Asia/Kolkata',
    },
    slug: 'ghee-roast',
    theme: 'ghee-roast' as const,
    type: 'restaurant' as const,
    typography: {
      bodyFont: 'Inter',
      cardRadius: '12px',
      headingFont: 'Oswald',
      headingTransform: 'uppercase' as const,
    },
  }
  const tenant = existingTenant
    ? await payload.update({
        id: existingTenant.id,
        collection: 'tenants',
        data: tenantData,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'tenants',
        data: tenantData,
        overrideAccess: true,
      })

  const existingTenantUser = await findFirst(payload, 'users', {
    email: { equals: environment.SEED_TENANT_USER_EMAIL.toLowerCase() },
  })
  const tenantUserData = {
    email: environment.SEED_TENANT_USER_EMAIL.toLowerCase(),
    name: environment.SEED_TENANT_USER_NAME,
    password: environment.SEED_TENANT_USER_PASSWORD,
    roles: [USER_ROLES.tenantAdmin],
    tenants: [tenant.id],
  }
  const tenantUser = existingTenantUser
    ? await payload.update({
        id: existingTenantUser.id,
        collection: 'users',
        context: { developmentSeed: true },
        data: tenantUserData,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'users',
        context: { developmentSeed: true },
        data: tenantUserData,
        overrideAccess: true,
      })

  const existingSettings = await findFirst(payload, 'site-settings', {
    tenantId: { equals: tenant.id },
  })
  const settingsData = {
    businessName: 'Very Good Ghee Roast',
    cuisineType: 'Mangalorean Coastal',
    priceRange: '$$' as const,
    tenantId: tenant.id,
  }
  const siteSettings = existingSettings
    ? await payload.update({
        id: existingSettings.id,
        collection: 'site-settings',
        data: settingsData,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'site-settings',
        data: settingsData,
        overrideAccess: true,
      })

  const existingNavigation = await findFirst(payload, 'nav', {
    tenantId: { equals: tenant.id },
  })
  const navigationData = {
    brandName: 'Very Good',
    cta: {
      enabled: true,
      label: 'Order online',
      url: '/menu',
    },
    internalName: 'Ghee Roast Primary Header',
    links: [
      ['Home', '/', 0],
      ['Menu', '/menu', 10],
      ['Our Story', '/about', 20],
      ['Quality', '/quality', 30],
      ['Delivery', '/delivery', 40],
      ['Catering', '/catering', 50],
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
  const navigation = existingNavigation
    ? await payload.update({
        id: existingNavigation.id,
        collection: 'nav',
        data: navigationData,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'nav',
        data: navigationData,
        overrideAccess: true,
      })

  const existingHomepage = await findFirst(payload, 'pages', {
    and: [
      { tenantId: { equals: tenant.id } },
      { isHomePage: { equals: true } },
    ],
  })
  const homepageData = {
    _status: 'published' as const,
    isHomePage: true,
    layout: [
      {
        blockType: 'heroBlock' as const,
        description: 'We slow roast every dish in ghee to bring out bold flavours and aromas that stay with you.',
        enabled: true,
        heading: 'Real Ingredients.\nRich Flavours.',
        highlightedHeading: 'Pure Ghee.',
        imageAlt: 'Signature chicken ghee roast',
        primaryCTALabel: 'Explore Menu',
        primaryCTAURL: '/menu',
        secondaryCTALabel: 'Order Now',
        secondaryCTAURL: '/delivery',
      },
    ],
    publishedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    slug: '',
    status: 'published' as const,
    tenantId: tenant.id,
    title: 'Ghee Roast Home',
  }
  const homepage = existingHomepage
    ? await payload.update({
        id: existingHomepage.id,
        collection: 'pages',
        data: homepageData,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'pages',
        data: homepageData,
        overrideAccess: true,
      })

  payload.logger.info('Development seed completed without logging credentials.')

  return {
    homepageID: homepage.id,
    navigationID: navigation.id,
    siteSettingsID: siteSettings.id,
    superAdminID: superAdmin.id,
    tenantID: tenant.id,
    tenantUserID: tenantUser.id,
  }
}
