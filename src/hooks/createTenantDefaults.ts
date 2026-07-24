import type { CollectionAfterChangeHook } from 'payload'

export const createTenantDefaults: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req: { payload },
}) => {
  if (operation === 'create') {
    // When a new tenant is created, automatically generate its default 
    // global-like settings (SiteSettings, Navigation, FooterConfig)
    try {
      await payload.create({
        collection: 'site-settings',
        data: {
          tenantId: doc.id,
          businessName: doc.name,
        },
      })
      
      await payload.create({
        collection: 'nav',
        data: {
          tenantId: doc.id,
        },
      })
      
      await payload.create({
        collection: 'footer',
        data: {
          tenantId: doc.id,
        },
      })
      
      payload.logger.info(`Successfully created default configuration documents for tenant: ${doc.name}`)
    } catch (err) {
      payload.logger.error(`Error creating default configurations for tenant ${doc.name}: ${err}`)
    }
  }

  return doc
}
