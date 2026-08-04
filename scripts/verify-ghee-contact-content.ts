import { getPayload } from 'payload'

import config from '../src/payload.config'
import {
  loadGheeRoastContentWithPayload,
  type GheeRoastFind,
} from '../src/lib/site/gheeRoastContentCore'
import { safeGheeRoastExternalHref } from '../src/themes/ghee-roast/mappers/cmsContent'
import { resolveGheeRoastBlockMedia } from '../src/themes/ghee-roast/utils/cmsBlockMedia'
import { shutdownPayload } from './lib/shutdownPayload'

process.env.DISABLE_PAYLOAD_HMR = 'true'
process.env.PAYLOAD_MIGRATING = 'true'

const requireOne = <T>(label: string, docs: T[]): T => {
  if (docs.length !== 1) throw new Error(`Expected exactly one ${label}; found ${docs.length}.`)
  return docs[0]!
}

const payload = await getPayload({ config, disableOnInit: true })

try {
  const tenant = requireOne('active Ghee Roast tenant', (await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: { and: [{ slug: { equals: 'ghee-roast' } }, { isActive: { equals: true } }] },
  })).docs)
  const tenantID = tenant.id
  const [pages, settingsResult, locationsResult, users, tenants] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 3,
      draft: false,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { tenantId: { equals: tenantID } },
          { slug: { equals: 'contact' } },
          { _status: { equals: 'published' } },
        ],
      },
    }),
    payload.find({
      collection: 'site-settings',
      depth: 0,
      draft: false,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: { and: [{ tenantId: { equals: tenantID } }, { _status: { equals: 'published' } }] },
    }),
    payload.find({
      collection: 'locations',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: { and: [{ tenantId: { equals: tenantID } }, { isActive: { equals: true } }] },
    }),
    payload.count({ collection: 'users', overrideAccess: true }),
    payload.count({ collection: 'tenants', overrideAccess: true }),
  ])
  const page = requireOne('published Contact Page', pages.docs)
  const settings = requireOne('published Site Settings', settingsResult.docs)
  const blocks = page.layout ?? []
  const blockTypes = blocks.map((block) => block.blockType)
  const expectedOrder = ['heroBlock', 'formBlock', 'locationsBlock', 'socialLinksBlock', 'newsletterBlock']
  let previousIndex = -1
  for (const blockType of expectedOrder) {
    const index = blockTypes.indexOf(blockType as typeof blockTypes[number])
    if (index <= previousIndex) throw new Error(`Contact block ${blockType} is missing or out of order.`)
    previousIndex = index
  }

  const form = blocks.find((block) => block.blockType === 'formBlock')
  if (!form || form.enabled === false || !form.sideImage || !form.imageAlt) {
    throw new Error('Contact Form media or accessibility configuration is incomplete.')
  }
  const subjectOptions = form.subjectOptions ?? []
  if (subjectOptions.length < 1) throw new Error('Contact Form has no configured subject options.')
  const formImage = resolveGheeRoastBlockMedia(
    { altOverride: form.imageAlt, item: form.sideImage },
    tenantID,
  )
  if (!formImage?.src || !formImage.alt) throw new Error('Contact Form media cannot be safely resolved.')

  const locations = locationsResult.docs.filter((location) => location.showOnContact !== false)
  if (!locations.length) throw new Error('No enabled Contact locations were found.')
  if (locations.filter((location) => location.isPrimary).length !== 1) {
    throw new Error('Contact locations must have exactly one primary location.')
  }
  for (const location of locations) {
    if (!safeGheeRoastExternalHref(location.mapsUrl)) {
      throw new Error(`Location ${location.id} has no safe external map URL.`)
    }
  }

  const enabledSocials = (settings.socials ?? []).filter((social) => social.enabled !== false)
  if (!enabledSocials.length) throw new Error('No enabled social CTA is configured.')
  for (const social of enabledSocials) {
    if (!safeGheeRoastExternalHref(social.url)) {
      throw new Error(`Enabled ${social.platform} social CTA has an invalid URL.`)
    }
  }

  const find: GheeRoastFind = async (args) => payload.find(args as never) as never
  const site = { hostname: 'ghee-roast.localhost', key: 'ghee-roast', theme: 'ghee-roast' } as const
  const [publicContact, unknownRoute] = await Promise.all([
    loadGheeRoastContentWithPayload({
      fallbacksEnabled: false,
      find,
      host: 'ghee-roast.localhost',
      pathname: '/contact',
      site,
    }),
    loadGheeRoastContentWithPayload({
      fallbacksEnabled: false,
      find,
      host: 'ghee-roast.localhost',
      pathname: '/definitely-unknown-contact-audit',
      site,
    }),
  ])
  if (publicContact.page?.id !== page.id) throw new Error('Published Contact loader did not resolve the expected Page.')
  if (unknownRoute.page !== null) throw new Error('Unknown-route loader unexpectedly resolved a Page.')

  console.log(JSON.stringify({
    contact: {
      blockTypes,
      id: page.id,
      loaderPageID: publicContact.page.id,
      sideImage: typeof form.sideImage === 'object' ? form.sideImage.id : form.sideImage,
      slug: page.slug,
      status: page._status,
      subjectOptions: subjectOptions.length,
    },
    unknownRoutePage: unknownRoute.page,
    locations: locations.map((location) => ({
      id: location.id,
      isPrimary: location.isPrimary,
      mapURLValid: true,
      showOnContact: location.showOnContact,
      title: location.title,
    })),
    settings: {
      enabledSocials: enabledSocials.map((social) => social.platform),
      id: settings.id,
      newsletterEnabled: settings.newsletter?.enabled,
      status: settings._status,
    },
    tenant: { id: tenantID, slug: tenant.slug },
    tenants: tenants.totalDocs,
    users: users.totalDocs,
  }, null, 2))
} finally {
  await shutdownPayload(payload)
}
