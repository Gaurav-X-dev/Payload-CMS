import { createLocalReq, getPayload } from 'payload'

import config from '../src/payload.config'
import type { Page, SiteSetting } from '../src/payload-types'
import { DEFAULT_CONTACT_SUBJECT_OPTIONS } from '../src/validation/contactPage'
import { validatePageLayout } from '../src/validation/pageLayout'
import { shutdownPayload } from './lib/shutdownPayload'

process.env.DISABLE_PAYLOAD_HMR = 'true'
process.env.PAYLOAD_MIGRATING = 'true'

const requireOne = <T>(label: string, docs: T[]): T => {
  if (docs.length !== 1) {
    throw new Error(`Expected exactly one ${label}; found ${docs.length}. No content was updated.`)
  }
  return docs[0]!
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object'
    ? value as Record<string, unknown>
    : {}

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

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
  const superAdmin = requireOne('existing Super Admin', (await payload.find({
    collection: 'users',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    where: { roles: { contains: 'super_admin' } },
  })).docs)
  const trustedReq = await createLocalReq({ user: superAdmin }, payload)

  const [pageResult, settingsResult, locationsResult, mediaResult, userCount, tenantCount] = await Promise.all([
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
          { pageType: { equals: 'contact' } },
          { _status: { equals: 'published' } },
        ],
      },
    }),
    payload.find({
      collection: 'site-settings',
      depth: 1,
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
      sort: 'sortOrder',
      where: { tenantId: { equals: tenantID } },
    }),
    payload.find({
      collection: 'media',
      depth: 0,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { tenantId: { equals: tenantID } },
          { filename: { equals: 'catering_event.png' } },
        ],
      },
    }),
    payload.count({ collection: 'users', overrideAccess: true }),
    payload.count({ collection: 'tenants', overrideAccess: true }),
  ])

  const page = requireOne('published Ghee Roast Contact Page', pageResult.docs)
  const settings = requireOne('published Ghee Roast Site Settings', settingsResult.docs)
  const sideImage = requireOne('Ghee Roast Contact media item', mediaResult.docs)
  if (!locationsResult.docs.length) {
    throw new Error('The existing Ghee Roast tenant has no Locations. No content was updated.')
  }

  const layout = (page.layout ?? []).map((block) => asRecord(block))
  const hero = requireOne('Contact Hero block', layout.filter((block) => block.blockType === 'heroBlock'))
  const form = requireOne('Contact Form block', layout.filter((block) => block.blockType === 'formBlock'))
  const locations = requireOne('Contact Locations block', layout.filter((block) => block.blockType === 'locationsBlock'))
  const oldSocial = layout.find((block) => {
    if (block.blockType !== 'contentgridBlock') return false
    const title = text(asRecord(block.sectionHeader).title).toLocaleLowerCase('en-IN')
    return title.includes('social') || title.includes('follow') || title.includes('connect')
  })
  const preservedGenericBlocks = layout.filter((block) => ![
    'heroBlock',
    'formBlock',
    'locationsBlock',
    'socialLinksBlock',
    'newsletterBlock',
  ].includes(text(block.blockType)) && block !== oldSocial)

  const subjectOptions = DEFAULT_CONTACT_SUBJECT_OPTIONS.map((option, index) => ({
    id: `ghee-contact-subject-${index + 1}`,
    ...option,
  }))
  const contactForm = {
    ...form,
    enabled: true,
    errorMessage: text(form.errorMessage) || 'We could not submit the form. Please check your details and try again.',
    formCardStyle: 'elevated',
    formType: 'contact',
    imageAlt: 'Very Good Ghee Roast team preparing a catering service',
    imageFit: 'cover',
    imagePosition: 'right',
    sideImage: sideImage.id,
    subjectOptions,
  }
  const locationsBlock = {
    ...locations,
    enabled: true,
    showMap: true,
  }
  const socialTitle = text(asRecord(oldSocial?.sectionHeader).title) || 'Follow The Flavour'
  const socialDescription = text(asRecord(oldSocial?.sectionHeader).description)
    || 'Follow Very Good Ghee Roast for food stories, updates, and new launches.'
  const socialBlock = {
    blockType: 'socialLinksBlock',
    enabled: true,
    id: `ghee-contact-social-${tenantID}`,
    sectionHeader: {
      alignment: 'center',
      description: socialDescription,
      eyebrow: 'Stay Connected',
      headingTag: 'h2',
      maxWidth: 'narrow',
      title: socialTitle,
    },
    settings: {
      animation: 'none',
      backgroundColor: 'surface',
      containerWidth: 'standard',
      paddingBottom: 'medium',
      paddingTop: 'medium',
      visibility: ['desktop', 'tablet', 'mobile'],
    },
    showDescriptions: true,
    showHandles: true,
  }
  const newsletter = asRecord(settings.newsletter)
  const newsletterBlock = {
    blockType: 'newsletterBlock',
    enabled: true,
    id: `ghee-contact-newsletter-${tenantID}`,
    sectionHeader: {
      alignment: 'left',
      description: text(newsletter.description),
      headingTag: 'h2',
      maxWidth: 'standard',
      title: text(newsletter.title) || 'Join The Flavour Club',
    },
    settings: {
      animation: 'none',
      backgroundColor: 'surface',
      containerWidth: 'wide',
      paddingBottom: 'medium',
      paddingTop: 'medium',
      visibility: ['desktop', 'tablet', 'mobile'],
    },
    source: 'site-settings',
  }
  const nextLayout = [
    hero,
    contactForm,
    locationsBlock,
    ...preservedGenericBlocks,
    socialBlock,
    newsletterBlock,
  ]
  const layoutValidation = validatePageLayout(nextLayout)
  if (layoutValidation !== true) throw new Error(`Contact layout validation failed: ${layoutValidation}`)

  const settingsHours = Array.isArray(settings.hours) ? settings.hours : []
  for (const [index, location] of locationsResult.docs.entries()) {
    const mapQuery = [location.address, location.city, location.state, location.postalCode, location.country]
      .map(text)
      .filter(Boolean)
      .join(', ')
    const mapsURL = new URL('https://www.google.com/maps/search/')
    mapsURL.searchParams.set('api', '1')
    mapsURL.searchParams.set('query', mapQuery || location.title)
    await payload.update({
      collection: 'locations',
      id: location.id,
      data: {
        businessHours: settingsHours.map((hours, hoursIndex) => ({
          ...hours,
          id: `ghee-location-${location.id}-hours-${hoursIndex + 1}`,
        })),
        country: location.country || 'India',
        isPrimary: index === 0,
        mapButtonLabel: location.mapButtonLabel || 'Find on Map',
        mapsUrl: location.mapsUrl || mapsURL.toString(),
        showInFooter: location.showInFooter ?? false,
        showOnContact: true,
        showOnHome: location.showOnHome ?? false,
      },
      overrideAccess: true,
      req: trustedReq,
    })
  }

  const existingSocials = Array.isArray(settings.socials) ? settings.socials : []
  const socials = existingSocials.map((social, index) => {
    const platform = text(social.platform)
    const url = text(social.url)
    let handle = text(social.handle)
    if (!handle && url) {
      try {
        const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, '')
        if (pathname) handle = `@${pathname.split('/').at(-1)}`
      } catch {
        handle = ''
      }
    }
    const displayLabel = text(social.displayLabel)
      || `${platform.charAt(0).toUpperCase()}${platform.slice(1)}`
    return {
      ...social,
      ctaLabel: text(social.ctaLabel) || (platform === 'facebook' ? 'Visit Facebook' : `Follow on ${displayLabel}`),
      description: text(social.description) || `Follow Very Good Ghee Roast on ${displayLabel}.`,
      displayLabel,
      enabled: social.enabled !== false && Boolean(url),
      handle,
      icon: social.icon || 'platform',
      id: social.id || `ghee-social-${index + 1}`,
      openInNewTab: social.openInNewTab !== false,
      sortOrder: Number.isInteger(social.sortOrder) ? social.sortOrder : index,
      url,
    }
  })
  if (!socials.some((social) => social.platform === 'facebook')) {
    socials.push({
      ctaLabel: '',
      description: 'Add the verified Very Good Ghee Roast Facebook URL to enable this card.',
      displayLabel: 'Facebook',
      enabled: false,
      handle: '',
      icon: 'platform',
      id: 'ghee-social-facebook-placeholder',
      openInNewTab: true,
      platform: 'facebook',
      sortOrder: socials.length,
      url: '',
    })
  }

  await payload.update({
    collection: 'site-settings',
    id: settings.id,
    draft: false,
    data: {
      _status: 'published',
      newsletter: {
        ...settings.newsletter,
        errorMessage: text(newsletter.errorMessage) || 'We could not save your signup. Please try again later.',
        successMessage: text(newsletter.successMessage) || 'Thank you for joining the list.',
      },
      socials: socials as SiteSetting['socials'],
    },
    overrideAccess: true,
    req: trustedReq,
  })

  const updatedPage = await payload.update({
    collection: 'pages',
    id: page.id,
    draft: false,
    data: {
      _status: 'published',
      layout: nextLayout as Page['layout'],
    },
    depth: 0,
    overrideAccess: true,
    req: trustedReq,
  })

  const [afterUsers, afterTenants] = await Promise.all([
    payload.count({ collection: 'users', overrideAccess: true }),
    payload.count({ collection: 'tenants', overrideAccess: true }),
  ])
  if (afterUsers.totalDocs !== userCount.totalDocs || afterTenants.totalDocs !== tenantCount.totalDocs) {
    throw new Error('User or tenant counts changed unexpectedly.')
  }

  console.log(JSON.stringify({
    contact: {
      blocks: (updatedPage.layout ?? []).map((block) => block.blockType),
      id: updatedPage.id,
      slug: updatedPage.slug,
      status: updatedPage._status,
    },
    locationsUpdated: locationsResult.docs.map((location) => location.id),
    mediaReused: sideImage.id,
    settings: { id: settings.id, socials: socials.length, status: 'published' },
    tenant: { id: tenantID, slug: tenant.slug },
    tenants: afterTenants.totalDocs,
    users: afterUsers.totalDocs,
  }, null, 2))
} finally {
  await shutdownPayload(payload)
}
