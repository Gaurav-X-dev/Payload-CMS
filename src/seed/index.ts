import type { Payload } from 'payload'

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding database...')

  try {
    // 1. Create Super Admin
    const superAdmin = await payload.create({
      collection: 'users',
      data: {
        email: 'admin@payload.local',
        password: 'password',
        name: 'Super Admin',
        roles: ['super_admin'],
      },
    })
    payload.logger.info('Created super admin user.')

    // 2. Create Hospitality Parent Tenant
    const hospitalityTenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Grand Hospitality Group',
        slug: 'grand-hospitality',
        type: 'hospitality',
        domains: [{ domain: 'grandhospitality.local' }],
        branding: {
          primaryColor: '#1a1a2e',
          accentColor: '#c9a84c',
          backgroundColor: '#f8f6f2',
        },
        typography: {
          headingFont: 'Cormorant Garamond',
          bodyFont: 'Inter',
          headingTransform: 'capitalize',
          cardRadius: '4px',
        },
        layout: {
          preset: 'grand',
          headerStyle: 'centered-logo',
          footerStyle: 'dark',
        },
        features: {
          enableGallery: true,
        },
      },
    })
    payload.logger.info('Created Hospitality Tenant.')

    // 3. Create Ghee Roast Tenant
    const gheeRoastTenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Ghee Roast',
        slug: 'ghee-roast',
        type: 'restaurant',
        parentTenant: hospitalityTenant.id,
        domains: [{ domain: 'ghee-roast.local' }],
        branding: {
          primaryColor: '#3E5237',
          accentColor: '#C44D18',
          backgroundColor: '#f4efe6',
        },
        typography: {
          headingFont: 'Oswald',
          bodyFont: 'Inter',
          headingTransform: 'uppercase',
          cardRadius: '12px',
        },
        layout: {
          preset: 'classic',
          headerStyle: 'transparent-scroll',
          footerStyle: 'light',
        },
        features: {
          enableMenu: true,
          enableCatering: true,
          enableGallery: true,
          enableReservations: true,
        },
      },
    })
    payload.logger.info('Created Ghee Roast Tenant.')

    // 4. Create Zuru Zuru Tenant
    const zuruZuruTenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Zuru Zuru Ramen',
        slug: 'zuru-zuru',
        type: 'restaurant',
        parentTenant: hospitalityTenant.id,
        domains: [{ domain: 'zuru-zuru.local' }],
        branding: {
          primaryColor: '#8B1A1A',
          accentColor: '#C9A227',
          backgroundColor: '#F7F3ED',
        },
        typography: {
          headingFont: 'Playfair Display',
          bodyFont: 'Inter',
          decorativeFont: 'Noto Serif JP',
          headingTransform: 'none',
          cardRadius: '0px',
        },
        layout: {
          preset: 'elegant',
          headerStyle: 'fixed-dark',
          footerStyle: 'dark',
        },
        features: {
          enableMenu: true,
          enableReservations: true,
          enableBlog: true,
        },
      },
    })
    payload.logger.info('Created Zuru Zuru Tenant.')

    payload.logger.info('Seeding complete.')
  } catch (err: unknown) {
    payload.logger.error({ err }, 'Error seeding data')
  }
}
